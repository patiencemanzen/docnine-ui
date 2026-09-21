import type { PortalBranding, PortalTemplateId } from "@/types/PortalTypes";

export type PortalLayoutId = "docs-sidebar" | "top-nav" | "hero-docs" | "dense-rail";

export type PortalAudience =
  "general" | "developers" | "companies" | "enterprise" | "startups" | "product";

export interface PortalTemplate {
  id: PortalTemplateId;
  label: string;
  description: string;
  audience: PortalAudience;
  layout: PortalLayoutId;
  preview: {
    header: string;
    sidebar: string;
    accent: string;
    surface: string;
  };
  branding: Pick<PortalBranding, "primaryColor" | "bgColor" | "accentColor">;
  forceDark?: boolean;
}

export const PORTAL_AUDIENCE_LABELS: Record<PortalAudience, string> = {
  general: "General",
  developers: "Developers",
  companies: "Companies",
  enterprise: "Enterprise",
  startups: "Startups",
  product: "Product",
};

export const PORTAL_TEMPLATES: PortalTemplate[] = [
  {
    id: "classic",
    label: "Classic Docs",
    description: "Familiar left sidebar with content and TOC. A solid default for any team.",
    audience: "general",
    layout: "docs-sidebar",
    preview: {
      header: "#ffffff",
      sidebar: "#f8faf9",
      accent: "#074a51",
      surface: "#ffffff",
    },
    branding: {
      primaryColor: "#074a51",
      bgColor: "#ffffff",
      accentColor: "#0d9488",
    },
  },
  {
    id: "teal-studio",
    label: "Teal Studio",
    description: "Soft teal atmosphere that matches Docnine brand feel.",
    audience: "product",
    layout: "docs-sidebar",
    preview: {
      header: "#f3f8f6",
      sidebar: "#e8f2ef",
      accent: "#0d9488",
      surface: "#f8fbfa",
    },
    branding: {
      primaryColor: "#0d9488",
      bgColor: "#f3f8f6",
      accentColor: "#074a51",
    },
  },
  {
    id: "midnight",
    label: "Midnight Reference",
    description: "Dark, focused layout for deep API and schema reference work.",
    audience: "developers",
    layout: "dense-rail",
    preview: {
      header: "#0a1a18",
      sidebar: "#071412",
      accent: "#0d9488",
      surface: "#0f1f1c",
    },
    branding: {
      primaryColor: "#0d9488",
      bgColor: "#0a1a18",
      accentColor: "#5eead4",
    },
    forceDark: true,
  },
  {
    id: "minimal",
    label: "Minimal Paper",
    description: "Light, calm, and easy to read: less chrome, more content.",
    audience: "general",
    layout: "docs-sidebar",
    preview: {
      header: "#fafafa",
      sidebar: "#f5f5f5",
      accent: "#171717",
      surface: "#ffffff",
    },
    branding: {
      primaryColor: "#171717",
      bgColor: "#fafafa",
      accentColor: "#074a51",
    },
  },
  {
    id: "company-showcase",
    label: "Company Showcase",
    description: "Hero intro with top navigation: polished for marketing and customer-facing docs.",
    audience: "companies",
    layout: "hero-docs",
    preview: {
      header: "#0f3d3e",
      sidebar: "#ffffff",
      accent: "#14b8a6",
      surface: "#f8fafc",
    },
    branding: {
      primaryColor: "#0f3d3e",
      bgColor: "#f8fafc",
      accentColor: "#14b8a6",
    },
  },
  {
    id: "developer-terminal",
    label: "Developer Terminal",
    description: "Compact dark rail and code-friendly spacing for day-to-day engineering use.",
    audience: "developers",
    layout: "dense-rail",
    preview: {
      header: "#111827",
      sidebar: "#0b1220",
      accent: "#38bdf8",
      surface: "#0f172a",
    },
    branding: {
      primaryColor: "#38bdf8",
      bgColor: "#0f172a",
      accentColor: "#7dd3fc",
    },
    forceDark: true,
  },
  {
    id: "enterprise-handbook",
    label: "Enterprise Handbook",
    description: "Structured and formal: built for larger orgs and shared knowledge bases.",
    audience: "enterprise",
    layout: "docs-sidebar",
    preview: {
      header: "#1e293b",
      sidebar: "#f1f5f9",
      accent: "#1d4ed8",
      surface: "#ffffff",
    },
    branding: {
      primaryColor: "#1e3a8a",
      bgColor: "#f8fafc",
      accentColor: "#2563eb",
    },
  },
  {
    id: "startup-guide",
    label: "Startup Guide",
    description: "Simple top navigation so people can jump between sections quickly.",
    audience: "startups",
    layout: "top-nav",
    preview: {
      header: "#ffffff",
      sidebar: "#ecfdf5",
      accent: "#059669",
      surface: "#ffffff",
    },
    branding: {
      primaryColor: "#059669",
      bgColor: "#ffffff",
      accentColor: "#10b981",
    },
  },
  {
    id: "product-manual",
    label: "Product Manual",
    description: "Friendly top-nav layout with a soft violet accent for product help centers.",
    audience: "product",
    layout: "top-nav",
    preview: {
      header: "#faf5ff",
      sidebar: "#f3e8ff",
      accent: "#7c3aed",
      surface: "#ffffff",
    },
    branding: {
      primaryColor: "#7c3aed",
      bgColor: "#faf5ff",
      accentColor: "#a78bfa",
    },
  },
  {
    id: "agency-portfolio",
    label: "Agency Portfolio",
    description: "Bold dark hero with warm accent: sharp for client and portfolio docs.",
    audience: "companies",
    layout: "hero-docs",
    preview: {
      header: "#18181b",
      sidebar: "#ffffff",
      accent: "#f59e0b",
      surface: "#fafafa",
    },
    branding: {
      primaryColor: "#18181b",
      bgColor: "#fafafa",
      accentColor: "#f59e0b",
    },
  },
];

export const DEFAULT_PORTAL_TEMPLATE_ID: PortalTemplateId = "classic";

export function getPortalTemplate(id?: string | null): PortalTemplate {
  return (
    PORTAL_TEMPLATES.find((t) => t.id === id) ??
    PORTAL_TEMPLATES.find((t) => t.id === DEFAULT_PORTAL_TEMPLATE_ID)!
  );
}

export function usesLeftSidebar(layout: PortalLayoutId) {
  return layout === "docs-sidebar" || layout === "dense-rail";
}

export function usesTopNav(layout: PortalLayoutId) {
  return layout === "top-nav" || layout === "hero-docs";
}
