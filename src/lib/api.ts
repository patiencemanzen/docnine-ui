import { fetchEventSource } from "@microsoft/fetch-event-source";
import { useAuthStore } from "@/store/auth";
import { useSessionStore } from "@/store/session";
import { ApiError, ApiException, AuthResponse } from "@/types/ApiTypes";
import { User } from "@/types/UserTypes";
import { GitHubOrg, GitHubReposResponse, GitHubStatus } from "@/types/GithubTypes";
import { GitLabReposResponse, GitLabStatus } from "@/types/GitlabTypes";
import { BitbucketReposResponse, BitbucketStatus } from "@/types/BitbucketTypes";
import { AzureReposResponse, AzureStatus } from "@/types/AzureTypes";
import {
  ApiProject,
  ApiProjectEditedSection,
  ApiProjectMeta,
  ApiProjectOutput,
  CustomTab,
  PipelineEvent,
  ProjectGetResponse,
  ProjectsListResponse,
} from "@/types/ProjectTypes";
import { ApiAttachment } from "@/types/DocAttachmentTypes";
import { DocVersion } from "@/types/DocVersionTypes";
import { ApiShare, ApiSharedProject } from "@/types/ProjectShareTypes";
import {
  ApiPortal,
  PortalAccessMode,
  PortalBranding,
  PortalSectionConfig,
  PortalSectionKey,
  PortalTemplateId,
  PublicPortalData,
} from "@/types/PortalTypes";
import { ApiSpec, TryItResult } from "@/types/ApiSpecTypes";
import {
  BillingPlan,
  InvoiceData,
  SubscriptionData,
  UsageData,
  PaymentMethodData,
} from "@/types/BillingTypes";
import {
  AdminProject,
  AdminStats,
  AdminSubscription,
  AdminSubscriptionInfo,
  AdminUser,
  Pagination,
} from "@/types/AdminTypes";
import { ActivityLog, ActivityLogsResponse } from "@/types/activity-log";
import {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
} from "@/types/NotificationTypes";

export const API_BASE = import.meta.env.VITE_API_URL || "";

let _accessToken: string | null = null;

export function getAccessToken() {
  return _accessToken;
}

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

let _isRefreshing = false;
let _refreshPromise: Promise<string | null> | null = null;

export async function refreshToken(): Promise<string | null> {
  if (_isRefreshing && _refreshPromise) return _refreshPromise;

  _isRefreshing = true;

  _refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return null;

      const json = await res.json();
      const token: string = json.data?.accessToken ?? json.accessToken ?? null;

      if (token) setAccessToken(token);

      return token;
    } catch {
      return null;
    } finally {
      _isRefreshing = false;
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {},
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);

  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = _accessToken;

  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const doFetch = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      credentials: "include",
      headers: t
        ? (() => {
            headers.set("Authorization", `Bearer ${t}`);
            return headers;
          })()
        : headers,
    });

  let res = await doFetch(token);

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  let body: any;
  const contentType = res.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    body = await res.json();
  } else if (!res.ok) {
    throw new ApiException(res.status, {
      code: "NETWORK_ERROR",
      message: `Server returned ${res.status} ${res.statusText}`,
    });
  } else {
    return res as unknown as T;
  }

  if (!res.ok) {
    const err: ApiError = body?.error ?? {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred.",
    };

    if (res.status === 401 && !skipAuth) {
      const authState = useAuthStore.getState();
      const sessionState = useSessionStore.getState();

      if (authState.isAuthenticated) {
        authState.clearAuth();
        sessionState.showSessionExpired();
      }
    }

    throw new ApiException(res.status, err);
  }

  return (body?.data ?? body) as T;
}

