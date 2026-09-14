/**
 * Product UI previews for the landing page.
 * Drawn to match guest-landing dark tokens (warm charcoal + cream accent),
 * not third-party product screenshots.
 */

import { cn } from "@/lib/utils"

function Shell({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141210] text-left shadow-[0_20px_50px_-28px_rgba(0,0,0,0.75)]",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-[#1a1816] px-3 py-2">
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="size-1.5 rounded-full bg-white/25" />
        <span className="ml-2 truncate text-[10px] font-medium tracking-wide text-white/45">
          {title}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden p-3">{children}</div>
    </div>
  )
}

function SideNavItem({
  label,
  active,
}: {
  label: string
  active?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-md px-2 py-1.5 text-[10px]",
        active
          ? "bg-[color-mix(in_oklab,oklch(0.86_0.045_86)_28%,transparent)] text-[oklch(0.92_0.04_86)]"
          : "text-white/45",
      )}
    >
      {label}
    </div>
  )
}

/** Docs workspace: sections + markdown body (matches Docnine docs UI). */
export function DocsWorkspacePreview({ className }: { className?: string }) {
  return (
    <Shell title="acme/payments · Documentation" className={className}>
      <div className="grid grid-cols-[88px_1fr] gap-2">
        <div className="space-y-0.5 rounded-lg border border-white/6 bg-black/25 p-1.5">
          <SideNavItem label="Overview" />
          <SideNavItem label="README" active />
          <SideNavItem label="API reference" />
          <SideNavItem label="Schemas" />
          <SideNavItem label="Security" />
        </div>
        <div className="space-y-2 rounded-lg border border-white/6 bg-black/20 p-2.5">
          <div className="h-2.5 w-28 rounded bg-[oklch(0.86_0.045_86)]/70" />
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-white/12" />
            <div className="h-1.5 w-[92%] rounded bg-white/10" />
            <div className="h-1.5 w-[78%] rounded bg-white/8" />
          </div>
          <div className="mt-2 rounded-md border border-white/8 bg-[#0f0e0c] p-2 font-mono text-[9px] leading-relaxed text-emerald-300/80">
            <div>POST /v1/charges</div>
            <div className="text-white/35">Creates a payment intent</div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

/** Sync panel: commit → docs regenerated. */
export function SyncPreview({ className }: { className?: string }) {
  return (
    <Shell title="GitHub sync · main" className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-white/8 bg-black/25 px-2.5 py-2">
          <div>
            <div className="text-[10px] font-medium text-white/80">
              Push detected
            </div>
            <div className="mt-0.5 font-mono text-[9px] text-white/40">
              feat: add refunds endpoint
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
            Synced
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {["README", "API ref", "Schemas"].map((s) => (
            <div
              key={s}
              className="rounded-md border border-white/8 bg-black/20 px-2 py-2 text-center"
            >
              <div className="text-[9px] text-white/40">Updated</div>
              <div className="mt-0.5 text-[10px] font-medium text-white/75">
                {s}
              </div>
            </div>
          ))}
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <div className="h-full w-[82%] rounded-full bg-[oklch(0.86_0.045_86)]" />
        </div>
      </div>
    </Shell>
  )
}

/** Public docs portal. */
export function PortalPreview({ className }: { className?: string }) {
  return (
    <Shell title="docs.acme.dev · Portal" className={className}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-semibold tracking-tight text-white/90">
            Acme Payments API
          </div>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] text-white/45">
            Public
          </span>
        </div>
        <div className="flex gap-1.5">
          {["Guides", "Reference", "Try it"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "rounded-full px-2 py-0.5 text-[9px]",
                i === 1
                  ? "bg-white text-[#141210]"
                  : "border border-white/10 text-white/50",
              )}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="rounded-lg border border-white/8 bg-black/25 p-2.5">
          <div className="mb-1.5 text-[10px] font-medium text-white/70">
            Authentication
          </div>
          <div className="space-y-1">
            <div className="h-1.5 w-full rounded bg-white/10" />
            <div className="h-1.5 w-[85%] rounded bg-white/8" />
          </div>
          <div className="mt-2 rounded bg-[#0c0b0a] px-2 py-1.5 font-mono text-[9px] text-sky-300/80">
            Authorization: Bearer sk_live_…
          </div>
        </div>
      </div>
    </Shell>
  )
}

/** Archive / version history strip. */
export function ArchivePreview({ className }: { className?: string }) {
  return (
    <Shell title="Version history" className={className}>
      <div className="space-y-1.5">
        {[
          { v: "v12", label: "API reference", when: "2h ago", on: true },
          { v: "v11", label: "README", when: "Yesterday", on: false },
          { v: "v10", label: "Schemas", when: "3 days ago", on: false },
        ].map((row) => (
          <div
            key={row.v}
            className={cn(
              "flex items-center justify-between rounded-md border px-2 py-1.5",
              row.on
                ? "border-[oklch(0.86_0.045_86)]/35 bg-[oklch(0.86_0.045_86)]/8"
                : "border-white/8 bg-black/20",
            )}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] text-white/40">{row.v}</span>
              <span className="text-[10px] text-white/75">{row.label}</span>
            </div>
            <span className="text-[9px] text-white/35">{row.when}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** Share / collaboration. */
export function SharePreview({ className }: { className?: string }) {
  return (
    <Shell title="Project sharing" className={className}>
      <div className="space-y-1.5">
        {[
          { name: "maya@acme.io", role: "Editor" },
          { name: "jon@acme.io", role: "Viewer" },
          { name: "Invite link", role: "Viewer" },
        ].map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-md border border-white/8 bg-black/20 px-2 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-5 place-items-center rounded-full bg-white/10 text-[8px] font-semibold text-white/60">
                {row.name[0]!.toUpperCase()}
              </span>
              <span className="text-[10px] text-white/75">{row.name}</span>
            </div>
            <span className="text-[9px] text-white/40">{row.role}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}

/** Notifications. */
export function NotifyPreview({ className }: { className?: string }) {
  return (
    <Shell title="Notifications" className={className}>
      <div className="space-y-1.5">
        {[
          "Docs regenerated after push to main",
          "Portal published · docs.acme.dev",
          "Share accepted · maya@acme.io",
        ].map((text, i) => (
          <div
            key={text}
            className="flex gap-2 rounded-md border border-white/8 bg-black/20 px-2 py-1.5"
          >
            <span
              className={cn(
                "mt-0.5 size-1.5 shrink-0 rounded-full",
                i === 0 ? "bg-emerald-400" : "bg-white/25",
              )}
            />
            <span className="text-[10px] leading-snug text-white/70">{text}</span>
          </div>
        ))}
      </div>
    </Shell>
  )
}
