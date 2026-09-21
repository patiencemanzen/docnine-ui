import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import { authApi, setAccessToken } from "@/lib/api";

const REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export function useTokenRefresh() {
  const { isAuthenticated } = useAuthStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refreshNow = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await authApi.refresh();
      if (data?.accessToken) {

        setAccessToken(data.accessToken);
        if (data.user) {
          useAuthStore.getState().setTokens(data.user, data.accessToken);
        }
        console.debug("[useTokenRefresh] Token refreshed successfully");
      }
    } catch {

      console.debug("[useTokenRefresh] Token refresh failed : session will expire on next request");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      refreshNow();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  return { refreshNow };
}
