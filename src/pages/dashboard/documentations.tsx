import { useState, useCallback, useEffect } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { projectsApi } from "@/lib/api"
import { mapApiStatus } from "@/store/projects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/ui/pagination"
import {
    BookOpen,
    FileCode2,
    Database,
    ShieldAlert,
    AlertTriangle,
    Search,
    ExternalLink,
    Github,
    Star,
    FileCode,
    Box,
    Network,
    Layers,
    CheckCircle2,
    Clock,
    RefreshCw,
    ArrowRight,
    FilesIcon,
} from "@/components/icons"
import TopBar from "@/components/projects/top-bar"
import { DocStatusBadge } from "@/components/projects/doc-status"
import { useDocTrackerStore } from "@/store/doc-tracker"
import { useClientPagination } from "@/hooks"
import { DocStatus } from "@/types/DocStatusTypes"
import { DOC_STATUS_ORDER } from "@/configs/DocStatusConfig"
import { ApiProject } from "@/types/ProjectTypes"

function gradeColour(grade?: string) {
    switch (grade) {
        case "A": return "text-green-600 dark:text-green-400"
        case "B": return "text-lime-600 dark:text-lime-400"
        case "C": return "text-yellow-600 dark:text-yellow-400"
        case "D": return "text-orange-600 dark:text-orange-400"
        case "F": return "text-red-600 dark:text-red-400"
        default: return "text-muted-foreground"
    }
}

const DOC_SECTIONS = [
    { key: "readme", label: "README", icon: BookOpen },
    { key: "apiReference", label: "API Ref", icon: FileCode2 },
    { key: "schemaDocs", label: "Schema", icon: Database },
    { key: "internalDocs", label: "Internal", icon: FileCode },
    { key: "securityReport", label: "Security", icon: ShieldAlert },
] as const

