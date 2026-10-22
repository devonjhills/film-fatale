"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/auth";

type AuthContextType = {
  user: SessionUser | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/me", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { user: SessionUser | null };
        return data.user;
      })
      .then((sessionUser) => setUser(sessionUser))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const signOut = () => {
    void fetch("/api/auth/signout", { method: "POST" })
      .catch(() => undefined)
      .finally(() => window.location.assign("/"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
