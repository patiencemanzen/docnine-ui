import { DocSectionTrack, DocStatus, StatusConfig } from "@/types/DocStatusTypes";
import {
  AlertTriangle,
  Archive,
  CheckCircle2,
  Eye,
  Globe,
  PenLine,
  RotateCcw,
} from "@/components/icons";

export const DOC_STATUS_CONFIG: Record<DocStatus, StatusConfig> = {
  draft: {
    label: "Draft",
    icon: PenLine,
    badgeClass: "bg-muted text-muted-foreground border-muted-foreground/20",
    dotClass: "bg-muted-foreground/50",
    iconClass: "text-muted-foreground",
  },
  in_review: {
    label: "In Review",
    icon: Eye,
    badgeClass: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    dotClass: "bg-yellow-500",
    iconClass: "text-yellow-600 dark:text-yellow-400",
  },
  changes_requested: {
    label: "Changes Requested",
    icon: RotateCcw,
    badgeClass: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    dotClass: "bg-orange-500",
    iconClass: "text-orange-600 dark:text-orange-400",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle2,
    badgeClass: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
    dotClass: "bg-green-500",
    iconClass: "text-green-600 dark:text-green-400",
  },
  published: {
    label: "Published",
    icon: Globe,
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    dotClass: "bg-blue-500",
    iconClass: "text-blue-600 dark:text-blue-400",
  },
  outdated: {
    label: "Outdated",
    icon: AlertTriangle,
    badgeClass: "bg-primary/15 text-primary dark:text-primary border-primary/30",
    dotClass: "bg-primary",
    iconClass: "text-primary dark:text-primary",
  },
  archived: {
    label: "Archived",
    icon: Archive,
    badgeClass: "bg-muted text-muted-foreground/60 border-muted-foreground/10",
    dotClass: "bg-muted-foreground/30",
    iconClass: "text-muted-foreground/50",
  },
};

export const DOC_STATUS_ORDER: DocStatus[] = [
  "draft",
  "in_review",
  "changes_requested",
  "approved",
  "published",
  "outdated",
  "archived",
];

export const DEFAULT_SECTION: DocSectionTrack = {
  status: "draft",
  log: [],
};
