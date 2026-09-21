import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  X,
  Clock,
  GitCommit,
  RotateCcw,
  AlertTriangle,
  Eye,
  CheckCircle2,
  ChevronDown,
  Undo2,
  Pencil,
} from "@/components/icons"
import { versionsApi } from "@/lib/api"
import { DocRenderer } from "@/components/projects/doc-render"
import { cn } from "@/lib/utils"
import { SOURCE_CONFIG } from "@/configs/DocVersionConfig"
import { DocVersion, VersionHistoryPanelProps } from "@/types/DocVersionTypes"
import Loader1 from "@/components/ui/loader1"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function VersionPreviewModal({
  version,
  projectId,
  section,
  restoringId,
  onClose,
  onRestore,
}: {
  version: DocVersion & { content: string }
  projectId: string
  section: string
  restoringId: string | null
  onClose: () => void
  onRestore: (id: string) => void
}) {
  const cfg = SOURCE_CONFIG[version.source] ?? SOURCE_CONFIG.user
  const { Icon } = cfg
  const isRestoring = restoringId === version._id

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[86vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-[14px] font-semibold">Version snapshot</span>
            <Badge variant="outline" className={cn("text-[11px] px-1.5 py-0", cfg.badgeClass)}>
              {cfg.label}
            </Badge>
            <span className="text-[12px] text-muted-foreground">{timeAgo(version.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-[12px]"
              disabled={isRestoring}
              onClick={() => onRestore(version._id)}
            >
              {isRestoring
                ? <Loader1 className="mr-1.5 h-3 w-3" />
                : <RotateCcw className="mr-1.5 h-3 w-3" />}
              Restore this version
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {version.meta?.changeSummary && (
          <div className="px-5 py-2 bg-muted/30 border-b border-border/50 text-[12px] text-muted-foreground">
            {version.meta.changeSummary}
          </div>
        )}

        {(version.meta?.commitSha || (version.meta?.agentsRun?.length ?? 0) > 0) && (
          <div className="px-5 py-2 border-b border-border/30 flex items-center gap-4 text-[11px] text-muted-foreground">
            {version.meta.commitSha && (
              <span className="flex items-center gap-1">
                <GitCommit className="h-3 w-3" />
                <span className="font-mono text-primary">{version.meta.commitSha.slice(0, 7)}</span>
              </span>
            )}
            {(version.meta?.agentsRun?.length ?? 0) > 0 && (
              <span>Agents: {version.meta.agentsRun!.join(", ")}</span>
            )}
            {(version.meta?.changedFiles?.length ?? 0) > 0 && (
              <span>{version.meta.changedFiles!.length} file{version.meta.changedFiles!.length !== 1 ? "s" : ""} changed</span>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <DocRenderer content={version.content} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function VersionHistoryPanel({
  projectId,
  section,
  sectionLabel,
  isUserEdited = false,
  onClose,
  onRestored,
  onRevertToAI,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<DocVersion[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)
  const [restoredId, setRestoredId] = useState<string | null>(null)
  const [restoreError, setRestoreError] = useState<string | null>(null)
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewVersion, setPreviewVersion] = useState<(DocVersion & { content: string }) | null>(null)

  const [confirmRevert, setConfirmRevert] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPage(1)
    versionsApi
      .list(projectId, section, 1)
      .then((r) => {
        if (!cancelled) {
          setVersions(r.versions)
          setTotal(r.total)
          setTotalPages(r.totalPages ?? 1)
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load version history. Check your connection and try again.")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [projectId, section])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    try {
      const r = await versionsApi.list(projectId, section, nextPage)
      setVersions((prev) => [...prev, ...r.versions])
      setPage(nextPage)
      setTotal(r.total)
      setTotalPages(r.totalPages ?? totalPages)
    } catch {

    } finally {
      setLoadingMore(false)
    }
  }

  const handlePreview = useCallback(
    async (v: DocVersion) => {
      setLoadingPreviewId(v._id)
      setPreviewError(null)
      try {
        const r = await versionsApi.get(projectId, section, v._id)
        setPreviewVersion(r.version)
      } catch {
        setPreviewError("Failed to load this snapshot. Try again.")
      } finally {
        setLoadingPreviewId(null)
      }
    },
    [projectId, section],
  )

  const handleRestore = useCallback(
    async (versionId: string) => {
      setRestoringId(versionId)
      setRestoreError(null)
      try {
        const r = await versionsApi.restore(projectId, section, versionId)
        onRestored(r.effectiveOutput as any, r.editedSections)
        setRestoredId(versionId)
        setPreviewVersion(null)
        setConfirmingId(null)

        const fresh = await versionsApi.list(projectId, section, 1)
        setVersions(fresh.versions)
        setTotal(fresh.total)
        setTotalPages(fresh.totalPages ?? 1)
        setPage(1)
        setTimeout(() => setRestoredId(null), 3000)
      } catch (err: any) {
        setRestoreError(err?.message ?? "Restore failed. Please try again.")
      } finally {
        setRestoringId(null)
        setConfirmingId(null)
      }
    },
    [projectId, section, onRestored],
  )

  const hasMore = page < totalPages

  return (
    <>
      {previewVersion && (
        <VersionPreviewModal
          version={previewVersion}
          projectId={projectId}
          section={section}
          restoringId={restoringId}
          onClose={() => setPreviewVersion(null)}
          onRestore={handleRestore}
        />
      )}

      <div className="flex flex-col h-full bg-card border-l border-border">

        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-[13px] font-semibold">Version History</span>
            <span
              className="text-[11px] text-muted-foreground truncate max-w-[90px]"
              title={sectionLabel}
            >
              {sectionLabel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {!loading && total > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {total}
              </span>
            )}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isUserEdited && onRevertToAI && (
          <div className="px-4 py-2.5 border-b border-border/50 bg-emerald-500/5 shrink-0">
            {!confirmRevert ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-400">
                  <Pencil className="h-3 w-3 shrink-0" />
                  Your edit is the active version
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] text-muted-foreground hover:text-destructive px-2"
                  onClick={() => setConfirmRevert(true)}
                >
                  <Undo2 className="mr-1 h-3 w-3" />
                  Discard edit
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[12px] text-foreground leading-relaxed">
                  Discard your edit and restore the AI-generated version?
                </p>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 text-[11px] px-2.5"
                    onClick={() => {
                      setConfirmRevert(false)
                      onRevertToAI()
                    }}
                  >
                    Discard my edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] px-2.5"
                    onClick={() => setConfirmRevert(false)}
                  >
                    Keep it
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {loading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-lg" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 gap-3">
              <AlertTriangle className="h-7 w-7 text-destructive/70" />
              <p className="text-[13px] text-muted-foreground">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-[12px]"
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  versionsApi.list(projectId, section, 1)
                    .then((r) => { setVersions(r.versions); setTotal(r.total); setTotalPages(r.totalPages ?? 1) })
                    .catch(() => setError("Still failing. Check your connection."))
                    .finally(() => setLoading(false))
                }}
              >
                Retry
              </Button>
            </div>
          )}

          {(restoreError || previewError) && (
            <div className="mx-4 mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-[12px] text-destructive flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              {restoreError ?? previewError}
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-14 text-center px-5 gap-2">
              <Clock className="h-7 w-7 text-muted-foreground/30" />
              <p className="text-[13px] font-medium text-muted-foreground">No snapshots yet</p>
              <p className="text-[12px] text-muted-foreground/60 leading-relaxed">
                Snapshots are saved automatically on each pipeline run and every time you save an edit.
              </p>
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div className="relative px-4 py-4">
              <div className="absolute left-[29px] top-8 bottom-8 w-px bg-border/50" />

              <div className="space-y-1">
                {versions.map((v, idx) => {
                  const cfg = SOURCE_CONFIG[v.source] ?? SOURCE_CONFIG.user
                  const { Icon } = cfg
                  const isLatest = idx === 0
                  const isConfirming = confirmingId === v._id
                  const isRestoring = restoringId === v._id
                  const isRestored = restoredId === v._id
                  const isLoadingPreview = loadingPreviewId === v._id

                  return (
                    <div key={v._id} className="relative flex gap-3 pb-1.5">
                      <div
                        className={cn(
                          "relative z-10 mt-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
                          isLatest
                            ? `${cfg.dotClass} border-background`
                            : "bg-muted border-background",
                        )}
                      >
                        <Icon className={cn("h-3 w-3", isLatest ? "text-white" : "text-muted-foreground")} />
                      </div>

                      <div
                        className={cn(
                          "flex-1 rounded-lg border p-3 mt-1 transition-colors",
                          isLatest
                            ? "border-border bg-muted/20"
                            : "border-border/40 hover:border-border bg-background",
                        )}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className={cn("text-[10px] px-1.5 py-0 font-medium", cfg.badgeClass)}
                              >
                                {cfg.label}
                              </Badge>

                              {isLatest && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground border-border/60"
                                >
                                  Latest
                                </Badge>
                              )}

                              {isLatest && !isUserEdited && (
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                                >
                                  Active
                                </Badge>
                              )}

                              {isRestored && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                  <CheckCircle2 className="h-3 w-3" /> Restored
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-muted-foreground mt-1 tabular-nums">
                              {timeAgo(v.createdAt)}
                            </p>

                            {v.meta?.changeSummary && (
                              <p className="text-[12px] text-foreground/70 mt-1.5 line-clamp-2 leading-relaxed">
                                {v.meta.changeSummary}
                              </p>
                            )}

                            {v.meta?.commitSha && (
                              <div className="flex items-center gap-1 mt-1">
                                <GitCommit className="h-3 w-3 text-muted-foreground" />
                                <span className="text-[10px] font-mono text-primary">
                                  {v.meta.commitSha.slice(0, 7)}
                                </span>
                              </div>
                            )}

                            {(v.meta?.changedFiles?.length ?? 0) > 0 && (
                              <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                                {v.meta.changedFiles!.length} file{v.meta.changedFiles!.length !== 1 ? "s" : ""} changed
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title="Preview this snapshot"
                              disabled={isLoadingPreview}
                              onClick={() => handlePreview(v)}
                            >
                              {isLoadingPreview
                                ? <Loader1 className="h-3 w-3" />
                                : <Eye className="h-3 w-3" />}
                            </Button>

                            {!isLatest && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                title="Restore this version"
                                disabled={!!restoringId}
                                onClick={() => {
                                  setRestoreError(null)
                                  setConfirmingId(isConfirming ? null : v._id)
                                }}
                              >
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {isConfirming && (
                          <div className="mt-2.5 rounded-md border border-border bg-muted/30 p-2.5 space-y-2">
                            <p className="text-[12px] text-foreground/80 leading-relaxed">
                              Replace the current content with this snapshot? The current state will be saved first so you can undo.
                            </p>
                            <div className="flex gap-1.5">
                              <Button
                                size="sm"
                                className="h-6 text-[11px] px-2.5"
                                disabled={isRestoring}
                                onClick={() => handleRestore(v._id)}
                              >
                                {isRestoring && <Loader1 className="mr-1 h-3 w-3" />}
                                Restore
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 text-[11px] px-2.5"
                                onClick={() => setConfirmingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {hasMore && (
                <div className="pt-3 pb-1 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[12px] text-muted-foreground"
                    disabled={loadingMore}
                    onClick={handleLoadMore}
                  >
                    {loadingMore
                      ? <Loader1 className="mr-1.5 h-3.5 w-3.5" />
                      : <ChevronDown className="mr-1.5 h-3.5 w-3.5" />}
                    Load older versions
                  </Button>
                </div>
              )}

              {!hasMore && versions.length > 3 && (
                <p className="text-center text-[11px] text-muted-foreground/50 pt-3 pb-1">
                  All {total} snapshot{total !== 1 ? "s" : ""} shown
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
