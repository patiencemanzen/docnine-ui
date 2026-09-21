import * as z from "zod";

export type NativeStep = "source" | "manual" | "zip" | "from-scratch";
export type ProviderStep = "github" | "gitlab" | "bitbucket" | "azure";
export type Step = NativeStep | ProviderStep;
export type ProviderKey = "github" | "gitlab" | "bitbucket" | "azure";

export const manualProjectSchema = z.object({
  repoUrl: z
    .string()
    .min(1, "Repository URL is required")
    .refine(
      (v) =>
        v.includes("github.com") ||
        v.includes("gitlab.com") ||
        v.includes("bitbucket.org") ||
        v.includes("dev.azure.com") ||
        /^[\w.-]+\/[\w.-]+$/.test(v),
      "Must be a valid repository URL or owner/repo shorthand",
    ),
});

export const fromScratchSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .min(3, "Project name must be at least 3 characters"),
});

export type ManualProjectFormValues = z.infer<typeof manualProjectSchema>;
export type FromScratchFormValues = z.infer<typeof fromScratchSchema>;

export interface ProviderConfig {
  label: string;
  description: string;
  emoji: React.ComponentType<{ className?: string }>;
}

export type ProviderStatusRecord = Record<ProviderKey, boolean>;
export type ProviderUsernamesRecord = Record<ProviderKey, string>;
export type ProviderCheckingRecord = Record<ProviderKey, boolean>;

export interface NormalizedRepo {
  id?: string;
  uuid?: string;
  path_with_namespace?: string;
  full_name: string;
  description?: string;
  html_url: string;
  web_url?: string;
}

export interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface RepoListProps {
  repos: NormalizedRepo[];
  loading: boolean;
  hasNextPage: boolean;
  selectedRepo: NormalizedRepo | null;
  onSelect: (repo: NormalizedRepo) => void;
  onLoadMore: () => void;
}

export interface SourceSelectorProps {
  providerStatus: ProviderStatusRecord;
  checkingStatus: ProviderCheckingRecord;
  isConnecting: boolean;
  onSelectProvider: (provider: ProviderKey) => void;
  onSelectZip: () => void;
  onSelectFromScratch: () => void;
  onSelectManual: () => void;
}

export interface ManualUrlFormProps {
  onBack: () => void;
  onSubmit: (values: ManualProjectFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface ZipUploadStepProps {
  onBack: () => void;
  error: string | null;
  isLoading: boolean;
  isValidating: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onUpload: () => Promise<void>;
  zipFile: File | null;
}

export interface FromScratchFormProps {
  onBack: () => void;
  onSubmit: (values: FromScratchFormValues) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export interface ProviderRepoSelectorProps {
  provider: ProviderKey;
  repos: NormalizedRepo[];
  filteredRepos: NormalizedRepo[];
  selectedRepo: NormalizedRepo | null;
  searchQuery: string;
  loading: boolean;
  hasNextPage: boolean;
  isConnecting: boolean;
  username: string;
  githubOrgs?: any[];
  githubOrgsLoading?: boolean;
  githubSelectedOrg?: string | null;
  onSearchChange: (query: string) => void;
  onSelectRepo: (repo: NormalizedRepo) => void;
  onLoadMore: () => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
  onGithubOrgChange?: (org: string | null) => void;
}

export interface ModalState {
  step: Step;
  isConnecting: boolean;
  apiError: string | null;
}

export interface ProviderState {
  status: ProviderStatusRecord;
  usernames: ProviderUsernamesRecord;
  checking: ProviderCheckingRecord;
}

export interface RepositoryState {
  repos: NormalizedRepo[];
  loading: boolean;
  page: number;
  hasNext: boolean;
  selectedRepo: NormalizedRepo | null;
  searchQuery: string;
}

export interface ZipState {
  file: File | null;
  validating: boolean;
  error: string | null;
}

export interface CustomTab {
  _id: string;
  name: string;
  description: string;
  content: string;
  order: number;
  isNative: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateTabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => Promise<void>;
  isLoading?: boolean;
}

export type ApiProjectStatus =
  | "queued"
  | "running"
  | "done"
  | "error"
  | "archived";

export interface ApiProjectEditedSection {
  section: string;
  editedAt: string;
  stale: boolean;
}

export interface ApiProjectMeta {
  name: string;
  description: string | null;
  language: string;
  stars: number;
  defaultBranch: string;
  topics: string[];
}

export interface ApiProjectStats {
  filesAnalysed: number;
  endpoints: number;
  models: number;
  relationships: number;
  components: number;
  lastSyncedAt?: string | null;
  lastSyncDuration?: number | null;
}

export interface ApiProjectSecurity {
  counts: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  score: number;
  grade: string;
  findings: any[];
}

export interface ApiProjectOutput {
  readme?: string;
  internalDocs?: string;
  apiReference?: string;
  schemaDocs?: string;
  securityReport?: string;
}

export interface ApiProject {
  meta: ApiProjectMeta;
  _id: string;
  userId: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  jobId: string;
  status: ApiProjectStatus;
  techStack: string[];
  lastDocumentedCommit: string;
  stats: ApiProjectStats;
  security: ApiProjectSecurity;
  output: ApiProjectOutput;
  editedOutput: ApiProjectOutput;
  editedSections: ApiProjectEditedSection[];
  customTabs?: CustomTab[];
  createdAt: string;
  updatedAt: string;
  chatSessionId?: string;
}

export interface ProjectGetResponse {
  project: ApiProject;
  effectiveOutput: ApiProjectOutput;
  editedSections: ApiProjectEditedSection[];
  lastSyncedCommit: string;
  shareRole: "owner" | "editor" | "viewer";
}

export interface PipelineEvent {
  step: string;
  status?: string;
  msg?: string;
  detail?: string;
  ts: string;
  result?: Record<string, unknown>;
}

export interface ProjectsListResponse {
  projects: ApiProject[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type ProjectStatus = "analyzing" | "completed" | "failed" | "archived";

export interface Project {
  id: string;
  name: string;
  description?: string;
  repoUrl: string;
  repoOwner: string;
  status: ProjectStatus;
  apiStatus: ApiProjectStatus;
  createdAt: string;
  updatedAt: string;
  shareRole: "owner" | "editor" | "viewer";

  readme?: string;
  apiReference?: string;
  schemaDocs?: string;
  internalDocs?: string;
  securityReport?: string;

  lastSyncedCommit?: string | null;
  lastSyncedAt?: string | null;
  provider?: string;
}

export interface ProjectState {
  projects: Project[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  sharedProjects: Project[];
  sharedLoading: boolean;
  sharedError: string | null;

  
  fetchProjects: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sort?: string;
    search?: string;
  }) => Promise<void>;

  
  createProject: (repoUrl: string) => Promise<Project & { streamUrl: string }>;

  
  deleteProject: (id: string) => Promise<void>;

  
  archiveProject: (id: string) => Promise<void>;

  
  retryProject: (id: string) => Promise<Project & { streamUrl: string }>;

  
  getProject: (id: string) => Promise<Project>;

  
  getProjectData: (id: string) => Promise<{
    project: ApiProject;
    editedSections: any;
    effectiveOutput: any;
    lastSyncedCommit: string;
    shareRole: "owner" | "editor" | "viewer";
  }>;

  
  updateLocalProject: (id: string, changes: Partial<Project>) => void;

  
  fetchSharedProjects: () => Promise<void>;
}
