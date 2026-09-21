import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Github,
  Webhook,
  FileCode2,
  Sparkles,
  Globe,
  Download,
  CreditCard,
  LifeBuoy,
  ChevronRight,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  Search,
  X,
  Menu,
  ArrowUp,
  Zap,
  Lock,
  Key,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "@/components/icons";
import { Background } from "@/components/landing";
import { cn } from "@/lib/utils";

interface DocSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  subsections?: { id: string; label: string }[];
}

const SECTIONS: DocSection[] = [
  {
    id: "getting-started",
    label: "Getting Started",
    icon: <BookOpen className="h-4 w-4" />,
    subsections: [
      { id: "what-is-docnine", label: "Introduction" },
      { id: "create-account", label: "Create an account" },
      { id: "first-project", label: "Your first project" },
    ],
  },
  {
    id: "github-integration",
    label: "GitHub Integration",
    icon: <Github className="h-4 w-4" />,
    subsections: [
      { id: "connect-repo", label: "Connect a repository" },
      { id: "private-repos", label: "Private repositories" },
      { id: "repo-picker", label: "Using the repo picker" },
    ],
  },
  {
    id: "yaml-openapi",
    label: "YAML / OpenAPI",
    icon: <FileCode2 className="h-4 w-4" />,
    subsections: [
      { id: "what-is-apispec", label: "What is API Spec?" },
      { id: "import-yaml", label: "Import a YAML file" },
      { id: "import-url", label: "Import from URL" },
      { id: "import-raw", label: "Paste raw spec" },
      { id: "sync-spec", label: "Auto-sync on update" },
    ],
  },
  {
    id: "webhooks",
    label: "GitHub Webhooks",
    icon: <Webhook className="h-4 w-4" />,
    subsections: [
      { id: "webhook-overview", label: "Overview" },
      { id: "webhook-setup", label: "Setup guide" },
      { id: "webhook-secret", label: "Securing the webhook" },
      { id: "webhook-events", label: "Supported events" },
    ],
  },
  {
    id: "ai-docs",
    label: "AI & Documentation",
    icon: <Sparkles className="h-4 w-4" />,
    subsections: [
      { id: "ai-pipeline", label: "The AI pipeline" },
      { id: "editing-docs", label: "Editing AI output" },
      { id: "ai-chat", label: "Chat with your codebase" },
      { id: "version-history", label: "Version history" },
    ],
  },
  {
    id: "portals",
    label: "Public Portals",
    icon: <Globe className="h-4 w-4" />,
    subsections: [
      { id: "portal-overview", label: "What is a portal?" },
      { id: "portal-publish", label: "Publishing a portal" },
      { id: "portal-branding", label: "Branding & custom domain" },
      { id: "portal-password", label: "Password protection" },
    ],
  },
  {
    id: "exports",
    label: "Exporting Docs",
    icon: <Download className="h-4 w-4" />,
    subsections: [
      { id: "export-pdf", label: "PDF export" },
      { id: "export-yaml", label: "YAML export" },
      { id: "export-notion", label: "Notion export" },
      { id: "export-google-docs", label: "Google Docs export" },
    ],
  },
  {
    id: "cli",
    label: "Docnine CLI",
    icon: <Terminal className="h-4 w-4" />,
    subsections: [
      { id: "cli-overview", label: "Overview" },
      { id: "cli-install", label: "Installation" },
      { id: "cli-login", label: "Authentication" },
      { id: "cli-init", label: "Project setup" },
      { id: "cli-generate", label: "Generate docs" },
      { id: "cli-ask", label: "Ask your codebase" },
      { id: "cli-audit", label: "Security audit" },
      { id: "cli-diff", label: "Diff & changes" },
      { id: "cli-export", label: "Exporting" },
      { id: "cli-ci", label: "CI/CD integration" },
    ],
  },
  {
    id: "plans",
    label: "Plans & Billing",
    icon: <CreditCard className="h-4 w-4" />,
    subsections: [
      { id: "plan-overview", label: "Plan overview" },
      { id: "upgrade", label: "Upgrading your plan" },
      { id: "limits", label: "Limits & quotas" },
    ],
  },
  {
    id: "support",
    label: "Support",
    icon: <LifeBuoy className="h-4 w-4" />,
    subsections: [
      { id: "faq", label: "FAQ" },
      { id: "contact-support", label: "Contact us" },
    ],
  },
];

function CodeBlock({ code, language = "yaml" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden my-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/50">
        <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-foreground" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({
  type = "info",
  children,
}: {
  type?: "info" | "warning" | "tip";
  children: React.ReactNode;
}) {
  const styles = {
    info: {
      bg: "bg-muted/60 border-border",
      icon: <Info className="h-4 w-4 text-foreground shrink-0 mt-0.5" />,
    },
    warning: {
      bg: "bg-primary/25 border-border",
      icon: <AlertTriangle className="h-4 w-4 text-foreground shrink-0 mt-0.5" />,
    },
    tip: {
      bg: "bg-secondary border-border",
      icon: <CheckCircle2 className="h-4 w-4 text-foreground shrink-0 mt-0.5" />,
    },
  };
  const { bg, icon } = styles[type];
  return (
    <div className={cn("flex gap-3 rounded-xl border p-4 my-4 text-sm text-muted-foreground", bg)}>
      {icon}
      <div>{children}</div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-5 px-5 border-b border-border/50 last:border-0">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-bold mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground mb-1">{title}</p>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="text-2xl font-bold text-foreground mt-12 mb-4 scroll-mt-6 flex items-center gap-2 group"
    >
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground hover:text-foreground"
      >
        #
      </a>
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3
      id={id}
      className="text-lg font-semibold text-foreground mt-8 mb-3 scroll-mt-6 flex items-center gap-2 group"
    >
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-60 transition-opacity text-muted-foreground hover:text-foreground text-sm"
      >
        #
      </a>
    </h3>
  );
}

