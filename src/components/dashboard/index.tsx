import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "@/store/projects";
import { useSubscriptionStore } from "@/store/subscription";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "@/components/icons";
import { NewProjectModal } from "@/components/projects/new-project";
import { UpgradeModal } from "@/components/billing/UpgradeModal";
import TopBar from "@/components/projects/top-bar";
import { ErrorBanner, EmptyState } from "@/components/common";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog";
import { useSearchAndFilter, usePagination, useConfirm } from "@/hooks";
import { DashboardFilters, ProjectsGrid, SharedProjects } from "./sections";
import type { GithubNotice } from "../../types/DashboardTypes";
import { SORT_API_MAP, STATUS_API_MAP } from "@/configs/DashboardConfig";
import { ProjectStatus } from "@/types/ProjectTypes";

export function DashboardPage() {
  const {
    projects,
    total,
    totalPages,
    page,
    isLoading,
    error,
    fetchProjects,
    deleteProject,
    archiveProject,
    retryProject,
    sharedProjects,
    sharedLoading,
    fetchSharedProjects,
  } = useProjectStore();
  const navigate = useNavigate();
  const { subscription, usage } = useSubscriptionStore();
  const { confirm, state: confirmState, handleConfirm, handleCancel } = useConfirm();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [openModalToGithubStep, setOpenModalToGithubStep] = useState(false);
  const [githubNotice, setGithubNotice] = useState<GithubNotice | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "name">("updated");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: "delete" | "archive";
    id: string;
  } | null>(null);

  const ITEMS_PER_PAGE = 6;
  const {
    currentPage,
    totalPages: paginationTotalPages,
    goToPrevious,
    goToNext,
    setTotalPages,
  } = usePagination({ initialPage: 1 });

  const {
    query: searchQuery,
    debouncedQuery: debouncedSearch,
    setQuery: setSearchQuery,
  } = useSearchAndFilter();

  useEffect(() => {
    setTotalPages(totalPages);
  }, [totalPages, setTotalPages]);

  const isAtProjectLimit = () => {
    if (!subscription || !usage) return false;
    const limit = subscription.limits.projects;
    if (limit === null) return false;
    return usage.projectCount >= limit;
  };

  const handleNewProject = () => {
    if (isAtProjectLimit()) {
      setUpgradeOpen(true);
      return;
    }
    setIsNewProjectModalOpen(true);
  };

  const doFetch = useCallback(() => {
    fetchProjects({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      status: STATUS_API_MAP[statusFilter] || undefined,
      sort: SORT_API_MAP[sortBy],
      search: debouncedSearch || undefined,
    });
  }, [currentPage, statusFilter, sortBy, debouncedSearch, fetchProjects]);

  useEffect(() => {
    doFetch();
    fetchSharedProjects();
  }, [doFetch, fetchSharedProjects]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get("github");
    if (!githubStatus) return;

    const user = params.get("user");
    const msg = params.get("msg");
    window.history.replaceState({}, document.title, window.location.pathname);

    if (githubStatus === "connected") {
      setGithubNotice({
        type: "success",
        message: `GitHub connected${user ? ` as @${user}` : ""}! Select a repository to continue.`,
      });
      setOpenModalToGithubStep(true);
      setIsNewProjectModalOpen(true);
      setTimeout(() => setGithubNotice(null), 6000);
    } else if (githubStatus === "error") {
      setGithubNotice({
        type: "error",
        message: msg ?? "GitHub connection failed. Please try again.",
      });
      setTimeout(() => setGithubNotice(null), 8000);
    }
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingAction({ type: "delete", id });

    const confirmed = await confirm({
      title: "Delete Project",
      message: "This project will be permanently deleted and cannot be undone. Are you sure?",
      confirmText: "Delete",
      cancelText: "Cancel",
      isDangerous: true,
    });

    if (!confirmed) {
      setPendingAction(null);
      return;
    }

    setActionLoading(id);

    try {
      await deleteProject(id);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Failed to delete project. Please try again.");
    } finally {
      setActionLoading(null);
      setPendingAction(null);
    }
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(id);
    try {
      await archiveProject(id);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Failed to archive project. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRetry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionLoading(id);
    try {
      const result = await retryProject(id);
      navigate(`/projects/${result.id}/live`);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(err?.message ?? "Failed to retry project. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <TopBar title="Projects" description="Manage Your projects and Collaborations.">
        <Button onClick={handleNewProject} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </TopBar>

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

      {errorMessage && (
        <div className="mx-6 mt-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <span className="text-base">⚠️</span>
            <div className="flex-1">{errorMessage}</div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-destructive/60 hover:text-destructive"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {githubNotice && (
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
              githubNotice.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
                : "border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            <span className="text-base">{githubNotice.type === "success" ? "✅" : "❌"}</span>
            <span>{githubNotice.message}</span>
          </div>
        )}

        <DashboardFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {error && <ErrorBanner message={error} onRetry={doFetch} />}

        {!isLoading && projects.length === 0 && !error && (
          <EmptyState
            title="No projects found"
            description={
              debouncedSearch || statusFilter !== "all"
                ? "No projects match your current filters. Try adjusting your search."
                : "You haven't created any projects yet."
            }
            actionLabel="Create Project"
            onAction={handleNewProject}
          />
        )}

        {projects.length > 0 && (
          <>
            <ProjectsGrid
              projects={projects}
              isLoading={isLoading}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onRetry={handleRetry}
              actionLoading={actionLoading}
              debouncedSearch={debouncedSearch}
              statusFilter={statusFilter}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPreviousClick={goToPrevious}
              onNextClick={goToNext}
              variant="compact"
            />
          </>
        )}

        <NewProjectModal
          open={isNewProjectModalOpen}
          onOpenChange={(v) => {
            setIsNewProjectModalOpen(v);
            if (!v) setOpenModalToGithubStep(false);
          }}
        />

        <UpgradeModal
          open={upgradeOpen}
          onClose={() => setUpgradeOpen(false)}
          featureName="More Projects"
          requiredPlan="starter"
          description={`You've reached the ${subscription?.limits.projects ?? 3} project limit on the ${subscription?.planName ?? "Free"} plan. Upgrade to create unlimited projects.`}
        />

        <SharedProjects projects={sharedProjects} isLoading={sharedLoading} />
      </div>
    </div>
  );
}
