/**
 * Email Type Definitions
 * TypeScript interfaces for email-related operations
 */

import type { Attachment } from "nodemailer/lib/mailer"

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Attachment[]
}

export interface VerificationEmailOptions {
  to: string
  code: string
  expiryMinutes: number
  type?: "email" | "phone" | "password_reset"
}

export interface WelcomeEmailOptions {
  to: string
  name: string
}

export interface TemplateData {
  code?: string
  expiryMinutes?: number
  name?: string
  email?: string
  verifyLink?: string
  frontendUrl?: string
  year?: number
}