export const authApi = {
  signup: (body: { name: string; email: string; password: string; agreeToTerms: boolean }) =>
    apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  login: (body: { email: string; password: string }) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  refresh: () => apiFetch<AuthResponse>("/auth/refresh", { method: "POST", skipAuth: true }),

  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),

  me: () => apiFetch<{ user: User }>("/auth/me"),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
      skipAuth: true,
    }),

  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  resetPassword: (body: { token: string; password: string; confirmPassword: string }) =>
    apiFetch<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
      skipAuth: true,
    }),

  updateProfile: (body: { name?: string; email?: string }) =>
    apiFetch<{ user: User }>("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  changePassword: (body: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) =>
    apiFetch<void>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  cliApprove: (sessionId: string) =>
    apiFetch<{ success: boolean }>("/auth/cli/approve", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),

  cliCancel: (sessionId: string) =>
    apiFetch<{ success: boolean }>("/auth/cli/cancel", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
      skipAuth: true,
    }),

  getGoogleDocsStatus: () =>
    apiFetch<{
      connected: boolean;
      email?: string;
      name?: string;
      connectedAt?: string;
    }>("/auth/google-docs/status"),

  getGoogleDocsStartUrl: () => apiFetch<{ url: string }>("/auth/google-docs/start"),

  disconnectGoogleDocs: () => apiFetch<void>("/auth/google-docs", { method: "DELETE" }),

  getNotionStatus: () =>
    apiFetch<{
      connected: boolean;
      parentPageId?: string;
      workspaceName?: string | null;
      connectedAt?: string;
    }>("/auth/notion/status"),

  connectNotion: (body: { apiKey: string; parentPageId: string; workspaceName?: string }) =>
    apiFetch<{
      connected: boolean;
      parentPageId: string;
      workspaceName?: string | null;
      connectedAt: string;
    }>("/auth/notion/connect", { method: "POST", body: JSON.stringify(body) }),

  disconnectNotion: () => apiFetch<void>("/auth/notion", { method: "DELETE" }),

  getWebhookStatus: () =>
    apiFetch<{
      webhookEnabled: boolean;
      hasSecret: boolean;
      lastWebhookAt: string | null;
      lastWebhookStatus: "success" | "failed" | "skipped" | null;
    }>("/auth/webhook/status"),

  getOrInitializeWebhook: () =>
    apiFetch<{
      webhookUrl: string;
      secret: string;
      webhookEnabled: boolean;
      lastWebhookAt: string | null;
      lastWebhookStatus: "success" | "failed" | "skipped" | null;
      yaml: string;
    }>("/auth/webhook/init", { method: "POST" }),

  rotateWebhookSecret: () =>
    apiFetch<{
      webhookUrl: string;
      secret: string;
      webhookEnabled: boolean;
      lastWebhookAt: string | null;
      lastWebhookStatus: "success" | "failed" | "skipped" | null;
      yaml: string;
    }>("/auth/webhook/rotate", { method: "POST" }),

  updateWebhookSettings: (webhookEnabled: boolean) =>
    apiFetch<{
      webhookUrl: string;
      webhookEnabled: boolean;
      hasSecret: boolean;
      lastWebhookAt: string | null;
      lastWebhookStatus: "success" | "failed" | "skipped" | null;
      yaml: string;
    }>("/auth/webhook", {
      method: "PATCH",
      body: JSON.stringify({ webhookEnabled }),
    }),

  createToken: (body: {
    name: string;
    description?: string;
    scope?: string[];
    expiresAt?: string;
  }) =>
    apiFetch<{
      id: string;
      plainToken: string;
      name: string;
      lastChars: string;
      scope: string[];
      createdAt: string;
      expiresAt?: string;
    }>("/auth/tokens", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listTokens: () =>
    apiFetch<{
      tokens: Array<{
        id: string;
        name: string;
        description?: string;
        lastChars: string;
        scope: string[];
        expiresAt?: string;
        lastUsedAt?: string;
        createdAt: string;
        isRevoked: boolean;
      }>;
      stats: {
        total: number;
        active: number;
        revoked: number;
        expiringSoon: number;
      };
    }>("/auth/tokens"),

  getToken: (tokenId: string) =>
    apiFetch<{
      id: string;
      name: string;
      description?: string;
      lastChars: string;
      scope: string[];
      expiresAt?: string;
      lastUsedAt?: string;
      createdAt: string;
      isRevoked: boolean;
    }>(`/auth/tokens/${tokenId}`),

  revokeToken: (tokenId: string) =>
    apiFetch<{ message: string }>(`/auth/tokens/${tokenId}`, {
      method: "DELETE",
    }),

  deleteToken: (tokenId: string) =>
    apiFetch<{ deleted: boolean }>(`/auth/tokens/${tokenId}?permanent=true`, {
      method: "DELETE",
    }),
};

