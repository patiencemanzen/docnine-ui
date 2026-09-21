import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Check } from "@/components/icons"
import Loader1 from "@/components/ui/loader1"
import { billingApi } from "@/lib/api"
import { useSubscriptionStore } from "@/store/subscription"
import { BillingPlan } from "@/types/BillingTypes"

function buildFeatures(plan: BillingPlan): string[] {
  const list: string[] = []
  if (plan.limits.projects === null) list.push("Unlimited projects")
  else list.push(`${plan.limits.projects} projects`)
  if (plan.limits.seats === null) list.push("Unlimited seats")
  else if (plan.limits.seats > 1) list.push(`Up to ${plan.limits.seats} seats`)
  if (plan.features.githubSync) list.push("GitHub sync")
  if (plan.features.shareViewOnly) list.push("Share docs")
  if (plan.features.archiveRestore) list.push("Archive & restore")
  if (plan.limits.aiChatsPerMonth && plan.limits.aiChatsPerMonth > 0)
    list.push(`${plan.limits.aiChatsPerMonth} AI chats/month`)
  if (plan.features.customDomain) list.push("Custom domain")
  if (plan.features.openApiImporter) list.push("OpenAPI importer")
  if (plan.limits.portals === null) list.push("Unlimited portals")
  else if (plan.limits.portals > 0)
    list.push(
      `${plan.limits.portals} portal${plan.limits.portals === 1 ? "" : "s"}`,
    )
  if (plan.limits.exportFormats?.length)
    list.push(
      `Export: ${plan.limits.exportFormats.map((f) => f.replace(/_/g, " ")).join(", ")}`,
    )
  return list.slice(0, 6)
}

function formatPrice(amount: number) {
  if (amount === 0) return "$0"
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`
}

export function Pricing() {
  const { loadPlans } = useSubscriptionStore()
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    billingApi
      .getPlans()
      .then((res) => {
        setPlans(res.plans)
        loadPlans()
      })
      .catch(() => {
        
      })
      .finally(() => setFetching(false))
  }, [loadPlans])

  const displayPlans = useMemo(() => {
    const starter = plans.find((p) => p.id === "starter")
    const pro = plans.find((p) => p.id === "pro")
    const picked = [starter, pro].filter(Boolean) as BillingPlan[]
    if (picked.length === 2) return picked
    return plans.filter((p) => p.prices.monthly > 0).slice(0, 2)
  }, [plans])

  return (
    <section id="pricing" className="mb-10">
      <div
        id="pricing-gradient-wrap"
        className="mx-auto w-full px-6 transition-[max-width] duration-75"
        style={{ maxWidth: 1152 }}
      >
        <div className="relative overflow-hidden rounded-2xl px-6 py-[calc(48px+8vh)]">
          <div className="landing-pricing-bg absolute inset-0" aria-hidden />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.72), rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.55))",
            }}
          />

          <div className="relative mx-auto max-w-5xl">
            <div className="px-6 md:px-10">
              <div
                className="grid grid-cols-1 gap-8 md:grid-cols-3"
                data-animate
              >
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Simple, transparent pricing
                  </h2>
                  <p className="mt-4 leading-relaxed text-white/70">
                    Start free. Upgrade when you need sync, portals, and team
                    seats — no surprises.
                  </p>
                  <Link
                    to="/pricing"
                    className="mt-6 inline-flex text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
                  >
                    Compare all plans
                  </Link>
                </div>

                {fetching ? (
                  <div className="col-span-1 flex items-center justify-center py-16 md:col-span-2">
                    <Loader1 className="h-8 w-8 text-white/70" />
                  </div>
                ) : (
                  displayPlans.map((plan, index) => {
                    const features = buildFeatures(plan)
                    const isLast = index === displayPlans.length - 1

                    return (
                      <div
                        key={plan.id}
                        className={isLast ? "md:pb-12" : undefined}
                      >
                        <div
                          className="overflow-hidden rounded-2xl border border-white/10 bg-black text-white"
                          style={{
                            backgroundImage:
                              "radial-gradient(80% 50% at 50% 0%, rgb(26,26,26) 0%, transparent 70%)",
                          }}
                        >
                          <div className="border-b border-white/10 p-10">
                            <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
                              {plan.name}
                            </p>
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-4xl font-bold tracking-tight text-white">
                                {formatPrice(plan.prices.monthly)}
                              </span>
                              <span className="text-sm text-white/50">
                                / month
                              </span>
                            </div>
                            <p className="mt-3 text-sm leading-relaxed text-white/60">
                              {plan.tagline}
                            </p>
                          </div>
                          <div className="px-10 py-8">
                            <ul className="m-0 flex list-none flex-col gap-3 p-0">
                              {features.map((feature) => (
                                <li
                                  key={feature}
                                  className="flex items-center gap-3 text-sm text-white/65"
                                >
                                  <Check className="size-4 shrink-0 text-white" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                            <Link
                              to="/signup"
                              className="mt-8 inline-flex items-center rounded-full border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                              Get started
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
