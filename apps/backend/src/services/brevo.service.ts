/**
 * Brevo Email Service
 * Handles email sending using Brevo (formerly Sendinblue) API
 * Provides fallback to SMTP if Brevo API fails
 */

// @ts-expect-error - Brevo SDK doesn't have built-in TypeScript types
import SibApiV3Sdk from "sib-api-v3-sdk"
import type { EmailOptions } from "../types/email.types.js"
import logger from "../utils/logger.js"

// Brevo API configuration
const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME

/**
 * Configure Brevo API client
 * @returns Configured Brevo API instance or null if not configured
 */
const getBrevoClient = (): SibApiV3Sdk.TransactionalEmailsApi | null => {
  if (!BREVO_API_KEY) {
    logger.warn("Brevo API key not configured")
    return null
  }

  try {
    const defaultClient = SibApiV3Sdk.ApiClient.instance
    defaultClient.authentications["api-key"].apiKey = BREVO_API_KEY

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
    return apiInstance
  } catch (error) {
    logger.error("Error initializing Brevo client:", error)
    return null
  }
}

/**
 * Convert EmailOptions to Brevo format
 * @param options - Email options from internal format
 * @returns Brevo SendSmtpEmail object
 */
const convertToBrevoFormat = (options: EmailOptions): SibApiV3Sdk.SendSmtpEmail => {
  const brevoEmail = new SibApiV3Sdk.SendSmtpEmail()

  // Set sender
  brevoEmail.sender = {
    email: BREVO_SENDER_EMAIL,
    name: BREVO_SENDER_NAME,
  }

  // Set recipient(s)
  if (Array.isArray(options.to)) {
    brevoEmail.to = options.to.map(email => ({ email }))
  } else {
    brevoEmail.to = [{ email: options.to }]
  }

  // Set content
  brevoEmail.subject = options.subject
  brevoEmail.htmlContent = options.html

  // Note: textContent is only set if explicitly provided
  // For HTML emails, omit textContent to ensure HTML rendering
  // When both htmlContent and textContent are provided, some email clients
  // may preferentially display the text version
  if (options.text) {
    brevoEmail.textContent = options.text
  }

  // Set attachments if present
  if (options.attachments && options.attachments.length > 0) {
    brevoEmail.attachment = options.attachments.map(att => ({
      name: att.filename,
      content: att.content ? att.content.toString("base64") : "",
    }))
  }

  return brevoEmail
}

/**
 * Send email using Brevo API
 * In development mode, logs to console instead of sending
 * In test mode, skips email sending entirely
 * @param options - Email options
 * @returns Promise resolving when email is sent
 * @throws Error if email sending fails and no fallback available
 */
export const sendBrevoEmail = async (options: EmailOptions): Promise<void> => {
  const isTest = process.env.NODE_ENV === "test"

  // Test mode: Skip email sending
  if (isTest) {
    logger.info(`[TEST MODE] Would send Brevo email to ${options.to}: ${options.subject}`)
    return
  }

  // All other modes (development & production): Send actual email via Brevo
  try {
    const apiInstance = getBrevoClient()

    if (!apiInstance) {
      throw new Error("Brevo client not configured. Check BREVO_API_KEY environment variable.")
    }

    const brevoEmail = convertToBrevoFormat(options)

    await apiInstance.sendTransacEmail(brevoEmail)

    logger.info(`Brevo email sent successfully to ${options.to}`)
  } catch (error) {
    logger.error("Error sending Brevo email:", error)

    // Check if error is recoverable (API key issues, rate limits, etc.)
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("403")) {
        logger.error("Brevo authentication failed. Check your API key.")
      } else if (error.message.includes("429")) {
        logger.error("Brevo rate limit exceeded. Consider implementing a queue.")
      } else if (error.message.includes("402")) {
        logger.error("Brevo quota exceeded. Upgrade your plan.")
      }
    }

    throw new Error("Failed to send email via Brevo")
  }
}

/**
 * Check if Brevo is properly configured
 * @returns true if Brevo API key is set
 */
export const isBrevoConfigured = (): boolean => {
  return !!BREVO_API_KEY
}

/**
 * Get Brevo account information (useful for testing)
 * @returns Account info or null if not configured
 */
export const getBrevoAccountInfo = async (): Promise<unknown | null> => {
  try {
    const apiInstance = getBrevoClient()
    if (!apiInstance) return null

    const accountApi = new SibApiV3Sdk.AccountApi()
    const account = await accountApi.getAccount()

    return account
  } catch (error) {
    logger.error("Error fetching Brevo account info:", error)
    return null
  }
}
