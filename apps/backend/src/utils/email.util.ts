/**
 * Email Utility Functions
 * Handles email sending for verification, password reset, etc.
 * Uses Brevo API as the email provider
 * Uses Handlebars templates for HTML generation
 */

import { sendBrevoEmail } from "../services/brevo.service.js"
import { emailTemplate } from "../services/emailTemplate.service.js"
import type { EmailOptions, VerificationEmailOptions } from "../types/email.types.js"
import logger from "./logger.js"

// Email template constants
export const EMAIL_TEMPLATES = {
  EMAIL_VERIFICATION: "email-verification-template.html",
  PASSWORD_RESET: "password-reset-template.html",
  WELCOME: "welcome-template.html",
  PHONE_VERIFICATION: "phone-verification-template.html",
} as const

// Email subject constants
export const EMAIL_SUBJECTS = {
  EMAIL_VERIFICATION: "Verify Your Email Address",
  PASSWORD_RESET: "Reset Your Password",
  WELCOME: "Welcome to Rituality!",
  PHONE_VERIFICATION: "Verify Your Phone Number",
} as const

/**
 * Send email using Brevo API
 * Sends actual emails in both development and production modes
 * In test mode, skips email sending entirely
 * @param options - Email options
 * @throws Error if email sending fails
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  const isTest = process.env.NODE_ENV === "test"

  // Test mode: Skip email sending
  if (isTest) {
    logger.info(`[TEST MODE] Would send email to ${options.to}: ${options.subject}`)
    return
  }

  // Development and Production: Send actual email via Brevo
  await sendBrevoEmail(options)
}

/**
 * Send verification email (email, phone, or password reset)
 * Uses Handlebars template for HTML generation
 * @param options - Verification email options
 * @throws Error if email sending fails or template compilation fails
 */
export const sendVerificationEmail = async (options: VerificationEmailOptions): Promise<void> => {
  const { to, code, expiryMinutes, type = "email" } = options

  const templateMap = {
    email: EMAIL_TEMPLATES.EMAIL_VERIFICATION,
    phone: EMAIL_TEMPLATES.PHONE_VERIFICATION,
    password_reset: EMAIL_TEMPLATES.PASSWORD_RESET,
  }

  const subjectMap = {
    email: EMAIL_SUBJECTS.EMAIL_VERIFICATION,
    phone: EMAIL_SUBJECTS.PHONE_VERIFICATION,
    password_reset: EMAIL_SUBJECTS.PASSWORD_RESET,
  }

  const templateFile = templateMap[type]
  const subject = subjectMap[type]

  // Compile template with data
  const html = await emailTemplate(templateFile, {
    code,
    expiryMinutes,
    email: to,
    year: new Date().getFullYear(),
  })

  // Send HTML email only (no text fallback to ensure HTML rendering)
  await sendEmail({ to, subject, html })
}

/**
 * Send welcome email after successful verification
 * Uses Handlebars template for HTML generation
 * @param to - Recipient email address
 * @param name - User's name
 * @throws Error if email sending fails or template compilation fails
 */
export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  // Compile template with data
  const html = await emailTemplate(EMAIL_TEMPLATES.WELCOME, {
    name,
    email: to,
    frontendUrl: process.env.APP_BASE_URL,
    year: new Date().getFullYear(),
  })

  // Send HTML email only (no text fallback to ensure HTML rendering)
  await sendEmail({
    to,
    subject: EMAIL_SUBJECTS.WELCOME,
    html,
  })
}
