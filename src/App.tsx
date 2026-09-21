import { lazy, Suspense, useEffect, useMemo } from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useSearchParams,
  useLocation,
  matchPath,
} from "react-router-dom"
import { useAuthStore } from "@/store/auth"
import { useSessionStore } from "@/store/session"
import { useTokenRefresh } from "@/hooks/useTokenRefresh"
import { ThemeProvider } from "@/providers/theme-provider"
import { useSeo } from "@/lib/seo"
import { SessionExpiredDialog } from "@/components/dialogs/SessionExpiredDialog"
import Loader1 from "./components/ui/loader1"
import { GuestLayout } from "./layout/guest"
import { AuthLayout } from "./layout/auth"
import { ApplicationLogo } from "./components/common"
import { SeoConfig } from "./types/SeoTypes"
import { PUBLIC_PAGES, SYSTEM_PATHS } from "./configs/SeoConfigs"

const LandingPage = lazy(() => import("@/pages/guest/home").then(m => ({ default: m.HomePage })))
const LoginPage = lazy(() => import("@/pages/auth/login").then(m => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import("@/pages/auth/signup").then(m => ({ default: m.SignupPage })))
const VerifyPage = lazy(() => import("@/pages/auth/verify").then(m => ({ default: m.VerifyPage })))
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password").then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password").then(m => ({ default: m.ResetPasswordPage })))
const AuthCallbackPage = lazy(() => import("@/pages/auth/callback").then(m => ({ default: m.AuthCallbackPage })))
const CliAuthPage = lazy(() => import("@/pages/auth/cli-auth").then(m => ({ default: m.CliAuthPage })))
const AcceptInvitePage = lazy(() => import("@/pages/auth/accept-invite").then(m => ({ default: m.AcceptInvitePage })))
const GithubOAuthPage = lazy(() => import("@/pages/auth/github-oauth").then(m => ({ default: m.GithubOAuthPage })))
const GitlabOAuthPage = lazy(() => import("@/pages/auth/gitlab-oauth").then(m => ({ default: m.GitlabOAuthPage })))
const BitbucketOAuthPage = lazy(() => import("@/pages/auth/bitbucket-oauth").then(m => ({ default: m.BitbucketOAuthPage })))
const AzureOAuthPage = lazy(() => import("@/pages/auth/azure-oauth").then(m => ({ default: m.AzureOAuthPage })))
const GithubOAuthCompletePage = lazy(() => import("@/pages/auth/oauth-complete").then(m => ({ default: m.GithubOAuthCompletePage })))
const GitlabOAuthCompletePage = lazy(() => import("@/pages/auth/oauth-complete").then(m => ({ default: m.GitlabOAuthCompletePage })))
const BitbucketOAuthCompletePage = lazy(() => import("@/pages/auth/oauth-complete").then(m => ({ default: m.BitbucketOAuthCompletePage })))
const AzureOAuthCompletePage = lazy(() => import("@/pages/auth/oauth-complete").then(m => ({ default: m.AzureOAuthCompletePage })))

const DashboardLayout = lazy(() => import("@/layout/dashboard").then(m => ({ default: m.DashboardLayout })))
const DashboardHomePage = lazy(() => import("@/pages/dashboard/home").then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import("@/pages/dashboard/dashboard").then(m => ({ default: m.DashboardPage })))
const ProjectOverviewPage = lazy(() => import("@/pages/projects/overview").then(m => ({ default: m.ProjectOverviewPage })))
const LiveAnalysisPage = lazy(() => import("@/pages/projects/live-analysis").then(m => ({ default: m.LiveAnalysisPage })))
const DocumentationViewerPage = lazy(() => import("@/pages/projects/documentation").then(m => ({ default: m.DocumentationViewerPage })))
const ProjectSettingsPage = lazy(() => import("@/pages/projects/settings").then(m => ({ default: m.ProjectSettingsPage })))
const DocumentationsPage = lazy(() => import("@/pages/dashboard/documentations").then(m => ({ default: m.DocumentationsPage })))
const LogsPage = lazy(() => import("@/pages/dashboard/logs").then(m => ({ default: m.LogsPage })))
const ProfilePage = lazy(() => import("@/pages/profile/profile").then(m => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() => import("@/pages/settings/settings").then(m => ({ default: m.SettingsPage })))
const PricingPage = lazy(() => import("@/pages/guest/pricing").then(m => ({ default: m.PricingPage })))
const PlatformDocsPage = lazy(() => import("@/pages/guest/docs").then(m => ({ default: m.PlatformDocsPage })))
const PublicPortalPage = lazy(() => import("@/pages/docs/public-portal").then(m => ({ default: m.PublicPortalPage })))
const SuperAdminPage = lazy(() => import("@/pages/admin/super-admin").then(m => ({ default: m.SuperAdminPage })))
const TermsPage = lazy(() => import("@/pages/guest/terms").then(m => ({ default: m.TermsPage })))
const PrivacyPage = lazy(() => import("@/pages/guest/privacy").then(m => ({ default: m.PrivacyPage })))
const ContactPage = lazy(() => import("@/pages/guest/contact").then(m => ({ default: m.ContactPage })))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center gap-3 justify-center bg-background">
      <ApplicationLogo className="h-18" />
      <Loader1 size="md" className="text-muted-foreground" />
    </div>
  )
}

