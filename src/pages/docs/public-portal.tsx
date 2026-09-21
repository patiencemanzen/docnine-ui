import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import {
    Search, ChevronRight, Lock, Globe, Eye, EyeOff,
    Menu, X, ExternalLink, AlertTriangle, BookOpen, ArrowUp, Home
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DocRenderer } from "@/components/projects/doc-render"
import { cn } from "@/lib/utils"
import Loader1 from "@/components/ui/loader1"
import { PortalSectionKey, PublicPortalData } from "@/types/PortalTypes"
import { publicPortalApi } from "@/lib/api"
import { applySeo } from "@/lib/seo"
import { PORTAL_SECTION_KEYS, PORTAL_SECTION_LABELS } from "@/configs/PortalConfig"
import { DEFAULT_PORTAL_TEMPLATE_ID, getPortalTemplate, usesLeftSidebar, usesTopNav } from "@/configs/PortalTemplates"

interface TocEntry {
    id: string
    level: number
    text: string
}

interface SearchHit {
    sectionKey: PortalSectionKey
    sectionLabel: string
    excerpt: string
    matchIndex: number
}

function usePortalThemeLock(scheme: "light" | "dark") {
    useEffect(() => {
        const root = document.documentElement
        const previous = Array.from(root.classList).filter((c) => c === "light" || c === "dark")

        root.setAttribute("data-portal-theme-lock", "true")
        root.classList.remove("light", "dark")
        root.classList.add(scheme)

        return () => {
            root.removeAttribute("data-portal-theme-lock")
            root.classList.remove("light", "dark")
            if (previous.length > 0) {
                previous.forEach((c) => root.classList.add(c))
                return
            }

            const stored = localStorage.getItem("docnine-ui-theme")
            if (stored === "dark" || stored === "light") {
                root.classList.add(stored)
                return
            }
            const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
            root.classList.add(systemDark ? "dark" : "light")
        }
    }, [scheme])
}

function slugifyHeading(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() || "section"
}

