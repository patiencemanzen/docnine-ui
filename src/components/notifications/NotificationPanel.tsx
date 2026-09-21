import { useEffect, useState } from "react";
import { Bell } from "@/components/icons";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "@/store/useNotificationStore";
import { NotificationItem } from "./NotificationItem";

type Filter = "all" | "unread" | "critical";

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose: _onClose }: NotificationPanelProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchNotifications,
    fetchMore,
    markAsRead,
    markAllAsRead,
    archive,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead && !n.isArchived;
    if (filter === "critical") return n.priority === "CRITICAL" && !n.isArchived;
    return !n.isArchived;
  });

  const TABS: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "unread", label: "Unread" },
    { key: "critical", label: "Critical" },
  ];

  const emptyMessages: Record<Filter, string> = {
    all: "No notifications yet",
    unread: "No unread notifications",
    critical: "No critical notifications",
  };

  return (
    <div className="absolute right-0 mt-2 w-95 rounded-lg border border-border bg-background shadow-lg z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="flex h-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground min-w-5">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex items-center border-b border-border px-4 gap-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              "py-2 text-xs font-medium border-b-2 transition-colors",
              filter === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto max-h-100 divide-y divide-border/60">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-muted w-3/4" />
                  <div className="h-3 rounded bg-muted w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center px-6">
            <Bell className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{emptyMessages[filter]}</p>
          </div>
        ) : (
          filtered.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={markAsRead}
              onArchive={archive}
            />
          ))
        )}
      </div>

      {hasMore && !isLoading && (
        <div className="border-t border-border p-2 flex justify-center">
          <button
            onClick={() => fetchMore()}
            disabled={isLoadingMore}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 py-1 px-3 rounded hover:bg-muted"
          >
            {isLoadingMore ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
