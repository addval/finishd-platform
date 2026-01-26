/**
 * useAuthForm Hook
 * Custom hook for authentication forms using react-hook-form and Zod validation
 * Provides consistent form handling, validation, and error management
 */

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { transformApiError } from "@/lib/errorTransformer"

/**
 * Custom hook for authentication forms
 *
 * @example
 * ```tsx
 * const { form, handleSubmit, isSubmitting, serverError } = useAuthForm(
 *   loginSchema,
 *   async (data) => {
 *     await login(data.email, data.password)
 *     navigate('/dashboard')
 *   }
 * )
 * ```
 */
export function useAuthForm<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  onSubmit: (data: T) => Promise<void>,
) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onBlur", // Validate on blur for real-time feedback
  })

  const handleSubmit = async (e?: React.BaseSyntheticEvent) => {
    if (e) {
      e.preventDefault()
    }

    setIsSubmitting(true)
    setServerError(null)

    try {
      // Validate with react-hook-form
      const isValid = await form.trigger()
      if (!isValid) {
        setIsSubmitting(false)
        return
      }

      // Get validated values
      const values = form.getValues()

      // Call submit handler
      await onSubmit(values as T)
    } catch (error) {
      // Transform error to user-friendly message
      const errorMessage = transformApiError(error)
      setServerError(errorMessage)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    handleSubmit,
    isSubmitting,
    serverError,
    clearServerError: () => setServerError(null),
  }
}
