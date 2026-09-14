import { useEffect, useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { formatDistanceToNow, format } from "date-fns"
import {
    FolderCode,
    FileText,
    ShieldCheck,
    Plus,
    ArrowRight,
    GitBranch,
    Clock,
    Zap,
    BookOpen,
    TerminalSquare,
    Settings,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    Loader2,
    BarChart3,
    FileCode2,
} from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/auth"
import { useProjectStore } from "@/store/projects"
import { useSubscriptionStore, effectivePlan } from "@/store/subscription"
import { useNotificationStore } from "@/store/useNotificationStore"
import { cn } from "@/lib/utils"



function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
}

function getFirstName(name: string | undefined) {
    return name?.split(" ")[0] ?? "there"
}

function statusConfig(status: string) {
    switch (status) {
        case "completed":
            return { label: "Completed", icon: CheckCircle2, className: "text-green-600 dark:text-green-400" }
        case "analyzing":
            return { label: "Analyzing", icon: Loader2, className: "text-blue-600 dark:text-blue-400 animate-spin" }
        case "failed":
            return { label: "Failed", icon: AlertCircle, className: "text-destructive" }
        case "archived":
            return { label: "Archived", icon: Clock, className: "text-muted-foreground" }
        default:
            return { label: status, icon: Clock, className: "text-muted-foreground" }
    }
}

function UsageMeter({ label, used, limit }: { label: string; used: number; limit: number | null }) {
    const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0
    const isNearLimit = pct >= 80
    const isAtLimit = pct >= 100

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">{label}</span>
                <span className={cn(
                    "font-medium tabular-nums",
                    isAtLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-foreground"
                )}>
                    {used}{limit ? ` / ${limit}` : ""}
                </span>
            </div>
            {limit && (
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            isAtLimit ? "bg-destructive" : isNearLimit ? "bg-amber-500" : "bg-primary"
                        )}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            )}
        </div>
    )
}



function StatCard({
    label,
    value,
    icon: Icon,
    sub,
    loading,
    accent,
}: {
    label: string
    value: string | number
    icon: React.ElementType
    sub?: string
    loading?: boolean
    accent?: "green" | "blue" | "amber" | "purple"
}) {
    const accentMap = {
        green: "text-green-600 dark:text-green-400 bg-green-500/10",
        blue: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
        amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
    }
    const iconClass = accent ? accentMap[accent] : "text-muted-foreground bg-muted"

    return (
        <Card className="border-border/60">
            <CardContent className="pt-5 pb-4 px-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                        {loading ? (
                            <Skeleton className="h-7 w-16 mt-1" />
                        ) : (
                            <p className="text-[26px] font-bold leading-none tabular-nums">{value}</p>
                        )}
                        {sub && !loading && (
                            <p className="text-[12px] text-muted-foreground mt-1.5">{sub}</p>
                        )}
                    </div>
                    <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", iconClass)}>
                        <Icon className="h-4 w-4" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}



function QuickAction({
    href,
    icon: Icon,
    label,
    description,
    accent,
}: {
    href: string
    icon: React.ElementType
    label: string
    description: string
    accent?: string
}) {
    return (
        <Link
            to={href}
            className="group flex items-center gap-3.5 rounded-xl border border-border/60 bg-card px-4 py-3.5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
        >
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 transition-colors", accent ?? "bg-muted text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary")}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">{label}</p>
                <p className="text-[12px] text-muted-foreground truncate">{description}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </Link>
    )
}