export const githubApi = {
  getStatus: () => apiFetch<GitHubStatus>("/github/status"),

  getOAuthStartUrl: () => apiFetch<{ url: string }>("/github/oauth/start"),

  getOrgs: () => apiFetch<{ orgs: GitHubOrg[] }>("/github/orgs"),

  getRepos: (
    params: {
      page?: number;
      perPage?: number;
      type?: string;
      sort?: string;
      org?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("perPage", String(params.perPage));
    if (params.type) qs.set("type", params.type);
    if (params.sort) qs.set("sort", params.sort);
    if (params.org) qs.set("org", params.org);
    return apiFetch<GitHubReposResponse>(`/github/repos?${qs}`);
  },

  disconnect: () => apiFetch<void>("/github/disconnect", { method: "DELETE" }),
};

export const gitlabApi = {
  getStatus: () => apiFetch<GitLabStatus>("/gitlab/status"),

  getOAuthStartUrl: () => apiFetch<{ url: string }>("/gitlab/oauth/start"),

  getRepos: (
    params: {
      page?: number;
      perPage?: number;
      sort?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("perPage", String(params.perPage));
    if (params.sort) qs.set("sort", params.sort);
    return apiFetch<GitLabReposResponse>(`/gitlab/repos?${qs}`);
  },

  disconnect: () => apiFetch<void>("/gitlab/disconnect", { method: "DELETE" }),
};

export const bitbucketApi = {
  getStatus: () => apiFetch<BitbucketStatus>("/bitbucket/status"),

  getOAuthStartUrl: () => apiFetch<{ url: string }>("/bitbucket/oauth/start"),

  getRepos: (
    params: {
      page?: number;
      perPage?: number;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("perPage", String(params.perPage));
    return apiFetch<BitbucketReposResponse>(`/bitbucket/repos?${qs}`);
  },

  disconnect: () => apiFetch<void>("/bitbucket/disconnect", { method: "DELETE" }),
};

export const azureApi = {
  getStatus: () => apiFetch<AzureStatus>("/azure/status"),

  getOAuthStartUrl: () => apiFetch<{ url: string }>("/azure/oauth/start"),

  getRepos: (
    params: {
      page?: number;
      perPage?: number;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.perPage) qs.set("perPage", String(params.perPage));
    return apiFetch<AzureReposResponse>(`/azure/repos?${qs}`);
  },

  disconnect: () => apiFetch<void>("/azure/disconnect", { method: "DELETE" }),
};

export const projectsApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      status?: string;
      sort?: string;
      search?: string;
    } = {},
  ) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.status && params.status !== "all") qs.set("status", params.status);
    if (params.sort) qs.set("sort", params.sort);
    if (params.search) qs.set("search", params.search);
    return apiFetch<ProjectsListResponse>(`/projects?${qs}`);
  },

  get: (id: string) => apiFetch<ProjectGetResponse>(`/projects/${id}`),

  create: (repoUrl: string) =>
    apiFetch<{ project: ApiProject; streamUrl: string }>("/projects", {
      method: "POST",
      body: JSON.stringify({ repoUrl }),
    }),

  validateZip: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return apiFetch<{
      valid: boolean;
      message?: string;
      stats?: { files: number; totalSize: number; languages: string[] };
    }>("/projects/zip/validate", {
      method: "POST",
      body: fd,
    });
  },

  uploadZip: (file: File, projectName?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (projectName) fd.append("projectName", projectName);
    return apiFetch<{ project: ApiProject }>("/projects/zip/upload", {
      method: "POST",
      body: fd,
    });
  },

  createFromScratch: (projectName: string) =>
    apiFetch<{ project: ApiProject }>("/projects/from-scratch", {
      method: "POST",
      body: JSON.stringify({ projectName }),
    }),

  update: (id: string, body: { status: "archived" }) =>
    apiFetch<{ project: ApiProject }>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: (id: string) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),

  retry: (id: string) =>
    apiFetch<{ project: ApiProject; streamUrl: string }>(`/projects/${id}/retry`, {
      method: "POST",
    }),

  sync: (id: string, force = false) =>
    apiFetch<{ project: ApiProject; streamUrl: string }>(
      `/projects/${id}/sync${force ? "?force=true" : ""}`,
      { method: "POST" },
    ),

  exportBlob: async (id: string, type: "pdf" | "yaml", data?: any) => {
    const token = _accessToken;
    const res = await fetch(`${API_BASE}/projects/${id}/export/${type}`, {
      method: "POST",
      credentials: "include",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { "Content-Type": "application/json" } : {}),
      },
      ...(data && { body: JSON.stringify(data) }),
    });
    if (!res.ok)
      throw new ApiException(res.status, {
        code: "EXPORT_FAILED",
        message: "Export failed.",
      });
    return res.blob();
  },

  exportNotion: (id: string, data?: any) =>
    apiFetch<{ mainPageUrl: string; mainPageId: string; childPages: string[] }>(
      `/projects/${id}/export/notion`,
      {
        method: "POST",
        ...(data && { body: JSON.stringify(data) }),
      },
    ),

  getGoogleDocsConnectUrl: (id: string) =>
    apiFetch<{ url: string }>(`/projects/${id}/export/google-docs/connect`),

  getGoogleDocsStatus: (id: string) =>
    apiFetch<{
      connected: boolean;
      email?: string;
      name?: string;
      connectedAt?: string;
    }>(`/projects/${id}/export/google-docs/status`),

  disconnectGoogleDocs: (id: string) =>
    apiFetch<void>(`/projects/${id}/export/google-docs`, { method: "DELETE" }),

  exportGoogleDocs: (id: string, data?: any) =>
    apiFetch<{ documentId: string; documentUrl: string; title: string }>(
      `/projects/${id}/export/google-docs`,
      {
        method: "POST",
        ...(data && { body: JSON.stringify(data) }),
      },
    ),

  getEvents: (id: string) =>
    apiFetch<{ events: PipelineEvent[]; status: string; jobId: string }>(`/projects/${id}/events`),

  saveEdit: (id: string, section: string, content: string) =>
    apiFetch<{
      project: ApiProject;
      effectiveOutput: ApiProjectOutput;
      editedSections: ApiProjectEditedSection[];
    }>(`/projects/${id}/docs/${section}`, {
      method: "PATCH",
      body: JSON.stringify({ content }),
    }),

  acceptAI: (id: string, section: string) =>
    apiFetch<{
      project: ApiProject;
      effectiveOutput: ApiProjectOutput;
      editedSections: ApiProjectEditedSection[];
    }>(`/projects/${id}/docs/${section}/accept-ai`, { method: "POST" }),

  revertEdit: (id: string, section: string) =>
    apiFetch<{
      project: ApiProject;
      effectiveOutput: ApiProjectOutput;
      editedSections: ApiProjectEditedSection[];
    }>(`/projects/${id}/docs/${section}/edit`, { method: "DELETE" }),

  getMCPInfo: (id: string) =>
    apiFetch<{
      projectId: string;
      projectName: string;
      mcpUrl: string;
      status: string;
    }>(`/projects/${id}/mcp/info`),
};

