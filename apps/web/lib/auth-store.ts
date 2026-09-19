"use client";

import { create } from "zustand";

export interface UserSession {
  id: string;
  email: string;
  name?: string | null;
  plan?: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserSession | null) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    if (user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("resumematch_user", JSON.stringify(user));
      }
      set({ user, isAuthenticated: true, isLoading: false });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem("resumematch_user");
      }
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    if (typeof window !== "undefined") {
      localStorage.removeItem("resumematch_user");
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  checkSession: async () => {
    try {
      // 1. Check local storage first for speed
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("resumematch_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          set({ user: parsed, isAuthenticated: true, isLoading: false });
        }
      }

      // 2. Fetch server session
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("resumematch_user", JSON.stringify(data.user));
        }
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else if (!localStorage.getItem("resumematch_user")) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (err) {
      set({ isLoading: false });
    }
  },
}));
