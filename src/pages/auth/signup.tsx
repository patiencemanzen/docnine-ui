import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi, API_BASE } from "@/lib/api"
import Loader1 from "@/components/ui/loader1"
import { ApiException } from "@/types/ApiTypes"
import { AuthShell } from "@/components/common/auth-shell"

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80, "Name must be at most 80 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Terms of Service and Privacy Policy",
  }),
})

type SignupFormValues = z.infer<typeof signupSchema>

function startOAuth(provider: "github" | "google") {
  window.location.href = `${API_BASE}/auth/${provider}/start`
}

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current shrink-0">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

export function SignupPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        agreeToTerms: data.agreeToTerms,
      })
      navigate("/verify")
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.code === "EMAIL_ALREADY_EXISTS" || err.status === 409) {
          setError("An account with this email already exists.")
        } else if (err.code === "VALIDATION_ERROR" && err.fields?.length) {
          setError(err.fields.map((f) => f.message).join(". "))
        } else {
          setError(err.message)
        }
      } else {
        setError("A network error occurred. Try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell>
      <div className="space-y-6">

        <div className="space-y-1.5">
          <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">Create your account</h1>
          <p className="text-[14px] text-muted-foreground">Connect a project and generate your first docs in minutes.</p>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-[13px] text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => startOAuth("github")}
            className="flex w-full items-center justify-center gap-2.5 h-11 rounded-xl border border-border bg-muted/40 px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-muted hover:border-border/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <GitHubIcon />
            Continue with GitHub
          </button>
          <button
            type="button"
            onClick={() => startOAuth("google")}
            className="flex w-full items-center justify-center gap-2.5 h-11 rounded-xl border border-border bg-muted/40 px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-muted hover:border-border/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[12px] text-muted-foreground uppercase tracking-wider">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[13px] font-medium">Full name</Label>
            <Input
              id="name"
              placeholder="Jane Smith"
              className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
              {...register("name")}
            />
            {errors.name && <p className="text-[12px] text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-[13px] font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
              {...register("email")}
            />
            {errors.email && <p className="text-[12px] text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-[13px] font-medium">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              className="h-11 rounded-xl border-border/70 bg-muted/30 text-[14px] focus-visible:ring-1 focus-visible:ring-primary"
              {...register("password")}
            />
            {errors.password && <p className="text-[12px] text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="agreeToTerms"
              className="mt-0.5 h-4 w-4 rounded border border-border cursor-pointer accent-primary shrink-0"
              {...register("agreeToTerms")}
            />
            <div className="space-y-1">
              <label htmlFor="agreeToTerms" className="text-[13px] text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </label>
              {errors.agreeToTerms && (
                <p className="text-[12px] text-destructive">{errors.agreeToTerms.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl text-[14px] font-medium mt-2"
            disabled={isLoading}
          >
            {isLoading && <Loader1 className="mr-2 h-4 w-4" />}
            Create account
          </Button>
        </form>

        <p className="text-center text-[13px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
