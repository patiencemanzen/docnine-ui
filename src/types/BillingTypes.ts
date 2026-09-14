export interface BillingPlanLimits {
  projects: number | null;
  seats: number | null;
  extraSeatPriceMonthly: number | null;
  attachmentsPerProject: number | null;
  maxFileSizeMb: number;
  aiChatsPerMonth: number | null;
  portals: number | null;
  versionHistoryDays: number | null;
  exportFormats: string[];
}

export interface BillingPlanFeatures {
  shareViewOnly: boolean;
  shareEdit: boolean;
  maxShares: number | null;
  archiveRestore: boolean;
  customDomain: boolean;
  docApproval: boolean;
  progressTracker: boolean;
  openApiImporter: boolean;
  apiWebhookAccess: boolean;
  githubSync: boolean;
}

export interface BillingPlan {
  id: string;
  name: string;
  tagline: string;
  prices: {
    monthly: number; // dollars
    annual: number; // dollars per month
    annualTotal: number | null;
    savingsPercent: number;
  };
  limits: BillingPlanLimits;
  features: BillingPlanFeatures;
}

export type SubscriptionStatus =
  | "free"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "paused";

export interface SubscriptionData {
  plan: string;
  planName: string;
  billingCycle: "monthly" | "annual" | null;
  status: SubscriptionStatus;
  seats: number;
  extraSeats: number;
  trialEndsAt: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  pendingPlan: string | null;
  pauseEndsAt: string | null;
  trialUsedAt: string | null;
  trialEligible: boolean;
  limits: BillingPlanLimits;
  features: BillingPlanFeatures;
}

export interface UsageData {
  aiChatsUsed: number;
  aiChatsResetAt: string | null;
  projectCount: number;
  portalCount: number;
  activeShareCount: number;
}

export type InvoiceStatus = "pending" | "paid" | "failed" | "refunded" | "void";

export interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  amount: number; // cents
  currency: string;
  description: string;
  status: InvoiceStatus;
  paymentMethodSnapshot: string | null;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

export interface PaymentMethodData {
  _id: string;
  type: "card" | "mobile_money" | "bank_transfer";
  isDefault: boolean;
  displayLabel: string;
  /** ISO currency code the token was issued in (e.g. NGN, KES, USD) */
  currency: string;
  card?: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  };
  mobileMoney?: {
    phone: string;
    network: string;
    country: string;
  };
  createdAt: string;
}

export interface PlanBadgeProps {
  className?: string;
  /** Show trial countdown or dunning warning inline. Defaults to true. */
  showStatus?: boolean;
}

export interface PlansModalProps {
  open: boolean;
  onClose: () => void;
}

export interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Human-readable name of the feature being blocked, e.g. "GitHub Sync" */
  featureName: string;
  /** Minimum plan ID required, e.g. "pro" */
  requiredPlan: string;
  /** Optional description override shown under the title */
  description?: string;
}

export interface SubscriptionState {
  subscription: SubscriptionData | null;
  usage: UsageData | null;
  plans: BillingPlan[];
  loading: boolean;
  error: string | null;

  // Load subscription + usage for the authenticated user
  load: () => Promise<void>;
  // Load available plans (public : no auth)
  loadPlans: () => Promise<void>;
  // Reset on logout
  reset: () => void;
  // Refresh subscription after a plan change
  refresh: () => Promise<void>;
}