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
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "client",
  isAuthenticated: true,
  isLoading: false,
  loginAs: () => {},
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
