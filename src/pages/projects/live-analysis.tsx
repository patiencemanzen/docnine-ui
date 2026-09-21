import { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useProjectStore } from "@/store/projects"
import { getAccessToken, API_BASE, refreshToken } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  ArrowLeft,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Terminal,
  BookOpen,
  AlertTriangle,
} from "@/components/icons"
import { fetchEventSource } from "@microsoft/fetch-event-source"
import { cn } from "@/lib/utils"
import Loader1 from "@/components/ui/loader1"
import { LogEntry, LogSeverity } from "@/types/LiveAnalysisTypes"

function eventToSeverity(step: string, status?: string): LogSeverity {
  if (step === "done") return "success"
  if (step === "error") return "error"
  if (step === "timeout") return "warning"
  if (status === "error") return "error"
  if (status === "warning") return "warning"
  if (step === "security") return "warning"
  return "info"
}

function eventToMessage(event: Record<string, any>): string {
  if (event.step === "done") return "Documentation generated successfully."
  if (event.step === "error") return `Pipeline error: ${event.msg ?? event.detail ?? "Unknown error"}`
  if (event.step === "timeout") return `Pipeline timed out. ${event.msg ?? "Click Retry to continue."}`
  const parts: string[] = []
  if (event.step) parts.push(`[${event.step}]`)
  if (event.msg) parts.push(event.msg)
  if (event.detail) parts.push(event.detail)
  return parts.join(" : ") || "Processing…"
}

function SeverityIcon({ severity }: { severity: LogSeverity }) {
  switch (severity) {
    case "info":    return <Info      className="h-3.5 w-3.5 text-blue-500 shrink-0" />
    case "warning": return <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
    case "error":   return <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
    case "success": return <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
  }
}

function severityRowClass(severity: LogSeverity) {
  switch (severity) {
    case "info":    return ""
    case "warning": return "bg-amber-500/5 border-l-2 border-amber-500/40"
    case "error":   return "bg-destructive/5 border-l-2 border-destructive/50"
    case "success": return "bg-green-500/5"
  }
}

function severityTextClass(severity: LogSeverity) {
  switch (severity) {
    case "info":    return "text-foreground/80"
    case "warning": return "text-amber-700 dark:text-amber-400"
    case "error":   return "text-destructive"
    case "success": return "text-green-700 dark:text-green-400"
  }
}

