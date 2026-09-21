import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "@/components/icons"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { billingApi } from "@/lib/api"
import { useSubscriptionStore } from "@/store/subscription"
import { useAuthStore } from "@/store/auth"
import { PlansModal } from "@/components/billing/PlansModal"
import Loader1 from "../ui/loader1"
import { UpgradeModalProps } from "@/types/BillingTypes"
import { PLAN_LABELS } from "@/configs/BillingConfig"

export function UpgradeModal({
    open,
    onClose,
    featureName,
    requiredPlan,
    description,
}: UpgradeModalProps) {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const plans = useSubscriptionStore((s) => s.plans)
    const refresh = useSubscriptionStore((s) => s.refresh)
    const loadPlans = useSubscriptionStore((s) => s.loadPlans)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [plansOpen, setPlansOpen] = useState(false)

    const planInfo = PLAN_LABELS[requiredPlan] ?? PLAN_LABELS.pro
    const planData = plans.find((p) => p.id === requiredPlan)

    async function handleUpgrade() {
        if (!isAuthenticated) {
            navigate("/signup")
            return
        }
        try {
            setLoading(true)
            setError(null)
            const res = await billingApi.checkout(requiredPlan, "monthly", undefined, true)
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
            setLoading(false)
        }
    }

    function handleViewPlans() {

        if (plans.length === 0) loadPlans()

        onClose()
        setPlansOpen(true)
    }

    return (
        <>
            <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            Unlock <span className={planInfo.colour}>{featureName}</span>
                        </DialogTitle>
                        <DialogDescription>
                            {description ??
                                `${featureName} is available on the ${planInfo.name} plan and above. Upgrade to get access.`}
                        </DialogDescription>
                    </DialogHeader>

                    {planData && (
                        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
                            <p className="mb-2 font-medium">{planData.name} plan includes:</p>
                            <ul className="space-y-1 text-muted-foreground">
                                {planData.limits.projects !== null && (
                                    <li>• Up to {planData.limits.projects} projects</li>
                                )}
                                {planData.limits.seats !== null && (
                                    <li>• {planData.limits.seats} team seats</li>
                                )}
                                {planData.features.githubSync && <li>• GitHub sync</li>}
                                {planData.features.openApiImporter && <li>• OpenAPI importer</li>}
                                {planData.features.customDomain && <li>• Custom domain</li>}
                                {planData.features.docApproval && <li>• Doc approval workflow</li>}
                            </ul>
                            {planData.prices.monthly > 0 && (
                                <p className="mt-3 font-semibold">
                                    From{" "}
                                    <span className={planInfo.colour}>
                                        ${planData.prices.monthly}/mo
                                    </span>
                                </p>
                            )}
                        </div>
                    )}

                    {error && (
                        <p className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col gap-2 pt-1">
                        <Button onClick={handleUpgrade} disabled={loading} className="w-full">
                            {loading ? (
                                <Loader1 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="mr-2 h-4 w-4" />
                            )}
                            {loading ? "Redirecting…" : `Upgrade to ${planInfo.name}`}
                        </Button>

                        <Button variant="ghost" size="sm" onClick={handleViewPlans}>
                            View all plans
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <PlansModal open={plansOpen} onClose={() => setPlansOpen(false)} />
        </>
    )
}
