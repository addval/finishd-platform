import { LogOut } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
      <AlertDialogContent className="max-w-[440px] p-10">
        {/* Icon Section */}
        <div className="flex justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut size={24} className="text-destructive" />
          </div>
        </div>

        <AlertDialogHeader className="text-center sm:text-center">
          <AlertDialogTitle className="text-2xl font-semibold text-foreground">
            Logging Out?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[15px] leading-relaxed text-muted-foreground">
            You're about to log out of your account.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row gap-3 sm:flex-row sm:space-x-0">
          <AlertDialogCancel
            className="flex-1 mt-0 h-12 text-base font-semibold border-2 border-primary bg-transparent text-foreground hover:opacity-90"
            onClick={onClose}
          >
            Stay
          </AlertDialogCancel>
          <AlertDialogAction
            className="flex-1 h-12 text-base font-semibold bg-destructive text-destructive-foreground hover:opacity-90"
            onClick={onConfirm}
          >
            Log Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
