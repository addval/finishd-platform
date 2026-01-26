/**
 * Email Template Service
 * Compiles Handlebars email templates with dynamic data
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Handlebars from "handlebars"
import logger from "../utils/logger.js"

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface TemplateData {
  [key: string]: string | number | undefined
}

/**
 * Configure Handlebars to ignore certain templates
 * This prevents Handlebars from trying to parse conditional comments
 */
Handlebars.registerHelper(
  "raw",
  function (this: unknown, options: { fn: (context: unknown) => string }) {
    return options.fn(this)
  },
)

/**
 * Compile and render email template with Handlebars
 * @param fileName - Template filename (e.g., 'email-verification-template.html')
 * @param replacements - Dynamic data to replace in template
 * @returns Compiled HTML string
 * @throws Error if template file not found or compilation fails
 */
export const emailTemplate = async (
  fileName: string,
  replacements: TemplateData,
): Promise<string> => {
  try {
    const filePath = path.join(__dirname, "../email-templates/", fileName)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template file not found: ${fileName}`)
    }

    const source = fs.readFileSync(filePath, "utf-8").toString()

    // Configure Handlebars to not parse MSO conditional comments
    const template = Handlebars.compile(source, {
      noEscape: true,
      strict: false,
    })

    return template(replacements)
  } catch (error) {
    logger.error("Error compiling email template:", error)
    if (error instanceof Error) {
      logger.error("Error details:", error.message)
      logger.error("Stack trace:", error.stack)
    }
    throw new Error(`Failed to compile email template: ${fileName}`)
  }
}