function extractToc(markdown: string): TocEntry[] {
    const lines = markdown.split("\n")
    const toc: TocEntry[] = []
    const seen: Record<string, number> = {}

    for (const line of lines) {
        const match = line.match(/^(#{1,6})\s+(.+)$/)
        if (!match) continue
        const level = match[1].length
        const text = match[2].trim()
        const base = slugifyHeading(text)
        const id = seen[base] ? `${base}-${seen[base]++}` : (seen[base] = 1, base)
        toc.push({ id, level, text })
    }
    return toc
}

function buildExcerpt(text: string, query: string, radius = 120): string {
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text.slice(0, 200)
    const start = Math.max(0, idx - 60)
    const end = Math.min(text.length, idx + radius)
    return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "")
}

function PasswordGate({
    slug,
    onUnlock,
}: {
    slug: string
    onUnlock: (password: string) => void
}) {
    const [pw, setPw] = useState("")
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!pw.trim()) return
        setLoading(true)
        setError("")
        try {
            await publicPortalApi.auth(slug, pw)
            onUnlock(pw)
        } catch {
            setError("Incorrect password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="rounded-full border border-border bg-muted p-4">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold">Protected Portal</h1>
                        <p className="text-sm text-muted-foreground mt-1">Enter the password to access this documentation.</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Portal password"
                            value={pw}
                            onChange={(e) => setPw(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm pr-10 outline-none focus:border-primary"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    {error && <p className="text-xs text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading && <Loader1 className="h-4 w-4 mr-2 " />}
                        Unlock
                    </Button>
                </form>
            </div>
        </div>
    )
}

export function PublicPortalPage() {
    const { slug } = useParams<{ slug: string }>()
    const [data, setData] = useState<PublicPortalData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [password, setPassword] = useState<string | null>(null)
    const [activeSection, setActiveSection] = useState<PortalSectionKey>("readme")
    const [searchQuery, setSearchQuery] = useState("")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showBackToTop, setShowBackToTop] = useState(false)
    const contentRef = useRef<HTMLDivElement>(null)

    
    const fetchPortal = useCallback(async (pw?: string) => {
        if (!slug) return
        setLoading(true)
        setError(null)
        try {
            const res = await publicPortalApi.get(slug, pw)
            setData(res)
            
            if (res.sectionVisibility) {
                const firstVisible = PORTAL_SECTION_KEYS.find(
                    (k) => res.sectionVisibility![k] !== "internal",
                )
                if (firstVisible) setActiveSection(firstVisible)
            }
        } catch {
            setError("This portal could not be found or is no longer public.")
        } finally {
            setLoading(false)
        }
    }, [slug])

    useEffect(() => {
        fetchPortal()
    }, [fetchPortal])

    
    useEffect(() => {
        if (!data) return
        const { portal, project } = data
        const title = portal.seoTitle || `${project.repoName} Docs`
        const description =
            portal.seoDescription ||
            `Documentation for ${project.repoOwner}/${project.repoName}`

        applySeo({
            title,
            description,
            pathname: `/docs/${portal.slug}`,
            appendSiteName: false,
            type: "article",
            siteName: portal.branding?.headerText || project.repoName || "Docs",
        })

        if (portal.branding?.favicon) {
            let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
            if (!favicon) {
                favicon = document.createElement("link")
                favicon.rel = "icon"
                document.head.appendChild(favicon)
            }
            favicon.href = portal.branding.favicon
        }
    }, [data])

    
    useEffect(() => {
        const el = contentRef.current
        if (!el) return
        const onScroll = () => setShowBackToTop(el.scrollTop > 400)
        el.addEventListener("scroll", onScroll)
        return () => el.removeEventListener("scroll", onScroll)
    }, [])

    
    const branding = data?.portal.branding ?? {}
    const template = getPortalTemplate(data?.portal.templateId ?? DEFAULT_PORTAL_TEMPLATE_ID)
    const primaryColor = branding.primaryColor ?? template.branding.primaryColor ?? "#074a51"
    const pageBg = branding.bgColor ?? template.branding.bgColor
    const accentColor = branding.accentColor ?? template.branding.accentColor ?? primaryColor
    const layout = template.layout
    const showLeftSidebar = usesLeftSidebar(layout)
    const showTopNav = usesTopNav(layout)
    const showHero = layout === "hero-docs"
    const isDense = layout === "dense-rail"
    const isMinimal = template.id === "minimal"
    const forceDark = Boolean(template.forceDark)
    const portalScheme: "light" | "dark" = data
        ? forceDark
            ? "dark"
            : "light"
        : "light"

    usePortalThemeLock(portalScheme)

    const visibleSections = useMemo(() => {
        if (!data?.sectionVisibility) return []
        return PORTAL_SECTION_KEYS.filter((k) => data.sectionVisibility![k] !== "internal")
    }, [data])

    const currentContent = useMemo(() => {
        if (!data?.content) return null
        return data.content[activeSection] ?? null
    }, [data, activeSection])

    const currentIsComingSoon = useMemo(() => {
        return data?.sectionVisibility?.[activeSection] === "coming_soon"
    }, [data, activeSection])

    const toc = useMemo(() => {
        if (!currentContent) return []
        return extractToc(currentContent)
    }, [currentContent])

    
    const searchResults = useMemo<SearchHit[]>(() => {
        if (!searchQuery.trim() || !data?.content) return []
        const q = searchQuery.toLowerCase()
        const hits: SearchHit[] = []
        for (const key of visibleSections) {
            const content = data.content![key]
            if (!content) continue
            const idx = content.toLowerCase().indexOf(q)
            if (idx === -1) continue
            hits.push({
                sectionKey: key,
                sectionLabel: PORTAL_SECTION_LABELS[key],
                excerpt: buildExcerpt(content, searchQuery),
                matchIndex: idx,
            })
        }
        return hits
    }, [searchQuery, data, visibleSections])

    
    const brandingStyle: React.CSSProperties = {
        "--portal-primary": primaryColor,
        "--portal-accent": accentColor,
        "--portal-bg": pageBg,
        ...(pageBg ? { backgroundColor: pageBg } : {}),
    } as React.CSSProperties

    

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader1 className="h-8 w-8  text-muted-foreground" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
                <Globe className="h-12 w-12 text-muted-foreground/40" />
                <div className="text-center">
                    <h1 className="text-xl font-semibold">Portal not found</h1>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                </div>
                <Link to="/" className="text-sm text-primary hover:underline flex items-center gap-1.5">
                    <Home className="h-3.5 w-3.5" /> Go to Docnine
                </Link>
            </div>
        )
    }

    
    if (data?.protected) {
        return (
            <PasswordGate
                slug={slug!}
                onUnlock={(pw) => {
                    setPassword(pw)
                    fetchPortal(pw)
                }}
            />
        )
    }

    if (!data) return null

    const { portal, project } = data
    const portalTitle = portal.seoTitle || `${project.repoName} Docs`
    const portalSubtitle = branding.headerText || project.meta?.description || ""

    return (
        <div
            className={cn(
                "portal-shell min-h-screen flex flex-col",
                forceDark && "dark text-foreground",
                !forceDark && "bg-background",
                isMinimal && "tracking-tight",
                isDense && "font-sans",
            )}
            data-portal-scheme={portalScheme}
            style={brandingStyle}
        >
            {showHero && (
                <div
                    className="px-4 sm:px-6 pt-10 pb-8 text-white"
                    style={{
                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
                    }}
                >
                    <div className={cn("mx-auto", isMinimal ? "max-w-5xl" : "max-w-screen-xl")}>
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                {branding.logo && (
                                    <img src={branding.logo} alt="logo" className="h-8 w-auto object-contain mb-4 brightness-0 invert" />
                                )}
                                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{portalTitle}</h1>
                                {portalSubtitle && (
                                    <p className="mt-2 text-sm text-white/80 max-w-2xl">{portalSubtitle}</p>
                                )}
                            </div>
                            <a
                                href="https://docnine.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden sm:flex items-center gap-1.5 text-xs text-white/70 hover:text-white shrink-0"
                            >
                                Powered by Docnine
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <header
                className={cn(
                    "sticky top-0 z-30 border-b backdrop-blur-sm",
                    forceDark
                        ? "border-white/10 bg-background/90"
                        : showHero
                          ? "border-border/50 bg-background/95"
                          : template.id === "teal-studio"
                            ? "border-teal-900/10 bg-[#f3f8f6]/95"
                            : isMinimal
                              ? "border-black/5 bg-white/90"
                              : template.id === "enterprise-handbook"
                                ? "border-slate-200 bg-slate-900 text-white"
                                : "border-border/60 bg-background/95",
                )}
                style={
                    branding.bgColor && !forceDark && !showHero && template.id !== "enterprise-handbook"
                        ? { backgroundColor: branding.bgColor }
                        : undefined
                }
            >
                <div
                    className={cn(
                        "mx-auto flex h-14 items-center gap-4 px-4 sm:px-6",
                        isMinimal || showTopNav ? "max-w-5xl" : "max-w-screen-xl",
                    )}
                >
                    {showLeftSidebar && (
                        <button
                            className="lg:hidden p-1.5 rounded-md hover:bg-muted"
                            onClick={() => setSidebarOpen((v) => !v)}
                        >
                            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    )}

                    {!showHero && (
                        <div className="flex items-center gap-3 min-w-0">
                            {branding.logo && (
                                <img src={branding.logo} alt="logo" className="h-7 w-auto object-contain shrink-0" />
                            )}
                            <div className="min-w-0">
                                <span
                                    className={cn(
                                        "font-semibold text-sm truncate block",
                                        template.id === "enterprise-handbook" && "text-white",
                                    )}
                                >
                                    {portalTitle}
                                </span>
                                {portalSubtitle && (
                                    <span
                                        className={cn(
                                            "text-xs hidden sm:block truncate",
                                            template.id === "enterprise-handbook"
                                                ? "text-white/70"
                                                : "text-muted-foreground",
                                        )}
                                    >
                                        {portalSubtitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {showTopNav && (
                        <nav className="hidden md:flex items-center gap-1 min-w-0 flex-1 overflow-x-auto">
                            {visibleSections.map((key) => {
                                const isActive = key === activeSection
                                const isComingSoon = data.sectionVisibility?.[key] === "coming_soon"
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setActiveSection(key)
                                            contentRef.current?.scrollTo({ top: 0 })
                                        }}
                                        className={cn(
                                            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                                            isActive
                                                ? "text-white"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                            isComingSoon && "opacity-60",
                                        )}
                                        style={isActive ? { backgroundColor: primaryColor } : undefined}
                                    >
                                        {PORTAL_SECTION_LABELS[key]}
                                    </button>
                                )
                            })}
                        </nav>
                    )}

                    {!showTopNav && <div className="flex-1" />}

                    <div className="relative hidden sm:flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search docs…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={cn(
                                "h-8 w-48 lg:w-64 rounded-md border pl-8 pr-3 text-sm outline-none transition-colors",
                                template.id === "enterprise-handbook"
                                    ? "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus:border-white/40"
                                    : "border-input bg-muted focus:border-primary focus:bg-background",
                                isDense && "font-mono text-[12px]",
                            )}
                        />
                    </div>

                    {portal.accessMode === "password" && (
                        <span className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock className="h-3 w-3" /> Protected
                        </span>
                    )}

                    {!showHero && (
                        <a
                            href="https://docnine.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "hidden md:flex items-center gap-1.5 text-xs transition-colors shrink-0",
                                template.id === "enterprise-handbook"
                                    ? "text-white/70 hover:text-white"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                        >
                            Powered by Docnine
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>

                {showTopNav && (
                    <div className="md:hidden px-4 pb-3 flex gap-1.5 overflow-x-auto">
                        {visibleSections.map((key) => {
                            const isActive = key === activeSection
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={cn(
                                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium",
                                        isActive ? "text-white" : "bg-muted text-muted-foreground",
                                    )}
                                    style={isActive ? { backgroundColor: primaryColor } : undefined}
                                >
                                    {PORTAL_SECTION_LABELS[key]}
                                </button>
                            )
                        })}
                    </div>
                )}

                <div className="lg:hidden px-4 pb-2">
                    <div className="relative flex items-center">
                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search docs…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 w-full rounded-md border border-input bg-muted pl-8 pr-3 text-sm outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </header>

            {searchQuery.trim() && (
                <div className="fixed inset-0 z-20 flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <span className="text-sm font-medium">
                                {searchResults.length > 0
                                    ? `${searchResults.length} result${searchResults.length > 1 ? "s" : ""} for "${searchQuery}"`
                                    : `No results for "${searchQuery}"`}
                            </span>
                            <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="overflow-y-auto max-h-[60vh]">
                            {searchResults.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    Nothing matched your search. Try different keywords.
                                </div>
                            ) : (
                                searchResults.map((hit) => (
                                    <button
                                        key={hit.sectionKey}
                                        onClick={() => {
                                            setActiveSection(hit.sectionKey)
                                            setSearchQuery("")
                                            setSidebarOpen(false)
                                        }}
                                        className="w-full px-4 py-3 hover:bg-muted text-left border-b border-border/50 last:border-0 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                            <span className="text-sm font-medium" style={{ color: primaryColor }}>{hit.sectionLabel}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{hit.excerpt}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div
                className={cn(
                    "flex flex-1 mx-auto w-full",
                    showTopNav || isMinimal ? "max-w-5xl" : "max-w-screen-xl",
                )}
            >
                {showLeftSidebar && (
                    <aside
                        className={cn(
                            "fixed lg:sticky top-14 z-20 h-[calc(100vh-3.5rem)] lg:h-[calc(100svh-3.5rem)] shrink-0",
                            "overflow-y-auto transition-transform duration-200 lg:translate-x-0",
                            isDense ? "w-72" : "w-64",
                            sidebarOpen ? "translate-x-0" : "-translate-x-full",
                            forceDark
                                ? "border-r border-white/10 bg-black/20 backdrop-blur-sm"
                                : template.id === "teal-studio"
                                  ? "border-r border-teal-900/10 bg-[#e8f2ef]/80 backdrop-blur-sm"
                                  : isMinimal
                                    ? "border-r border-black/5 bg-[#f5f5f5]/90"
                                    : template.id === "enterprise-handbook"
                                      ? "border-r border-slate-200 bg-slate-50"
                                      : "border-r border-border bg-background/95 backdrop-blur-sm",
                        )}
                    >
                        <nav className="py-4 px-3">
                            <p
                                className={cn(
                                    "px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1",
                                    isDense && "font-mono tracking-[0.18em]",
                                )}
                            >
                                Documentation
                            </p>
                            {visibleSections.map((key) => {
                                const isActive = key === activeSection
                                const isComingSoon = data.sectionVisibility?.[key] === "coming_soon"
                                return (
                                    <button
                                        key={key}
                                        onClick={() => {
                                            setActiveSection(key)
                                            setSidebarOpen(false)
                                            contentRef.current?.scrollTo({ top: 0 })
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors mb-0.5",
                                            isDense && "font-mono text-[12px] rounded-md",
                                            isActive
                                                ? "font-medium text-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted",
                                            isComingSoon && "opacity-60",
                                        )}
                                        style={isActive ? { backgroundColor: `${primaryColor}18`, color: primaryColor } : undefined}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isActive && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                                            {!isActive && <span className="h-3.5 w-3.5 shrink-0" />}
                                            {PORTAL_SECTION_LABELS[key]}
                                        </span>
                                        {isComingSoon && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-muted-foreground shrink-0">
                                                Soon
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </nav>
                    </aside>
                )}

                {showLeftSidebar && sidebarOpen && (
                    <div
                        className="fixed inset-0 z-10 bg-background/50 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 flex min-w-0" ref={contentRef as any}>
                    <article
                        className={cn(
                            "flex-1 min-w-0 px-6 lg:px-10 py-8",
                            showTopNav || isMinimal ? "max-w-2xl mx-auto" : isDense ? "max-w-3xl" : "max-w-3xl",
                        )}
                    >
                        <h1
                            className={cn(
                                "mb-1 flex items-center gap-2 font-bold",
                                isMinimal || showTopNav ? "text-xl tracking-tight" : "text-2xl",
                                isDense && "font-mono text-xl tracking-tight",
                                showHero && "font-semibold",
                                template.id === "teal-studio" && "font-display tracking-[0.01em]",
                            )}
                        >
                            {PORTAL_SECTION_LABELS[activeSection]}
                            {currentIsComingSoon && (
                                <span className="text-sm font-normal text-muted-foreground border border-border rounded-full px-2.5 py-0.5">
                                    Coming Soon
                                </span>
                            )}
                        </h1>
                        <div className="h-px bg-border my-4" />

                        {currentIsComingSoon ? (
                            
                            <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
                                <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/40" />
                                <h3 className="font-semibold text-lg">Coming Soon</h3>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                                    This section is under development and will be published soon. Check back later!
                                </p>
                            </div>
                        ) : currentContent ? (
                            <DocRenderer content={currentContent} />
                        ) : (
                            <div className="text-sm text-muted-foreground py-8 text-center">No content available for this section.</div>
                        )}
                    </article>

                    {toc.length > 0 && showLeftSidebar && (
                        <aside className="hidden xl:block w-56 shrink-0 sticky top-14 h-[calc(100svh-3.5rem)] overflow-y-auto py-8 pr-6">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">On this page</p>
                            <nav className="space-y-1">
                                {toc.map((entry) => (
                                    <a
                                        key={entry.id}
                                        href={`#${entry.id}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            const el = document.getElementById(entry.id)
                                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
                                        }}
                                        className={cn(
                                            "block text-xs text-muted-foreground hover:text-foreground transition-colors py-0.5 leading-relaxed",
                                            entry.level === 1 && "font-medium",
                                            entry.level === 2 && "pl-3",
                                            entry.level >= 3 && "pl-5",
                                        )}
                                    >
                                        {entry.text}
                                    </a>
                                ))}
                            </nav>
                        </aside>
                    )}
                </main>

            </div>

            {(branding.footerText || (branding.footerLinks && branding.footerLinks.length > 0)) && (
                <footer className="border-t border-border py-6 px-6 text-center">
                    {branding.footerLinks && branding.footerLinks.length > 0 && (
                        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-2">
                            {branding.footerLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    )}
                    {branding.footerText && (
                        <p className="text-xs text-muted-foreground">{branding.footerText}</p>
                    )}
                </footer>
            )}

            {showBackToTop && (
                <button
                    onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
                    className="fixed bottom-6 right-6 z-20 rounded-full border border-border bg-background p-2.5 shadow-lg hover:bg-muted transition-colors"
                    aria-label="Back to top"
                >
                    <ArrowUp className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
