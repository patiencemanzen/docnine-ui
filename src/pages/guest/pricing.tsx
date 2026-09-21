import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Zap, Users, Star, ArrowRight, ChevronRight, Minus, User } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { billingApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useSubscriptionStore } from "@/store/subscription";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import PlanCard from "@/components/billing/PlanCard";
import Loader1 from "@/components/ui/loader1";
import { BillingPlan } from "@/types/BillingTypes";
import { COMPARISON_ROWS, FEATURE_ROWS, PLAN_ACCENT } from "@/configs/BillingConfig";
import { Background } from "@/components/landing";

function ComparisonTable({ plans }: { plans: BillingPlan[] }) {
  return (
    <div className="overflow-x-auto border-border z-10 rounded-2xl border bg-card p-6 transition-all">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="py-3 text-left text-muted-foreground font-medium w-48">Feature</th>
            {plans.map((p) => (
              <th key={p.id} className={cn("py-3 text-center font-semibold", PLAN_ACCENT[p.id])}>
                {p.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-border/50">
              <td className="py-3 text-muted-foreground">{row.label}</td>
              {plans.map((p) => {
                const val = p.limits[row.key];
                return (
                  <td key={p.id} className="py-3 text-center font-medium">
                    {val === null ? (
                      "∞"
                    ) : val === 0 ? (
                      <Minus className="h-4 w-4 mx-auto text-muted-foreground" />
                    ) : (
                      val
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {FEATURE_ROWS.map((row) => (
            <tr key={row.key} className="border-b border-border/50">
              <td className="py-3 text-muted-foreground">{row.label}</td>
              {plans.map((p) => (
                <td key={p.id} className="py-3 text-center">
                  {p.features[row.key] ? (
                    <Check className="h-4 w-4 mx-auto text-green-500" />
                  ) : (
                    <Minus className="h-4 w-4 mx-auto text-muted-foreground/30" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { subscription, loadPlans } = useSubscriptionStore();

  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [annual, setAnnual] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    billingApi
      .getPlans()
      .then((res) => {
        setPlans(res.plans);
        loadPlans();
      })
      .catch(() => setError("Failed to load plans. Please refresh."))
      .finally(() => setFetching(false));
  }, [loadPlans]);

  async function handleSelect(plan: BillingPlan) {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }
    if (plan.id === "free") {
      navigate("/projects");
      return;
    }
    try {
      setLoading(plan.id);
      setError(null);
      const res = await billingApi.checkout(
        plan.id,
        annual ? "annual" : "monthly",
        undefined,
        true,
      );
      if (res.type === "trial" || res.trial) {
        navigate("/billing?welcome=1");
        return;
      }
      if (res.paymentLink) {
        window.location.href = res.paymentLink;
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Background className="mt-5">
      <section className="mx-auto relative z-10 max-w-5xl px-6 pt-28 pb-12 text-center lg:pt-36">
        <h1 data-animate className="text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Start free. Upgrade when you're ready.
          <span className="ml-1 text-primary font-medium">7-day free trial on all paid plans.</span>
        </p>

        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Monthly
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              annual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Annual - Save up to 24%
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-2 pb-16 relative z-10">
        {error && (
          <p className="mb-6 rounded-lg px-4 py-3 text-sm text-red-400 text-center">{error}</p>
        )}

        {fetching ? (
          <div className="flex justify-center py-24">
            <Loader1 className="h-8 w-8  text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  annual={annual}
                  currentPlanId={subscription?.plan ?? null}
                  onSelect={handleSelect}
                  loading={loading}
                />
              ))}
            </div>

            {plans.length > 0 && (
              <div className="mt-20">
                <h2 className="mb-8 text-center text-2xl font-bold">Full plan comparison</h2>

                <ComparisonTable plans={plans} />
              </div>
            )}
          </>
        )}
      </section>
    </Background>
  );
}
