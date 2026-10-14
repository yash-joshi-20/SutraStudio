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
import { useRouter } from "next/navigation";
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
  loginAdmin: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
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
  let effectiveCode = code;
  if (!effectiveCode && typeof fallbackMessage === "string") {
    const match = fallbackMessage.match(/auth\/[a-z0-9-]+/i);
    if (match) effectiveCode = match[0].toLowerCase();
  }

  if (effectiveCode) {
    switch (effectiveCode) {
      case "auth/operation-not-allowed":
        return "Google Sign-In is not enabled yet in your Firebase Project. Please enable Google provider in Firebase Console > Authentication > Sign-in method, or sign in using your email and password.";
      case "auth/unauthorized-domain":
        return "Domain authorization notice: If developing locally, ensure you open http://localhost:3000 (not 127.0.0.1). Otherwise, add your current domain to Firebase Console > Authentication > Settings > Authorized Domains.";
      case "auth/popup-blocked":
        return "The Google sign-in popup was blocked by your browser. Please allow popups for this site or sign in using email and password.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Google sign-in was cancelled.";
      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using a different sign-in method. Please sign in using your email and password.";
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
        return "Too many sign-in attempts. Please wait a minute and try again.";
      case "auth/network-request-failed":
        return "Network connection issue. Please check your internet connection and try again.";
      case "auth/requires-recent-login":
        return "For security, please sign in again before making this change.";
      case "auth/user-disabled":
        return "This account has been suspended or disabled. Please contact the studio for assistance.";
      case "auth/invalid-api-key":
        return "Firebase API configuration is invalid. Please verify your project credentials.";
    }
  }

  if (fallbackMessage && fallbackMessage !== "[object Object]") {
    return (
      fallbackMessage
        .replace(/^Firebase:\s*(Error\s*)?(\(auth\/[a-z0-9-]+\)\.?\s*)?/i, "")
        .trim() || fallbackMessage
    );
  }
  return "Sign-in could not be completed. Please check your credentials and try again.";
}

