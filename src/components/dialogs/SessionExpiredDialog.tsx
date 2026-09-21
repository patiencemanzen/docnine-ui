import { AlertCircle } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useNavigate } from "react-router-dom"
import { useSubscriptionStore } from "@/store/subscription"
import { SessionExpiredDialogProps } from "@/types/StateTypes"

export function SessionExpiredDialog({
    open,
    onOpenChange,
}: SessionExpiredDialogProps) {
    const navigate = useNavigate()
    const { reset: resetSubscription } = useSubscriptionStore()

    const handleLoginAgain = () => {

        resetSubscription()
        onOpenChange(false)
        navigate("/login", { replace: true })
    }

    return (

        <Dialog
            open={open}
            onOpenChange={(next) => {

                if (!next) return
                onOpenChange(next)
            }}
        >
            <DialogContent
                className="sm:max-w-[400px]"
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                        <DialogTitle>Session Expired</DialogTitle>
                    </div>
                    <DialogDescription>
                        Your session has expired or was signed out from another device.
                        Please log in again to continue where you left off.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 flex justify-end">
                    <Button onClick={handleLoginAgain} className="w-full">
                        Log In Again
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
