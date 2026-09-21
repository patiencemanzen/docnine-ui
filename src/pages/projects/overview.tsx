import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProjectStore } from "@/store/projects";
import { projectsApi, activityLogsApi } from "@/lib/api";
import { formatActivityLabel } from "@/lib/activity-copy";
import { useAuthStore } from "@/store/auth";
import { prepareExportData, getExportSummary, getFormattedTabContent } from "@/lib/export-utils";
import { generatePDFHTML } from "@/lib/pdf-generator";
import { useSubscriptionStore, meetsMinPlan } from "@/store/subscription";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import { DocRenderer } from "@/components/projects/doc-render";
import { SharePanel } from "@/components/projects/share-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  Download,
  Share2,
  Github,
  AlertTriangle,
  CheckCircle2,
  Clock,
  PlayCircle,
  RefreshCw,
  Archive,
  Trash2,
  ExternalLink,
  FileCode,
  Lock,
  Settings,
  GitBranch,
  FileText,
  Shield,
  Layers,
} from "@/components/icons";
import Loader1 from "@/components/ui/loader1";
import { useConfirm } from "@/hooks";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { cn } from "@/lib/utils";

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const DOC_SECTIONS = [
  { key: "readme", label: "README", icon: FileText, color: "text-blue-600 dark:text-blue-400" },
  {
    key: "apiReference",
    label: "API Reference",
    icon: FileCode,
    color: "text-violet-600 dark:text-violet-400",
  },
  {
    key: "schemaDocs",
    label: "Schema Docs",
    icon: Layers,
    color: "text-cyan-600 dark:text-cyan-400",
  },
  {
    key: "internalDocs",
    label: "Internal Docs",
    icon: BookOpen,
    color: "text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "securityReport",
    label: "Security Report",
    icon: Shield,
    color: "text-amber-600 dark:text-amber-400",
  },
] as const;

