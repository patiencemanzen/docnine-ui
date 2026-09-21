import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import Loader1 from "@/components/ui/loader1"

type OAuthProvider = "github" | "gitlab" | "bitbucket" | "azure"

function completeProviderOAuthPopup(provider: OAuthProvider, searchParams: URLSearchParams) {
  const status = searchParams.get(provider)
  const user = searchParams.get("user")
  const msg = searchParams.get("msg")
  const payload = { status, user, msg, ts: Date.now() }

  try {
    localStorage.setItem(`__docnine_${provider}_oauth_result`, JSON.stringify(payload))
  } catch {}

  if (window.opener && !window.opener.closed) {
    try {
      window.opener.postMessage(
        { type: `${provider}-oauth-complete`, status, user, msg },
        window.location.origin,
      )
    } catch {}
  }

  if (window.opener) window.close()
}

function OAuthCompletePage({
  provider,
  label,
}: {
  provider: OAuthProvider
  label: string
}) {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    completeProviderOAuthPopup(provider, searchParams)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader1 className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground">Completing {label} connection…</p>
      </div>
    </div>
  )
}

export function GithubOAuthCompletePage() {
  return <OAuthCompletePage provider="github" label="GitHub" />
}

export function GitlabOAuthCompletePage() {
  return <OAuthCompletePage provider="gitlab" label="GitLab" />
}

export function BitbucketOAuthCompletePage() {
  return <OAuthCompletePage provider="bitbucket" label="Bitbucket" />
}

export function AzureOAuthCompletePage() {
  return <OAuthCompletePage provider="azure" label="Azure DevOps" />
}
