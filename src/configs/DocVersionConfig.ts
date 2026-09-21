import { DocVersion } from "@/types/DocVersionTypes";
import { Pencil, RefreshCw, Sparkles } from "@/components/icons";

export const SOURCE_CONFIG: Record<
  DocVersion["source"],
  {
    label: string;
    Icon: React.ElementType;
    badgeClass: string;
    dotClass: string;
  }
> = {
  ai_full: {
    label: "AI Full Run",
    Icon: Sparkles,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  ai_incremental: {
    label: "AI Sync",
    Icon: RefreshCw,
    badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    dotClass: "bg-violet-500",
  },
  user: {
    label: "Your Edit",
    Icon: Pencil,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
};
