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
  // Session initialization with localStorage persistence and route-aware persona
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sutra_auth_user");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
      // If direct navigation to /admin or ?role=admin in development
      const isDirectAdmin =
        window.location.pathname.startsWith("/admin") ||
        window.location.search.includes("role=admin");
      if (isDirectAdmin) {
        const adminPersona: AuthUser = {
          uid: "usr_admin_001",
          email: "admin@sutrastudio.com",
          displayName: "Studio Producer",
          role: "admin",
          driveFolderId: "drive_fld_sutra_001",
        };
        try {
          localStorage.setItem("sutra_auth_user", JSON.stringify(adminPersona));
        } catch {}
        return adminPersona;
      }
    }
    return {
      uid: "usr_mock_001",
      email: "yash@studioliving.com",
      displayName: "Yash Joshi",
      role: "client",
      driveFolderId: "drive_fld_sutra_001",
    };
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginAs = (targetRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      if (targetRole === "guest") {
        if (typeof window !== "undefined") {
          localStorage.removeItem("sutra_auth_user");
        }
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
        setUser(newUser);
      }
      setIsLoading(false);
    }, 200);
  };

  const loginWithEmail = async (email: string, password: string, role: UserRole = "client"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));
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
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));
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
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const registerWithEmail = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 450));
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
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sutra_auth_user");
    }
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