function createAuthError(err: any): Error & { code?: string } {
  const code =
    err?.code ||
    (typeof err?.message === "string" ? err.message.match(/auth\/[a-z0-9-]+/i)?.[0]?.toLowerCase() : undefined);
  const message = friendlyAuthError(code, err?.message);
  const outErr = new Error(message) as Error & { code?: string };
  outErr.code = code;
  return outErr;
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
  const router = useRouter();
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

    // Single unified session synchronizer
    const syncSession = async (fbUser: any | null) => {
      try {
        // 1. Check the server-minted session cookie (the primary authority)
        const res = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });
        const data = await res.json().catch(() => ({ authenticated: false }));
        if (cancelled) return;

        if (data.authenticated && data.user) {
          const authUser: AuthUser = {
            uid: data.user.uid,
            email: data.user.email ?? fbUser?.email ?? "",
            displayName: data.user.name ?? fbUser?.displayName ?? "",
            photoURL: data.user.picture ?? fbUser?.photoURL ?? "",
            role: data.user.role ?? "client",
            emailVerified: Boolean(data.user.emailVerified ?? fbUser?.emailVerified),
            phone: data.profile?.phone ?? fbUser?.phoneNumber ?? "",
          };
          setUser(authUser);
          setRole(data.user.role ?? "client");
          setProfile(data.profile ?? null);
          setIsSessionStale(false);
          setIsLoading(false);
          return;
        }

        // 2. If server session is absent but Firebase client has a signed-in user
        if (fbUser) {
          const idTokenResult = await fbUser.getIdTokenResult();
          const isStaff =
            idTokenResult.claims.role === "admin" ||
            idTokenResult.claims.role === "superAdmin" ||
            Boolean(idTokenResult.claims.admin);
          const resolvedRole: UserRole = isStaff ? "admin" : "client";
          const idToken = await fbUser.getIdToken();

          let effectiveRole: UserRole = resolvedRole;
          try {
            if (isStaff) {
              await postJson("/api/auth/admin-login", { idToken, rememberMe: true });
              effectiveRole = "admin";
            } else {
              try {
                await establishServerSession(idToken, true);
              } catch (clientErr: any) {
                if (clientErr?.code === "USE_ADMIN_LOGIN") {
                  await postJson("/api/auth/admin-login", { idToken, rememberMe: true });
                  effectiveRole = "admin";
                } else {
                  throw clientErr;
                }
              }
            }

            const retry = await fetch("/api/auth/session", { cache: "no-store", credentials: "same-origin" });
            const retryData = await retry.json().catch(() => ({}));
            if (cancelled) return;
            if (retryData.authenticated && retryData.user) {
              const authUser: AuthUser = {
                uid: retryData.user.uid,
                email: retryData.user.email ?? fbUser.email ?? "",
                displayName: retryData.user.name ?? fbUser.displayName ?? "",
                photoURL: retryData.user.picture ?? fbUser.photoURL ?? "",
                role: retryData.user.role ?? effectiveRole,
                emailVerified: Boolean(retryData.user.emailVerified ?? fbUser.emailVerified),
                phone: retryData.profile?.phone ?? fbUser.phoneNumber ?? "",
              };
              setUser(authUser);
              setRole(retryData.user.role ?? effectiveRole);
              setProfile(retryData.profile ?? null);
              setIsSessionStale(false);
              setIsLoading(false);
              return;
            }
          } catch (restoreErr) {
            console.warn("[AuthContext] session sync restore failed:", restoreErr);
          }

          // Resilient fallback: Preserve verified Firebase client user so they are not wrongly kicked out
          const fallbackUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email ?? "",
            displayName: fbUser.displayName ?? (fbUser.email ?? "").split("@")[0],
            photoURL: fbUser.photoURL ?? "",
            role: resolvedRole,
            emailVerified: Boolean(fbUser.emailVerified),
            phone: fbUser.phoneNumber ?? "",
          };
          setUser(fallbackUser);
          setRole(resolvedRole);
          setIsSessionStale(false);
          setIsLoading(false);
          return;
        }

        // 3. Truly unauthenticated guest
        setUser(null);
        setProfile(null);
        setRole("guest");
        setIsSessionStale(false);
        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
          setRole("guest");
          setIsSessionStale(false);
          setIsLoading(false);
        }
      }
    };

    // Immediately trigger server session sync on mount
    void syncSession(null);

    // Listen to Firebase client auth changes
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), (fbUser) => {
      if (!cancelled) {
        void syncSession(fbUser);
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
      try {
        await applyPersistence(rememberMe);
      } catch (pErr) {
        console.warn("[Auth] Could not apply persistence:", pErr);
      }
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
        try {
          if (isStaff) {
            await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
          } else {
            try {
              await establishServerSession(token, rememberMe);
            } catch (clientErr: any) {
              if (clientErr?.code === "USE_ADMIN_LOGIN") {
                await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
                next.role = "admin";
                setRole("admin");
                setUser(next);
              } else {
                throw clientErr;
              }
            }
          }
        } catch (serverErr: any) {
          await signOut(getFirebaseAuth()).catch(() => {});
          setUser(null);
          setProfile(null);
          setRole("guest");
          throw new Error(serverErr?.message || "Sign-in was not accepted by the server.");
        }
        setIsSessionStale(false);
        void refreshProfile();
        return next;
      } catch (err: any) {
        throw createAuthError(err);
      }
    },
    [configurationError, establishServerSession, refreshProfile]
  );

  const loginWithGoogle = useCallback(
    async (rememberMe = true): Promise<AuthUser> => {
      if (configurationError) throw new Error(configurationError);
      try {
        await applyPersistence(rememberMe);
      } catch (pErr) {
        console.warn("[Auth] Could not apply persistence:", pErr);
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      provider.addScope("email");
      provider.addScope("profile");
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
        try {
          if (isStaff) {
            await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
          } else {
            try {
              await establishServerSession(token, rememberMe);
            } catch (clientErr: any) {
              // If allowlisted admin email attempts client login via Google, seamlessly route to admin-login
              if (clientErr?.code === "USE_ADMIN_LOGIN") {
                await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
                next.role = "admin";
                setRole("admin");
                setUser(next);
              } else {
                throw clientErr;
              }
            }
          }
        } catch (serverErr: any) {
          await signOut(getFirebaseAuth()).catch(() => {});
          setUser(null);
          setProfile(null);
          setRole("guest");
          throw new Error(serverErr?.message || "Sign-in was not accepted by the server.");
        }
        setIsSessionStale(false);
        void refreshProfile();
        return next;
      } catch (err: any) {
        throw createAuthError(err);
      }
    },
    [configurationError, establishServerSession, refreshProfile]
  );

  const loginAdmin = useCallback(
    async (email: string, password: string, rememberMe = true): Promise<AuthUser> => {
      if (configurationError) throw new Error(configurationError);
      try {
        await applyPersistence(rememberMe);
      } catch (pErr) {
        console.warn("[Auth] Could not apply persistence:", pErr);
      }
      setIsLoading(true);
      try {
        const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
        const token = await cred.user.getIdToken(true);
        const res = await postJson("/api/auth/admin-login", { idToken: token, rememberMe });
        const serverUser = (res?.user as any) || {};
        const adminUser: AuthUser = {
          uid: cred.user.uid,
          email: cred.user.email ?? email.trim(),
          displayName: serverUser.displayName || cred.user.displayName || "Studio Administrator",
          photoURL: cred.user.photoURL ?? "",
          role: "admin",
          emailVerified: true,
          phone: cred.user.phoneNumber ?? "",
        };
        setUser(adminUser);
        setRole("admin");
        setIsSessionStale(false);
        setIsLoading(false);
        void refreshProfile();
        return adminUser;
      } catch (err: any) {
        setIsLoading(false);
        throw createAuthError(err);
      }
    },
    [configurationError, refreshProfile]
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
        throw createAuthError(err);
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

      const nextRole: UserRole = (data?.user as any)?.role === "admin" ? "admin" : "client";
      const next = toAuthUser({ ...cred.user, displayName: name });
      next.role = nextRole;
      setUser(next);
      setRole(nextRole);
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
      router.replace("/login");
      router.refresh();
    }
  }, [configurationError, router]);

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
      router.replace("/login");
      router.refresh();
    }
  }, [configurationError, router]);

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
      loginAdmin,
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
      loginAdmin,
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