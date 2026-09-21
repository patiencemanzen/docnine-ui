import { useNavigate } from "react-router-dom";
import {
  Bell,
  FolderGit2,
  FileText,
  ShieldAlert,
  CreditCard,
  Zap,
  Users,
  Globe,
  Bot,
  Archive,
  CheckCheck,
  Download,
} from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Notification, NotificationEntityType } from "@/types/NotificationTypes";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
}

const ENTITY_ICON: Record<NotificationEntityType, React.ElementType> = {
  PROJECT: FolderGit2,
  DOCUMENTATION: FileText,
  SECURITY: ShieldAlert,
  PAYMENT: CreditCard,
  SUBSCRIPTION: CreditCard,
  PIPELINE: Zap,
  SHARE: Users,
  PORTAL: Globe,
  SLACK: Bot,
  SYSTEM: Bell,
  EXPORT: Download,
};

const PRIORITY_BORDER: Record<string, string> = {
  CRITICAL: "border-l-4 border-l-red-500",
  HIGH: "border-l-4 border-l-orange-500",
  MEDIUM: "border-l-4 border-l-blue-500",
  LOW: "border-l-4 border-l-border",
};

export function NotificationItem({ notification, onMarkRead, onArchive }: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = ENTITY_ICON[notification.entityType] ?? Bell;
  const borderClass = PRIORITY_BORDER[notification.priority] ?? PRIORITY_BORDER.LOW;

  function handleClick() {
    if (!notification.isRead) {
      onMarkRead(notification._id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className={cn(
        "group relative flex items-start gap-3 px-4 py-3 cursor-pointer",
        "hover:bg-muted/60 transition-colors",
        borderClass,
        !notification.isRead && "bg-primary/5"
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", !notification.isRead && "font-medium text-foreground", notification.isRead && "text-foreground/80")}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>

      {!notification.isRead && (
        <span className="absolute top-3.5 right-3 h-2 w-2 rounded-full bg-primary shrink-0" />
      )}

      <div className={cn(
        "absolute right-3 top-2 hidden group-hover:flex items-center gap-1",
        !notification.isRead && "right-6"
      )}>
        {!notification.isRead && (
          <button
            title="Mark as read"
            onClick={(e) => { e.stopPropagation(); onMarkRead(notification._id); }}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          title="Archive"
          onClick={(e) => { e.stopPropagation(); onArchive(notification._id); }}
          className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
