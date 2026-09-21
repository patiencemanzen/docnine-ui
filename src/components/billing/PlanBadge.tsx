import { differenceInDays } from "date-fns";
import { Zap, Users, Star, AlertTriangle, Clock, User } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSubscriptionStore, PLAN_LEVEL } from "@/store/subscription";
import { PlanBadgeProps } from "@/types/BillingTypes";
import { PLAN_COLOURS, PLAN_ICONS } from "@/configs/BillingConfig";

export function PlanBadge({ className, showStatus = true }: PlanBadgeProps) {
  const subscription = useSubscriptionStore((s) => s.subscription);

  if (!subscription) return null;

  const { plan, planName, status, trialEndsAt } = subscription;
  const Icon = PLAN_ICONS[plan] ?? Star;
  const colourClass = PLAN_COLOURS[plan] ?? PLAN_COLOURS.free;

  let statusBadge: React.ReactNode = null;
  if (showStatus) {
    if (status === "trialing" && trialEndsAt) {
      const daysLeft = differenceInDays(new Date(trialEndsAt), new Date());
      statusBadge = (
        <span className="ml-1.5 flex items-center gap-0.5 text-primary text-[10px] font-medium">
          <Clock className="h-2.5 w-2.5" />
          {daysLeft > 0 ? `${daysLeft}d` : "ends today"}
        </span>
      );
    } else if (status === "past_due") {
      statusBadge = (
        <span className="ml-1.5 flex items-center gap-0.5 text-red-400 text-[10px] font-medium">
          <AlertTriangle className="h-2.5 w-2.5" />
          past due
        </span>
      );
    } else if (status === "paused") {
      statusBadge = (
        <span className="ml-1.5 text-muted-foreground text-[10px] font-medium">paused</span>
      );
    }
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1 rounded border-none px-3 py-1 text-xs font-medium",
        colourClass,
        className,
      )}
    >
      {planName}
      {statusBadge} Plan
    </Badge>
  );
}

export function usePlanCheck(minPlan: string): boolean {
  const subscription = useSubscriptionStore((s) => s.subscription);
  if (!subscription) return false;
  return (PLAN_LEVEL[subscription.plan] ?? 0) >= (PLAN_LEVEL[minPlan] ?? 0);
}
