import { ApiShare } from "./ProjectShareTypes";

export interface StatusConfig {
  label: string;
  icon: React.ElementType;
  
  badgeClass: string;
  
  dotClass: string;
  
  iconClass: string;
}

export type DocStatus =
  | "draft"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "outdated"
  | "archived";

export interface DocStatusLogEntry {
  status: DocStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface DocSectionTrack {
  status: DocStatus;
  assignee?: string;
  dueDate?: string;
  log: DocStatusLogEntry[];
}

export type Entries = Record<string, Record<string, DocSectionTrack>>;

export interface StatusChangeModalProps {
    isOpen: boolean
    onClose: () => void
    pendingStatus: DocStatus | null
    onConfirm: (note: string, taggedMember?: string) => void
    members: ApiShare[]
    loadingMembers: boolean
}