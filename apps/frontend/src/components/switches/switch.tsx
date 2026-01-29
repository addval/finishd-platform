import { forwardRef } from "react"
import { Switch as ShadcnSwitch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface SwitchProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  id?: string
  className?: string
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onChange, disabled = false, label, description, id, className }, ref) => {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <ShadcnSwitch
          ref={ref}
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
        />

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <Label
                htmlFor={id}
                className={cn(
                  "text-base font-semibold text-text-primary",
                  disabled ? "cursor-not-allowed" : "cursor-pointer"
                )}
              >
                {label}
              </Label>
            )}
            {description && (
              <p className="text-sm leading-relaxed text-text-secondary">
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
