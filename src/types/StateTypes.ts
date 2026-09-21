import { User } from "./UserTypes";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export interface SessionExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface SessionState {
  sessionExpiredOpen: boolean;
  showSessionExpired: () => void;
  hideSessionExpired: () => void;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  initialized: boolean;

  setTokens: (user: User, token: string) => void;
  clearAuth: () => void;
  initAuth: () => Promise<void>;
}
