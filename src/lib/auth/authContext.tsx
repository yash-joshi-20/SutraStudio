"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "client" | "admin" | "guest";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  driveFolderId?: string;
  company?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginAs: (role: UserRole) => void;
  loginWithEmail: (email: string, password: string, role?: UserRole) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "client",
  isAuthenticated: true,
  isLoading: false,
  loginAs: () => {},
  loginWithEmail: async () => true,
  loginWithGoogle: async () => true,
  registerWithEmail: async () => true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const defaultUser: AuthUser = {
    uid: "usr_mock_001",
    email: "yash@studioliving.com",
    displayName: "Yash Joshi",
    role: "client",
    driveFolderId: "drive_fld_sutra_001",
  };

  const [user, setUser] = useState<AuthUser | null>(defaultUser);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to persist auth cookies for Next.js middleware
  const setAuthCookies = (authUser: AuthUser | null) => {
    if (typeof document === "undefined") return;
    if (authUser) {
      document.cookie = `role=${authUser.role}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `sutra_user=${encodeURIComponent(JSON.stringify(authUser))}; path=/; max-age=604800; SameSite=Lax`;
    } else {
      document.cookie = "role=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "sutra_user=; path=/; max-age=0; SameSite=Lax";
    }
  };

  // Synchronize state with client localStorage and cookies on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sutra_auth_user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
          setAuthCookies(parsed);
          return;
        }
      }
      setAuthCookies(defaultUser);
    } catch {}
  }, []);

  const loginAs = (targetRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      if (targetRole === "guest") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sutra_auth_user");
        }
        setAuthCookies(null);
        setUser(null);
      } else {
        const newUser: AuthUser = {
          uid: targetRole === "admin" ? "usr_admin_001" : "usr_client_001",
          email: targetRole === "admin" ? "admin@sutrastudio.com" : "yash@studioliving.com",
          displayName: targetRole === "admin" ? "Studio Producer" : "Yash Joshi",
          role: targetRole,
          driveFolderId: "drive_fld_sutra_001",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("sutra_auth_user", JSON.stringify(newUser));
        }
        setAuthCookies(newUser);
        setUser(newUser);
      }
      setIsLoading(false);
    }, 200);
  };

  const loginWithEmail = async (email: string, password: string, role: UserRole = "client"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 300));
    const isAdmin = email.toLowerCase().includes("admin") || role === "admin";
    const newUser: AuthUser = {
      uid: isAdmin ? "usr_admin_001" : "usr_client_001",
      email: email || (isAdmin ? "admin@sutrastudio.com" : "client@sutrastudio.com"),
      displayName: isAdmin ? "Studio Producer" : email.split("@")[0] || "Client Member",
      role: isAdmin ? "admin" : "client",
      driveFolderId: "drive_fld_sutra_001",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("sutra_auth_user", JSON.stringify(newUser));
    }
    setAuthCookies(newUser);
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 300));
    const newUser: AuthUser = {
      uid: "usr_google_client",
      email: "yash.google@sutrastudio.com",
      displayName: "Yash Joshi",
      role: "client",
      driveFolderId: "drive_fld_sutra_001",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("sutra_auth_user", JSON.stringify(newUser));
    }
    setAuthCookies(newUser);
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const registerWithEmail = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 350));
    const newUser: AuthUser = {
      uid: `usr_${Date.now()}`,
      email,
      displayName: name || "Studio Client",
      role: "client",
      driveFolderId: "drive_fld_sutra_001",
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("sutra_auth_user", JSON.stringify(newUser));
    }
    setAuthCookies(newUser);
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sutra_auth_user");
    }
    setAuthCookies(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || "guest",
        isAuthenticated: !!user,
        isLoading,
        loginAs,
        loginWithEmail,
        loginWithGoogle,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
