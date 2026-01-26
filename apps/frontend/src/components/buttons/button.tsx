/**
 * Button Component
 * Reusable button with variants, sizes, and loading state
 * Matches existing app button styles
 */

import { Loader2 } from "lucide-react"
import { forwardRef } from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      children,
      className = "",
      style = {},
      ...props
    },
    ref,
  ) => {
    // Size styles (matching existing app: h-12 = 48px for default)
    const sizeStyles = {
      sm: {
        height: "40px",
        fontSize: "14px",
        padding: "0 20px",
      },
      md: {
        height: "48px",
        fontSize: "16px",
        padding: "0 24px",
      },
      lg: {
        height: "56px",
        fontSize: "18px",
        padding: "0 32px",
      },
    }

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: "#000000",
        color: "#FFFFFF",
        border: "none",
      },
      secondary: {
        backgroundColor: "#FFFFFF",
        color: "#000000",
        border: "2px solid #000000",
      },
      outline: {
        backgroundColor: "transparent",
        color: "#000000",
        border: "2px solid #000000",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#000000",
        border: "none",
      },
    }

    const currentSizeStyle = sizeStyles[size]
    const currentVariantStyle = variantStyles[variant]

    const disabledOrLoading = disabled || isLoading
    const baseStyle = {
      ...currentSizeStyle,
      ...currentVariantStyle,
      ...(fullWidth ? { width: "100%" } : {}),
      ...(disabledOrLoading ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      ...style,
    }

    return (
      <button
        ref={ref}
        disabled={disabledOrLoading}
        className={`${className} rounded-md text-base font-semibold transition-opacity hover:opacity-90 disabled:hover:opacity-50 flex items-center justify-center gap-2`}
        style={baseStyle}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"
