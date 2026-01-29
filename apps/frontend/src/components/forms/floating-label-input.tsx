import { forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  onClearError?: () => void
}

export const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({ label, error, className, onClearError, required, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          {...props}
          onFocus={e => {
            if (error && onClearError) {
              onClearError()
            }
            props.onFocus?.(e)
          }}
          onChange={e => {
            if (error && onClearError) {
              onClearError()
            }
            props.onChange?.(e)
          }}
          className={cn(
            "w-full px-4 pt-5 pb-2 border rounded-md transition-all duration-200 peer",
            error ? "border-destructive" : "border-input",
            props.disabled && "opacity-50 cursor-not-allowed",
            className
          )}
          placeholder=" "
        />
        <Label
          className={cn(
            "absolute left-4 px-1 pointer-events-none bg-card -top-2.5 text-sm transition-colors duration-200",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
          {required && (
            <span className={cn("ms-1", error ? "text-destructive" : "text-foreground")}>*</span>
          )}
        </Label>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)

FloatingLabelInput.displayName = "FloatingLabelInput"
