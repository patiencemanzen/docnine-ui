import { create } from "zustand";
import { billingApi } from "@/lib/api";
import { SubscriptionData, SubscriptionState } from "@/types/BillingTypes";

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  usage: null,
  plans: [],
  loading: false,
  error: null,

  load: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const data = await billingApi.getSubscription();
      set({ subscription: data.subscription, usage: data.usage });
    } catch (err: any) {
      set({ error: err.message ?? "Failed to load subscription" });
    } finally {
      set({ loading: false });
    }
  },

  loadPlans: async () => {
    try {
      const data = await billingApi.getPlans();
      set({ plans: data.plans });
    } catch {

    }
  },

  refresh: async () => {
    try {
      const data = await billingApi.getSubscription();
      set({ subscription: data.subscription, usage: data.usage });
    } catch {

    }
  },

  reset: () => set({ subscription: null, usage: null, plans: [], error: null }),
}));

export function isPaidPlan(sub: SubscriptionData | null): boolean {
  if (!sub) return false;
  return sub.plan !== "free";
}

export function effectivePlan(sub: SubscriptionData | null): string {
  if (!sub) return "free";
  if (sub.status === "paused") return "free";
  return sub.plan;
}

export function hasFeature(
  sub: SubscriptionData | null,
  featureKey: keyof SubscriptionData["features"],
): boolean {
  if (!sub) return false;
  return !!sub.features?.[featureKey];
}

export const PLAN_LEVEL: Record<string, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  team: 3,
};

export function meetsMinPlan(
  sub: SubscriptionData | null,
  minPlan: string,
): boolean {
  const current = effectivePlan(sub);
  return (PLAN_LEVEL[current] ?? 0) >= (PLAN_LEVEL[minPlan] ?? 0);
}
