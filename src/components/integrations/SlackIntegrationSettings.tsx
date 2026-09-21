import React, { useState, useEffect, useCallback, useRef } from "react";
import { Loader, AlertCircle, CheckCircle, Slack, Settings, Trash2 } from "@/components/icons";
import { API_BASE, getAccessToken } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getAuthToken() {
  return getAccessToken() ?? "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  };
}

const EMPTY_CONFIG = {
  configured: false,
  workspace: null,
  healthStatus: null,
  isCustomApp: false,
  alertChannel: "",
  enabledAlerts: {
    critical: true,
    high: true,
    medium: false,
    low: false,
  },
  lastAlert: null,
  pendingCustomApp: false,
  clientIdLast4: "",
  signingSecretLast4: "",
};

const ALERT_PREFERENCES = [
  {
    key: "critical",
    label: "Critical findings",
    description: "Immediate alert with @channel ping",
    updateKey: "enableCriticalAlerts",
  },
  {
    key: "high",
    label: "High severity findings",
    description: "Immediate alert, no ping",
    updateKey: "enableHighAlerts",
  },
  {
    key: "medium",
    label: "Medium severity findings",
    description: "Batched into weekly digest",
    updateKey: "enableMediumAlerts",
  },
  {
    key: "low",
    label: "Low severity findings",
    description: "Off by default",
    updateKey: "enableLowAlerts",
  },
];

