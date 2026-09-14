/**
 * Service: Provider OAuth Management
 * Handles OAuth window flows and result polling
 */

import { githubApi, gitlabApi, bitbucketApi, azureApi } from "@/lib/api";
import {
  readOAuthResult,
  clearOAuthResult,
  OAUTH_TIMEOUT_MS,
  OAUTH_POLL_INTERVAL_MS,
} from "@/configs/ProjectConfig";
import type { ProviderKey } from "@/types/ProjectTypes";
import { OAuthStatus } from "@/types/OauthIntergrationTypes";

export class ProviderOAuthService {
  /**
   * Fetch the provider consent URL with the session JWT, then open it.
   * Never puts the access token in a query string.
   */
  static async getOAuthStartUrl(provider: ProviderKey): Promise<string> {
    let data: { url: string };
    if (provider === "github") data = await githubApi.getOAuthStartUrl();
    else if (provider === "gitlab") data = await gitlabApi.getOAuthStartUrl();
    else if (provider === "bitbucket") data = await bitbucketApi.getOAuthStartUrl();
    else if (provider === "azure") data = await azureApi.getOAuthStartUrl();
    else throw new Error(`Unknown provider: ${provider}`);
    if (!data?.url) throw new Error("Provider did not return an OAuth URL");
    return data.url;
  }

  /**
   * Open OAuth window and handle the authentication flow
   */
  static async openOAuthWindow(
    provider: ProviderKey,
    _accessToken: string,
    onStatusChange: (
      status: OAuthStatus,
      user?: string,
      message?: string,
    ) => void,
  ): Promise<void> {
    clearOAuthResult(provider);

    let startUrl: string;
    try {
      startUrl = await this.getOAuthStartUrl(provider);
    } catch (err) {
      onStatusChange(
        "error",
        undefined,
        err instanceof Error ? err.message : "Failed to start OAuth.",
      );
      return;
    }

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      startUrl,
      `${provider}-oauth`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      onStatusChange(
        "error",
        undefined,
        "Failed to open OAuth window. Please allow popups.",
      );
      return;
    }

    let settled = false;

    const finish = (status: OAuthStatus, user?: string, msg?: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      onStatusChange(status, user, msg);
    };

    const cleanup = (pollInterval?: NodeJS.Timeout) => {
      if (pollInterval) clearInterval(pollInterval);
      window.removeEventListener("message", onMessage);
      clearTimeout(maxWaitTimer);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== `${provider}-oauth-complete`) return;
      finish(event.data.status, event.data.user, event.data.msg);
    };

    window.addEventListener("message", onMessage);

    const maxWaitTimer = setTimeout(() => {
      if (!settled) finish("cancelled");
    }, OAUTH_TIMEOUT_MS);

    const poll = setInterval(() => {
      // Check localStorage for result
      const result = readOAuthResult(provider);
      if (result) {
        finish(result.status, result.user, result.msg);
        return;
      }

      // Check if popup was closed
      if (popup.closed) {
        if (!settled) {
          settled = true;
          cleanup(poll);

          // Fallback: check provider status
          this.checkProviderStatus(provider)
            .then((connected) => {
              if (connected) {
                finish("success", undefined, "Connected successfully");
              }
            })
            .catch(() => {
              /* network error */
            });
        }
        return;
      }
    }, OAUTH_POLL_INTERVAL_MS);
  }

  /**
   * Check if a provider is currently connected
   */
  private static async checkProviderStatus(
    provider: ProviderKey,
  ): Promise<boolean> {
    try {
      let status: any;
      if (provider === "github") {
        status = await githubApi.getStatus();
      } else if (provider === "gitlab") {
        status = await gitlabApi.getStatus();
      } else if (provider === "bitbucket") {
        status = await bitbucketApi.getStatus();
      } else if (provider === "azure") {
        status = await azureApi.getStatus();
      }
      return status?.connected ?? false;
    } catch {
      return false;
    }
  }
}
