import { getSiteUrl } from "@/lib/seo"
import { SeoConfig } from "@/types/SeoTypes"

export const SYSTEM_PATHS = [
  "/verify",
  "/auth/callback",
  "/cli-auth",
  "/auth/github",
  "/auth/gitlab",
  "/auth/bitbucket",
  "/auth/azure",
  "/github/oauth/complete",
  "/gitlab/oauth/complete",
  "/bitbucket/oauth/complete",
  "/azure/oauth/complete",
  "/forgot-password",
  "/reset-password",
]

export const MARKETING_KEYWORDS = [
  "ai documentation",
  "developer documentation",
  "documentation generator",
  "generate docs from code",
  "api documentation tool",
  "github documentation generator",
  "codebase documentation",
  "keep docs in sync",
  "docnine",
  "docnine ai",
]

export const AUTH_KEYWORDS = [
  "docnine login",
  "docnine signup",
  "sign into docnine",
  "create docnine account",
  "developer documentation tool",
]

const siteUrl = getSiteUrl()

export const PUBLIC_PAGES: Record<string, SeoConfig> = {
  "/": {
    title: "Docnine: AI documentation for engineering teams",
    description:
      "Generate clear developer docs from your codebase and keep them up to date as your code changes. Less busywork, better documentation.",
    pathname: "/",
    keywords: MARKETING_KEYWORDS,
    appendSiteName: false,
    image: "/landing/cocoon/og-image.png",
    imageWidth: 1200,
    imageHeight: 630,
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Docnine",
        url: siteUrl,
        logo: `${siteUrl}/web-app-manifest-512x512.png`,
        sameAs: ["https://github.com/docnineai"],
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Docnine",
        url: siteUrl,
        description:
          "Generate and maintain developer documentation from your code with AI.",
        publisher: { "@type": "Organization", name: "Docnine", url: siteUrl },
      },
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Docnine",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description:
          "Generate and maintain developer documentation from your code with AI.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    ],
  },
  "/login": {
    title: "Sign in",
    description:
      "Sign in to Docnine to generate and maintain documentation for your codebase.",
    pathname: "/login",
    keywords: AUTH_KEYWORDS,
    robots: "index, follow",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Sign in to Docnine",
      url: `${siteUrl}/login`,
      description: "Sign in to your Docnine account.",
    },
  },
  "/signup": {
    title: "Create a free account",
    description:
      "Create a free Docnine account, connect a repo, and generate your first docs in minutes.",
    pathname: "/signup",
    keywords: [
      ...AUTH_KEYWORDS,
      "free developer documentation",
      "docnine free plan",
    ],
    robots: "index, follow",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Sign up for Docnine",
      url: `${siteUrl}/signup`,
      description:
        "Create a free Docnine account to generate documentation from your codebase.",
    },
  },
  "/pricing": {
    title: "Pricing",
    description:
      "Start free, then upgrade when you need more. Compare Docnine plans for individuals and teams.",
    pathname: "/pricing",
    keywords: [
      ...MARKETING_KEYWORDS,
      "documentation pricing",
      "docnine pricing",
      "docnine free plan",
      "docnine pro",
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Docnine Pricing",
      url: `${siteUrl}/pricing`,
      description: "Pricing and plan comparison for Docnine.",
    },
  },
  "/docs": {
    title: "Documentation",
    description:
      "Guides for setting up Docnine, GitHub, webhooks, AI workflows, portals, exports, and billing.",
    pathname: "/docs",
    keywords: [
      ...MARKETING_KEYWORDS,
      "docnine docs",
      "docnine setup guide",
      "how to use docnine",
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: "Docnine documentation",
      url: `${siteUrl}/docs`,
      description: "Setup guides and reference docs for Docnine.",
      author: { "@type": "Organization", name: "Docnine", url: siteUrl },
    },
  },
  "/contact": {
    title: "Contact us",
    description:
      "Questions, feedback, or partnership ideas? Reach the Docnine team.",
    pathname: "/contact",
    keywords: ["contact docnine", "docnine support", "docnine enterprise"],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Docnine",
      url: `${siteUrl}/contact`,
    },
  },
  "/terms": {
    title: "Terms of use",
    description: "Terms that govern your use of Docnine.",
    pathname: "/terms",
    keywords: ["docnine terms", "terms and conditions", "docnine legal"],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Docnine Terms of Use",
      url: `${siteUrl}/terms`,
    },
  },
  "/privacy": {
    title: "Privacy policy",
    description:
      "How Docnine collects, uses, and protects your information.",
    pathname: "/privacy",
    keywords: ["docnine privacy", "privacy policy", "data protection", "GDPR"],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Docnine Privacy Policy",
      url: `${siteUrl}/privacy`,
    },
  },
}
