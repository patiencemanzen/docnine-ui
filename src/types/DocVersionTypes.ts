export interface DocVersion {
  _id: string;
  projectId: string;
  section: string;
  source: "ai_full" | "ai_incremental" | "user";
  meta: {
    commitSha?: string;
    changedFiles?: string[];
    agentsRun?: string[];
    changeSummary?: string;
  };
  createdAt: string;
  updatedAt: string;
  
  content?: string;
}

export interface VersionListResponse {
  versions: DocVersion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface VersionHistoryPanelProps {
  projectId: string;
  
  section: string;
  
  sectionLabel: string;
  
  isUserEdited?: boolean;
  onClose: () => void;
  onRestored: (
    effectiveOutput: Record<string, string>,
    editedSections: any[],
  ) => void;
  
  onRevertToAI?: () => void;
}
