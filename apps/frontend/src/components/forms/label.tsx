/**
 * Label Component
 * A simple form label component
 */

import { forwardRef } from "react"

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ children, required, className = "", ...props }, ref) => {
    return (
      <label
        ref={ref}
        {...props}
        className={`
          block text-sm font-medium text-gray-700 mb-1
          ${className}
        `}
      >
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )
  },
)

Label.displayName = "Label"