function BillingRedirect() {
  const [searchParams] = useSearchParams()
  const forward = new URLSearchParams(searchParams)
  forward.set("tab", "billing")
  return <Navigate to={`/settings?${forward.toString()}`} replace />
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (isAuthenticated) return <>{children}</>
  const redirect = `${location.pathname}${location.search}`
  const to = redirect && redirect !== "/" ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login"
  return <Navigate to={to} replace />
}

function LandingOnlyRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/home" replace /> : <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  return user?.role === "super-admin"
    ? <>{children}</>
    : <Navigate to="/home" replace />
}

function getRouteSeo(pathname: string): SeoConfig | null {
  if (matchPath("/docs/:slug", pathname)) return null

  if (
    pathname === "/home" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/documentations") ||
    pathname.startsWith("/logs") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/admin")
  ) {
    return {
      title: "Workspace",
      description: "Docnine workspace: manage your projects and documentation.",
      pathname,
      robots: "noindex, nofollow",
      keywords: [],
    }
  }

  if (
    SYSTEM_PATHS.includes(pathname) ||
    matchPath("/share/accept/:token", pathname)
  ) {
    return {
      title: "Account Access",
      description: "Secure authentication and account access for Docnine.",
      pathname,
      robots: "noindex, nofollow",
      keywords: [],
    }
  }

  return PUBLIC_PAGES[pathname] ?? null
}

function RouteSeoManager() {
  const { pathname } = useLocation()
  const seo = useMemo(() => getRouteSeo(pathname), [pathname])
  useSeo(seo)
  return null
}

function ScrollRestoration() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [pathname])
  return null
}

function AppRoutes() {
  const { initAuth, initialized } = useAuthStore()
  const { sessionExpiredOpen, hideSessionExpired } = useSessionStore()

  useTokenRefresh()

  useEffect(() => {
    const oauthPaths = [
      "/auth/callback",
      "/auth/github", "/auth/gitlab", "/auth/bitbucket", "/auth/azure",
      "/github/oauth/complete", "/gitlab/oauth/complete", "/bitbucket/oauth/complete", "/azure/oauth/complete"
    ]

    if (oauthPaths.includes(window.location.pathname)) {
      useAuthStore.setState({ initialized: true })
      return
    }

    initAuth()
  }, [initAuth])

  if (!initialized) return <PageLoader />

  return (
    <>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<GuestLayout />}>
            <Route path="/" element={<LandingOnlyRoute><LandingPage /></LandingOnlyRoute>} />

            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/docs" element={<PlatformDocsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          <Route path="/docs/:slug" element={<PublicPortalPage />} />

          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/cli-auth" element={<CliAuthPage />} />
          <Route path="/share/accept/:token" element={<AcceptInvitePage />} />

          <Route path="/auth/github" element={<GithubOAuthPage />} />
          <Route path="/auth/gitlab" element={<GitlabOAuthPage />} />
          <Route path="/auth/bitbucket" element={<BitbucketOAuthPage />} />
          <Route path="/auth/azure" element={<AzureOAuthPage />} />

          <Route path="/github/oauth/complete" element={<GithubOAuthCompletePage />} />
          <Route path="/gitlab/oauth/complete" element={<GitlabOAuthCompletePage />} />
          <Route path="/bitbucket/oauth/complete" element={<BitbucketOAuthCompletePage />} />
          <Route path="/azure/oauth/complete" element={<AzureOAuthCompletePage />} />

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="home" element={<DashboardHomePage />} />
            <Route path="dashboard" element={<Navigate to="/home" replace />} />
            <Route path="projects" element={<DashboardPage />} />
            <Route path="projects/:id" element={<ProjectOverviewPage />} />
            <Route path="projects/:id/live" element={<LiveAnalysisPage />} />
            <Route path="projects/:id/docs" element={<DocumentationViewerPage />} />
            <Route path="projects/:id/settings" element={<ProjectSettingsPage />} />
            <Route path="documentations" element={<DocumentationsPage />} />
            <Route path="logs" element={<LogsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="billing" element={<BillingRedirect />} />
            <Route path="admin" element={<AdminRoute><SuperAdminPage /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>

      <SessionExpiredDialog open={sessionExpiredOpen} onOpenChange={hideSessionExpired} />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="docnine-theme">
      <Router>
        <ScrollRestoration />
        <RouteSeoManager />
        <AppRoutes />
      </Router>
    </ThemeProvider>
  )
}
