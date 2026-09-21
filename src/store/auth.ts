import { create } from "zustand";
import { authApi, setAccessToken } from "@/lib/api";
import { AuthState } from "@/types/StateTypes";

let _initAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  initialized: false,

  
  setTokens: (user, token) => {
    setAccessToken(token);
    set({ user, isAuthenticated: true });
  },

  
  clearAuth: () => {
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  
  initAuth: async () => {
    if (_initAuthPromise) return _initAuthPromise;

    _initAuthPromise = (async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
        set({ user: data.user, isAuthenticated: true });
      } catch {

        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
      } finally {
        set({ initialized: true });
        _initAuthPromise = null;
      }
    })();

    return _initAuthPromise;
  },
}));