export const versionsApi = {
  list: (projectId: string, section: string, page = 1, limit = 20) =>
    apiFetch<{
      versions: DocVersion[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`/projects/${projectId}/docs/${section}/versions?page=${page}&limit=${limit}`),

  get: (projectId: string, section: string, versionId: string) =>
    apiFetch<{ version: DocVersion & { content: string } }>(
      `/projects/${projectId}/docs/${section}/versions/${versionId}`,
    ),

  restore: (projectId: string, section: string, versionId: string) =>
    apiFetch<{
      project: ApiProject;
      effectiveOutput: ApiProjectOutput;
      editedSections: ApiProjectEditedSection[];
    }>(`/projects/${projectId}/docs/${section}/versions/${versionId}/restore`, {
      method: "POST",
    }),
};

export const attachmentsApi = {
  list: (projectId: string) =>
    apiFetch<{ attachments: ApiAttachment[] }>(`/projects/${projectId}/attachments`),

  upload: (projectId: string, file: File, description = "") => {
    const fd = new FormData();
    fd.append("file", file);
    if (description) fd.append("description", description);
    return apiFetch<{ attachment: ApiAttachment }>(`/projects/${projectId}/attachments`, {
      method: "POST",
      body: fd,
    });
  },

  downloadUrl: (projectId: string, attachmentId: string) =>
    `${API_BASE}/projects/${projectId}/attachments/${attachmentId}`,

  updateDescription: (projectId: string, attachmentId: string, description: string) =>
    apiFetch<{ attachment: ApiAttachment }>(`/projects/${projectId}/attachments/${attachmentId}`, {
      method: "PATCH",
      body: JSON.stringify({ description }),
    }),

  delete: (projectId: string, attachmentId: string) =>
    apiFetch<void>(`/projects/${projectId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
};

export const sharingApi = {
  invite: (projectId: string, invites: { email: string; role: "viewer" | "editor" }[]) =>
    apiFetch<{
      results: Array<{
        email: string;
        status: string;
        reason?: string;
        share?: ApiShare;
      }>;
    }>(`/projects/${projectId}/share`, {
      method: "POST",
      body: JSON.stringify({ invites }),
    }),

  listAccess: (projectId: string) =>
    apiFetch<{ shares: ApiShare[] }>(`/projects/${projectId}/share`),

  changeRole: (projectId: string, shareId: string, role: "viewer" | "editor") =>
    apiFetch<{ share: ApiShare }>(`/projects/${projectId}/share/${shareId}`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    }),

  revokeAccess: (projectId: string, shareId: string) =>
    apiFetch<void>(`/projects/${projectId}/share/${shareId}`, {
      method: "DELETE",
    }),

  resendInvite: (projectId: string, shareId: string) =>
    apiFetch<{ share: ApiShare }>(`/projects/${projectId}/share/${shareId}/resend`, {
      method: "POST",
    }),

  cancelInvite: (projectId: string, shareId: string) =>
    apiFetch<void>(`/projects/${projectId}/share/${shareId}/cancel`, {
      method: "DELETE",
    }),

  acceptInvite: (token: string) =>
    apiFetch<{ projectId: string; role: string }>(`/projects/share/accept/${token}`, {
      method: "POST",
    }),

  getSharedProjects: () => apiFetch<{ projects: ApiSharedProject[] }>("/projects/shared"),
};

export function chatStream(
  projectId: string,
  message: string,
  handlers: {
    onToken: (token: string) => void;
    onDone: (result: { historyLength: number }) => void;
    onError: (err: Error) => void;
  },
): AbortController {
  const ctrl = new AbortController();

  const run = async (token: string | null) => {
    await fetchEventSource(`${API_BASE}/projects/${projectId}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify({ message }),
      signal: ctrl.signal,
      openWhenHidden: true,
      async onopen(res) {
        if (res.status === 401) {
          const err = new Error("SSE_AUTH") as Error & { code?: string };
          err.code = "SSE_AUTH";
          throw err;
        }
        if (!res.ok) {
          throw new Error(`Chat stream failed (${res.status})`);
        }
      },
      onmessage(ev) {
        try {
          const data = JSON.parse(ev.data);
          if (data.type === "token") handlers.onToken(data.token);
          else if (data.type === "done") {
            handlers.onDone(data);
            ctrl.abort();
          } else if (data.type === "error") handlers.onError(new Error(data.message));
        } catch {}
      },
      onerror(err) {
        if ((err as { code?: string })?.code === "SSE_AUTH") throw err;
        handlers.onError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      },
    });
  };

  (async () => {
    try {
      await run(_accessToken);
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      if (err?.code === "SSE_AUTH") {
        const next = await refreshToken();
        if (next) {
          try {
            await run(next);
            return;
          } catch (retryErr: any) {
            if (retryErr?.name !== "AbortError") handlers.onError(retryErr);
            return;
          }
        }
      }
      handlers.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return ctrl;
}

export const chatApi = {
  reset: (projectId: string) => apiFetch<void>(`/projects/${projectId}/chat`, { method: "DELETE" }),
};

export const portalApi = {
  get: (projectId: string) =>
    apiFetch<{ portal: ApiPortal | null }>(`/projects/${projectId}/portal`),

  update: (
    projectId: string,
    data: {
      branding?: PortalBranding;
      sections?: PortalSectionConfig[];
      seoTitle?: string;
      seoDescription?: string;
      customDomain?: string;
      accessMode?: PortalAccessMode;
      templateId?: PortalTemplateId;
      password?: string | null;
    },
  ) =>
    apiFetch<{ portal: ApiPortal }>(`/projects/${projectId}/portal`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  togglePublish: (projectId: string) =>
    apiFetch<{ portal: ApiPortal }>(`/projects/${projectId}/portal/publish`, {
      method: "POST",
    }),
};

export const publicPortalApi = {
  get: (slug: string, password?: string) => {
    const headers: Record<string, string> = {};
    if (password) headers["x-portal-password"] = password;
    return apiFetch<PublicPortalData>(`/portal/${slug}`, {
      skipAuth: true,
      headers,
    });
  },

  auth: (slug: string, password: string) =>
    apiFetch<{ valid: boolean }>(`/portal/${slug}/auth`, {
      method: "POST",
      skipAuth: true,
      body: JSON.stringify({ password }),
    }),
};

export const apiSpecApi = {
  get: (projectId: string) => apiFetch<{ spec: ApiSpec | null }>(`/projects/${projectId}/apispec`),

  importFile: (projectId: string, formData: FormData) =>
    apiFetch<{ spec: ApiSpec }>(`/projects/${projectId}/apispec/import`, {
      method: "POST",
      body: formData,

      headers: {},
    }),

  importUrl: (projectId: string, url: string, autoSync = false) =>
    apiFetch<{ spec: ApiSpec }>(`/projects/${projectId}/apispec/import`, {
      method: "POST",
      body: JSON.stringify({ method: "url", url, autoSync }),
    }),

  importRaw: (projectId: string, raw: string) =>
    apiFetch<{ spec: ApiSpec }>(`/projects/${projectId}/apispec/import`, {
      method: "POST",
      body: JSON.stringify({ method: "raw", raw }),
    }),

  sync: (projectId: string) =>
    apiFetch<{ spec: ApiSpec }>(`/projects/${projectId}/apispec/sync`, {
      method: "POST",
    }),

  delete: (projectId: string) =>
    apiFetch<null>(`/projects/${projectId}/apispec`, { method: "DELETE" }),

  updateNote: (projectId: string, endpointId: string, note: string) =>
    apiFetch<{ spec: ApiSpec }>(`/projects/${projectId}/apispec/endpoint`, {
      method: "PATCH",
      body: JSON.stringify({ endpointId, note }),
    }),

  tryRequest: (
    projectId: string,
    opts: {
      method: string;
      baseUrl: string;
      path: string;
      headers?: Record<string, string>;
      queryParams?: Record<string, string>;
      body?: string;
    },
  ) =>
    apiFetch<TryItResult>(`/projects/${projectId}/apispec/try`, {
      method: "POST",
      body: JSON.stringify(opts),
    }),
};

export const customTabsApi = {
  list: (projectId: string) =>
    apiFetch<{ tabs: CustomTab[] }>(`/projects/${projectId}/custom-tabs`),

  create: (projectId: string, data: { name: string; description?: string; content?: string }) =>
    apiFetch<{ project: ApiProject }>(`/projects/${projectId}/custom-tabs`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    projectId: string,
    tabId: string,
    data: { name?: string; description?: string; content?: string },
  ) =>
    apiFetch<{ project: ApiProject }>(`/projects/${projectId}/custom-tabs/${tabId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (projectId: string, tabId: string) =>
    apiFetch<{ project: ApiProject }>(`/projects/${projectId}/custom-tabs/${tabId}`, {
      method: "DELETE",
    }),

  reorder: (projectId: string, orders: Array<{ tabId: string; order: number }>) =>
    apiFetch<{ project: ApiProject }>(`/projects/${projectId}/custom-tabs/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ orders }),
    }),
};

