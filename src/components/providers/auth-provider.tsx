"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { AccessUser } from "@/lib/access-auth";

type AuthContextType = {
  user: AccessUser | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AccessUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/me", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return null;
        const data = (await response.json()) as { user: AccessUser | null };
        return data.user;
      })
      .then((accessUser) => setUser(accessUser))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name !== "AbortError") {
          setUser(null);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const signOut = () => {
    window.location.assign("/cdn-cgi/access/logout");
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
