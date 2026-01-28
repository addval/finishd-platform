/**
 * SMS Service
 * Mock SMS provider for development - logs OTP to console
 * Can be extended for MSG91, Twilio, or Firebase in production
 */

const SMS_PROVIDER = process.env.SMS_PROVIDER || "mock"
const IS_DEV = process.env.NODE_ENV !== "production"

export interface SmsResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send OTP via SMS
 * In development, this just logs the OTP to console
 * In production, integrates with actual SMS provider
 */
export async function sendOtpSms(phone: string, otp: string): Promise<SmsResult> {
  // Format message
  const message = `Your Finishd verification code is: ${otp}. Valid for 5 minutes. Do not share this code.`

  switch (SMS_PROVIDER) {
    case "mock":
      return sendMockSms(phone, otp, message)
    case "msg91":
      return sendMsg91Sms(phone, otp)
    case "twilio":
      return sendTwilioSms(phone, message)
    default:
      return sendMockSms(phone, otp, message)
  }
}

/**
 * Mock SMS sender - logs OTP to console
 */
async function sendMockSms(phone: string, otp: string, message: string): Promise<SmsResult> {
  console.log("═".repeat(50))
  console.log("📱 MOCK SMS SENT")
  console.log("═".repeat(50))
  console.log(`To: ${phone}`)
  console.log(`OTP: ${otp}`)
  console.log(`Message: ${message}`)
  console.log("═".repeat(50))
  console.log('💡 In development, use "123456" as OTP to verify')
  console.log("═".repeat(50))

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    success: true,
    messageId: `mock_${Date.now()}`,
  }
}

/**
 * MSG91 SMS sender
 * Documentation: https://docs.msg91.com/
 */
async function sendMsg91Sms(phone: string, otp: string): Promise<SmsResult> {
  const authKey = process.env.MSG91_AUTH_KEY
  const templateId = process.env.MSG91_TEMPLATE_ID
  const senderId = process.env.MSG91_SENDER_ID || "FINSHD"

  if (!authKey || !templateId) {
    console.error("[SMS] MSG91 credentials not configured")
    return { success: false, error: "SMS provider not configured" }
  }

  try {
    const response = await fetch("https://api.msg91.com/api/v5/otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authkey: authKey,
      },
      body: JSON.stringify({
        template_id: templateId,
        mobile: phone.replace("+", ""),
        otp,
        sender: senderId,
      }),
    })

    const data = await response.json()

    if (data.type === "success") {
      console.log(`[SMS] MSG91 OTP sent to ${phone}`)
      return { success: true, messageId: data.request_id }
    }

    console.error("[SMS] MSG91 error:", data.message)
    return { success: false, error: data.message }
  } catch (error) {
    console.error("[SMS] MSG91 request failed:", error)
    return { success: false, error: "Failed to send SMS" }
  }
}

/**
 * Twilio SMS sender
 * Documentation: https://www.twilio.com/docs/sms
 */
async function sendTwilioSms(phone: string, message: string): Promise<SmsResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  if (!accountSid || !authToken || !fromNumber) {
    console.error("[SMS] Twilio credentials not configured")
    return { success: false, error: "SMS provider not configured" }
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: phone,
          From: fromNumber,
          Body: message,
        }),
      },
    )

    const data = await response.json()

    if (data.sid) {
      console.log(`[SMS] Twilio OTP sent to ${phone}`)
      return { success: true, messageId: data.sid }
    }

    console.error("[SMS] Twilio error:", data.message)
    return { success: false, error: data.message }
  } catch (error) {
    console.error("[SMS] Twilio request failed:", error)
    return { success: false, error: "Failed to send SMS" }
  }
}

/**
 * Validate phone number format
 * Accepts Indian numbers with or without country code
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean
  normalized?: string
  error?: string
} {
  // Remove spaces and dashes
  let cleaned = phone.replace(/[\s\-()]/g, "")

  // Check for valid Indian phone number patterns
  // +91XXXXXXXXXX, 91XXXXXXXXXX, or XXXXXXXXXX (10 digits)
  const patterns = [
    /^\+91[6-9]\d{9}$/, // +91 followed by 10 digits starting with 6-9
    /^91[6-9]\d{9}$/, // 91 followed by 10 digits starting with 6-9
    /^[6-9]\d{9}$/, // 10 digits starting with 6-9
  ]

  for (const pattern of patterns) {
    if (pattern.test(cleaned)) {
      // Normalize to E.164 format (+91XXXXXXXXXX)
      if (cleaned.startsWith("+91")) {
        return { valid: true, normalized: cleaned }
      }
      if (cleaned.startsWith("91") && cleaned.length === 12) {
        return { valid: true, normalized: `+${cleaned}` }
      }
      if (cleaned.length === 10) {
        return { valid: true, normalized: `+91${cleaned}` }
      }
    }
  }

  return {
    valid: false,
    error: "Please enter a valid 10-digit Indian mobile number",
  }
}
