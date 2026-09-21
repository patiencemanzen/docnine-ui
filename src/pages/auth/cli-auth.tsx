import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_BASE, authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ApiException } from "@/types/ApiTypes";

type CliAuthState = "idle" | "approving" | "approved" | "cancelled" | "error";

function cancelWithBeacon(sessionId: string) {
  const endpoint = `${API_BASE}/auth/cli/cancel`;
  const payload = JSON.stringify({ sessionId });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon(endpoint, blob);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      credentials: "include",
    }).catch(() => {});
  } catch {}
}

export function CliAuthPage() {
  const [searchParams] = useSearchParams();
  const sessionId = (searchParams.get("session") || "").trim();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [state, setState] = useState<CliAuthState>("idle");
  const [message, setMessage] = useState("");

  const loginRedirect = useMemo(
    () => `/login?redirect=${encodeURIComponent(`/cli-auth?session=${sessionId}`)}`,
    [sessionId],
  );

  useEffect(() => {
    if (!sessionId) return;

    const onBeforeUnload = () => {
      if (state === "approved" || state === "cancelled") return;
      cancelWithBeacon(sessionId);
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [sessionId, state]);

  const handleApprove = async () => {
    if (!sessionId) return;

    setState("approving");
    setMessage("");

    try {
      await authApi.cliApprove(sessionId);
      setState("approved");
      setMessage("CLI login approved. You can return to the terminal.");
    } catch (err) {
      setState("error");
      if (err instanceof ApiException) {
        if (err.code === "NO_WEB_SESSION" || err.code === "INVALID_WEB_SESSION") {
          setMessage("Your web session expired. Please sign in again and retry.");
          return;
        }
        setMessage(err.message || "Failed to approve CLI login.");
        return;
      }

      setMessage("Failed to approve CLI login.");
    }
  };

  const handleCancel = async () => {
    if (!sessionId) return;

    try {
      await authApi.cliCancel(sessionId);
    } catch {}

    setState("cancelled");
    setMessage("CLI login cancelled.");
  };

  if (!sessionId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Invalid CLI Session</CardTitle>
            <CardDescription>The login link is missing a session token.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Sign in to approve this CLI login request.</CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-3">
            <Button asChild>
              <Link to={loginRedirect}>Sign In</Link>
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel Request
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Authorize Docnine CLI</CardTitle>
          <CardDescription>Approve this request to sign your terminal session in.</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground break-all">Session: {sessionId}</p>
          {message ? <p className="mt-3 text-sm">{message}</p> : null}
        </CardContent>

        <CardFooter className="flex gap-3">
          {state === "approved" ? (
            <Button onClick={() => window.close()}>Close Window</Button>
          ) : (
            <Button onClick={handleApprove} disabled={state === "approving"}>
              {state === "approving" ? "Approving..." : "Approve CLI Login"}
            </Button>
          )}

          {state !== "approved" ? (
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          ) : null}
        </CardFooter>
      </Card>
    </div>
  );
}
