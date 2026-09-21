export interface GoogleDocsStatusData {
  connected: boolean;
  email?: string;
  name?: string;
  connectedAt?: string;
}

export type NotionStatusData = {
  connected: boolean;
  parentPageId?: string;
  workspaceName?: string | null;
  connectedAt?: string;
};

export type OAuthStatus = "success" | "error" | "cancelled";

export interface OAuthResult {
  status: OAuthStatus;
  user?: string;
  message?: string;
}