function DocProjectCard({ project }: { project: ApiProject }) {
    const name = project.meta?.name || project.repoName
    const description = project.meta?.description
    const language = project.meta?.language
    const stars = project.meta?.stars
    const techStack = project.techStack?.slice(0, 4) ?? []
    const stats = project.stats
    const security = project.security
    const updatedAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })

    
    const { getEntry, isOverdue } = useDocTrackerStore()
    const SECTION_KEYS = DOC_SECTIONS.map((s) => s.key)

    
    const STATUS_PRIORITY: DocStatus[] = [
        "changes_requested", "in_review", "outdated", "published", "approved", "archived",
    ]
    const dominantStatus = (() => {
        for (const st of STATUS_PRIORITY) {
            if (SECTION_KEYS.some((k) => getEntry(project._id, k)?.status === st)) return st
        }
        return null
    })()

    return (
        <Card className="flex flex-col hover:border-primary/40 transition-colors group shadow-none bg-background">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                            {project.repoOwner}/{name}
                        </CardTitle>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
                        )}
                    </div>
                    {security?.grade && (
                        <span className={`shrink-0 text-xl font-bold tabular-nums ${gradeColour(security.grade)}`} title="Security grade">
                            {security.grade}
                        </span>
                    )}
                </div>
                {dominantStatus && (
                    <DocStatusBadge status={dominantStatus} compact />
                )}

                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {language && (
                        <span className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-primary/70" />
                            {language}
                        </span>
                    )}
                    {stars !== undefined && (
                        <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {stars.toLocaleString()}
                        </span>
                    )}
                    <span className="flex items-center gap-1 ml-auto">
                        <Clock className="h-3 w-3" />
                        {updatedAgo}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4 pb-3">
                {stats && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                        {[
                            { value: stats.filesAnalysed, icon: FileCode, label: "Files" },
                            { value: stats.endpoints, icon: Network, label: "Endpoints" },
                            { value: stats.models, icon: Database, label: "Models" },
                        ].map(({ value, icon: Icon, label }) => (
                            <div key={label} className="bg-muted/50 rounded-lg p-2">
                                <div className="text-lg font-bold">{value ?? 0}</div>
                                <div className="text-[13px] text-muted-foreground flex items-center justify-center gap-0.5">
                                    <Icon className="h-2.5 w-2.5" />{label}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {security?.counts && Object.values(security.counts).some(Boolean) && (
                    <div className="flex items-center gap-2 text-xs">
                        <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => {
                            const n = security.counts[sev]
                            if (!n) return null
                            const colours: Record<string, string> = {
                                CRITICAL: "bg-red-500/20 text-red-600 dark:text-red-400",
                                HIGH: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
                                MEDIUM: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                                LOW: "bg-blue-500/20 text-blue-500",
                            }
                            return (
                                <span key={sev} className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${colours[sev]}`}>
                                    {n} {sev[0]}
                                </span>
                            )
                        })}
                    </div>
                )}

                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {techStack.map((t) => (
                            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                {t}
                            </span>
                        ))}
                        {(project.techStack?.length ?? 0) > 4 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                                +{project.techStack!.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-3 border-t border-border flex items-center gap-2">
                <Button asChild size="sm" className="flex-1 gap-1.5 rounded-4xl">
                    <Link to={`/projects/${project._id}/docs`}>
                        <BookOpen className="h-3.5 w-3.5" />
                        View Docs
                    </Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                    <a href={project.repoUrl} target="_blank" rel="noreferrer">
                        <Github className="h-3.5 w-3.5" />
                    </a>
                </Button>
            </CardFooter>
        </Card>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-primary/10 p-5 mb-5">
                <FilesIcon className="h-12 w-12 text-primary/60" />
            </div>
            <h2 className="text-2xl font-bold">No files yet</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
                Create a project and run the analysis pipeline.
            </p>
            <Button asChild className="mt-6 gap-2">
                <Link to="/dashboard">
                    <ArrowRight className="h-4 w-4" />
                    Go to Dashboard
                </Link>
            </Button>
        </div>
    )
}

export function DocumentationsPage() {
    const [completedProjects, setCompletedProjects] = useState<ApiProject[]>([])
    const [inProgressProjects, setInProgressProjects] = useState<ApiProject[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<DocStatus | "all">("all")

    const { getEntry } = useDocTrackerStore()
    const SECTION_KEYS = DOC_SECTIONS.map((s) => s.key)

    const loadProjects = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            
            const [doneRes, activeRes] = await Promise.all([
                projectsApi.list({ status: "done", limit: 100, sort: "-updatedAt" }),
                projectsApi.list({ limit: 100, sort: "-updatedAt" }),
            ])
            setCompletedProjects(doneRes.projects as unknown as ApiProject[])
            
            const nonDone = (activeRes.projects as unknown as ApiProject[]).filter(
                (p) => p.status !== "done"
            )
            setInProgressProjects(nonDone)
        } catch (err: any) {
            setError(err?.message ?? "Failed to load projects.")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadProjects()
    }, [loadProjects])

    
    const filteredCompleted = completedProjects.filter((p) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            p.repoName?.toLowerCase().includes(q) ||
            p.repoOwner?.toLowerCase().includes(q) ||
            p.meta?.language?.toLowerCase().includes(q) ||
            p.techStack?.some((t) => t.toLowerCase().includes(q))
        )
    }).filter((p) => {
        if (statusFilter === "all") return true
        return SECTION_KEYS.some((k) => getEntry(p._id, k)?.status === statusFilter)
    })

    
    const {
        currentPage,
        totalPages,
        paginatedItems: paginatedCompleted,
        startIdx,
        endIdx,
        totalItems,
        goToPrevious,
        goToNext,
    } = useClientPagination({
        items: filteredCompleted,
        itemsPerPage: 6,
        resetOnChange: true,
    })

    
    const totalFiles = completedProjects.reduce((s, p) => s + (p.stats?.filesAnalysed ?? 0), 0)
    const totalEndpoints = completedProjects.reduce((s, p) => s + (p.stats?.endpoints ?? 0), 0)
    const totalModels = completedProjects.reduce((s, p) => s + (p.stats?.models ?? 0), 0)

    return (
        <div>
            <TopBar title="Documentation" description="All documented projects across your account.">
                <Button variant="outline" size="sm" onClick={loadProjects} className="gap-2 shrink-0 rounded-2xl">
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </Button>
            </TopBar>

            <div className="space-y-6">
                {!isLoading && completedProjects.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Documented projects", value: completedProjects.length, icon: BookOpen },
                            { label: "Files analysed", value: totalFiles, icon: FileCode },
                            { label: "API endpoints", value: totalEndpoints, icon: Network },
                            { label: "Data models", value: totalModels, icon: Database },
                        ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
                                    <div className="text-xs text-muted-foreground">{label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {!isLoading && completedProjects.length > 0 && (
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, language, or tech..."
                                className="pl-9 rounded-2xl w-full"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    )}

                    {!isLoading && completedProjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${statusFilter === "all"
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 bg-card"
                                    }`}
                            >
                                All
                            </button>
                            {DOC_STATUS_ORDER.map((status) => {
                                const activeCount = completedProjects.filter((p) =>
                                    SECTION_KEYS.some((k) => getEntry(p._id, k)?.status === status)
                                ).length
                                if (activeCount === 0) return null
                                const isActive = statusFilter === status
                                return (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(isActive ? "all" : status)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${isActive
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border text-muted-foreground hover:border-muted-foreground"
                                            }`}
                                    >
                                        <DocStatusBadge status={status} compact />
                                        <span className="font-tabular ml-1">{activeCount}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="border border-border rounded-xl p-5 space-y-3">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-3 w-full" />
                                <div className="grid grid-cols-3 gap-2">
                                    <Skeleton className="h-12" />
                                    <Skeleton className="h-12" />
                                    <Skeleton className="h-12" />
                                </div>
                                <Skeleton className="h-8" />
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && !error && completedProjects.length === 0 && <EmptyState />}

                {!isLoading && filteredCompleted.length > 0 && (
                    <section>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {paginatedCompleted.map((p) => (
                                <DocProjectCard key={p._id} project={p} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPreviousClick={goToPrevious}
                            onNextClick={goToNext}
                            showItemCount
                            itemCount={totalItems}
                            currentItemStart={startIdx}
                            currentItemEnd={Math.min(endIdx, totalItems)}
                        />

                        {search && filteredCompleted.length === 0 && (
                            <p className="text-center text-muted-foreground py-12">No projects match "{search}".</p>
                        )}
                    </section>
                )}

                {!isLoading && inProgressProjects.length > 0 && (
                    <section>
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            Other projects
                        </h2>
                        <div className="space-y-2">
                            {inProgressProjects.map((p) => {
                                const uiStatus = mapApiStatus(p.status)
                                return (
                                    <div key={p._id} className="flex flex-wrap items-center justify-between bg-card border border-border rounded-lg px-4 py-3 gap-x-4 gap-y-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                                            <span className="font-medium text-sm truncate">
                                                {p.repoOwner}/{p.repoName}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge
                                                variant={
                                                    uiStatus === "analyzing" ? "warning"
                                                        : uiStatus === "failed" ? "destructive"
                                                            : uiStatus === "archived" ? "secondary"
                                                                : "default"
                                                }
                                                className="text-xs"
                                            >
                                                {p.status}
                                            </Badge>
                                            {uiStatus === "analyzing" && (
                                                <Link to={`/projects/${p._id}/live`} className="text-xs text-primary hover:underline">
                                                    View live
                                                </Link>
                                            )}
                                            {(uiStatus === "failed" || uiStatus === "archived") && (
                                                <Link to={`/projects/${p._id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                                                    Details <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
