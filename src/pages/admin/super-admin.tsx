import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  FolderKanban,
  DollarSign,
  TrendingUp,
  Search,
  Trash2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  CreditCard,
  BarChart3,
  RefreshCw,
  Pencil,
  History,
} from "@/components/icons";
import { adminApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Loader1 from "@/components/ui/loader1";
import {
  AdminProject,
  AdminStats,
  AdminSubscription,
  AdminSubscriptionInfo,
  AdminUser,
} from "@/types/AdminTypes";
import { ActivityLog } from "@/types/activity-log";
import { CATEGORY_LABELS, formatActivityLabel } from "@/lib/activity-copy";
import { EditPlanDialog, EditUserDialog, PlanEditTarget } from "@/pages/admin/admin-dialogs";

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pro: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  team: "bg-primary text-primary dark:bg-primary/30 dark:text-primary/30",
};

const STATUS_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  trialing: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  past_due: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  cancelled: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  paused: "bg-muted text-muted-foreground",
};

function PlanBadge({ plan }: { plan: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PLAN_COLORS[plan] ?? "bg-muted text-muted-foreground"}`}
    >
      {plan}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-2 mt-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconClass,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  iconClass?: string;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-md ${iconClass ?? "bg-primary/10"}`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function DeleteButton({ onConfirm, loading }: { onConfirm: () => void; loading?: boolean }) {
  const [confirm, setConfirm] = useState(false);

  if (confirm) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-destructive">Sure?</span>
        <Button
          size="sm"
          variant="destructive"
          className="h-7 px-2 text-xs"
          onClick={() => {
            setConfirm(false);
            onConfirm();
          }}
          disabled={loading}
        >
          {loading ? <Loader1 className="h-3 w-3 " /> : "Yes"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs"
          onClick={() => setConfirm(false)}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
      onClick={() => setConfirm(true)}
      disabled={loading}
    >
      {loading ? <Loader1 className="h-3.5 w-3.5 " /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}

type Tab = "overview" | "users" | "projects" | "subscriptions" | "activity";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", Icon: BarChart3 },
  { id: "users", label: "Users", Icon: Users },
  { id: "projects", label: "Projects", Icon: FolderKanban },
  { id: "subscriptions", label: "Subscriptions", Icon: CreditCard },
  { id: "activity", label: "Activity", Icon: History },
];

function ownerId(userId: AdminSubscription["userId"]): string | null {
  return userId && typeof userId === "object" ? userId._id : null;
}

export function SuperAdminPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "super-admin") {
      navigate("/projects", { replace: true });
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } catch (e: unknown) {
      setStatsError((e as Error).message ?? "Failed to load stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [planTarget, setPlanTarget] = useState<PlanEditTarget | null>(null);
  const [userTarget, setUserTarget] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(async (page = 1, search = "") => {
    setUsersLoading(true);
    try {
      const res = await adminApi.listUsers({ page, limit: 20, search: search || undefined });
      setUsers(res.users);
      setUsersTotal(res.pagination.total);
      setUsersPage(res.pagination.page);
      setUsersTotalPages(res.pagination.totalPages);
    } catch {
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") loadUsers(1, usersSearch);
  }, [activeTab, loadUsers]);

  const handleDeleteUser = async (id: string) => {
    setDeletingUserId(id);
    setActionError(null);
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setUsersTotal((prev) => prev - 1);

      loadStats();
    } catch (e: unknown) {
      setActionError((e as Error).message ?? "Failed to delete user");
    } finally {
      setDeletingUserId(null);
    }
  };

  const applySubscriptionUpdate = (userId: string, subscription: AdminSubscriptionInfo) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === userId ? { ...u, subscription: { ...u.subscription, ...subscription } } : u,
      ),
    );
    setSubs((prev) =>
      prev.map((s) => {
        const id = ownerId(s.userId);
        return id === userId
          ? {
              ...s,
              ...subscription,
              plan: subscription.plan,
              status: subscription.status,
              billingCycle: subscription.billingCycle ?? null,
            }
          : s;
      }),
    );
    loadStats();
  };

  const openPlanEditor = (target: PlanEditTarget) => {
    setActionError(null);
    setPlanTarget(target);
  };

  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsTotalPages, setProjectsTotalPages] = useState(1);
  const [projectsSearch, setProjectsSearch] = useState("");
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const loadProjects = useCallback(async (page = 1, search = "") => {
    setProjectsLoading(true);
    try {
      const res = await adminApi.listProjects({ page, limit: 20, search: search || undefined });
      setProjects(res.projects);
      setProjectsTotal(res.pagination.total);
      setProjectsPage(res.pagination.page);
      setProjectsTotalPages(res.pagination.totalPages);
    } catch {
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "projects") loadProjects(1, projectsSearch);
  }, [activeTab, loadProjects]);

  const handleDeleteProject = async (id: string) => {
    setDeletingProjectId(id);
    try {
      await adminApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      setProjectsTotal((prev) => prev - 1);
      loadStats();
    } catch {
    } finally {
      setDeletingProjectId(null);
    }
  };

  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [subsTotal, setSubsTotal] = useState(0);
  const [subsPage, setSubsPage] = useState(1);
  const [subsTotalPages, setSubsTotalPages] = useState(1);
  const [subsLoading, setSubsLoading] = useState(false);
  const [subsPlanFilter, setSubsPlanFilter] = useState("");
  const [subsStatusFilter, setSubsStatusFilter] = useState("");

  const loadSubs = useCallback(async (page = 1, plan = "", status = "") => {
    setSubsLoading(true);
    try {
      const res = await adminApi.listSubscriptions({
        page,
        limit: 20,
        plan: plan || undefined,
        status: status || undefined,
      });
      setSubs(res.subscriptions);
      setSubsTotal(res.pagination.total);
      setSubsPage(res.pagination.page);
      setSubsTotalPages(res.pagination.totalPages);
    } catch {
    } finally {
      setSubsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "subscriptions") loadSubs(1, subsPlanFilter, subsStatusFilter);
  }, [activeTab, loadSubs]);

  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activitySearch, setActivitySearch] = useState("");
  const [activityCategory, setActivityCategory] = useState("");
  const [activityLoading, setActivityLoading] = useState(false);

  const loadActivity = useCallback(async (page = 1, search = "", category = "") => {
    setActivityLoading(true);
    try {
      const res = await adminApi.listActivity({
        page,
        limit: 30,
        search: search || undefined,
        category: category || undefined,
      });
      setActivity(res.logs);
      setActivityTotal(res.pagination.total);
      setActivityPage(res.pagination.page);
      setActivityTotalPages(res.pagination.totalPages);
    } catch {
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "activity") loadActivity(1, activitySearch, activityCategory);
  }, [activeTab, loadActivity]);

  if (!user || user.role !== "super-admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {statsError && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {statsError}
            </div>
          )}

          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-7 w-16 rounded bg-muted animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers.toLocaleString()}
                  sub={`+${stats.newUsersLast30Days} last 30 days`}
                  icon={Users}
                  iconClass="bg-blue-500/10"
                />
                <StatCard
                  title="Total Projects"
                  value={stats.totalProjects.toLocaleString()}
                  sub={`+${stats.newProjectsLast30Days} last 30 days`}
                  icon={FolderKanban}
                  iconClass="bg-purple-500/10"
                />
                <StatCard
                  title="Estimated MRR"
                  value={`$${stats.estimatedMRR.toLocaleString()}`}
                  sub={`${stats.paidSubscriptions} paid subscriptions`}
                  icon={DollarSign}
                  iconClass="bg-green-500/10"
                />
                <StatCard
                  title="Paid Subscribers"
                  value={stats.paidSubscriptions}
                  sub={`of ${stats.totalUsers} total users`}
                  icon={TrendingUp}
                  iconClass="bg-primary/10"
                />
              </div>

              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">Users by Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(["free", "starter", "pro", "team"] as const).map((plan) => {
                      const count = stats.planBreakdown[plan] ?? 0;
                      const pct =
                        stats.totalUsers > 0 ? Math.round((count / stats.totalUsers) * 100) : 0;
                      return (
                        <div key={plan} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <PlanBadge plan={plan} />
                            <span className="text-sm font-semibold">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      )}

      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email…"
                className="pl-9"
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadUsers(1, usersSearch);
                }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadUsers(1, usersSearch)}>
              Search
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">{usersTotal} total</span>
          </div>

          {actionError && activeTab === "users" && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {actionError}
            </div>
          )}

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Provider
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Joined
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={5}>
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium truncate max-w-[180px]">{u.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {u.email}
                          </p>
                          {u.role === "super-admin" && (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-destructive font-medium">
                              <ShieldAlert className="h-3 w-3" /> admin
                            </span>
                          )}
                          {u.isEmailVerified === false && (
                            <span className="inline-flex items-center gap-1 mt-0.5 text-xs text-amber-600 dark:text-amber-400">
                              unverified
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs capitalize text-muted-foreground">
                          {u.provider}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <PlanBadge plan={u.subscription?.plan ?? "free"} />
                          <StatusBadge status={u.subscription?.status ?? "free"} />
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit plan"
                            onClick={() =>
                              openPlanEditor({
                                userId: u._id,
                                userName: u.name,
                                userEmail: u.email,
                                plan: u.subscription?.plan ?? "free",
                                status: u.subscription?.status ?? "free",
                                billingCycle: u.subscription?.billingCycle,
                                seats: u.subscription?.seats,
                              })
                            }
                          >
                            <CreditCard className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Manage user"
                            onClick={() => {
                              setActionError(null);
                              setUserTarget(u);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <DeleteButton
                            loading={deletingUserId === u._id}
                            onConfirm={() => handleDeleteUser(u._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={usersPage}
            totalPages={usersTotalPages}
            onPage={(p) => {
              setUsersPage(p);
              loadUsers(p, usersSearch);
            }}
          />
        </div>
      )}

      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by repo name…"
                className="pl-9"
                value={projectsSearch}
                onChange={(e) => setProjectsSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadProjects(1, projectsSearch);
                }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => loadProjects(1, projectsSearch)}>
              Search
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">{projectsTotal} total</span>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Project</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Owner
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {projectsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={4}>
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : projects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  projects.map((p) => (
                    <tr
                      key={p._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">
                          {p.repoOwner}/{p.repoName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{p._id}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.userId ? (
                          <div>
                            <p className="text-sm">
                              {(p.userId as { name: string; email: string }).name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(p.userId as { name: string; email: string }).email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">deleted user</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DeleteButton
                          loading={deletingProjectId === p._id}
                          onConfirm={() => handleDeleteProject(p._id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={projectsPage}
            totalPages={projectsTotalPages}
            onPage={(p) => {
              setProjectsPage(p);
              loadProjects(p, projectsSearch);
            }}
          />
        </div>
      )}

      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              value={subsPlanFilter}
              onChange={(e) => {
                setSubsPlanFilter(e.target.value);
                loadSubs(1, e.target.value, subsStatusFilter);
              }}
            >
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="team">Team</option>
            </select>
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              value={subsStatusFilter}
              onChange={(e) => {
                setSubsStatusFilter(e.target.value);
                loadSubs(1, subsPlanFilter, e.target.value);
              }}
            >
              <option value="">All statuses</option>
              <option value="free">Free</option>
              <option value="active">Active</option>
              <option value="trialing">Trialing</option>
              <option value="past_due">Past due</option>
              <option value="cancelled">Cancelled</option>
              <option value="paused">Paused</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSubs(1, subsPlanFilter, subsStatusFilter)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">{subsTotal} total</span>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Billing
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Since
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={6}>
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : subs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subs.map((s) => (
                    <tr
                      key={s._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        {s.userId ? (
                          <div>
                            <p className="font-medium truncate max-w-[180px]">
                              {(s.userId as { name: string; email: string }).name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              {(s.userId as { name: string; email: string }).email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">deleted user</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <PlanBadge plan={s.plan} />
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs capitalize text-muted-foreground">
                          {s.billingCycle ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(s.createdAt), { addSuffix: true })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.userId ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit plan"
                            onClick={() =>
                              openPlanEditor({
                                userId: (s.userId as { _id: string })._id,
                                userName: (s.userId as { name: string }).name,
                                userEmail: (s.userId as { email: string }).email,
                                plan: s.plan,
                                status: s.status,
                                billingCycle: s.billingCycle,
                                seats: s.seats,
                              })
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={subsPage}
            totalPages={subsTotalPages}
            onPage={(p) => {
              setSubsPage(p);
              loadSubs(p, subsPlanFilter, subsStatusFilter);
            }}
          />
        </div>
      )}

      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search actor, email, or summary…"
                className="pl-9"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadActivity(1, activitySearch, activityCategory);
                }}
              />
            </div>
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm"
              value={activityCategory}
              onChange={(e) => {
                setActivityCategory(e.target.value);
                loadActivity(1, activitySearch, e.target.value);
              }}
            >
              <option value="">All categories</option>
              {Object.entries(CATEGORY_LABELS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadActivity(1, activitySearch, activityCategory)}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <span className="text-sm text-muted-foreground ml-auto">{activityTotal} total</span>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    When
                  </th>
                </tr>
              </thead>
              <tbody>
                {activityLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-4 py-3" colSpan={3}>
                        <div className="h-4 rounded bg-muted animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : activity.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No activity found
                    </td>
                  </tr>
                ) : (
                  activity.map((log) => (
                    <tr
                      key={log._id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium">{formatActivityLabel(log)}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[420px]">
                          {log.actorEmail || log.actorName}
                          {log.projectName ? ` · ${log.projectName}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs capitalize text-muted-foreground">
                          {CATEGORY_LABELS[log.category] ?? log.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={activityPage}
            totalPages={activityTotalPages}
            onPage={(p) => {
              setActivityPage(p);
              loadActivity(p, activitySearch, activityCategory);
            }}
          />
        </div>
      )}

      <EditPlanDialog
        open={!!planTarget}
        target={planTarget}
        onClose={() => setPlanTarget(null)}
        onSaved={applySubscriptionUpdate}
      />
      <EditUserDialog
        open={!!userTarget}
        user={userTarget}
        currentUserId={user.id}
        onClose={() => setUserTarget(null)}
        onSaved={(updated) => {
          setUsers((prev) => prev.map((u) => (u._id === updated._id ? { ...u, ...updated } : u)));
        }}
      />
    </div>
  );
}
