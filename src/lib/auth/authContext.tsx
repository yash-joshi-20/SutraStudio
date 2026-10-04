"use client";

/**
 * SUTRA STUDIO — Browser Auth Context
 *
 * Uses the real Firebase Web SDK. The browser proves the credential, the
 * server mints the session cookie, and the cookie is the only thing the
 * server trusts afterwards.
 *
 * Deliberately removed from this file:
 *   • `document.cookie = 'sutra_user=...'` identity writing (forgeable)
 *   • localStorage as the source of truth for "am I signed in"
 *   • `loginWithGoogle()` posting fake credentials to a fake endpoint
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateAuthProfile,
  reload,
  onIdTokenChanged,
  signOut,
  EmailAuthProvider,
} from "firebase/auth";
import {
  applyPersistence,
  firebaseClientConfigured,
  getFirebaseAuth,
  FIREBASE_NOT_CONFIGURED,
} from "@/lib/firebase/client";

export type UserRole = "client" | "admin" | "guest";

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  emailVerified: boolean;
  phone: string;
}

export interface ProfileSnapshot {
  displayName: string;
  phone: string;
  companyName: string;
  industry: string;
  website: string;
  locale: string;
  timezone: string;
  brandColors: string[];
  socialLinks: Record<string, string>;
  referenceLinks: string[];
  billing: {
    legalName: string;
    gstin: string;
    gstEnabled: boolean;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  gstEnabled: boolean;
  defaultBrandKitId: string;
  driveFolderId: string;
  onboardingComplete: boolean;
  profileCompleteness: number;
  marketingOptIn: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: ProfileSnapshot | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True when the server session cookie is gone even though Firebase still has a user. */
  isSessionStale: boolean;
  configurationError: string;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<{ user: AuthUser; emailVerificationSent: boolean }>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  refreshProfile: () => Promise<ProfileSnapshot | null>;
  requestPasswordReset: (email: string) => Promise<string>;
  resendVerification: () => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<string>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<string>;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  companyName: string;
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  marketingOptIn: boolean;
  rememberMe: boolean;
  returnTo?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: "Unexpected server response." }));
  if (!res.ok) {
    const err = new Error(data.error ?? "Something went wrong.") as Error & {
      fieldErrors?: Record<string, string>;
      code?: string;
      missingKeys?: string[];
    };
    err.fieldErrors = data.fieldErrors;
    err.code = data.code;
    err.missingKeys = data.missingKeys;
    throw err;
  }
  return data as Record<string, unknown>;
}

function friendlyAuthError(code?: string, fallbackMessage?: string): string {
  if (code) {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "That email and password combination is not correct.";
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/email-already-in-use":
        return "An account with that email already exists. Try signing in instead.";
      case "auth/weak-password":
        return "Choose a stronger password — at least 8 characters with a letter and a number.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a minute and try again.";
      case "auth/network-request-failed":
        return "Network problem. Check your connection and try again.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Google sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Your browser blocked the sign-in popup. Allow popups and try again.";
      case "auth/account-exists-with-different-credential":
        return "That email is already registered with a different sign-in method.";
      case "auth/requires-recent-login":
        return "For security, please sign in again before making this change.";
    }
  }
  return fallbackMessage && fallbackMessage !== "[object Object]"
    ? fallbackMessage
    : "Sign-in could not be completed. Please check your credentials and try again.";
}

