import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type React from "react"

export interface ConfirmDialogState {
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    isDangerous: boolean
    onConfirm: () => void
    onCancel: () => void
}

export interface ConfirmDialogProps extends Omit<ConfirmDialogState, "onConfirm" | "onCancel"> {
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const handleConfirm = () => {
        onConfirm()
    }

    const handleCancel = () => {
        onCancel()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            handleCancel()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
            <DialogContent onKeyDown={handleKeyDown} className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <DialogDescription className="text-sm text-muted-foreground">
                    {message}
                </DialogDescription>
                <DialogFooter className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        autoFocus={!isDangerous}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={isDangerous ? "destructive" : "default"}
                        onClick={handleConfirm}
                        autoFocus={isDangerous}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