export function PlatformDocsPage() {
  const [activeSection, setActiveSection] = useState("what-is-docnine");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const allIds = SECTIONS.flatMap((s) => [s.id, ...(s.subsections?.map((sub) => sub.id) ?? [])]);
    const observers: IntersectionObserver[] = [];

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { root, rootMargin: "-20% 0px -65% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const handler = () => setShowBackToTop(root.scrollTop > 400);
    root.addEventListener("scroll", handler);
    return () => root.removeEventListener("scroll", handler);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
    setSidebarOpen(false);
  }

  const filteredSections = searchQuery.trim()
    ? SECTIONS.map((s) => ({
        ...s,
        subsections: s.subsections?.filter(
          (sub) =>
            sub.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.label.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      })).filter(
        (s) =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.subsections?.length ?? 0) > 0,
      )
    : SECTIONS;

  return (
    <Background className="mt-5 flex h-[calc(100svh-1.25rem)] flex-col overflow-hidden">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            Documentation
          </button>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-foreground font-medium truncate">
            {
              SECTIONS.flatMap((s) => [
                { id: s.id, label: s.label },
                ...(s.subsections ?? []),
              ]).find((x) => x.id === activeSection)?.label
            }
          </span>
        </div>

        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <aside
            className={cn(
              "absolute inset-y-0 left-0 z-40 flex h-full w-64 max-w-[85%] flex-col border-r border-border backdrop-blur-md",
              "lg:static lg:z-0 lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0",
              "transition-transform duration-200",
              sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
            )}
          >
            <div className="shrink-0 border-b border-border p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search docs…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-muted/60 pl-9 pr-3 text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-4">
              {filteredSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-semibold text-left transition-colors",
                      activeSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/70",
                    )}
                  >
                    {section.icon}
                    <span className="truncate">{section.label}</span>
                  </button>

                  {section.subsections && (
                    <div className="mt-1 ml-5 space-y-0.5 border-l border-border pl-2.5">
                      {section.subsections.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => scrollTo(sub.id)}
                          className={cn(
                            "w-full text-left px-2 py-1 rounded-md text-xs transition-colors truncate",
                            activeSection === sub.id
                              ? "text-foreground font-semibold bg-muted/80"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>

          {sidebarOpen && (
            <div
              className="absolute inset-0 z-30 bg-foreground/20 backdrop-blur-[2px] lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <main
            ref={mainRef}
            className="min-w-0 flex-1 overflow-y-auto px-5 sm:px-8 lg:px-5 xl:px-5 py-8 lg:py-10"
          >
            <div className="mx-auto w-full max-w-4xl pt-32">
              <div className="mb-12">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-3">
                  Documentation
                </p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                  Docnine Docs
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Everything you need to set up, configure, and get the most out of Docnine,from
                  connecting your first repo to publishing a fully branded documentation portal.
                </p>
              </div>

              {}
              {}
              {}
              <section id="getting-started">
                <H2 id="getting-started">
                  <BookOpen className="h-6 w-6 text-foreground" /> Getting Started
                </H2>

                <H3 id="what-is-docnine">What is Docnine?</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Docnine is an AI-powered documentation platform. It uses a multi-agent pipeline to
                  scan GitHub repositories and generate structured documentation : automatically. It
                  covers your README, internal developer guides, API reference, database schema, and
                  security audit in one unified place.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Once generated, you can edit any section, chat directly with your codebase,
                  publish a public documentation portal, and export to PDF, YAML, Notion, or Google
                  Docs.
                </p>

                <H3 id="create-account">Create an account</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Sign up">
                    Go to{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                    >
                      docnine.app/signup
                    </Link>{" "}
                    and create an account with your email, or continue with GitHub or Google.
                  </Step>
                  <Step n={2} title="Verify your email">
                    Check your inbox for a verification link and click it to activate your account.
                  </Step>
                  <Step n={3} title="Access your dashboard">
                    You'll land on the Projects dashboard : this is where all your projects live.
                  </Step>
                </div>

                <H3 id="first-project">Your first project</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title={'Click "New Project"'}>
                    From the dashboard, click the <strong>New Project</strong> button in the
                    top-right corner.
                  </Step>
                  <Step n={2} title="Paste your GitHub repo URL">
                    Enter any public GitHub repo URL, for example:
                    <br />
                    <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded mt-1 inline-block">
                      https://github.com/owner/my-api
                    </code>
                  </Step>
                  <Step n={3} title="Wait for the AI pipeline">
                    Docnine will clone the repo, analyse the code with AI, and generate all
                    documentation sections. This typically takes 30–120 seconds depending on repo
                    size.
                  </Step>
                  <Step n={4} title="Review and edit">
                    Once ready, you can read, edit, or chat with every section of your
                    documentation.
                  </Step>
                </div>
                <Callout type="info">
                  Free plan accounts can create up to <strong>2 projects</strong>.{" "}
                  <Link
                    to="/pricing"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Upgrade to Starter or higher
                  </Link>{" "}
                  for unlimited projects.
                </Callout>
              </section>

              {}
              {}
              {}
              <section id="github-integration">
                <H2 id="github-integration">
                  <Github className="h-6 w-6 text-foreground" /> GitHub Integration
                </H2>

                <H3 id="connect-repo">Connect a repository</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  You can connect any public repository by pasting the URL directly into the new
                  project form. No additional setup is required for public repos.
                </p>

                <H3 id="private-repos">Private repositories</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  To access private repositories, you must connect your GitHub account via OAuth:
                </p>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Open Settings → GitHub">
                    In your Docnine account, go to{" "}
                    <Link
                      to="/settings"
                      className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                    >
                      Settings
                    </Link>{" "}
                    and find the GitHub section.
                  </Step>
                  <Step n={2} title={'Click "Connect GitHub"'}>
                    You'll be redirected to GitHub to authorise Docnine. Grant access to the
                    repositories you want to use (or all repositories).
                  </Step>
                  <Step n={3} title="Create a project with a private repo URL">
                    Once connected, paste any private repo URL into the new project form and Docnine
                    will fetch it using your authorised token.
                  </Step>
                </div>
                <Callout type="warning">
                  Your GitHub OAuth token is encrypted at rest using AES-256-GCM. We never store
                  your token in plain text.
                </Callout>

                <H3 id="repo-picker">Using the repo picker</H3>
                <p className="text-muted-foreground leading-relaxed">
                  Once your GitHub account is connected, clicking <strong>"Browse repos"</strong> in
                  the new project form opens a repo picker that lists all repositories you have
                  access to : search, filter by org, and click to select.
                </p>
              </section>

              {}
              {}
              {}
              <section id="yaml-openapi">
                <H2 id="yaml-openapi">
                  <FileCode2 className="h-6 w-6 text-foreground" /> YAML / OpenAPI Integration
                </H2>

                <H3 id="what-is-apispec">What is API Spec?</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Docnine can import an <strong>OpenAPI 3.x</strong> or <strong>Swagger 2.x</strong>{" "}
                  specification (JSON or YAML) and display it as a structured, browsable API
                  reference directly inside your project. You get a full endpoint list,
                  request/response schemas, and a built-in "Try it" console.
                </p>

                <H3 id="import-yaml">Import a YAML file</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Open your project">
                    Navigate to a project and click the <strong>API Spec</strong> tab.
                  </Step>
                  <Step n={2} title={'Click "Import"'}>
                    Choose the <strong>Upload file</strong> option.
                  </Step>
                  <Step n={3} title="Select your YAML / JSON file">
                    Upload your{" "}
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                      openapi.yaml
                    </code>{" "}
                    or{" "}
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                      swagger.json
                    </code>{" "}
                    file (max 10 MB).
                  </Step>
                </div>
                <p className="text-muted-foreground text-sm mt-3 leading-relaxed">
                  Example minimal OpenAPI 3.0 spec:
                </p>
                <CodeBlock
                  language="yaml"
                  code={`openapi: "3.0.3"
info:
  title: My API
  version: "1.0.0"
paths:
  /users:
    get:
      summary: List users
      responses:
        "200":
          description: A list of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/User"
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        name:
          type: string`}
                />

                <H3 id="import-url">Import from URL</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If your spec is hosted publicly (e.g. served by your API server), you can point
                  Docnine directly at the URL:
                </p>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title={'Choose "Import from URL"'}>
                    In the API Spec import dialog, select the URL option.
                  </Step>
                  <Step n={2} title="Enter the spec URL">
                    Paste the direct URL to your spec, for example:
                    <code className="block text-sm font-mono bg-muted px-3 py-2 rounded mt-2">
                      https://api.myapp.com/openapi.yaml
                    </code>
                  </Step>
                  <Step n={3} title="Save">
                    Docnine fetches and stores a snapshot. You can re-sync at any time (or set up
                    auto-sync via webhook : see below).
                  </Step>
                </div>

                <H3 id="import-raw">Paste raw spec</H3>
                <p className="text-muted-foreground leading-relaxed">
                  You can also paste the raw YAML or JSON content directly into the text editor in
                  the import modal : no file or URL needed. This is useful for quick testing or when
                  the spec lives in your clipboard.
                </p>

                <H3 id="sync-spec">Auto-sync on update</H3>
                <p className="text-muted-foreground leading-relaxed">
                  For URL-based specs, click <strong>Sync</strong> in the API Spec panel to re-fetch
                  the latest version at any time. For automatic syncing on every deploy, combine
                  this with a GitHub webhook (see next section).
                </p>
                <Callout type="tip">
                  The OpenAPI importer is available on <strong>Pro and Team</strong> plans. On lower
                  plans, you'll see an upgrade prompt when clicking the API Spec tab.
                </Callout>
              </section>

              {}
              {}
              {}
              <section id="webhooks">
                <H2 id="webhooks">
                  <Webhook className="h-6 w-6 text-foreground" /> GitHub Webhooks
                </H2>

                <H3 id="webhook-overview">Overview</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  GitHub webhooks allow Docnine to automatically re-generate your documentation
                  every time you push code to your repository. Once set up, your docs stay in sync
                  with your codebase without any manual intervention.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  When a{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">push</code>{" "}
                  event fires, Docnine runs an incremental sync : only re-generating sections
                  affected by the changed files.
                </p>

                <H3 id="webhook-setup">Setup guide</H3>

                <h4 className="text-lg font-semibold mt-6 mb-3">
                  Option A : Use a real GitHub webhook (recommended)
                </h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Set up an actual webhook in your repo settings pointing to{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    https://api.docnineai.com/webhook/github
                  </code>
                  . GitHub will POST the full push payload with a valid signature computed using
                  your{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    WEBHOOK_SECRET
                  </code>
                  . Your existing handleWebhook code already handles this correctly : no workflow
                  file needed.
                </p>

                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Go to your repository webhook settings">
                    Open your GitHub repo and navigate to:
                    <code className="block text-sm font-mono bg-muted px-3 py-2 rounded mt-2">
                      https://github.com/your-username/your-repo/settings/hooks/new
                    </code>
                  </Step>
                  <Step n={2} title="Fill in the webhook form">
                    <ul className="list-disc list-inside space-y-2 mt-2">
                      <li>
                        <strong>Payload URL:</strong>{" "}
                        <code className="font-mono bg-muted px-1 rounded text-xs">
                          https://api.docnineai.com/webhook/github
                        </code>
                      </li>
                      <li>
                        <strong>Content type:</strong>{" "}
                        <code className="font-mono bg-muted px-1 rounded text-xs">
                          application/json
                        </code>
                      </li>
                      <li>
                        <strong>Secret:</strong> your{" "}
                        <code className="font-mono bg-muted px-1 rounded text-xs">
                          WEBHOOK_SECRET
                        </code>{" "}
                        from Vercel environment variables
                      </li>
                      <li>
                        <strong>Which events?:</strong> Just the push event
                      </li>
                      <li>
                        <strong>Active:</strong> ✅ checked
                      </li>
                    </ul>
                  </Step>
                  <Step n={3} title="Verify your Vercel environment variable">
                    In your Vercel dashboard →{" "}
                    <strong>Project Settings → Environment Variables</strong>, confirm{" "}
                    <code className="font-mono bg-muted px-1 rounded text-xs">WEBHOOK_SECRET</code>{" "}
                    is set to the exact same string you entered in GitHub.
                  </Step>
                  <Step n={4} title="Delete the GitHub Actions workflow file (if present)">
                    Remove{" "}
                    <code className="font-mono bg-muted px-1 rounded text-xs">
                      .github/workflows/document.yml
                    </code>{" "}
                    from your repo : it's now redundant and will cause confusion.
                  </Step>
                  <Step n={5} title="Test the connection">
                    After saving, GitHub will send a ping event. You'll see a green checkmark at{" "}
                    <code className="font-mono bg-muted px-1 rounded text-xs">
                      https://github.com/your-username/your-repo/settings/hooks
                    </code>{" "}
                    if the connection is working. On your next push to main, the full documentation
                    sync will trigger automatically.
                  </Step>
                </div>

                <Callout type="info">
                  This is the <strong>recommended approach</strong> because GitHub handles the
                  signature and payload delivery : your server receives verified, complete push
                  event data.
                </Callout>

                <h4 className="text-lg font-semibold mt-8 mb-3">
                  Option B : Use GitHub Actions workflow
                </h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  If you prefer, you can use a GitHub Actions workflow file that triggers on every
                  push and calls the Docnine API. This approach works but requires maintaining a
                  workflow file and doesn't provide signature verification.
                </p>
                <Callout type="tip">
                  We recommend <strong>Option A</strong> over this approach, as it's simpler to set
                  up and more secure.
                </Callout>

                <H3 id="webhook-secret">Securing the webhook</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Every incoming webhook payload is validated using an HMAC-SHA256 signature.
                  Docnine will reject any request that doesn't carry a matching{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    X-Hub-Signature-256
                  </code>{" "}
                  header.
                </p>
                <Callout type="warning">
                  Never share your <code className="font-mono">WEBHOOK_SECRET</code>. If it is ever
                  exposed, rotate it immediately in Docnine Settings and update the GitHub webhook
                  configuration to match.
                </Callout>
                <p className="text-muted-foreground leading-relaxed">
                  On your server, the secret is set via the{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    WEBHOOK_SECRET
                  </code>{" "}
                  environment variable:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# .env
WEBHOOK_SECRET=some_long_random_secret_here

# Generate a strong secret with:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`}
                />

                <H3 id="webhook-events">Supported events</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden divide-y divide-border">
                  {[
                    {
                      event: "push",
                      description:
                        "Triggers an incremental documentation sync for the affected branch.",
                    },
                    {
                      event: "ping",
                      description:
                        "Sent by GitHub when the webhook is first created. Docnine acknowledges it with a 200 OK.",
                    },
                  ].map(({ event, description }) => (
                    <div key={event} className="flex items-start gap-4 px-4 py-3">
                      <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0 text-foreground font-medium">
                        {event}
                      </code>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
                <Callout type="info">
                  At this time only <strong>push</strong> events are processed. Pull request events
                  are planned for a future release.
                </Callout>
              </section>

              {}
              {}
              {}
              <section id="ai-docs">
                <H2 id="ai-docs">
                  <Sparkles className="h-6 w-6 text-foreground" /> AI & Documentation
                </H2>

                <H3 id="ai-pipeline">The AI pipeline</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When you create a project (or trigger a sync), Docnine runs a multi-stage
                  pipeline:
                </p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  {[
                    {
                      icon: <Github className="h-4 w-4" />,
                      label: "Repo scanner",
                      desc: "Fetches file tree & content from GitHub (respects .gitignore).",
                    },
                    {
                      icon: <FileCode2 className="h-4 w-4" />,
                      label: "Schema analyser",
                      desc: "Detects database models and generates schema documentation.",
                    },
                    {
                      icon: <Terminal className="h-4 w-4" />,
                      label: "API extractor",
                      desc: "Identifies REST/GraphQL endpoints in the codebase.",
                    },
                    {
                      icon: <Lock className="h-4 w-4" />,
                      label: "Security auditor",
                      desc: "Flags common vulnerabilities and insecure patterns.",
                    },
                    {
                      icon: <Sparkles className="h-4 w-4" />,
                      label: "Doc writer",
                      desc: "AI writes README, internal docs, API reference, schema docs & security report.",
                    },
                  ].map(({ icon, label, desc }) => (
                    <div key={label} className="flex items-start gap-3 px-4 py-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground mt-0.5">
                        {icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <H3 id="editing-docs">Editing AI output</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Every generated section has a built-in editor. Click <strong>Edit</strong> on any
                  documentation section to switch to editing mode. Your changes are saved separately
                  from the AI output so you can always revert to the original AI version.
                </p>
                <Callout type="tip">
                  After a sync that changes the AI output for a section you've edited, Docnine will
                  mark that section as <strong>stale</strong> and let you choose whether to keep
                  your version, accept the new AI version, or merge them.
                </Callout>

                <H3 id="ai-chat">Chat with your codebase</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The <strong>Ask AI</strong> chat panel (available on Pro & Team plans) lets you
                  ask questions about your codebase in natural language. The AI has context from all
                  generated documentation sections.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Example questions you can ask:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 my-4 ml-2">
                  <li>"How does authentication work in this repo?"</li>
                  <li>"What endpoints does this API expose?"</li>
                  <li>"Are there any security issues I should fix first?"</li>
                  <li>"Explain the database schema for the User model."</li>
                </ul>

                <H3 id="version-history">Version history</H3>
                <p className="text-muted-foreground leading-relaxed">
                  Every time a section is updated (by AI sync or manual edit), Docnine saves a
                  snapshot. Open the history panel for any section to browse previous versions and
                  restore any of them. Version history is available on{" "}
                  <strong>Starter and above</strong> (30-day window) and <strong>Pro/Team</strong>{" "}
                  (full history).
                </p>
              </section>

              {}
              {}
              {}
              <section id="portals">
                <H2 id="portals">
                  <Globe className="h-6 w-6 text-foreground" /> Public Portals
                </H2>

                <H3 id="portal-overview">What is a portal?</H3>
                <p className="text-muted-foreground leading-relaxed">
                  A <strong>portal</strong> is a publicly accessible documentation website generated
                  from your project. It gets its own URL (
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    docnine.app/docs/your-portal
                  </code>
                  ) and can be shared with customers, contributors, or anyone else : no Docnine
                  account needed.
                </p>
                <Callout type="info">
                  Portals require at minimum a <strong>Starter</strong> plan. Free plan users cannot
                  publish portals.
                </Callout>

                <H3 id="portal-publish">Publishing a portal</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Open your project → Portal tab">
                    Navigate to your project and click the <strong>Portal</strong> button.
                  </Step>
                  <Step n={2} title="Configure sections">
                    Choose which documentation sections to include and set their visibility (Public,
                    Internal, or Coming Soon).
                  </Step>
                  <Step n={3} title="Click Publish">
                    Toggle the <strong>Publish</strong> switch to make your portal live. You'll get
                    a shareable URL immediately.
                  </Step>
                </div>

                <H3 id="portal-branding">Branding & custom domain</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Under the <strong>Branding</strong> tab in portal settings you can:
                </p>
                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-2 mb-4">
                  <li>Upload a logo and favicon</li>
                  <li>Set a primary colour, background colour, and accent colour</li>
                  <li>Add a header tagline and footer text/links</li>
                  <li>Configure SEO title and meta description</li>
                  <li>Set a custom domain (Pro & Team : DNS managed externally)</li>
                </ul>

                <H3 id="portal-password">Password protection</H3>
                <p className="text-muted-foreground leading-relaxed">
                  Set a portal password in <strong>General → Access</strong> to require visitors to
                  enter a password before viewing any content. The password is hashed server-side
                  and never stored in plain text.
                </p>
              </section>

              {}
              {}
              {}
              <section id="exports">
                <H2 id="exports">
                  <Download className="h-6 w-6 text-foreground" /> Exporting Docs
                </H2>

                <div className="grid sm:grid-cols-2 gap-4 my-6">
                  {[
                    {
                      id: "export-pdf",
                      icon: <Download className="h-5 w-5" />,
                      title: "PDF",
                      plan: "Starter+",
                      desc: "Exports all documentation sections into a single formatted PDF.",
                    },
                    {
                      id: "export-yaml",
                      icon: <FileCode2 className="h-5 w-5" />,
                      title: "YAML",
                      plan: "Team",
                      desc: "Exports your API spec (OpenAPI 3.0) as a YAML file.",
                    },
                    {
                      id: "export-notion",
                      icon: <Zap className="h-5 w-5" />,
                      title: "Notion",
                      plan: "Team",
                      desc: "Pushes all doc sections to a Notion database page via the Notion API.",
                    },
                    {
                      id: "export-google-docs",
                      icon: <ExternalLink className="h-5 w-5" />,
                      title: "Google Docs",
                      plan: "Pro+",
                      desc: "Creates a Google Doc in your Drive with all documentation content.",
                    },
                  ].map(({ id, icon, title, plan, desc }) => (
                    <div
                      key={id}
                      id={id}
                      className="scroll-mt-24 rounded-xl border border-border p-5 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground">
                          {icon}
                        </div>
                        <p className="font-semibold text-foreground">{title}</p>
                        <span className="ml-auto text-[10px] font-medium text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                          {plan}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>

                <Callout type="info">
                  Export buttons appear in the project overview page toolbar. If your plan doesn't
                  include a specific format, clicking it will show an upgrade prompt.
                </Callout>

                <H3 id="export-notion">Notion export : setup</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Create a Notion integration">
                    Go to{" "}
                    <a
                      href="https://notion.so/my-integrations"
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-foreground underline underline-offset-2 hover:opacity-70 inline-flex items-center gap-1"
                    >
                      notion.so/my-integrations <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    and create a new integration. Copy the{" "}
                    <strong>Internal Integration Token</strong>.
                  </Step>
                  <Step n={2} title="Share a page with the integration">
                    In Notion, open the page you want docs exported to → <strong>Share</strong> →
                    invite your integration.
                  </Step>
                  <Step n={3} title="Add keys to your Docnine server env">
                    <CodeBlock
                      language="bash"
                      code={`NOTION_API_KEY=ntn_your_integration_token
NOTION_PARENT_PAGE_ID=your_page_id_here`}
                    />
                  </Step>
                  <Step n={4} title="Export from your project">
                    Click <strong>Export → Notion</strong> in the project overview.
                  </Step>
                </div>
              </section>

              {}
              {}
              {}
              <section id="cli">
                <H2 id="cli">
                  <Terminal className="h-6 w-6 text-foreground" /> Docnine CLI
                </H2>

                <H3 id="cli-overview">Overview</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The <strong>Docnine CLI</strong> brings all of Docnine's documentation generation,
                  security auditing, and AI features straight to your terminal. You can scan local
                  repositories, generate documentation, ask questions about your codebase, and
                  integrate everything into CI/CD pipelines : without leaving the command line.
                </p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden my-4">
                  {[
                    {
                      cmd: "login / logout",
                      desc: "Authenticate with your Docnine account via browser-based OAuth.",
                    },
                    {
                      cmd: "init",
                      desc: "Initialize a project by selecting a source (GitHub, GitLab, Bitbucket, Azure DevOps, or ZIP upload).",
                    },
                    {
                      cmd: "generate",
                      desc: "Run the full AI documentation pipeline on your project.",
                    },
                    { cmd: "ask", desc: "Ask natural-language questions about your codebase." },
                    { cmd: "audit", desc: "Run a security audit and get a vulnerability report." },
                    {
                      cmd: "diff",
                      desc: "Detect what changed since the last generation and show a summary.",
                    },
                    {
                      cmd: "export",
                      desc: "Export documentation as OpenAPI YAML, Postman collection, or Markdown.",
                    },
                    {
                      cmd: "ci",
                      desc: "Run generate + diff in one step, designed for CI/CD pipelines.",
                    },
                  ].map(({ cmd, desc }) => (
                    <div key={cmd} className="flex items-start gap-4 px-4 py-3">
                      <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0 text-foreground font-medium">
                        {cmd}
                      </code>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>

                <H3 id="cli-install">Installation</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Install the CLI globally via npm:
                </p>
                <CodeBlock language="bash" code="npm install -g @docnineai/cli" />
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Verify the installation:
                </p>
                <CodeBlock language="bash" code="docnine --version" />
                <Callout type="info">
                  Requires <strong>Node.js 18+</strong>. The CLI is published as an ESM package.
                </Callout>

                <H3 id="cli-login">Authentication</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The CLI uses browser-based authentication. Running{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    docnine login
                  </code>{" "}
                  opens your browser to sign in, then stores a session token locally.
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Interactive login (opens browser)
docnine login

# Check who you're logged in as
docnine whoami

# Log out and remove stored credentials
docnine logout`}
                />
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Credentials are stored in{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    ~/.docnine/config.json
                  </code>
                  . For CI/CD environments, use an <strong>API token</strong> instead:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Use a token for non-interactive environments
docnine generate --token YOUR_API_TOKEN

# Or set the environment variable
export DOCNINE_API_TOKEN=YOUR_API_TOKEN
docnine generate`}
                />
                <Callout type="tip">
                  Generate API tokens from{" "}
                  <Link
                    to="/settings"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Settings → API Tokens
                  </Link>{" "}
                  in the Docnine dashboard.
                </Callout>

                <H3 id="cli-init">Project setup</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">init</code>{" "}
                  command creates a new Docnine project by walking you through an interactive
                  wizard:
                </p>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden">
                  <Step n={1} title="Run docnine init">
                    <CodeBlock language="bash" code="docnine init" />
                  </Step>
                  <Step n={2} title="Choose a source type">
                    Select one of: <strong>GitHub</strong>, <strong>GitLab</strong>,{" "}
                    <strong>Bitbucket</strong>, <strong>Azure DevOps</strong>, or{" "}
                    <strong>Upload ZIP</strong>.
                  </Step>
                  <Step n={3} title="Enter repository details">
                    Provide the repo URL (or select from a list). For ZIP uploads, the CLI bundles
                    your local directory and uploads it.
                  </Step>
                  <Step n={4} title="Project created">
                    Once created, a{" "}
                    <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                      .docnine.json
                    </code>{" "}
                    config file is saved in your project root with the project ID.
                  </Step>
                </div>
                <Callout type="info">
                  The{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">
                    .docnine.json
                  </code>{" "}
                  file stores your project ID and API URL. Commit it to your repo so the CLI can
                  find your project automatically.
                </Callout>

                <H3 id="cli-generate">Generate docs</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Run the full AI documentation pipeline on your project:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Generate documentation for the project in current directory
docnine generate

# Specify a project ID explicitly
docnine generate --project <project-id>

# Watch mode : re-generate when files change
docnine generate --watch`}
                />
                <p className="text-muted-foreground leading-relaxed">
                  The CLI shows a real-time progress spinner for each pipeline stage (scanning,
                  schema analysis, API extraction, security audit, doc writing). Once complete, your
                  documentation is available in the Docnine dashboard.
                </p>

                <H3 id="cli-ask">Ask your codebase</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Ask natural-language questions about your codebase using the generated
                  documentation as context:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Ask a one-off question
docnine ask "How does authentication work in this project?"

# Interactive REPL mode : keep asking questions
docnine ask --interactive

# Specify a project explicitly
docnine ask --project <project-id> "What endpoints are exposed?"`}
                />
                <p className="text-muted-foreground leading-relaxed">
                  In interactive mode, type your questions one at a time and type{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">exit</code> or
                  press{" "}
                  <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">Ctrl+C</code>{" "}
                  to quit.
                </p>

                <H3 id="cli-audit">Security audit</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Run a security audit on your project to detect common vulnerabilities:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Run a security audit
docnine audit

# Output results in SARIF format (for GitHub Code Scanning)
docnine audit --format sarif --output results.sarif

# Fail the process if critical or high severity issues are found
docnine audit --fail-on high`}
                />
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The audit scans for issues like hardcoded secrets, missing authentication, SQL
                  injection risks, insecure dependencies, and more.
                </p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden my-4">
                  {[
                    { flag: "--format", desc: "Output format: table (default), json, or sarif." },
                    { flag: "--output <file>", desc: "Write results to a file instead of stdout." },
                    {
                      flag: "--fail-on <level>",
                      desc: "Exit with code 1 if issues at or above this severity are found (critical, high, medium, low).",
                    },
                  ].map(({ flag, desc }) => (
                    <div key={flag} className="flex items-start gap-4 px-4 py-3">
                      <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0 text-foreground font-medium">
                        {flag}
                      </code>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
                <Callout type="tip">
                  Combine <code className="font-mono">--format sarif</code> with GitHub Actions to
                  upload results to the <strong>Security</strong> tab automatically.
                </Callout>

                <H3 id="cli-diff">Diff & changes</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Detect what changed in your codebase since the last documentation generation:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Show a diff summary
docnine diff

# Show changes since a specific date
docnine diff --since 2024-01-15

# Choose a diff strategy
docnine diff --strategy snapshot   # compare local files against last snapshot
docnine diff --strategy server     # compare against server-stored version`}
                />
                <p className="text-muted-foreground leading-relaxed">
                  The diff output shows which files were added, modified, or deleted, and which
                  documentation sections may need updating.
                </p>

                <H3 id="cli-export">Exporting</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Export your generated documentation to portable formats:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Export as OpenAPI YAML
docnine export --format openapi

# Export as Postman collection
docnine export --format postman

# Export as Markdown files
docnine export --format markdown

# Specify an output directory
docnine export --format markdown --output ./docs`}
                />
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden my-4">
                  {[
                    { fmt: "openapi", desc: "OpenAPI 3.0 YAML specification file." },
                    { fmt: "postman", desc: "Postman collection JSON for API testing." },
                    {
                      fmt: "markdown",
                      desc: "Separate Markdown files for each documentation section (README, API, COMPONENTS, SCHEMA, SECURITY, INTERNAL).",
                    },
                  ].map(({ fmt, desc }) => (
                    <div key={fmt} className="flex items-start gap-4 px-4 py-3">
                      <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0 text-foreground font-medium">
                        {fmt}
                      </code>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>

                <H3 id="cli-ci">CI/CD integration</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  The <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-sm">ci</code>{" "}
                  command is designed for automated pipelines. It runs{" "}
                  <strong>generate + diff</strong> in a single step and can post results as a PR
                  comment:
                </p>
                <CodeBlock
                  language="bash"
                  code={`# Run in CI mode
docnine ci --token $DOCNINE_API_TOKEN`}
                />
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Here's a complete GitHub Actions workflow example:
                </p>
                <CodeBlock
                  language="yaml"
                  code={`name: Docnine Documentation
on:
  pull_request:
    branches: [main]

jobs:
  docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - run: npm install -g @docnineai/cli

      - name: Generate & diff docs
        env:
          DOCNINE_API_TOKEN: \${{ secrets.DOCNINE_API_TOKEN }}
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: docnine ci --token $DOCNINE_API_TOKEN`}
                />
                <Callout type="info">
                  Set <code className="font-mono">GITHUB_TOKEN</code> to allow the CLI to post a
                  diff summary as a comment on your pull request automatically.
                </Callout>

                <p className="text-muted-foreground leading-relaxed mt-4">
                  Environment variables reference:
                </p>
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden my-4">
                  {[
                    {
                      env: "DOCNINE_API_TOKEN",
                      desc: "API token for authentication (required in CI).",
                    },
                    {
                      env: "DOCNINE_API_URL",
                      desc: "Custom API URL if self-hosting (defaults to https://api.docnineai.com).",
                    },
                    {
                      env: "GITHUB_TOKEN",
                      desc: "GitHub token for posting PR comments (provided automatically in GitHub Actions).",
                    },
                  ].map(({ env, desc }) => (
                    <div key={env} className="flex items-start gap-4 px-4 py-3">
                      <code className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0 text-foreground font-medium">
                        {env}
                      </code>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {}
              {}
              {}
              <section id="plans">
                <H2 id="plans">
                  <CreditCard className="h-6 w-6 text-foreground" /> Plans & Billing
                </H2>

                <H3 id="plan-overview">Plan overview</H3>
                <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden divide-y divide-border my-4">
                  {[
                    {
                      plan: "Free",
                      price: "$0",
                      projects: "2",
                      portals: "0",
                      features: "Basic doc generation, view-only sharing",
                    },
                    {
                      plan: "Starter",
                      price: "$15/mo",
                      projects: "Unlimited",
                      portals: "1",
                      features: "PDF export, version history (30d), sharing",
                    },
                    {
                      plan: "Pro",
                      price: "$38/mo",
                      projects: "Unlimited",
                      portals: "Unlimited",
                      features:
                        "AI chat, Google Docs, OpenAPI importer, full history, custom domain",
                    },
                    {
                      plan: "Team",
                      price: "$24/seat/mo",
                      projects: "Unlimited",
                      portals: "Unlimited",
                      features:
                        "Everything in Pro + YAML & Notion export, unlimited seats, doc approval",
                    },
                  ].map(({ plan, price, projects, portals, features }) => (
                    <div
                      key={plan}
                      className="grid grid-cols-[120px_1fr] gap-x-4 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-semibold text-foreground">{plan}</p>
                        <p className="text-xs text-foreground/70 font-medium">{price}</p>
                      </div>
                      <div className="text-muted-foreground">
                        <span className="inline-flex gap-4 flex-wrap">
                          <span>
                            <strong className="text-foreground">{projects}</strong> projects
                          </span>
                          <span>
                            <strong className="text-foreground">{portals}</strong> portals
                          </span>
                        </span>
                        <p className="text-xs mt-0.5">{features}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <H3 id="upgrade">Upgrading your plan</H3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Go to{" "}
                  <Link
                    to="/settings"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Settings → Billing
                  </Link>{" "}
                  or visit the{" "}
                  <Link
                    to="/pricing"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Pricing page
                  </Link>{" "}
                  and click <strong>Start free trial</strong> on any paid plan. All paid plans
                  include a <strong>7-day free trial</strong> : no credit card required to start.
                </p>

                <H3 id="limits">Limits & quotas</H3>
                <div className="overflow-x-auto rounded-xl">
                  <div className="min-w-[400px]">
                    <div className="rounded-xl border border-border bg-background/80 backdrop-blur-md overflow-hidden divide-y divide-border">
                      {[
                        {
                          limit: "Projects",
                          free: "2",
                          starter: "Unlimited",
                          pro: "Unlimited",
                          team: "Unlimited",
                        },
                        {
                          limit: "Portals",
                          free: "0",
                          starter: "1",
                          pro: "Unlimited",
                          team: "Unlimited",
                        },
                        {
                          limit: "AI chats/mo",
                          free: "0",
                          starter: "0",
                          pro: "50",
                          team: "Unlimited",
                        },
                        {
                          limit: "File size",
                          free: "5 MB",
                          starter: "20 MB",
                          pro: "50 MB",
                          team: "100 MB",
                        },
                        {
                          limit: "Attachments",
                          free: "3/project",
                          starter: "Unlimited",
                          pro: "Unlimited",
                          team: "Unlimited",
                        },
                        {
                          limit: "Version history",
                          free: "None",
                          starter: "30 days",
                          pro: "Full",
                          team: "Full",
                        },
                      ].map(({ limit, free, starter, pro, team }) => (
                        <div key={limit} className="grid grid-cols-5 px-4 py-2.5 text-xs">
                          <div className="font-medium text-foreground">{limit}</div>
                          <div className="text-muted-foreground">{free}</div>
                          <div className="text-muted-foreground">{starter}</div>
                          <div className="text-muted-foreground">{pro}</div>
                          <div className="text-muted-foreground">{team}</div>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground border border-border border-t-0 rounded-b-xl bg-muted/40">
                      <div />
                      <div>Free</div>
                      <div>Starter</div>
                      <div>Pro</div>
                      <div>Team</div>
                    </div>
                  </div>
                </div>
              </section>

              {}
              {}
              {}
              <section id="support">
                <H2 id="support">
                  <LifeBuoy className="h-6 w-6 text-foreground" /> Support
                </H2>

                <H3 id="faq">FAQ</H3>
                <div className="space-y-4 my-4">
                  {[
                    {
                      q: "Why is my documentation generation taking a long time?",
                      a: "Generation time depends on the size of the repository. Large monorepos with hundreds of files may take up to a few minutes. The Live Analysis page shows real-time progress for each pipeline stage.",
                    },
                    {
                      q: "Can I use Docnine with a monorepo?",
                      a: "Yes. Docnine scans the entire repository tree. You can limit scan scope via the MAX_FILES_PER_REPO and MAX_FILE_SIZE_KB environment variables on your self-hosted instance.",
                    },
                    {
                      q: "My push webhook fired but docs didn't update. What happened?",
                      a: "Check that the WEBHOOK_SECRET in your Docnine env matches the secret configured in GitHub. Also verify that the webhook is sending to the correct URL and that the server is reachable. Check the logs in Docnine → Logs for webhook event entries.",
                    },
                    {
                      q: "Can I self-host Docnine?",
                      a: "The Docnine server is open source. You can run it on your own infrastructure by setting the environment variables in .env and pointing the frontend VITE_API_URL at your server. See the README for deployment instructions.",
                    },
                    {
                      q: "How do I delete my account?",
                      a: 'Go to Settings → Account and click "Delete account". All your projects, documentation, and personal data will be permanently removed.',
                    },
                  ].map(({ q, a }, i) => (
                    <details
                      key={i}
                      className="group rounded-xl border border-border bg-background/80 backdrop-blur-md px-4"
                    >
                      <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer text-sm font-medium text-foreground select-none list-none">
                        {q}
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-90" />
                      </summary>
                      <p className="text-sm text-muted-foreground pb-4 leading-relaxed">{a}</p>
                    </details>
                  ))}
                </div>

                <H3 id="contact-support">Contact us</H3>
                <div className="grid sm:grid-cols-2 gap-4 my-4">
                  <a
                    href="mailto:docnineai@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/80 backdrop-blur-md p-4 hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground shrink-0">
                      <LifeBuoy className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:opacity-80 transition-opacity">
                        Email support
                      </p>
                      <p className="text-xs text-muted-foreground">docnineai@gmail.com</p>
                    </div>
                  </a>
                  <a
                    href="https://github.com/docnineai"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-border bg-background/80 backdrop-blur-md p-4 hover:bg-muted/70 transition-colors group"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-foreground shrink-0">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground group-hover:opacity-80 transition-opacity">
                        GitHub Issues
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bug reports & feature requests
                      </p>
                    </div>
                  </a>
                </div>
                <Callout type="tip">
                  You can also reach us via the{" "}
                  <Link
                    to="/contact"
                    className="font-medium text-foreground underline underline-offset-2 hover:opacity-70"
                  >
                    Contact page
                  </Link>
                  . We typically respond within 1–2 business days.
                </Callout>

                <div className="mt-16 pt-8 border-t border-border text-xs text-muted-foreground flex flex-wrap gap-x-6 gap-y-2">
                  <span>Last updated: March 2025</span>
                  <Link to="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                  <Link to="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                  <Link to="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {showBackToTop && (
        <button
          onClick={() => mainRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute bottom-6 right-6 z-20 rounded-full border border-border bg-background/90 backdrop-blur-md p-2.5 shadow-lg hover:bg-muted transition-colors"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </Background>
  );
}
