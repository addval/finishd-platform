/**
 * Switch/Toggle Component
 * Reusable toggle switch for settings and permissions
 */

import { forwardRef, useId } from "react"

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange"> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  label?: string
  description?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      checked = false,
      onChange,
      disabled = false,
      label,
      description,
      id,
      style = {},
      className = "",
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const switchId = id || generatedId

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked)
    }

    const handleClick = () => {
      if (!disabled && onChange !== undefined) {
        onChange(!checked)
      }
    }

    const switchStyle: React.CSSProperties = {
      width: "48px",
      height: "24px",
      backgroundColor: checked ? "#000000" : "#E0E0E0",
      borderRadius: "9999px",
      position: "relative",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background-color 0.2s ease-in-out",
      opacity: disabled ? 0.5 : 1,
      ...style,
    }

    const knobStyle: React.CSSProperties = {
      position: "absolute",
      top: "2px",
      left: checked ? "26px" : "2px",
      width: "20px",
      height: "20px",
      backgroundColor: "#FFFFFF",
      borderRadius: "50%",
      transition: "left 0.2s ease-in-out",
    }

    return (
      <div className={`flex items-start gap-3 ${className}`}>
        <div style={switchStyle} onClick={handleClick}>
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            id={switchId}
            className="sr-only"
            {...props}
          />
          <span style={knobStyle} />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={switchId}
                className="text-base font-semibold"
                style={{ color: "#333333", cursor: disabled ? "not-allowed" : "pointer" }}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm leading-relaxed" style={{ color: "#666666" }}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  },
)

Switch.displayName = "Switch"
