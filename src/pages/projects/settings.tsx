import { useEffect, useState, useCallback } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useProjectStore } from "@/store/projects"
import { useSubscriptionStore } from "@/store/subscription"
import { authApi, projectsApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SlackIntegrationSettings } from "@/components/integrations/SlackIntegrationSettings"
import { ProjectGeneralSettings } from "@/components/project/ProjectGeneralSettings"
import { UpgradeModal } from "@/components/billing/UpgradeModal"
import {
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Circle,
    Github,
    Lock,
    RefreshCw,
    Settings,
    Webhook,
    Zap,
} from "@/components/icons"
import { cn } from "@/lib/utils"

export function ProjectSettingsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { getProject } = useProjectStore()
    const subscription = useSubscriptionStore((s) => s.subscription)

    const [project, setProject] = useState<ReturnType<typeof useProjectStore.getState>["projects"][0] | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("general")


    const [upgradeModal, setUpgradeModal] = useState<{ open: boolean; feature: string; plan: string; description?: string }>({
        open: false,
        feature: "",
        plan: "pro",
    })


    const [webhookStatus, setWebhookStatus] = useState<{
        hasSecret: boolean
        webhookEnabled: boolean
        lastWebhookAt: string | null
        lastWebhookStatus: "success" | "failed" | "skipped" | null
    } | null>(null)
    const [webhookStatusLoading, setWebhookStatusLoading] = useState(false)
    const [syncLoading, setSyncLoading] = useState(false)
    const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null)

    const isOwner = project?.shareRole === "owner"
    const slackStatus = searchParams.get("slack")
    const slackMessage = searchParams.get("message")
    const slackWorkspace = searchParams.get("workspace")

    const hasGithubSync = Boolean(subscription?.features?.githubSync)
    const hasWebhookAccess = Boolean(subscription?.features?.apiWebhookAccess)

    useEffect(() => {
        if (slackStatus) {
            setActiveTab("integrations")
        }
    }, [slackStatus])


    useEffect(() => {
        if (activeTab !== "integrations" || webhookStatus || webhookStatusLoading) return
        setWebhookStatusLoading(true)
        authApi.getWebhookStatus()
            .then((data) => setWebhookStatus(data))
            .catch(() => setWebhookStatus(null))
            .finally(() => setWebhookStatusLoading(false))
    }, [activeTab, webhookStatus, webhookStatusLoading])

    const handleSync = useCallback(async (force = false) => {
        if (!id) return
        setSyncLoading(true)
        setSyncFeedback(null)
        try {
            const result = await projectsApi.sync(id, force)

            setProject((prev) => prev ? { ...prev, apiStatus: "running", status: "analyzing" } : prev)
            setSyncFeedback({ type: "success", msg: "Sync started : redirecting to live progress…" })

            setTimeout(() => {
                navigate(`/projects/${id}/live?streamUrl=${encodeURIComponent(result.streamUrl)}`)
            }, 800)
        } catch (err: any) {
            setSyncFeedback({ type: "error", msg: err?.message ?? "Failed to trigger sync." })
        } finally {
            setSyncLoading(false)
        }
    }, [id, navigate])

    const handleProjectUpdate = (updatedProject) => {
        setProject(updatedProject)
    }

    useEffect(() => {
        if (!id) return
        setIsLoading(true)
        setError(null)
        getProject(id)
            .then((p) => setProject(p))
            .catch((err: any) => setError(err?.message ?? "Failed to load project."))
            .finally(() => setIsLoading(false))
    }, [id, getProject])

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <div className="w-full max-w-3xl space-y-6 mt-4">
                    <Skeleton className="h-4 w-52" />
                    <div className="bg-card px-6 py-5 rounded-xl border border-border">
                        <Skeleton className="h-6 w-48 mb-2" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                    <Skeleton className="h-64 w-full rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 mb-4">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Project Not Found</h2>
                <p className="text-[13px] text-muted-foreground mt-2 max-w-sm">
                    {error ?? "The project does not exist or has been deleted."}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-6">
                    <Link to="/projects">Back to Projects</Link>
                </Button>
            </div>
        )
    }

    return (
        <>
            <div className="flex justify-center">
                <div className={cn("w-full space-y-5", "max-w-3xl")}>
                    <div className="space-y-5 mt-4">
                        { }
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-card px-6 py-5 rounded-xl border border-border">
                            <div className="space-y-0.5">
                                <h1 className="text-[22px] font-semibold tracking-tight">Project Settings</h1>
                                <p className="text-[13px] text-muted-foreground">
                                    Manage your project information and integrations.
                                </p>
                            </div>
                        </div>

                        { }
                        {(slackStatus === "success" || slackStatus === "error") && (
                            <div
                                className={`rounded-lg border px-4 py-3 text-[13px] ${slackStatus === "success"
                                    ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                    }`}
                            >
                                {slackStatus === "success"
                                    ? `Slack connected${slackWorkspace ? ` to ${slackWorkspace}` : ""}.`
                                    : (slackMessage ?? "Slack connection failed. Please try again.")}
                            </div>
                        )}

                        { }
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="general" className="gap-1.5 text-[13px]">
                                    <Settings className="h-3.5 w-3.5" />
                                    General
                                </TabsTrigger>
                                <TabsTrigger value="integrations" className="gap-1.5 text-[13px]">
                                    <Zap className="h-3.5 w-3.5" />
                                    Integrations
                                </TabsTrigger>
                            </TabsList>

                            { }
                            <TabsContent value="general" className="space-y-5 mt-4">
                                {isOwner ? (
                                    <ProjectGeneralSettings project={project} onProjectUpdate={handleProjectUpdate} />
                                ) : (
                                    <Card className="shadow-none">
                                        <CardContent className="pt-6">
                                            <div className="rounded-lg border border-border bg-muted/30 p-4 text-[13px] text-muted-foreground">
                                                Only project owners can modify general settings for this project.
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            { }
                            <TabsContent value="integrations" className="space-y-4 mt-4">

                                {!isOwner && (
                                    <div className="rounded-lg border border-border bg-muted/30 p-4 text-[13px] text-muted-foreground">
                                        Only project owners can manage integrations for this project.
                                    </div>
                                )}

                                {isOwner && (
                                    <>
                                        { }
                                        <Card className="shadow-none">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
                                                    <Zap className="h-4 w-4 text-muted-foreground" />
                                                    Notifications &amp; Alerts
                                                </CardTitle>
                                                <CardDescription className="text-[13px]">
                                                    Connect external tools to receive security alerts and query your documentation.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <SlackIntegrationSettings projectId={project.id} />
                                            </CardContent>
                                        </Card>

                                        { }
                                        <Card className="shadow-none">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
                                                        <Github className="h-4 w-4 text-muted-foreground" />
                                                        GitHub Sync
                                                    </CardTitle>
                                                    {!hasGithubSync && (
                                                        <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                                                            <Lock className="h-2.5 w-2.5" /> Pro
                                                        </Badge>
                                                    )}
                                                    {hasGithubSync && webhookStatus?.hasSecret && webhookStatus?.webhookEnabled && (
                                                        <Badge variant="outline" className="text-[11px] gap-1 text-green-600 dark:text-green-400 border-green-500/40">
                                                            <CheckCircle2 className="h-2.5 w-2.5" /> Configured
                                                        </Badge>
                                                    )}
                                                    {hasGithubSync && (!webhookStatus?.hasSecret || !webhookStatus?.webhookEnabled) && !webhookStatusLoading && (
                                                        <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                                                            <Circle className="h-2.5 w-2.5" /> Not configured
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-[13px]">
                                                    Automatically re-analyze documentation when commits are pushed to this repository.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {hasGithubSync ? (
                                                    <div className="space-y-4">
                                                        { }
                                                        {syncFeedback && (
                                                            <div className={cn(
                                                                "rounded-lg border px-3 py-2.5 text-[13px]",
                                                                syncFeedback.type === "success"
                                                                    ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                                                                    : "border-destructive/30 bg-destructive/10 text-destructive"
                                                            )}>
                                                                {syncFeedback.msg}
                                                            </div>
                                                        )}

                                                        { }
                                                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div className="space-y-0.5 min-w-0">
                                                                    <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Last Synced Commit</p>
                                                                    {project?.lastSyncedCommit ? (
                                                                        <code className="text-[12px] font-mono text-foreground">
                                                                            {project.lastSyncedCommit.slice(0, 12)}
                                                                        </code>
                                                                    ) : (
                                                                        <p className="text-[13px] text-muted-foreground">Never synced</p>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="gap-1.5 text-[13px]"
                                                                        disabled={syncLoading || project?.apiStatus === "running"}
                                                                        onClick={() => handleSync(false)}
                                                                    >
                                                                        <RefreshCw className={cn("h-3.5 w-3.5", syncLoading && "animate-spin")} />
                                                                        {syncLoading ? "Syncing…" : "Sync now"}
                                                                    </Button>
                                                                </div>
                                                            </div>

                                                            {project?.lastSyncedAt && (
                                                                <p className="text-[12px] text-muted-foreground">
                                                                    Last synced:{" "}
                                                                    {new Date(project.lastSyncedAt).toLocaleDateString(undefined, {
                                                                        month: "short", day: "numeric", year: "numeric",
                                                                        hour: "2-digit", minute: "2-digit",
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>

                                                        { }
                                                        {webhookStatusLoading ? (
                                                            <div className="h-10 flex items-center">
                                                                <Skeleton className="h-3 w-48" />
                                                            </div>
                                                        ) : webhookStatus?.hasSecret && webhookStatus?.webhookEnabled ? (
                                                            <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-[13px] text-green-700 dark:text-green-400 space-y-1">
                                                                <p className="font-medium">Webhook active</p>
                                                                <p className="text-[12px]">
                                                                    Pushes to{" "}
                                                                    <code className="font-mono">{project?.repoOwner ? `${project.repoOwner}/${project.name}` : "this repository"}</code>{" "}
                                                                    will automatically trigger incremental analysis.
                                                                    {webhookStatus.lastWebhookAt && (
                                                                        <> Last received: {new Date(webhookStatus.lastWebhookAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}.</>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <div className="rounded-lg border border-border bg-muted/20 px-3 py-3 text-[13px] space-y-2">
                                                                <p className="font-medium text-foreground">Set up auto-sync</p>
                                                                <p className="text-muted-foreground text-[12px]">
                                                                    Configure your GitHub webhook in{" "}
                                                                    <Link to="/settings?tab=integrations" className="text-primary underline underline-offset-2">
                                                                        Account Settings → Integrations
                                                                    </Link>{" "}
                                                                    to enable automatic re-analysis on every push.
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[13px] font-medium">Upgrade to unlock GitHub Sync</p>
                                                            <p className="text-[12px] text-muted-foreground">
                                                                Available on the Pro plan and above.
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1.5 shrink-0"
                                                            onClick={() => setUpgradeModal({ open: true, feature: "GitHub Sync", plan: "pro" })}
                                                        >
                                                            <Lock className="h-3 w-3" />
                                                            Upgrade to Pro
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        { }
                                        <Card className="shadow-none">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-[15px] font-semibold flex items-center gap-2">
                                                        <Webhook className="h-4 w-4 text-muted-foreground" />
                                                        API &amp; Webhooks
                                                    </CardTitle>
                                                    {!hasWebhookAccess && (
                                                        <Badge variant="outline" className="text-[11px] gap-1 text-muted-foreground">
                                                            <Lock className="h-2.5 w-2.5" /> Team
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-[13px]">
                                                    Access your documentation via REST API and receive webhook events on doc changes.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {hasWebhookAccess ? (
                                                    <div className="space-y-4">
                                                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                                                            <div className="space-y-1">
                                                                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Project API Endpoint</p>
                                                                <code className="block text-[12px] font-mono bg-muted px-3 py-2 rounded-md break-all">
                                                                    GET /v1/projects/{project.id}/docs
                                                                </code>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Webhook Events</p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {["doc.generated", "doc.section.updated", "security.alert"].map((evt) => (
                                                                        <Badge key={evt} variant="secondary" className="text-[11px] font-mono">
                                                                            {evt}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-[12px] text-muted-foreground">
                                                            Full API reference and webhook setup available in{" "}
                                                            <a href="https://docs.docnine.dev/api" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
                                                                our API docs
                                                            </a>.
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="rounded-xl border border-dashed border-border bg-muted/20 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[13px] font-medium">Upgrade to unlock API &amp; Webhooks</p>
                                                            <p className="text-[12px] text-muted-foreground">
                                                                Available on the Team plan. Automate documentation workflows.
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="gap-1.5 shrink-0"
                                                            onClick={() => setUpgradeModal({
                                                                open: true,
                                                                feature: "API & Webhooks",
                                                                plan: "team",
                                                                description: "Access the DocNine REST API and configure webhooks to automate your documentation workflows.",
                                                            })}
                                                        >
                                                            <Lock className="h-3 w-3" />
                                                            Upgrade to Team
                                                        </Button>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            <UpgradeModal
                open={upgradeModal.open}
                onClose={() => setUpgradeModal((prev) => ({ ...prev, open: false }))}
                featureName={upgradeModal.feature}
                requiredPlan={upgradeModal.plan}
                description={upgradeModal.description}
            />
        </>
    )
}
