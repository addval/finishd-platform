/**
 * OTP Input Component
 * 6-digit OTP input with auto-navigation and paste support
 */

import { forwardRef, useEffect, useRef, useState } from "react"

export interface OtpInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: string
}

export const OtpInput = forwardRef<HTMLInputElement, OtpInputProps>(
  ({ length = 6, value = "", onChange, onComplete, disabled = false, error }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])
    const [otpValues, setOtpValues] = useState<string[]>(value.padEnd(length, "").split(""))
    const [focusedIndex, setFocusedIndex] = useState<number>(-1)

    useEffect(() => {
      setOtpValues(value.padEnd(length, "").split(""))
    }, [value, length])

    const handleChange = (index: number, digit: string) => {
      // Allow only digits
      if (!/^\d*$/.test(digit)) return

      const newValues = [...otpValues]
      newValues[index] = digit
      setOtpValues(newValues)

      const newValue = newValues.join("")
      onChange?.(newValue)

      // Auto-focus next input
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Auto-submit when complete
      if (digit && newValues.every(v => v !== "") && newValues.join("").length === length) {
        onComplete?.(newValues.join(""))
      }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      // Handle backspace
      if (e.key === "Backspace" && !otpValues[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").slice(0, length)

      // Validate paste is digits only
      if (!/^\d+$/.test(pastedData)) return

      const newValues = pastedData
        .split("")
        .concat(otpValues.slice(pastedData.length))
        .slice(0, length)
      setOtpValues(newValues)

      const newValue = newValues.join("")
      onChange?.(newValue)

      // Auto-submit if complete
      if (newValues.every(v => v !== "") && newValue.length === length) {
        onComplete?.(newValue)
      }
    }

    const handleFocus = (index: number) => (e: React.FocusEvent<HTMLInputElement>) => {
      setFocusedIndex(index)
      e.target.select()
    }

    return (
      <div className="flex gap-2">
        {Array.from({ length }).map((_, index) => (
          <input
            key={`otp-digit-${index + 1}`}
            ref={el => {
              inputRefs.current[index] = el
              if (index === 0 && ref) {
                if (typeof ref === "function") ref(el)
                else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el
              }
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otpValues[index] || ""}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={handleFocus(index)}
            onBlur={() => setFocusedIndex(-1)}
            disabled={disabled}
            className="w-[45px] h-[45px] text-center text-lg font-bold rounded-md focus:outline-none transition-colors"
            style={{
              borderWidth: focusedIndex === index ? "2px" : "1px",
              borderColor: focusedIndex === index ? "#000000" : error ? "#C33" : "#000000",
              backgroundColor: disabled ? "#F5F5F5" : "#FFFFFF",
              color: "#000000",
            }}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </div>
    )
  },
)

OtpInput.displayName = "OtpInput"
