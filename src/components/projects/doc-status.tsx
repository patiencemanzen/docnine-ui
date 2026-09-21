import { useState, useRef, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { ChevronDown, User, Calendar, AlertCircle, History, PenLine, Eye, RotateCcw, CheckCircle2, Globe, AlertTriangle, Archive } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useDocTrackerStore } from "@/store/doc-tracker"
import { DocSectionTrack, DocStatus } from "@/types/DocStatusTypes"
import { DOC_STATUS_CONFIG, DOC_STATUS_ORDER } from "@/configs/DocStatusConfig"

interface DocStatusBadgeProps {
  status: DocStatus
  className?: string
  
  compact?: boolean
}

export function DocStatusBadge({ status, className, compact }: DocStatusBadgeProps) {
  const cfg = DOC_STATUS_CONFIG[status]
  if (!cfg) return null
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        compact ? "px-1.5 py-0 text-[10px]" : "px-2 py-0.5",
        cfg.badgeClass,
        className,
      )}
    >
      <Icon className={cn(compact ? "h-2.5 w-2.5" : "h-3 w-3", "shrink-0")} />
      {cfg.label}
    </span>
  )
}

export function DocStatusDot({ status, className }: { status: DocStatus; className?: string }) {
  if (status === "draft") return null
  const cfg = DOC_STATUS_CONFIG[status]
  return (
    <span
      className={cn("h-1.5 w-1.5 rounded-full shrink-0", cfg.dotClass, className)}
      title={cfg.label}
      aria-label={cfg.label}
    />
  )
}

interface DocStatusSelectorProps {
  current: DocStatus
  onSelect: (status: DocStatus) => void
  className?: string
}

export function DocStatusSelector({ current, onSelect, className }: DocStatusSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const cfg = DOC_STATUS_CONFIG[current]
  const CfgIcon = cfg.icon

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-medium transition-opacity hover:opacity-80",
          cfg.badgeClass,
        )}
      >
        <CfgIcon className="h-3 w-3 shrink-0" />
        {cfg.label}
        <ChevronDown className="h-3 w-3 opacity-60 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-popover shadow-md overflow-hidden">
          {DOC_STATUS_ORDER.map((s) => {
            const c = DOC_STATUS_CONFIG[s]
            const SIcon = c.icon
            return (
              <button
                key={s}
                type="button"
                onClick={() => { onSelect(s); setOpen(false) }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 transition-colors hover:bg-muted text-left",
                  s === current && "bg-muted font-medium",
                )}
              >
                <SIcon className={cn("h-3.5 w-3.5 shrink-0", c.iconClass)} />
                <span>{c.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface DocStatusPanelProps {
  projectId: string
  
  section: string
  
  sectionLabel: string
  
  currentUser?: string
}

export function DocStatusPanel({ projectId, section, sectionLabel, currentUser }: DocStatusPanelProps) {
  const { getEntry, setStatus, setAssignee, setDueDate, isOverdue } = useDocTrackerStore()
  const entry: DocSectionTrack = getEntry(projectId, section) ?? { status: "draft", log: [] }
  const [showLog, setShowLog] = useState(false)
  const [editAssignee, setEditAssignee] = useState(false)
  const [assigneeInput, setAssigneeInput] = useState(entry.assignee ?? "")

  useEffect(() => {
    setAssigneeInput(getEntry(projectId, section)?.assignee ?? "")
  }, [projectId, section]) // eslint-disable-line react-hooks/exhaustive-deps

  const overdue = isOverdue(projectId, section)

  return (
    <div className="border-t border-border">
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {sectionLabel} Status
          </span>
        </div>

        <DocStatusSelector
          current={entry.status}
          onSelect={(s) => setStatus(projectId, section, s, currentUser)}
        />

        {overdue && (
          <div className="flex items-center gap-1.5 text-[10px] text-red-600 dark:text-red-400">
            <AlertCircle className="h-3 w-3 shrink-0" />
            Past due date
          </div>
        )}

        <div className="flex items-center gap-1.5 min-w-0">
          <User className="h-3 w-3 text-muted-foreground shrink-0" />
          {editAssignee ? (
            <form
              className="flex-1 flex gap-1"
              onSubmit={(e) => {
                e.preventDefault()
                setAssignee(projectId, section, assigneeInput.trim() || undefined)
                setEditAssignee(false)
              }}
            >
              <input
                autoFocus
                className="flex-1 min-w-0 text-[11px] border border-border rounded px-1.5 py-0.5 bg-background outline-none focus:border-primary"
                placeholder="name or email"
                value={assigneeInput}
                onChange={(e) => setAssigneeInput(e.target.value)}
                onBlur={() => {
                  setAssignee(projectId, section, assigneeInput.trim() || undefined)
                  setEditAssignee(false)
                }}
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditAssignee(true)}
              className="text-[11px] truncate text-left hover:text-foreground transition-colors text-muted-foreground flex-1"
            >
              {entry.assignee ?? <span className="italic">Unassigned</span>}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            type="date"
            className={cn(
              "text-[11px] border border-border rounded px-1.5 py-0.5 bg-background outline-none focus:border-primary flex-1 min-w-0",
              overdue && "border-red-400 text-red-600 dark:text-red-400",
            )}
            value={entry.dueDate ?? ""}
            onChange={(e) => setDueDate(projectId, section, e.target.value || undefined)}
          />
        </div>

        {entry.log.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowLog((s) => !s)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <History className="h-3 w-3" />
              {showLog ? "Hide" : "Show"} history ({entry.log.length})
            </button>

            {showLog && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {entry.log.slice(0, 10).map((l, i) => {
                  const cfg = DOC_STATUS_CONFIG[l.status]
                  return (
                    <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0 mt-1", cfg.dotClass)} />
                      <div className="min-w-0">
                        <span className="font-medium text-foreground/80">{cfg.label}</span>
                        {l.changedBy && <span> · {l.changedBy}</span>}
                        <div className="text-[9px]">
                          {formatDistanceToNow(new Date(l.changedAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
