import { CustomTab } from "./ProjectTypes";

export interface DocHeaderProps {
  title: string;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  onBack: () => void;
}

export interface DocSidebarProps {
  sections: Array<{
    key: string;
    label: string;
    icon: React.ElementType;
  }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading: boolean;
}

export interface DocViewerProps {
  content: string;
  isLoading: boolean;
  isSkeleton?: boolean;
}

export interface DocumentationTabState {
  activeTab: string;
  isEditMode: boolean;
  isChatOpen: boolean;
  isHistoryOpen: boolean;
}

export interface DocumentationViewerState {
  project: any | null;
  editedContent: Record<string, string>;
  editedSections: any[];
  portals: any[];
  isOwner: boolean;
}

export type NativeTab =
  | "readme"
  | "api"
  | "schema"
  | "internal"
  | "security"
  | "other_docs";
export type DocTab = NativeTab | `custom_${string}`;

export interface TabDef {
  key: DocTab;
  label: string;
  icon: React.ElementType;
  field?: string;
  isNative: boolean;
  isCustom?: boolean;
  customTab?: CustomTab;
}
