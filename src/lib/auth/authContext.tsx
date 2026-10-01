"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "client" | "admin" | "guest";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  driveFolderId?: string;
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
  // Defaulting to an authenticated client session for smooth local review
  const [user, setUser] = useState<AuthUser | null>({
    uid: "usr_mock_001",
    email: "yash@studioliving.com",
    displayName: "Yash Joshi",
    role: "client",
    driveFolderId: "drive_fld_sutra_001",
  });
  const [isLoading, setIsLoading] = useState(false);

  const loginAs = (targetRole: UserRole) => {
    setIsLoading(true);
    setTimeout(() => {
      if (targetRole === "guest") {
        setUser(null);
      } else {
        setUser({
          uid: targetRole === "admin" ? "usr_admin_001" : "usr_client_001",
          email: targetRole === "admin" ? "admin@sutrastudio.com" : "yash@studioliving.com",
          displayName: targetRole === "admin" ? "Studio Producer" : "Yash Joshi",
          role: targetRole,
          driveFolderId: "drive_fld_sutra_001",
        });
      }
      setIsLoading(false);
    }, 200);
  };

  const loginWithEmail = async (email: string, password: string, role: UserRole = "client"): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));
    const isAdmin = email.toLowerCase().includes("admin") || role === "admin";
    setUser({
      uid: isAdmin ? "usr_admin_001" : "usr_client_001",
      email: email || (isAdmin ? "admin@sutrastudio.com" : "client@sutrastudio.com"),
      displayName: isAdmin ? "Studio Producer" : email.split("@")[0] || "Client Member",
      role: isAdmin ? "admin" : "client",
      driveFolderId: "drive_fld_sutra_001",
    });
    setIsLoading(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));
    setUser({
      uid: "usr_google_client",
      email: "yash.google@sutrastudio.com",
      displayName: "Yash Joshi",
      role: "client",
      driveFolderId: "drive_fld_sutra_001",
    });
    setIsLoading(false);
    return true;
  };

  const registerWithEmail = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 450));
    setUser({
      uid: `usr_${Date.now()}`,
      email,
      displayName: name || "Studio Client",
      role: "client",
      driveFolderId: "drive_fld_sutra_001",
    });
    setIsLoading(false);
    return true;
  };

  const logout = () => {
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
