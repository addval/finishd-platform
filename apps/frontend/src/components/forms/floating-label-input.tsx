/**
 * Floating Label Input Component
 * An input field with a floating label animation
 */

import { forwardRef } from "react"

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  onClearError?: () => void
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, className = "", onClearError, required, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          ref={ref}
          {...props}
          onFocus={e => {
            // Clear error when user focuses
            if (error && onClearError) {
              onClearError()
            }
            props.onFocus?.(e)
          }}
          onChange={e => {
            // Clear error when user types
            if (error && onClearError) {
              onClearError()
            }
            props.onChange?.(e)
          }}
          className={`
            w-full px-4 pt-5 pb-2 border border-gray-500 rounded-md
            focus:outline-none 
            transition-all duration-200
            peer
            ${error ? "border-red-500" : "border-gray-300"}
            ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          placeholder=" "
        />
        <label
          className={`
            absolute left-4 px-1 pointer-events-none
            bg-white -top-2.5 text-sm
            transition-colors duration-200
            ${error ? "text-red-500" : "text-black-600"}
          `}
        >
          {label}
          {required && (
            <span className={`${error ? "text-red-500" : "text-black-600"} ms-1`}>*</span>
          )}
        </label>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)

FloatingLabelInput.displayName = "FloatingLabelInput"
