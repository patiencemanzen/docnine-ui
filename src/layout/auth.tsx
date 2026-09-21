import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  );
}