export const billingApi = {
  getPlans: () => apiFetch<{ plans: BillingPlan[] }>("/billing/plans", { skipAuth: true }),

  getSubscription: () =>
    apiFetch<{ subscription: SubscriptionData; usage: UsageData }>("/billing/subscription"),

  checkout: (planId: string, cycle: "monthly" | "annual", seats?: number, startTrial?: boolean) =>
    apiFetch<{ type?: "trial" | "payment"; trial?: boolean; paymentLink?: string; txRef?: string }>(
      "/billing/checkout",
      {
        method: "POST",
        body: JSON.stringify({ planId, cycle, seats, startTrial }),
      },
    ),

  verifyPayment: (txRef?: string, transactionId?: number) =>
    apiFetch<{ subscription: SubscriptionData }>("/billing/verify-payment", {
      method: "POST",
      body: JSON.stringify({ txRef, transactionId }),
    }),

  changePlan: (planId: string, cycle: "monthly" | "annual", seats?: number) =>
    apiFetch<{
      type: "upgrade" | "downgrade" | "immediate_no_charge" | "none";
      immediate?: boolean;
      paymentLink?: string;
      effectiveAt?: string;
    }>("/billing/change-plan", {
      method: "POST",
      body: JSON.stringify({ planId, cycle, seats }),
    }),

  cancel: (reason?: string) =>
    apiFetch<{ subscription: SubscriptionData }>("/billing/cancel", {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  pause: (months?: number) =>
    apiFetch<{ subscription: SubscriptionData }>("/billing/pause", {
      method: "POST",
      body: JSON.stringify({ months }),
    }),

  addSeats: (seats: number) =>
    apiFetch<
      | { type: "immediate"; extraSeats: number; totalSeats: number }
      | { type: "payment_required"; paymentLink: string }
    >("/billing/seats", {
      method: "POST",
      body: JSON.stringify({ seats }),
    }),

  getPaymentMethods: () => apiFetch<{ methods: PaymentMethodData[] }>("/billing/payment-methods"),

  deletePaymentMethod: (id: string) =>
    apiFetch<null>(`/billing/payment-methods/${id}`, { method: "DELETE" }),

  setDefaultPaymentMethod: (id: string) =>
    apiFetch<{ method: PaymentMethodData }>(`/billing/payment-methods/${id}/default`, {
      method: "PATCH",
    }),

  getBillingHistory: (page = 1, limit = 20) =>
    apiFetch<{
      invoices: InvoiceData[];
      total: number;
      page: number;
      limit: number;
    }>(`/billing/history?page=${page}&limit=${limit}`),

  downloadInvoicePdf: async (id: string): Promise<void> => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}/billing/invoices/${id}/pdf`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json?.error?.message ?? "Failed to download invoice");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  updateInvoiceDetails: (id: string, data: { companyName?: string; vatNumber?: string }) =>
    apiFetch<{ invoice: InvoiceData }>(`/billing/invoices/${id}/details`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

export const adminApi = {
  getStats: () => apiFetch<AdminStats>("/admin/stats"),

  listUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    return apiFetch<{ users: AdminUser[]; pagination: Pagination }>(`/admin/users?${q}`);
  },

  deleteUser: (id: string) => apiFetch<null>(`/admin/users/${id}`, { method: "DELETE" }),

  updateUser: (
    id: string,
    data: {
      role?: "user" | "super-admin";
      isEmailVerified?: boolean;
      revokeSessions?: boolean;
    },
  ) =>
    apiFetch<{ user: AdminUser }>(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateUserSubscription: (
    userId: string,
    data: {
      plan: string;
      status?: string;
      billingCycle?: string | null;
      seats?: number;
      note?: string;
    },
  ) =>
    apiFetch<{ subscription: AdminSubscriptionInfo }>(`/admin/users/${userId}/subscription`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  listProjects: (params?: { page?: number; limit?: number; search?: string; userId?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.userId) q.set("userId", params.userId);
    return apiFetch<{ projects: AdminProject[]; pagination: Pagination }>(`/admin/projects?${q}`);
  },

  deleteProject: (id: string) => apiFetch<null>(`/admin/projects/${id}`, { method: "DELETE" }),

  listSubscriptions: (params?: {
    page?: number;
    limit?: number;
    plan?: string;
    status?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.plan) q.set("plan", params.plan);
    if (params?.status) q.set("status", params.status);
    return apiFetch<{
      subscriptions: AdminSubscription[];
      pagination: Pagination;
    }>(`/admin/subscriptions?${q}`);
  },

  listActivity: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    userId?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.limit) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.category) q.set("category", params.category);
    if (params?.userId) q.set("userId", params.userId);
    return apiFetch<{ logs: ActivityLog[]; pagination: Pagination }>(`/admin/activity?${q}`);
  },
};

export type { ActivityLog, ActivityLogsResponse };

export const activityLogsApi = {
  list: (
    params: {
      category?: string;
      severity?: string;
      projectId?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const q = new URLSearchParams();
    if (params.category) q.set("category", params.category);
    if (params.severity) q.set("severity", params.severity);
    if (params.projectId) q.set("projectId", params.projectId);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    if (params.page !== undefined) q.set("page", String(params.page));
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    return apiFetch<ActivityLogsResponse>(`/activity-logs?${q}`);
  },

  listByProject: (
    projectId: string,
    params: {
      category?: string;
      severity?: string;
      from?: string;
      to?: string;
      page?: number;
      limit?: number;
    } = {},
  ) => {
    const q = new URLSearchParams();
    if (params.category) q.set("category", params.category);
    if (params.severity) q.set("severity", params.severity);
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    if (params.page !== undefined) q.set("page", String(params.page));
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    return apiFetch<ActivityLogsResponse>(`/activity-logs/project/${projectId}?${q}`);
  },
};

export const notificationsApi = {
  list: (
    params: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      archived?: boolean;
    } = {},
  ) => {
    const q = new URLSearchParams();
    if (params.page !== undefined) q.set("page", String(params.page));
    if (params.limit !== undefined) q.set("limit", String(params.limit));
    if (params.unreadOnly) q.set("unreadOnly", "true");
    if (params.archived) q.set("archived", "true");
    return apiFetch<NotificationsResponse>(`/notifications?${q}`);
  },

  unreadCount: () => apiFetch<UnreadCountResponse>("/notifications/unread-count"),

  markAsRead: (id: string) =>
    apiFetch<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: "PATCH",
    }),

  markAllAsRead: () =>
    apiFetch<{ modifiedCount: number }>("/notifications/read-all", {
      method: "PATCH",
    }),

  archive: (id: string) =>
    apiFetch<{ notification: Notification }>(`/notifications/${id}/archive`, {
      method: "PATCH",
    }),

  delete: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/notifications/${id}`, {
      method: "DELETE",
    }),
};
