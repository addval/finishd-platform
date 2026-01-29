import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface SuccessScreenProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  notice?: {
    title: string
    message: string
  }
  className?: string
}

function SuccessScreen({
  title,
  description,
  actionLabel,
  onAction,
  notice,
  className,
}: SuccessScreenProps) {
  return (
    <Card className={cn("text-center shadow-md", className)}>
      <CardContent className="p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="mb-6 text-muted-foreground">{description}</p>

        {notice && (
          <div className="mb-6 rounded-md bg-accent p-4 text-left">
            <p className="text-sm text-accent-foreground">
              <strong>{notice.title}</strong> {notice.message}
            </p>
          </div>
        )}

        <Button onClick={onAction} variant="primary" fullWidth className="py-3">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

export { SuccessScreen }
