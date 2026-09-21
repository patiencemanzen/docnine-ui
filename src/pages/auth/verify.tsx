import { useEffect, useState } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { MailCheck, CheckCircle2, XCircle } from "@/components/icons"
import { authApi } from "@/lib/api"
import Loader1 from "@/components/ui/loader1"
import { ApiException } from "@/types/ApiTypes"
import { AuthShell } from "@/components/common/auth-shell"

export function VerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!token) return
    setStatus("loading")
    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error")
        if (err instanceof ApiException) {
          if (err.code === "TOKEN_EXPIRED") {
            setErrorMessage("This verification link has expired. Please request a new one.")
          } else if (err.code === "TOKEN_INVALID") {
            setErrorMessage("This verification link is invalid or has already been used.")
          } else {
            setErrorMessage(err.message)
          }
        } else {
          setErrorMessage("A network error occurred. Please try again.")
        }
      })
  }, [token])

  
  if (token && status === "loading") {
    return (
      <AuthShell>
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <Loader1 className="h-8 w-8 text-primary" />
          <p className="text-[14px] text-muted-foreground">Verifying your email…</p>
        </div>
      </AuthShell>
    )
  }

  
  if (token && status === "success") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">Email verified</h1>
            <p className="text-[14px] text-muted-foreground">
              Your account is ready. Sign in and start documenting your projects.
            </p>
          </div>
          <Button
            className="w-full h-11 rounded-xl text-[14px] font-medium"
            onClick={() => navigate("/login")}
          >
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    )
  }

  
  if (token && status === "error") {
    return (
      <AuthShell>
        <div className="space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">Verification failed</h1>
            <p className="text-[14px] text-muted-foreground">{errorMessage}</p>
          </div>
          <Button variant="outline" className="w-full h-11 rounded-xl text-[14px]" asChild>
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthShell>
    )
  }

  
  return (
    <AuthShell>
      <div className="space-y-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <MailCheck className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-display text-[24px] font-semibold tracking-[0.02em] leading-snug text-foreground">Check your email</h1>
          <p className="text-[14px] text-muted-foreground leading-relaxed">
            We sent a verification link to your email. Open it to activate your account, then you’ll
            be ready to go.
          </p>
        </div>
        <Button variant="outline" className="w-full h-11 rounded-xl text-[14px]" asChild>
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    </AuthShell>
  )
}