function toAuthUser(fbUser: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
}): AuthUser {
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? "",
    displayName: fbUser.displayName ?? "",
    photoURL: fbUser.photoURL ?? "",
    role: "client",
    emailVerified: fbUser.emailVerified,
    phone: fbUser.phoneNumber ?? "",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionStale, setIsSessionStale] = useState(false);
  const [role, setRole] = useState<UserRole>("guest");
  const bootstrapped = useRef(false);

  const configurationError = firebaseClientConfigured() ? "" : FIREBASE_NOT_CONFIGURED;

  /* -------------------- server session helpers -------------------- */

  const establishServerSession = useCallback(async (idToken: string, rememberMe: boolean) => {
    await postJson("/api/auth/client-login", { idToken, rememberMe });
  }, []);

  const refreshProfile = useCallback(async (): Promise<ProfileSnapshot | null> => {
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
      const data = await res.json();
      if (data.authenticated) {
        setProfile(data.profile ?? null);
        setRole(data.user?.role ?? "client");
        return (data.profile ?? null) as ProfileSnapshot | null;
      }
      setProfile(null);
      setIsSessionStale(Boolean(user));
      return null;
    } catch {
      return null;
    }
  }, [user]);

  /* -------------------- bootstrap / session restore -------------------- */

  useEffect(() => {
    if (configurationError) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (fbUser) => {
      if (cancelled) return;
      if (!fbUser) {
        setUser(null);
        setProfile(null);
        setRole("guest");
        setIsLoading(false);
        return;
      }
      try {
        const idTokenResult = await fbUser.getIdTokenResult();
        const isStaff =
          idTokenResult.claims.role === "admin" ||
          idTokenResult.claims.role === "superAdmin" ||
          Boolean(idTokenResult.claims.admin);
        const resolvedRole: UserRole = isStaff ? "admin" : "client";

        setUser({
          uid: fbUser.uid,
          email: fbUser.email ?? "",
          displayName: fbUser.displayName ?? "",
          photoURL: fbUser.photoURL ?? "",
          role: resolvedRole,
          emailVerified: fbUser.emailVerified,
          phone: fbUser.phoneNumber ?? "",
        });
        setRole(resolvedRole);

        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
        const data = await res.json();
        if (data.authenticated) {
          setProfile(data.profile ?? null);
          const serverRole = data.user?.role ?? resolvedRole;
          setRole(serverRole);
          setUser((prev) => (prev ? { ...prev, role: serverRole } : null));
          setIsSessionStale(false);
        } else {
          // Firebase knows the user but the server cookie is absent. Re-establish it.
          const idToken = await fbUser.getIdToken();
          if (isStaff) {
            await postJson("/api/auth/admin-login", { idToken, rememberMe: true }).catch(() => {});
          } else {
            await establishServerSession(idToken, true).catch(() => {});
          }
          setRole(resolvedRole);
          setIsSessionStale(false);
          const retry = await fetch("/api/auth/session", { cache: "no-store" });
          const retryData = await retry.json();
          setProfile(retryData.profile ?? null);
          if (retryData.user?.role) {
            setRole(retryData.user.role);
            setUser((prev) => (prev ? { ...prev, role: retryData.user.role } : null));
          }
        }
      } catch {
        setIsSessionStale(true);
      } finally {
        if (!cancelled) {
          bootstrapped.current = true;
          setIsLoading(false);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [configurationError, establishServerSession]);

  /* -------------------- actions -------------------- */

  const loginWithEmail = useCallback(
    async (email: string, password: string, rememberMe = false): Promise<AuthUser> => {
      if (configurationError) throw new Error(configurationError);
      await applyPersistence(rememberMe);
      try {
        const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        const idTokenResult = await cred.user.getIdTokenResult();
        const isStaff =
          idTokenResult.claims.role === "admin" ||
          idTokenResult.claims.role === "superAdmin" ||
          Boolean(idTokenResult.claims.admin);
        const resolvedRole: UserRole = isStaff ? "admin" : "client";

        const next: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email ?? "",
          displayName: cred.user.displayName ?? "",
          photoURL: cred.user.photoURL ?? "",
          role: resolvedRole,
          emailVerified: cred.user.emailVerified,
          phone: cred.user.phoneNumber ?? "",
        };

        setUser(next);
        setRole(resolvedRole);
        const token = await cred.user.getIdToken();
        if (isStaff) {
          await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
        } else {
          await establishServerSession(token, rememberMe);
        }
        setIsSessionStale(false);
        void refreshProfile();
        return next;
      } catch (err: any) {
        throw new Error(friendlyAuthError(err?.code, err?.message));
      }
    },
    [configurationError, establishServerSession, refreshProfile]
  );

  const loginWithGoogle = useCallback(
    async (rememberMe = true): Promise<AuthUser> => {
      if (configurationError) throw new Error(configurationError);
      await applyPersistence(rememberMe);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        const cred = await signInWithPopup(getFirebaseAuth(), provider);
        const idTokenResult = await cred.user.getIdTokenResult();
        const isStaff =
          idTokenResult.claims.role === "admin" ||
          idTokenResult.claims.role === "superAdmin" ||
          Boolean(idTokenResult.claims.admin);
        const resolvedRole: UserRole = isStaff ? "admin" : "client";

        const next: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email ?? "",
          displayName: cred.user.displayName ?? "",
          photoURL: cred.user.photoURL ?? "",
          role: resolvedRole,
          emailVerified: cred.user.emailVerified,
          phone: cred.user.phoneNumber ?? "",
        };

        setUser(next);
        setRole(resolvedRole);
        const token = await cred.user.getIdToken();
        if (isStaff) {
          await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
        } else {
          await establishServerSession(token, rememberMe);
        }
        setIsSessionStale(false);
        void refreshProfile();
        return next;
      } catch (err: any) {
        throw new Error(friendlyAuthError(err?.code, err?.message));
      }
    },
    [configurationError, establishServerSession, refreshProfile]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      if (configurationError) throw new Error(configurationError);
      await applyPersistence(input.rememberMe);
      let cred;
      try {
        cred = await createUserWithEmailAndPassword(
          getFirebaseAuth(),
          input.email.trim(),
          input.password
        );
      } catch (err: any) {
        throw new Error(friendlyAuthError(err?.code, err?.message));
      }

      const email = input.email.trim();
      const name = input.name.trim();
      await updateAuthProfile(cred.user, { displayName: name });
      if (input.phone) {
        // Phone is stored on the profile document; Firebase phone linking is
        // intentionally not forced here so sign-up stays one step.
        void input.phone;
      }

      const data = await postJson("/api/auth/register", {
        idToken: await cred.user.getIdToken(),
        name,
        email,
        phone: input.phone,
        companyName: input.companyName,
        acceptedTerms: input.acceptedTerms,
        acceptedPrivacy: input.acceptedPrivacy,
        marketingOptIn: input.marketingOptIn,
        rememberMe: input.rememberMe,
        returnTo: input.returnTo,
      });

      let verificationSent = false;
      try {
        await sendEmailVerification(cred.user);
        verificationSent = true;
      } catch {
        verificationSent = false;
      }

      const next = toAuthUser({ ...cred.user, displayName: name });
      setUser(next);
      setRole("client");
      void refreshProfile();
      return { user: next, emailVerificationSent: verificationSent, ...data };
    },
    [configurationError, refreshProfile]
  );

  const logout = useCallback(async () => {
    if (configurationError) return;
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // Network failure must never trap the user in the app.
    }
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // Ignore — local state is cleared regardless.
    }
    setUser(null);
    setProfile(null);
    setRole("guest");
    setIsSessionStale(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [configurationError]);

  /** Signs out of this device AND revokes every other refresh token. */
  const logoutEverywhere = useCallback(async () => {
    if (configurationError) return;
    try {
      await fetch("/api/auth/logout", { method: "DELETE", credentials: "same-origin" });
    } catch {
      // ignored
    }
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // ignored
    }
    setUser(null);
    setProfile(null);
    setRole("guest");
    setIsSessionStale(false);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, [configurationError]);

  const requestPasswordReset = useCallback(
    async (email: string): Promise<string> => {
      if (configurationError) throw new Error(configurationError);
      try {
        await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      } catch (err) {
        const code = (err as { code?: string })?.code ?? "";
        if (code === "auth/user-not-found") {
          // Neutral message — do not disclose account existence.
          return "If an account exists for that email, a reset link is on its way.";
        }
        throw new Error(friendlyAuthError(code));
      }
      return "If an account exists for that email, a reset link is on its way. Check your spam folder too.";
    },
    [configurationError]
  );

  const resendVerification = useCallback(async (): Promise<string> => {
    if (configurationError) throw new Error(configurationError);
    const auth = getFirebaseAuth();
    if (!auth.currentUser) throw new Error("Please sign in again to resend the verification email.");
    await sendEmailVerification(auth.currentUser);
    await reload(auth.currentUser);
    return "Verification email sent. Please check your inbox.";
  }, [configurationError]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<string> => {
      if (configurationError) throw new Error(configurationError);
      const auth = getFirebaseAuth();
      const fbUser = auth.currentUser;
      if (!fbUser?.email) throw new Error("Please sign in again before changing your password.");

      // Re-authenticate to prove the current password.
      const cred = await signInWithEmailAndPassword(auth, fbUser.email, currentPassword).catch(() => {
        throw new Error("Your current password is not correct.");
      });

      const data = await postJson("/api/auth/change-password", {
        mode: "change",
        currentIdToken: await cred.user.getIdToken(),
        newPassword,
      });
      await logout();
      return String(data.message ?? "Password updated.");
    },
    [configurationError, logout]
  );

  const changeEmail = useCallback(
    async (newEmail: string, currentPassword: string): Promise<string> => {
      if (configurationError) throw new Error(configurationError);
      const auth = getFirebaseAuth();
      const fbUser = auth.currentUser;
      if (!fbUser?.email) throw new Error("Please sign in again before changing your email.");

      const cred = await signInWithEmailAndPassword(auth, fbUser.email, currentPassword).catch(() => {
        throw new Error("Your current password is not correct.");
      });

      const data = await postJson("/api/auth/change-email", {
        newEmail,
        currentIdToken: await cred.user.getIdToken(),
      });
      await logout();
      return String(data.message ?? "Verification email sent.");
    },
    [configurationError, logout]
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      profile,
      role,
      isAuthenticated: Boolean(user),
      isLoading,
      isSessionStale,
      configurationError,
      loginWithEmail,
      loginWithGoogle,
      register,
      logout,
      logoutEverywhere,
      refreshProfile,
      requestPasswordReset,
      resendVerification,
      changePassword,
      changeEmail,
    }),
    [
      user,
      profile,
      role,
      isLoading,
      isSessionStale,
      configurationError,
      loginWithEmail,
      loginWithGoogle,
      register,
      logout,
      logoutEverywhere,
      refreshProfile,
      requestPasswordReset,
      resendVerification,
      changePassword,
      changeEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>.");
  }
  return ctx;
}

export { EmailAuthProvider };