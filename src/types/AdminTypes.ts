export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  newUsersLast30Days: number;
  newProjectsLast30Days: number;
  planBreakdown: Record<string, number>;
  estimatedMRR: number;
  paidSubscriptions: number;
}

export interface AdminSubscriptionInfo {
  _id?: string;
  plan: string;
  status: string;
  billingCycle?: string | null;
  seats?: number;
  currentPeriodEnd?: string | null;
  trialEndsAt?: string | null;
  lastBillingNote?: string | null;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  isEmailVerified?: boolean;
  createdAt: string;
  subscription: AdminSubscriptionInfo;
}

export interface AdminProject {
  _id: string;
  name: string;
  repoOwner: string;
  repoName: string;
  createdAt: string;
  userId: { _id: string; name: string; email: string } | null;
}

export interface AdminSubscription {
  _id: string;
  plan: string;
  status: string;
  billingCycle: string | null;
  seats?: number;
  currentPeriodEnd?: string | null;
  createdAt: string;
  userId: { _id: string; name: string; email: string } | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