function NotifItem({ notif }: { notif: any }) {
    return (
        <div className={cn(
            "flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0",
            !notif.isRead && "bg-primary/[0.03]"
        )}>
            <div className={cn(
                "mt-0.5 h-2 w-2 rounded-full shrink-0",
                notif.isRead ? "bg-transparent" : "bg-primary"
            )} />
            <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground leading-snug">{notif.title}</p>
                <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{notif.message}</p>
            </div>
            <span className="text-[11px] text-muted-foreground/60 shrink-0 mt-0.5">
                {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
            </span>
        </div>
    )
}



export function HomePage() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { projects, isLoading: projectsLoading, fetchProjects } = useProjectStore()
    const { subscription, usage, loading: subLoading, load: loadSub } = useSubscriptionStore()
    const { notifications, isLoading: notifsLoading, fetchNotifications } = useNotificationStore()

    useEffect(() => {
        fetchProjects({ limit: 20 })
        loadSub()
        fetchNotifications()
    }, [fetchProjects, loadSub, fetchNotifications])

    const today = format(new Date(), "EEEE, MMMM d")

    
    const stats = useMemo(() => {
        const total = projects.length
        const completed = projects.filter((p) => p.status === "completed").length
        const analyzing = projects.filter((p) => p.status === "analyzing").length
        const failed = projects.filter((p) => p.status === "failed").length
        return { total, completed, analyzing, failed }
    }, [projects])

    const recentProjects = useMemo(
        () => [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5),
        [projects]
    )

    const recentNotifs = useMemo(
        () => notifications.slice(0, 5),
        [notifications]
    )

    const plan = effectivePlan(subscription)
    const projectLimit = subscription?.limits?.projects ?? null
    const projectsUsed = usage?.projectCount ?? stats.total

    return (
        <div className="space-y-8 pb-6">

            {}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[13px] text-muted-foreground">{today}</p>
                    <h1 className="text-[22px] font-bold tracking-tight mt-0.5">
                        {getGreeting()}, {getFirstName(user?.name)} 👋
                    </h1>
                    <p className="text-[13px] text-muted-foreground mt-1">
                        Here's what's happening with your documentation projects.
                    </p>
                </div>
                <Button
                    onClick={() => navigate("/projects")}
                    className="shrink-0 gap-1.5"
                    size="sm"
                >
                    <Plus className="h-3.5 w-3.5" />
                    New Project
                </Button>
            </div>

            {}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Projects"
                    value={stats.total}
                    icon={FolderCode}
                    sub={projectLimit ? `${projectsUsed} of ${projectLimit} used` : undefined}
                    loading={projectsLoading}
                    accent="blue"
                />
                <StatCard
                    label="Docs Generated"
                    value={stats.completed}
                    icon={FileText}
                    sub={stats.completed > 0 ? `${Math.round((stats.completed / Math.max(stats.total, 1)) * 100)}% success rate` : "No docs yet"}
                    loading={projectsLoading}
                    accent="green"
                />
                <StatCard
                    label="Analyzing Now"
                    value={stats.analyzing}
                    icon={Zap}
                    sub={stats.analyzing > 0 ? "Pipeline running" : "All quiet"}
                    loading={projectsLoading}
                    accent="amber"
                />
                <StatCard
                    label="Failed Runs"
                    value={stats.failed}
                    icon={AlertCircle}
                    sub={stats.failed > 0 ? "Needs attention" : "No errors"}
                    loading={projectsLoading}
                    accent={stats.failed > 0 ? "amber" : undefined}
                />
            </div>

            {}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {}
                <div className="xl:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[15px] font-semibold">Recent Projects</h2>
                        <Link
                            to="/projects"
                            className="text-[13px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                        >
                            View all <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    {projectsLoading ? (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <Card key={i} className="border-border/60">
                                    <CardContent className="p-4">
                                        <Skeleton className="h-4 w-48 mb-2" />
                                        <Skeleton className="h-3 w-64" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : recentProjects.length === 0 ? (
                        <Card className="border-border/60 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center">
                                    <FolderCode className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-[14px] font-semibold">No projects yet</p>
                                    <p className="text-[13px] text-muted-foreground mt-0.5">Connect a repo and generate your first documentation.</p>
                                </div>
                                <Button size="sm" className="gap-1.5 mt-1" onClick={() => navigate("/projects")}>
                                    <Plus className="h-3.5 w-3.5" />
                                    Create Project
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-2">
                            {recentProjects.map((project) => {
                                const sc = statusConfig(project.status)
                                const StatusIcon = sc.icon
                                return (
                                    <Link
                                        key={project.id}
                                        to={`/projects/${project.id}`}
                                        className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150"
                                    >
                                        {}
                                        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                            <GitBranch className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>

                                        {}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-semibold text-foreground truncate">{project.name}</p>
                                            <p className="text-[12px] text-muted-foreground truncate">
                                                {project.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                                            </p>
                                        </div>

                                        {}
                                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                            {project.readme && (
                                                <span title="README" className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
                                                    <BookOpen className="h-3 w-3" />
                                                </span>
                                            )}
                                            {project.apiReference && (
                                                <span title="API Reference" className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
                                                    <FileCode2 className="h-3 w-3" />
                                                </span>
                                            )}
                                            {project.securityReport && (
                                                <span title="Security Report" className="flex h-6 w-6 items-center justify-center rounded bg-muted text-muted-foreground">
                                                    <ShieldCheck className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>

                                        {}
                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <div className="flex items-center gap-1.5">
                                                <StatusIcon className={cn("h-3 w-3", sc.className)} />
                                                <span className={cn("text-[12px] font-medium", sc.className)}>{sc.label}</span>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground/60">
                                                {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                {}
                <div className="space-y-5">

                    {}
                    <div>
                        <h2 className="text-[15px] font-semibold mb-3">Quick Actions</h2>
                        <div className="space-y-2">
                            <QuickAction
                                href="/projects"
                                icon={Plus}
                                label="New Project"
                                description="Connect a GitHub, GitLab or Bitbucket repo"
                                accent="bg-primary/10 text-primary"
                            />
                            <QuickAction
                                href="/documentations"
                                icon={BookOpen}
                                label="Doc Sites"
                                description="Browse all generated documentation"
                            />
                            <QuickAction
                                href="/logs"
                                icon={TerminalSquare}
                                label="Activity"
                                description="See what happened in your projects"
                            />
                            <QuickAction
                                href="/settings"
                                icon={Settings}
                                label="Settings"
                                description="Integrations, tokens & preferences"
                            />
                        </div>
                    </div>

                    {}
                    <Card className="border-border/60">
                        <CardHeader className="pb-3 pt-4 px-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[14px] font-semibold">Plan & Usage</CardTitle>
                                <Badge variant="secondary" className="text-[11px] capitalize font-semibold">
                                    {plan}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            {subLoading ? (
                                <>
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-3/4" />
                                </>
                            ) : (
                                <>
                                    <UsageMeter
                                        label="Projects"
                                        used={projectsUsed}
                                        limit={projectLimit}
                                    />
                                    {usage?.aiChatsUsed != null && (
                                        <UsageMeter
                                            label="AI Chats"
                                            used={usage.aiChatsUsed}
                                            limit={subscription?.limits?.aiChatsPerMonth ?? null}
                                        />
                                    )}
                                </>
                            )}
                            {plan === "free" && (
                                <Link
                                    to="/settings?tab=billing"
                                    className="mt-1 flex items-center gap-1.5 text-[12px] font-medium text-primary hover:underline"
                                >
                                    <TrendingUp className="h-3 w-3" />
                                    Upgrade for more capacity
                                </Link>
                            )}
                        </CardContent>
                    </Card>

                    {}
                    <Card className="border-border/60">
                        <CardHeader className="pb-0 pt-4 px-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-[14px] font-semibold">Recent Activity</CardTitle>
                                {recentNotifs.length > 0 && (
                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pt-2 pb-0">
                            {notifsLoading ? (
                                <div className="px-4 py-3 space-y-3">
                                    {[...Array(3)].map((_, i) => (
                                        <Skeleton key={i} className="h-4 w-full" />
                                    ))}
                                </div>
                            ) : recentNotifs.length === 0 ? (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-[13px] text-muted-foreground">No recent activity</p>
                                </div>
                            ) : (
                                <>
                                    {recentNotifs.map((n) => (
                                        <NotifItem key={n._id} notif={n} />
                                    ))}
                                    <div className="px-4 py-2.5 border-t border-border/50">
                                        <Link
                                            to="/logs"
                                            className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                        >
                                            View all activity <ArrowRight className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>

        </div>
    )
}
