import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleChipProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  variant?: "pill" | "card"
  className?: string
}

function ToggleChip({
  selected,
  onClick,
  children,
  variant = "pill",
  className,
}: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-sm font-medium transition-colors",
        variant === "pill" &&
          "rounded-full border px-4 py-2",
        variant === "card" &&
          "rounded-md border px-4 py-3 text-left",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-input hover:border-input/80",
        className,
      )}
    >
      {children}
    </button>
  )
}

interface ToggleChipGroupProps {
  children: React.ReactNode
  className?: string
}

function ToggleChipGroup({ children, className }: ToggleChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>{children}</div>
  )
}

export { ToggleChip, ToggleChipGroup }