export function LiveAnalysisPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getProject, updateLocalProject, retryProject } = useProjectStore()

  const [projectName, setProjectName] = useState<string>("")
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isPaused, setIsPaused] = useState(false)
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "reconnecting" | "disconnected"
  >("connecting")
  const [pipelineStatus, setPipelineStatus] = useState<
    "running" | "done" | "error" | "timeout"
  >("running")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [connectionKey, setConnectionKey] = useState(0)

  const logsEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const pausedRef = useRef(isPaused)

  useEffect(() => { pausedRef.current = isPaused }, [isPaused])

  
  useEffect(() => {
    if (!isPaused) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs, isPaused])

  
  useEffect(() => {
    if (!id) return

    getProject(id)
      .then((p) => setProjectName(p.name))
      .catch(() => {})

    const ctrl = new AbortController()
    abortRef.current = ctrl

    ;(async () => {
      let token = getAccessToken() || await refreshToken()
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          await fetchEventSource(`${API_BASE}/projects/${id}/stream`, {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
            signal: ctrl.signal,
            credentials: "include",

            onopen: async (res) => {
              if (res.status === 401) {
                const err = new Error("SSE_AUTH") as Error & { code?: string }
                err.code = "SSE_AUTH"
                throw err
              }
              if (res.ok) {
                setConnectionState("connected")
                setLoadError(null)
              } else {
                const body = await res.json().catch(() => ({}))
                throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
              }
            },

          onmessage: (ev) => {
            try {
              const data = JSON.parse(ev.data ?? "{}")
              if (data.type === "ping") return

              const severity = eventToSeverity(data.step, data.status)
              const message = eventToMessage(data)

              setLogs((prev) => {
                if (data.step === "done" && prev.some((l) => l.severity === "success")) return prev
                return [
                  ...prev,
                  {
                    id: `${Date.now()}-${Math.random()}`,
                    timestamp: data.ts ?? new Date().toISOString(),
                    message,
                    severity,
                  },
                ]
              })

              if (data.step === "done") {
                setPipelineStatus("done")
                setConnectionState("disconnected")
                updateLocalProject(id, { status: "completed", apiStatus: "done" })
              } else if (data.step === "error") {
                setPipelineStatus("error")
                setConnectionState("disconnected")
                updateLocalProject(id, { status: "failed", apiStatus: "error" })
              } else if (data.step === "timeout") {
                setPipelineStatus("timeout")
                setConnectionState("disconnected")
                updateLocalProject(id, { status: "failed", apiStatus: "timeout" })
                abortRef.current?.abort()
              }
            } catch {
              
            }
          },

          onerror: (err) => {
            if ((err as { code?: string })?.code === "SSE_AUTH") throw err
            if (ctrl.signal.aborted) return
            setConnectionState("reconnecting")
          },

          onclose: () => {
            if (!ctrl.signal.aborted) setConnectionState("disconnected")
          },
        })
          return
        } catch (err: any) {
          if (err?.code === "SSE_AUTH" && attempt === 0) {
            token = await refreshToken()
            if (token) continue
          }
          if (!ctrl.signal.aborted) {
            setConnectionState("disconnected")
            setLoadError(err?.message ?? "Failed to connect to the pipeline stream.")
          }
          return
        }
      }
    })()

    return () => { ctrl.abort() }
    
  }, [id, connectionKey])

  
  const terminalLabel = (() => {
    if (pipelineStatus === "done") return "Pipeline complete"
    if (pipelineStatus === "error") return "Pipeline stopped : error encountered"
    if (pipelineStatus === "timeout") return "Pipeline timed out"
    if (connectionState === "connecting") return "Connecting to pipeline…"
    if (connectionState === "reconnecting") return "Reconnecting…"
    return `Documenting${projectName ? ` ${projectName}` : ""}…`
  })()

  const isActive = connectionState !== "disconnected"

  return (
    <div className="space-y-5 max-w-5xl mx-auto flex flex-col" style={{ height: "calc(100vh - 7rem)" }}>

      <div className="flex items-start sm:items-center justify-between shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="-ml-2 h-8 w-8">
            <Link to={`/projects/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[18px] font-semibold tracking-tight">Live Analysis</h1>
              {connectionState === "connected" && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
              )}
            </div>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {projectName || `Project ${id}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {connectionState === "reconnecting" && (
            <Badge variant="warning" className="animate-pulse text-[12px]">
              <RefreshCw className="mr-1 h-3 w-3" /> Reconnecting…
            </Badge>
          )}

          {!isActive && pipelineStatus === "done" && (
            <Button asChild size="sm" className="h-9">
              <Link to={`/projects/${id}/docs`}>
                <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                View Documentation
              </Link>
            </Button>
          )}
          {!isActive && pipelineStatus === "error" && (
            <Button size="sm" variant="outline" className="h-9" onClick={() => navigate(`/projects/${id}`)}>
              View Project
            </Button>
          )}
          {!isActive && pipelineStatus === "timeout" && (
            <Button
              size="sm"
              variant="outline"
              className="h-9"
              disabled={isRetrying}
              onClick={async () => {
                if (!id) return
                setIsRetrying(true)
                try {
                  await retryProject(id)
                  setLogs([])
                  setPipelineStatus("running")
                  setConnectionState("connecting")
                  setConnectionKey((k) => k + 1)
                } catch {
                  
                } finally {
                  setIsRetrying(false)
                }
              }}
            >
              {isRetrying
                ? <Loader1 className="mr-1.5 h-3.5 w-3.5" />
                : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
              Retry
            </Button>
          )}

          {isActive && (
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setIsPaused((p) => !p)}
            >
              {isPaused
                ? <><Play className="mr-1.5 h-3.5 w-3.5" /> Resume</>
                : <><Pause className="mr-1.5 h-3.5 w-3.5" /> Pause</>}
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive flex items-center gap-2 shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {loadError}
        </div>
      )}

      {!isActive && pipelineStatus === "done" && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-[13px] text-green-700 dark:text-green-400 flex items-center gap-2 shrink-0">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Documentation generated successfully. Your docs are ready to view.
        </div>
      )}
      {!isActive && pipelineStatus === "error" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive flex items-center gap-2 shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          The pipeline encountered an error. Review the logs below or go back to retry.
        </div>
      )}
      {!isActive && pipelineStatus === "timeout" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400 flex items-center gap-2 shrink-0">
          <AlertCircle className="h-4 w-4 shrink-0" />
          The pipeline timed out. You can retry to continue from where it left off.
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden shadow-none min-h-0">
        <CardHeader className="py-2.5 px-4 border-b border-border/30 bg-muted/30 shrink-0 flex flex-row items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[12px] font-mono text-muted-foreground">{terminalLabel}</span>
          </div>
          {isActive && (
            <Badge variant="outline" className="ml-auto text-[11px] font-mono">
              {logs.length} events
            </Badge>
          )}
          {!isActive && logs.length > 0 && (
            <span className="ml-auto text-[11px] font-mono text-muted-foreground">
              {logs.length} events
            </span>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0 font-mono text-[13px] min-h-0">
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
              <Loader1 className="h-5 w-5" />
              <p className="text-[13px]">
                {connectionState === "connecting" ? "Connecting to pipeline…" : "Waiting for events…"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-2 transition-colors",
                    severityRowClass(log.severity)
                  )}
                >
                  <span className="text-muted-foreground/50 shrink-0 w-[72px] text-[11px] mt-0.5 tabular-nums">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>

                  <span className="mt-0.5">
                    <SeverityIcon severity={log.severity} />
                  </span>

                  <span className={cn("break-all leading-relaxed", severityTextClass(log.severity))}>
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
