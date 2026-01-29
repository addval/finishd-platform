import { cn } from "@/lib/utils"

interface StepProgressProps {
  steps: string[]
  currentStep: string
  className?: string
}

function StepProgress({ steps, currentStep, className }: StepProgressProps) {
  const currentIndex = steps.indexOf(currentStep)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              index === currentIndex
                ? "font-medium text-primary"
                : index < currentIndex
                  ? "text-muted-foreground"
                  : "text-muted-foreground/60",
            )}
          >
            {step}
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        {steps.map((step, index) => (
          <div
            key={step}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              index === currentIndex
                ? "bg-primary"
                : index < currentIndex
                  ? "bg-primary/40"
                  : "bg-muted-foreground/20",
            )}
          />
        ))}
      </div>
    </div>
  )
}

export { StepProgress }
