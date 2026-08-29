"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import type { User } from "@/lib/types";

const TOKEN_KEY = "kelana_token";

type AuthContextValue = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
};

const INITIAL_STATE: AuthState = { token: null, user: null, loading: true };

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (Date.now() >= payload.exp * 1000) return null;
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}

function readStoredAuth(): AuthState {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (!stored) return { token: null, user: null, loading: false };

  const decoded = decodeUser(stored);
  if (!decoded) {
    localStorage.removeItem(TOKEN_KEY);
    return { token: null, user: null, loading: false };
  }

  return { token: stored, user: decoded, loading: false };
}

async function parseErrorDetail(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return typeof data.detail === "string" ? data.detail : fallback;
  } catch {
    return fallback;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  useEffect(() => {
    // Reads localStorage (unavailable during SSR) to hydrate the session after
    // mount, so the server-rendered and first-client-render output match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(readStoredAuth());
  }, []);

  const applyToken = (newToken: string) => {
    const decoded = decodeUser(newToken);
    localStorage.setItem(TOKEN_KEY, newToken);
    setState({ token: newToken, user: decoded, loading: false });
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorDetail(res, "Failed to log in."));
    }

    const data = await res.json();
    applyToken(data.access_token);
  };

  const register = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error(await parseErrorDetail(res, "Failed to register."));
    }

    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ token: null, user: null, loading: false });
  };

  return (
    <AuthContext.Provider
      value={{ token: state.token, user: state.user, loading: state.loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