export function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProject, retryProject, archiveProject, deleteProject, updateLocalProject } =
    useProjectStore();

  const [project, setProject] = useState<
    ReturnType<typeof useProjectStore.getState>["projects"][0] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [githubReadme, setGithubReadme] = useState<string | null>(null);
  const [isReadmeLoading, setIsReadmeLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [activity, setActivity] = useState<import("@/types/activity-log").ActivityLog[]>([]);
  const viewerUserId = useAuthStore((s) => s.user?.id);

  const isOwner = project?.shareRole === "owner";

  const { subscription } = useSubscriptionStore();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<{
    name: string;
    plan: string;
    description?: string;
  }>({ name: "", plan: "starter" });
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  function requirePlan(featureName: string, plan: string, description: string, cb: () => void) {
    if (!meetsMinPlan(subscription, plan)) {
      setUpgradeFeature({ name: featureName, plan, description });
      setUpgradeOpen(true);
      return;
    }
    cb();
  }

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    getProject(id)
      .then((p) => {
        setProject(p);
        const urlParts = p.repoUrl.replace(/\/$/, "").split("/");
        const owner = p.repoOwner || urlParts[urlParts.length - 2];
        const repo = urlParts[urlParts.length - 1];
        setIsReadmeLoading(true);
        fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
          headers: { Accept: "application/vnd.github.raw" },
        })
          .then((r) => (r.ok ? r.text() : Promise.reject()))
          .then(setGithubReadme)
          .catch(() => setGithubReadme(null))
          .finally(() => setIsReadmeLoading(false));
      })
      .catch((err: any) => setError(err?.message ?? "Failed to load project."))
      .finally(() => setIsLoading(false));
    activityLogsApi
      .listByProject(id, { limit: 8 })
      .then((d) => setActivity(d.logs ?? []))
      .catch(() => setActivity([]));
  }, [id, getProject]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-5 w-40 rounded-md" />
        <div className="bg-card p-5 rounded-xl border border-border space-y-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-56 md:col-span-2 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-5">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Project Not Found</h2>
        <p className="text-[14px] text-muted-foreground mt-1.5 max-w-sm">
          {error ?? "This project doesn't exist or has been deleted."}
        </p>
        <Button asChild className="mt-6 h-10 rounded-lg px-5">
          <Link to="/projects">Back to Projects</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (project.status) {
      case "completed":
        return (
          <Badge variant="success" className="flex items-center gap-1.5 text-[12px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </Badge>
        );
      case "analyzing":
        return (
          <Badge variant="warning" className="flex items-center gap-1.5 text-[12px]">
            <Loader1 className="h-3.5 w-3.5" /> Analyzing…
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" className="flex items-center gap-1.5 text-[12px]">
            <AlertTriangle className="h-3.5 w-3.5" /> Failed
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="secondary" className="flex items-center gap-1.5 text-[12px]">
            <Archive className="h-3.5 w-3.5" /> Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1.5 text-[12px]">
            <Clock className="h-3.5 w-3.5" /> Ready
          </Badge>
        );
    }
  };

  const handleRetry = async () => {
    setActionLoading("retry");
    try {
      await retryProject(project.id);
      navigate(`/projects/${project.id}/live`);
    } catch (err: any) {
      await confirm({
        title: "Action Failed",
        message: err?.message ?? "Failed to continue pipeline",
        confirmText: "Try Again",
        cancelText: "Cancel",
        isDangerous: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async () => {
    const confirmed = await confirm({
      title: "Archive Project",
      message:
        "Archived projects are hidden from the main view. You can restore them any time from settings.",
      confirmText: "Archive",
      cancelText: "Cancel",
      isDangerous: false,
    });
    if (!confirmed) return;
    setActionLoading("archive");
    try {
      await archiveProject(project.id);
      setProject((p) => (p ? { ...p, status: "archived" as const, apiStatus: "archived" } : p));
    } catch (err: any) {
      await confirm({
        title: "Archive Failed",
        message: err?.message ?? "Failed to archive project. Try again later.",
        confirmText: "Ok",
        cancelText: "Cancel",
        isDangerous: true,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Project",
      message:
        "This will permanently delete the project and all generated documentation. This cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
    });
    if (!confirmed) return;
    setActionLoading("delete");
    try {
      await deleteProject(project.id);
      navigate("/projects");
    } catch (err: any) {
      await confirm({
        title: "Delete Failed",
        message: err?.message ?? "Failed to delete project. Try again later.",
        confirmText: "Try Again",
        cancelText: "Cancel",
        isDangerous: true,
      });
      setActionLoading(null);
    }
  };

  const handleExportPdf = async () => {
    setActionLoading("pdf");
    setExportMessage(null);
    try {
      const tabs = [
        { key: "readme", label: "README", content: project.readme || "", isCustom: false },
        {
          key: "api",
          label: "API Reference",
          content: project.apiReference || "",
          isCustom: false,
        },
        { key: "schema", label: "Schema", content: project.schemaDocs || "", isCustom: false },
        {
          key: "internal",
          label: "Internal",
          content: project.internalDocs || "",
          isCustom: false,
        },
        {
          key: "security",
          label: "Security",
          content: project.securityReport || "",
          isCustom: false,
        },
      ].filter((t) => t.content);
      const exportData = {
        projectName: project.name,
        projectDescription: "",
        exportedAt: new Date().toISOString(),
        tabs,
        totalTabs: tabs.length,
      };
      const pdfHtml = generatePDFHTML(exportData, {
        includeTableOfContents: true,
        includeTimestamp: true,
        pageNumbers: true,
        headerFooter: true,
      });
      const blob = new Blob([pdfHtml], { type: "text/html;charset=utf-8" });
      triggerDownload(blob, `${project.name}-documentation.html`);
      setExportMessage({ ok: true, text: "PDF exported successfully" });
    } catch (err: any) {
      setExportMessage({ ok: false, text: err?.message ?? "PDF export failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportYaml = async () => {
    setActionLoading("yaml");
    setExportMessage(null);
    try {
      const tabs = [
        { key: "readme", label: "README", content: project.readme || "", isCustom: false },
        {
          key: "api",
          label: "API Reference",
          content: project.apiReference || "",
          isCustom: false,
        },
        { key: "schema", label: "Schema", content: project.schemaDocs || "", isCustom: false },
        {
          key: "internal",
          label: "Internal",
          content: project.internalDocs || "",
          isCustom: false,
        },
        {
          key: "security",
          label: "Security",
          content: project.securityReport || "",
          isCustom: false,
        },
      ].filter((t) => t.content);
      const exportData = {
        projectName: project.name,
        projectDescription: "",
        exportedAt: new Date().toISOString(),
        tabs,
        totalTabs: tabs.length,
      };
      const formattedTabs = getFormattedTabContent(exportData.tabs, "formatted");
      const cleanExportData = { ...exportData, tabs: formattedTabs };
      const blob = await projectsApi.exportBlob(project.id, "yaml", cleanExportData);
      triggerDownload(blob, `${project.name}-workflow.yml`);
      setExportMessage({
        ok: true,
        text: `YAML exported (${cleanExportData.totalTabs} section${cleanExportData.totalTabs !== 1 ? "s" : ""})`,
      });
    } catch (err: any) {
      setExportMessage({ ok: false, text: err?.message ?? "YAML export failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportNotion = async () => {
    setActionLoading("notion");
    setExportMessage(null);
    try {
      const result = await projectsApi.exportNotion(project.id);
      setExportMessage({ ok: true, text: `Pushed to Notion : ${result.mainPageUrl}` });
    } catch (err: any) {
      setExportMessage({ ok: false, text: err?.message ?? "Notion export failed" });
    } finally {
      setActionLoading(null);
    }
  };

  const generatedSections = DOC_SECTIONS.filter((s) => !!project[s.key as keyof typeof project]);

  return (
    <>
      <div className="space-y-5 mt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card rounded-xl border border-border p-5">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[22px] font-semibold tracking-tight truncate">{project.name}</h1>
              {!isOwner && (
                <Badge variant="secondary" className="capitalize text-[11px]">
                  {project.shareRole} access
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-[13px] text-muted-foreground flex-wrap">
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Github className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {project.repoOwner}/{project.name}
                </span>
                <ExternalLink className="h-3 w-3 opacity-50 shrink-0" />
              </a>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
              </span>
              {project.lastSyncedCommit && (
                <span
                  className="flex items-center gap-1.5"
                  title={`Last synced commit: ${project.lastSyncedCommit}`}
                >
                  <GitBranch className="h-3.5 w-3.5 shrink-0" />
                  <code className="font-mono text-[12px]">
                    {project.lastSyncedCommit.slice(0, 8)}
                  </code>
                  {project.lastSyncedAt && (
                    <span className="text-muted-foreground/70">
                      · {formatDistanceToNow(new Date(project.lastSyncedAt), { addSuffix: true })}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {project.status === "failed" && isOwner && (
              <Button size="sm" className="h-9" onClick={handleRetry} disabled={!!actionLoading}>
                {actionLoading === "retry" ? (
                  <Loader1 className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                )}
                Retry Analysis
              </Button>
            )}
            {project.status === "analyzing" && (
              <Button asChild size="sm" variant="secondary" className="h-9">
                <Link to={`/projects/${project.id}/live`}>
                  <Loader1 className="mr-1.5 h-3.5 w-3.5" />
                  View Progress
                </Link>
              </Button>
            )}
            {project.status === "completed" && (
              <Button asChild size="sm" className="h-9">
                <Link to={`/projects/${project.id}/docs`}>
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  View Docs
                </Link>
              </Button>
            )}
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() =>
                  requirePlan(
                    "Share & Collaborate",
                    "starter",
                    "Share your project with team members and collaborators.",
                    () => setShowShare(true),
                  )
                }
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                {!meetsMinPlan(subscription, "starter") && (
                  <Lock className="mr-1 h-3 w-3 opacity-50" />
                )}
                Share
              </Button>
            )}
            {isOwner && (
              <Button asChild variant="outline" size="sm" className="h-9">
                <Link to={`/projects/${project.id}/settings`}>
                  <Settings className="mr-1.5 h-3.5 w-3.5" />
                  Settings
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 order-2 md:order-1 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-semibold">Project Overview</CardTitle>
              <CardDescription className="text-[13px]">
                Summary of the latest analysis run.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {project.status === "completed" && (
                <div className="space-y-5">
                  {generatedSections.length > 0 && (
                    <div>
                      <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Generated outputs
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {generatedSections.map(({ key, label, icon: Icon, color }) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2"
                          >
                            <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />
                            <span className="text-[13px] font-medium truncate">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border/50 pt-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Github className="h-4 w-4 text-muted-foreground" />
                      <p className="text-[13px] font-medium text-muted-foreground">
                        Repository README
                      </p>
                    </div>
                    {isReadmeLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-5/6" />
                        <Skeleton className="h-3.5 w-2/3" />
                      </div>
                    ) : githubReadme ? (
                      <div className="prose prose-sm prose-slate dark:prose-invert max-w-none max-h-[28rem] overflow-y-auto pr-1">
                        <DocRenderer content={githubReadme} />
                      </div>
                    ) : (
                      <p className="text-[13px] text-muted-foreground">
                        No README found in this repository.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {project.status === "analyzing" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-[14px] text-muted-foreground">
                    <Loader1 className="h-4 w-4 text-primary shrink-0" />
                    <span>Analysis is running : this usually takes 1–3 minutes.</span>
                  </div>
                  <div className="space-y-2 pt-2">
                    <Skeleton className="h-3.5 w-3/5" />
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3.5 w-1/2" />
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-1">
                    <Link to={`/projects/${project.id}/live`}>
                      <GitBranch className="mr-1.5 h-3.5 w-3.5" />
                      Watch live progress
                    </Link>
                  </Button>
                </div>
              )}

              {project.status === "failed" && (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-destructive/30 bg-destructive/5">
                  <AlertTriangle className="h-9 w-9 text-destructive mb-3" />
                  <p className="text-[14px] font-medium text-destructive">Analysis failed</p>
                  <p className="text-[13px] text-muted-foreground mt-1 max-w-xs">
                    The pipeline encountered an error. Use "Retry Analysis" above to run it again.
                  </p>
                </div>
              )}

              {project.status === "archived" && (
                <div className="flex flex-col items-center justify-center py-10 text-center rounded-lg border border-dashed border-border bg-muted/20">
                  <PlayCircle className="h-9 w-9 text-muted-foreground mb-3" />
                  <p className="text-[14px] font-medium">Archived project</p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    No new analyses will run on archived projects.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="order-1 md:order-2 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-[15px] font-semibold">Actions</CardTitle>
              <CardDescription className="text-[13px]">
                Export documentation or manage this project.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {exportMessage && (
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 text-[12px] border mb-1",
                    exportMessage.ok
                      ? "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                      : "bg-destructive/10 text-destructive border-destructive/20",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {exportMessage.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {exportMessage.text}
                  </span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9"
                disabled={project.status !== "completed" || !!actionLoading}
                onClick={() =>
                  requirePlan(
                    "PDF Export",
                    "starter",
                    "Export your documentation as a PDF file.",
                    handleExportPdf,
                  )
                }
              >
                {actionLoading === "pdf" ? (
                  <Loader1 className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <Download className="mr-2 h-3.5 w-3.5" />
                )}
                Export as PDF
                {!meetsMinPlan(subscription, "starter") && (
                  <Lock className="h-3 w-3 ml-auto opacity-40" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9"
                disabled={project.status !== "completed" || !!actionLoading}
                onClick={() =>
                  requirePlan(
                    "GitHub Actions Export",
                    "team",
                    "Export your documentation as a GitHub Actions YAML workflow.",
                    handleExportYaml,
                  )
                }
              >
                {actionLoading === "yaml" ? (
                  <Loader1 className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <FileCode className="mr-2 h-3.5 w-3.5" />
                )}
                Export YAML workflow
                {!meetsMinPlan(subscription, "team") && (
                  <Lock className="h-3 w-3 ml-auto opacity-40" />
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start h-9"
                disabled={project.status !== "completed" || !!actionLoading}
                onClick={() =>
                  requirePlan(
                    "Notion Export",
                    "team",
                    "Push your documentation directly to Notion.",
                    handleExportNotion,
                  )
                }
              >
                {actionLoading === "notion" ? (
                  <Loader1 className="mr-2 h-3.5 w-3.5" />
                ) : (
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                )}
                Push to Notion
                {!meetsMinPlan(subscription, "team") && (
                  <Lock className="h-3 w-3 ml-auto opacity-40" />
                )}
              </Button>

              {isOwner && (
                <div className="border-t border-border/50 pt-2 space-y-1 mt-1">
                  {project.status !== "archived" && project.status !== "analyzing" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 text-muted-foreground hover:text-foreground"
                      disabled={!!actionLoading}
                      onClick={() =>
                        requirePlan(
                          "Archive Project",
                          "starter",
                          "Archive projects to keep your workspace organised.",
                          handleArchive,
                        )
                      }
                    >
                      {actionLoading === "archive" ? (
                        <Loader1 className="mr-2 h-3.5 w-3.5" />
                      ) : (
                        <Archive className="mr-2 h-3.5 w-3.5" />
                      )}
                      Archive Project
                      {!meetsMinPlan(subscription, "starter") && (
                        <Lock className="h-3 w-3 ml-auto opacity-40" />
                      )}
                    </Button>
                  )}
                  {project.status !== "analyzing" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={!!actionLoading}
                      onClick={handleDelete}
                    >
                      {actionLoading === "delete" ? (
                        <Loader1 className="mr-2 h-3.5 w-3.5" />
                      ) : (
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                      )}
                      Delete Project
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {activity.length > 0 && (
          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-[15px] font-semibold">Recent activity</CardTitle>
                  <CardDescription className="text-[13px]">
                    What happened on this project.
                  </CardDescription>
                </div>
                <Button asChild variant="ghost" size="sm" className="h-8 text-muted-foreground">
                  <Link to="/logs">View all</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="divide-y divide-border/60">
                {activity.map((log) => (
                  <li key={log._id} className="py-2.5 flex items-start justify-between gap-3">
                    <p className="text-[13px] text-foreground/90 leading-5">
                      {formatActivityLabel(log, { viewerUserId })}
                    </p>
                    <time
                      dateTime={log.createdAt}
                      className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap"
                    >
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </time>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {project && (
        <SharePanel
          open={showShare}
          onOpenChange={setShowShare}
          projectId={project.id}
          projectName={project.name}
          isOwner={isOwner}
        />
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        featureName={upgradeFeature.name}
        requiredPlan={upgradeFeature.plan}
        description={upgradeFeature.description}
      />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        isDangerous={confirmState.isDangerous}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