export function SlackIntegrationSettings({ projectId }) {
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);

  const [alertChannelInput, setAlertChannelInput] = useState("");
  const saveChannelTimeout = useRef(null);

  const [credentials, setCredentials] = useState({
    clientId: "",
    clientSecret: "",
    signingSecret: "",
  });

  const fetchConfig = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_BASE}/slack/config/${projectId}`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? "Failed to load Slack configuration");
      }

      const body = await res.json();
      const data = body.data ?? EMPTY_CONFIG;
      setConfig(data);
      setAlertChannelInput(data.alertChannel ?? "");
    } catch (err) {
      setError(err.message ?? "Failed to load Slack configuration");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleConnectSlack = async () => {
    try {
      setConnecting(true);
      setError(null);

      const res = await fetch(`${API_BASE}/slack/oauth/start`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ projectId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? "Failed to initiate Slack OAuth");
      }

      const body = await res.json().catch(() => ({}));
      const authUrl = body?.data?.authUrl;
      if (!authUrl) throw new Error("Slack OAuth start response missing authUrl");
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  };

  const handleUpdateConfig = async (newConfig) => {
    try {
      setUpdating(true);
      setError(null);

      const res = await fetch(`${API_BASE}/slack/config/${projectId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(newConfig),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? "Failed to update configuration");
      }

      const body = await res.json();
      setConfig(body.data ?? newConfig);
      showSuccess("Slack configuration updated successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAlertChannelChange = (value) => {
    setAlertChannelInput(value);
    if (saveChannelTimeout.current) clearTimeout(saveChannelTimeout.current);
    saveChannelTimeout.current = setTimeout(() => {
      handleUpdateConfig({ ...config, alertChannelName: value });
    }, 800);
  };

  const handleDisconnect = async () => {
    try {
      setUpdating(true);
      setError(null);

      const res = await fetch(`${API_BASE}/slack/${projectId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? "Failed to disconnect Slack");
      }

      setConfig(EMPTY_CONFIG);
      setAlertChannelInput("");
      setShowDisconnectModal(false);
      showSuccess("Slack integration disconnected");
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveCredentials = async () => {
    try {
      if (
        !credentials.clientId?.trim() ||
        !credentials.clientSecret?.trim() ||
        !credentials.signingSecret?.trim()
      ) {
        setError("All credential fields are required");
        return;
      }

      setUpdating(true);
      setError(null);

      const res = await fetch(`${API_BASE}/slack/credentials/${projectId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          slackClientId: credentials.clientId,
          slackClientSecret: credentials.clientSecret,
          slackSigningSecret: credentials.signingSecret,
        }),
      });

      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message ?? "Failed to save credentials");
      }

      const body = await res.json();
      const data = body.data ?? {};

      setConfig((prev) => ({
        ...prev,
        pendingCustomApp: true,
        clientIdLast4: data.clientIdLast4 || "",
        signingSecretLast4: data.signingSecretLast4 || credentials.signingSecret.slice(-4),
      }));

      setShowCredentialsForm(false);
      showSuccess("Custom Slack app credentials saved successfully");
      setCredentials({ clientId: "", clientSecret: "", signingSecret: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-5 text-[13px] text-muted-foreground">
        <Loader className="h-3.5 w-3.5 animate-spin" />
        Loading Slack configuration…
      </div>
    );
  }

  const isConfigured = Boolean(config?.configured && config?.workspace);
  const hasPendingCredentials = Boolean(config?.pendingCustomApp && config?.clientIdLast4);
  const healthStatus = config?.healthStatus ?? "unknown";
  const healthVariant =
    config?.healthStatus === "healthy" ? "success" : config?.healthStatus ? "warning" : "secondary";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Slack className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold tracking-tight">Slack</h3>
          </div>
        </div>
        {isConfigured && <Badge variant="success">Connected</Badge>}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-[13px] text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {!isConfigured ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6">
          {hasPendingCredentials && !showCredentialsForm ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Custom Slack App Credentials Saved</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Client ID:{" "}
                      <code className="bg-primary/10 px-2 py-0.5 rounded text-xs">
                        ...{config.clientIdLast4}
                      </code>
                    </p>
                    {config.signingSecretLast4 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Signing Secret:{" "}
                        <code className="bg-primary/10 px-2 py-0.5 rounded text-xs">
                          ...{config.signingSecretLast4}
                        </code>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Your custom Slack app is configured. Click below to authorize it in your Slack
                workspace.
              </p>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleConnectSlack}
                  disabled={connecting}
                  className="gap-2 w-full"
                  size="lg"
                >
                  {connecting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Connecting to Slack...
                    </>
                  ) : (
                    <>
                      <Slack className="h-4 w-4" />
                      Connect to Slack
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCredentialsForm(true)}
                  className="w-full"
                  disabled={connecting || updating}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Credentials
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center mb-2">
                <Slack className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
                <h4 className="text-[13px] font-semibold">Configure Custom Slack App</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-id">Client ID</Label>
                <Input
                  id="client-id"
                  value={credentials.clientId}
                  onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                  placeholder="e.g. 1234567890.1234567890"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-secret">Client Secret</Label>
                <Input
                  id="client-secret"
                  type="password"
                  value={credentials.clientSecret}
                  onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                  placeholder="Your client secret"
                  disabled={updating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signing-secret">Signing Secret</Label>
                <Input
                  id="signing-secret"
                  type="password"
                  value={credentials.signingSecret}
                  onChange={(e) =>
                    setCredentials({ ...credentials, signingSecret: e.target.value })
                  }
                  placeholder="Your signing secret"
                  disabled={updating}
                />
              </div>
              <div className="flex gap-2 pt-2">
                {hasPendingCredentials && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCredentialsForm(false);
                      setCredentials({ clientId: "", clientSecret: "", signingSecret: "" });
                    }}
                    disabled={updating}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={handleSaveCredentials}
                  disabled={
                    updating ||
                    !credentials.clientId?.trim() ||
                    !credentials.clientSecret?.trim() ||
                    !credentials.signingSecret?.trim()
                  }
                  className="gap-2 flex-1"
                >
                  {updating && <Loader className="h-4 w-4 animate-spin" />}
                  Save Credentials
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">
                    Connected to {config?.workspace ?? "your workspace"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Workspace health</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={healthVariant} className="capitalize">
                  {healthStatus}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Custom App
                </Badge>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              <h4 className="text-[13px] font-semibold tracking-tight">Alert Channel</h4>
            </div>
            <div className="space-y-2">
              <Label htmlFor="slack-alert-channel">Send security alerts to</Label>
              <Input
                id="slack-alert-channel"
                type="text"
                value={alertChannelInput}
                onChange={(e) => handleAlertChannelChange(e.target.value)}
                disabled={updating}
                placeholder="#security-alerts"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <h4 className="text-[13px] font-semibold tracking-tight mb-3">Alert Preferences</h4>
            <div className="space-y-3">
              {ALERT_PREFERENCES.map((pref) => (
                <label
                  key={pref.key}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors hover:bg-muted"
                >
                  <Checkbox
                    checked={Boolean(config?.enabledAlerts?.[pref.key])}
                    onCheckedChange={(checked) =>
                      handleUpdateConfig({
                        ...config,
                        [pref.updateKey]: Boolean(checked),
                      })
                    }
                    disabled={updating}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-[13px] font-medium">{pref.label}</p>
                    <p className="text-[12px] text-muted-foreground">{pref.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {config?.lastAlert && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-[12px] text-muted-foreground">
              Last alert sent:{" "}
              <span className="font-medium text-foreground">
                {new Date(config.lastAlert).toLocaleString()}
              </span>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-4">
            <h4 className="text-[13px] font-semibold mb-2">What's Next?</h4>
            <ul className="space-y-2 text-muted-foreground text-[12px]">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>
                  Use{" "}
                  <code className="bg-primary/10 px-1 rounded text-foreground">/docnine ask</code>{" "}
                  slash command in Slack to query your documentation
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Security alerts will be sent to the configured channel</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Manage who has access to this project via project sharing settings</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-[12px] text-muted-foreground">
              Disconnecting will stop Slack alerts and slash commands for this project.
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDisconnectModal(true)}
              disabled={updating}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Disconnect Slack
            </Button>
          </div>
        </div>
      )}

      {/* Disconnect confirmation dialog */}
      <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disconnect Slack?</DialogTitle>
            <DialogDescription>
              You will no longer receive security alerts in Slack, and slash commands will stop
              working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDisconnectModal(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnect}
              disabled={updating}
              className="gap-2"
            >
              {updating && <Loader className="h-4 w-4 animate-spin" />}
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SlackIntegrationSettings;
