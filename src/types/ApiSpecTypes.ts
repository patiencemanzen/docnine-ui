export type ApiSpecSource = "file" | "url" | "raw";
export type ApiSpecVersion = "2.0" | "3.0" | "3.1" | "postman" | "unknown";

export interface ApiSpecParameter {
  in: "path" | "query" | "header" | "cookie" | "body";
  name: string;
  required: boolean;
  description: string;
  schema: Record<string, unknown>;
  example?: unknown;
}

export interface ApiSpecRequestBodyContent {
  schema: Record<string, unknown>;
  example?: unknown;
}

export interface ApiSpecRequestBody {
  required: boolean;
  description: string;
  content: Record<string, ApiSpecRequestBodyContent>;
}

export interface ApiSpecResponseContent {
  schema: Record<string, unknown>;
  example?: unknown;
}

export interface ApiSpecResponse {
  description: string;
  content: Record<string, ApiSpecResponseContent>;
}

export interface ApiSpecEndpoint {
  id: string;
  method: string;
  path: string;
  summary: string;
  description: string;
  tags: string[];
  operationId: string;
  parameters: ApiSpecParameter[];
  requestBody: ApiSpecRequestBody | null;
  responses: Record<string, ApiSpecResponse>;
  security: unknown;
  deprecated: boolean;
  customNote: string;
}

export interface ApiSpecInfo {
  title: string;
  version: string;
  description: string;
  contact?: unknown;
  license?: unknown;
  termsOfService?: string;
}

export interface ApiSpecServer {
  url: string;
  description: string;
}

export interface ApiSpecTag {
  name: string;
  description: string;
}

export interface ApiSpec {
  _id: string;
  projectId: string;
  source: ApiSpecSource;
  sourceUrl?: string;
  specVersion: ApiSpecVersion;
  info: ApiSpecInfo;
  servers: ApiSpecServer[];
  tags: ApiSpecTag[];
  endpoints: ApiSpecEndpoint[];
  schemas: Record<string, unknown>;
  securitySchemes: Record<string, unknown>;
  autoSync: boolean;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TryItResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export type Tab = "file" | "url" | "raw";

export interface Props {
  projectId: string;
  open: boolean;
  onClose: () => void;
  onImported: (spec: ApiSpec) => void;
  existingSpec?: ApiSpec | null;
}
