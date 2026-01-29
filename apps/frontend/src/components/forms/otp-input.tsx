import { useCallback } from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { cn } from "@/lib/utils"

export interface OtpInputProps {
  length?: number
  value?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  disabled?: boolean
  error?: string
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  error,
}: OtpInputProps) {
  const handleChange = useCallback(
    (newValue: string) => {
      onChange?.(newValue)
      if (newValue.length === length) {
        onComplete?.(newValue)
      }
    },
    [onChange, onComplete, length],
  )

  return (
    <div>
      <InputOTP
        maxLength={length}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        containerClassName="gap-2"
      >
        <InputOTPGroup className="gap-2">
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className={cn(
                "h-[45px] w-[45px] rounded-md border text-lg font-bold",
                error
                  ? "border-destructive"
                  : "border-primary",
                disabled && "bg-muted"
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

OtpInput.displayName = "OtpInput"
