import { ApiProject } from "./ProjectTypes";

export interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

export interface AIChatPanelProps {
  project: ApiProject;
  activeSection: string;
  activeSectionContent: string;
  onClose: () => void;
}
