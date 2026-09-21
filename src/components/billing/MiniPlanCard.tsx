import { PLAN_ACCENT, PLAN_BTN, PLAN_ICONS } from '@/configs/BillingConfig'
import { cn } from '@/lib/utils'
import { BillingPlan } from '@/types/BillingTypes'
import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import Loader1 from '../ui/loader1'
import { ArrowRight, Check, Minus, Star } from "@/components/icons"

function FeatureLine({ label }: { label: string }) {
    return (
        <li className="flex items-center gap-1.5">
            <Check className="h-3 w-3 shrink-0 text-primary" />
            {label}
        </li>
    )
}

function MiniPlanCard({
    plan,
    annual,
    currentPlanId,
    loading,
    onSelect,
}: {
    plan: BillingPlan
    annual: boolean
    currentPlanId: string | null
    loading: string | null
    onSelect: (plan: BillingPlan) => void
}) {
    const Icon = PLAN_ICONS[plan.id] ?? Star
    const accent = PLAN_ACCENT[plan.id] ?? "text-muted-foreground"
    const btnClass = PLAN_BTN[plan.id] ?? ""
    const isCurrent = currentPlanId === plan.id
    const isPro = plan.id === "pro"
    const isLoading = loading === plan.id
    const price = annual ? plan.prices.annual : plan.prices.monthly

    return (
        <div
            className={cn(
                "relative flex flex-col rounded-xl border bg-card p-5 transition-all",
                isPro
                    ? "border-primary ring-1 ring-primary/30"
                    : "border-border",
            )}
        >
            {isPro && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-white text-[10px] px-2 py-0.5">
                        Most Popular
                    </Badge>
                </div>
            )}

            <div className="flex items-center gap-2 mb-3">
                <Icon className={cn("h-4 w-4", accent)} />
                <span className="font-semibold text-sm">{plan.name}</span>
            </div>

            <div className="mb-4">
                {plan.prices.monthly === 0 ? (
                    <span className="text-2xl font-bold">Free</span>
                ) : (
                    <div className="flex items-end gap-1">
                        <span className="text-2xl font-bold">${price}</span>
                        <span className="mb-0.5 text-xs text-muted-foreground">${plan.id == "team" ? "/user" : ""}/mo</span>
                    </div>
                )}
                {annual && plan.prices.annualTotal != null && plan.prices.monthly > 0 && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                        ${plan.prices.annualTotal}/yr
                        {plan.prices.savingsPercent > 0 && (
                            <span className="ml-1 text-primary font-medium">
                                (Save {plan.prices.savingsPercent}%)
                            </span>
                        )}
                    </p>
                )}
            </div>

            <Button
                className={cn("w-full mb-4 text-xs h-8", btnClass)}
                variant={plan.id === "free" ? "outline" : "default"}
                size="sm"
                disabled={isCurrent || isLoading}
                onClick={() => onSelect(plan)}
            >
                {isLoading ? (
                    <Loader1 className="mr-1.5 h-3.5 w-3.5" />
                ) : isCurrent ? (
                    "Current plan"
                ) : plan.id === "free" ? (
                    "Get started free"
                ) : (
                    <>
                        Start free trial
                        <ArrowRight className="ml-1.5 h-3 w-3" />
                    </>
                )}
            </Button>

            <ul className="space-y-1.5 text-xs text-muted-foreground">
                {plan.limits.projects !== null ? (
                    <FeatureLine label={`${plan.limits.projects} projects`} />
                ) : (
                    <FeatureLine label="Unlimited projects" />
                )}
                {plan.limits.aiChatsPerMonth === null ? (
                    <FeatureLine label="Unlimited AI chats" />
                ) : plan.limits.aiChatsPerMonth > 0 ? (
                    <FeatureLine label={`${plan.limits.aiChatsPerMonth} AI chats/mo`} />
                ) : (
                    <li className="flex items-center gap-1.5 opacity-40">
                        <Minus className="h-3 w-3 shrink-0" />
                        AI chats
                    </li>
                )}
                {plan.features.githubSync && <FeatureLine label="GitHub sync" />}
                {plan.features.openApiImporter && <FeatureLine label="OpenAPI importer" />}
                {plan.features.customDomain && <FeatureLine label="Custom domain" />}
                {plan.features.docApproval && <FeatureLine label="Doc approval" />}
            </ul>
        </div>
    )
}

export default MiniPlanCard
