import { ArrowRight, Check, Star, User, Users, Zap } from "@/components/icons";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import Loader1 from "../ui/loader1";
import { BillingPlan } from "@/types/BillingTypes";
import { PLAN_ACCENT, PLAN_BTN, PLAN_ICONS } from "@/configs/BillingConfig";

function FeatureLine({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2 text-muted-foreground">
      <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
      {label}
    </li>
  );
}

function PlanCard({
  plan,
  annual,
  currentPlanId,
  onSelect,
  loading,
}: {
  plan: BillingPlan;
  annual: boolean;
  currentPlanId: string | null;
  onSelect: (plan: BillingPlan) => void;
  loading: string | null;
}) {
  const Icon = PLAN_ICONS[plan.id] ?? Star;
  const accent = PLAN_ACCENT[plan.id] ?? "text-muted-foreground";
  const btn = PLAN_BTN[plan.id] ?? "";
  const isCurrent = currentPlanId === plan.id;
  const isPro = plan.id === "pro";

  const price = annual ? plan.prices.annual : plan.prices.monthly;
  const isLoading = loading === plan.id;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 transition-all",
        isPro ? "border-primary  scale-[1.02]" : "border-border hover:border-border/80",
      )}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-white text-xs px-3 py-0.5">Most Popular</Badge>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="font-semibold">{plan.name}</span>
      </div>

      <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{plan.tagline}</p>

      <div className="mb-6">
        {plan.prices.monthly === 0 ? (
          <span className="text-3xl font-bold">Free</span>
        ) : (
          <div className="flex items-end gap-1">
            <span className="text-3xl font-bold">${price}</span>
            <span className="mb-1 text-sm text-muted-foreground">
              {plan.id == "team" ? "/user" : ""}/mo
            </span>
          </div>
        )}
        {annual && plan.prices.annualTotal != null && plan.prices.monthly > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Billed ${plan.prices.annualTotal}/year
            {plan.prices.savingsPercent > 0 && (
              <span className="ml-1 text-primary font-medium">
                (Save {plan.prices.savingsPercent}%)
              </span>
            )}
          </p>
        )}
      </div>

      <Button
        className={cn("w-full mb-6", btn)}
        variant={plan.id === "free" ? "outline" : "default"}
        disabled={isCurrent || isLoading}
        onClick={() => onSelect(plan)}
      >
        {isLoading ? (
          <Loader1 className="mr-2 h-4 w-4" />
        ) : isCurrent ? (
          "Current plan"
        ) : plan.id === "free" ? (
          "Get started free"
        ) : (
          <>
            Start free trial
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <ul className="space-y-2.5 text-sm">
        {plan.limits.projects !== null && (
          <FeatureLine label={`${plan.limits.projects} projects`} />
        )}
        {plan.limits.projects === null && <FeatureLine label="Unlimited projects" />}
        {plan.limits.seats !== null && <FeatureLine label={`${plan.limits.seats} team seats`} />}
        {plan.limits.aiChatsPerMonth !== null && (
          <FeatureLine label={`${plan.limits.aiChatsPerMonth} AI chats/mo`} />
        )}
        {plan.limits.aiChatsPerMonth === null && <FeatureLine label="Unlimited AI chats" />}
        {plan.features.githubSync && <FeatureLine label="GitHub sync" />}
        {plan.features.openApiImporter && <FeatureLine label="OpenAPI importer" />}
        {plan.features.customDomain && <FeatureLine label="Custom domain" />}
        {plan.features.docApproval && <FeatureLine label="Doc approval workflow" />}
        {plan.features.apiWebhookAccess && <FeatureLine label="API & webhook access" />}
      </ul>
    </div>
  );
}

export default PlanCard;
