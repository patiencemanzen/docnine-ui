import { useState } from "react"
import {
    ArrowRight,
    Check,
    Minus,
    Star,
    Users,
    User,
    Zap,
    X,
} from "@/components/icons"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { billingApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth"
import { useSubscriptionStore } from "@/store/subscription"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import Loader1 from "../ui/loader1"
import { BillingPlan, PlansModalProps } from "@/types/BillingTypes"
import MiniPlanCard from "./MiniPlanCard"

export function PlansModal({ open, onClose }: PlansModalProps) {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const { subscription, plans, refresh } = useSubscriptionStore()

    const [annual, setAnnual] = useState(false)
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    async function handleSelect(plan: BillingPlan) {
        if (!isAuthenticated) {
            onClose()
            navigate("/signup")
            return
        }
        if (plan.id === "free") {
            onClose()
            return
        }
        try {
            setLoading(plan.id)
            setError(null)
            const res = await billingApi.checkout(plan.id, annual ? "annual" : "monthly", undefined, true)
            if (res.type === "trial" || res.trial) {
                await refresh()
                onClose()
                return
            }
            if (res.paymentLink) {
                window.location.href = res.paymentLink
            }
        } catch (err: any) {
            setError(err?.message ?? "Something went wrong. Please try again.")
        } finally {
            setLoading(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <DialogHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl">Choose your plan</DialogTitle>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        7-day free trial on all paid plans. No credit card required.
                    </p>

                    <div className="flex items-center gap-3 pt-3">
                        <span className={cn("text-sm font-medium transition-colors", !annual ? "text-foreground" : "text-muted-foreground")}>
                            Monthly
                        </span>
                        <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
                        <span className={cn("text-sm font-medium transition-colors", annual ? "text-foreground" : "text-muted-foreground")}>
                            Annual - Save up to 20%
                        </span>
                    </div>
                </DialogHeader>

                {error && (
                    <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {plans.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader1 className="h-6 w-6 text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-2">
                        {plans.map((plan) => (
                            <MiniPlanCard
                                key={plan.id}
                                plan={plan}
                                annual={annual}
                                currentPlanId={subscription?.plan ?? null}
                                loading={loading}
                                onSelect={handleSelect}
                            />
                        ))}
                    </div>
                )}

                <p className="text-center text-xs text-muted-foreground pt-2">
                    Need a custom plan?{" "}
                    <a href="mailto:hello@docnine.io" className="text-primary hover:underline">
                        Contact us
                    </a>
                </p>
            </DialogContent>
        </Dialog>
    )
}
