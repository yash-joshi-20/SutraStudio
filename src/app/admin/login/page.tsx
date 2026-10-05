"use client";

/**
 * Executive Terminal Gateway — admin sign-in.
 *
 * Two independent checks must BOTH pass, and both are enforced server-side by
 * /api/auth/admin-login:
 *   1. Firebase verifies the password.
 *   2. That uid carries the `role: "admin"` custom claim.
 *
 * Knowing a valid password is not enough. There is no email-pattern shortcut,
 * and no client-side role decision: this page only forwards a Firebase ID token
 * and renders whatever the server decides.
 */

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { TextField, FormAlert } from "@/components/ui/FormField";
import { NotConfiguredState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth/authContext";
import { Modal } from "@/components/ui/Modal";
import { getFirebaseAuth, firebaseClientConfigured, applyPersistence } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ArrowLeft, ArrowRight, ShieldCheck, Terminal, CheckCircle2 } from "lucide-react";

const FIREBASE_NOT_CONFIGURED =
  "Firebase is not configured. Missing environment key(s): NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID.";

function safeReturnTo(raw: string | null): string {
  if (!raw) return "/admin";
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) return "/admin";
  if (
    trimmed === "/admin/login" ||
    trimmed === "/login" ||
    trimmed === "/register" ||
    trimmed.startsWith("/admin/login?") ||
    trimmed.startsWith("/login?") ||
    trimmed.startsWith("/register?")
  ) {
    return "/admin";
  }
  return trimmed.startsWith("/admin") ? trimmed : "/admin";
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawParam =
    searchParams?.get("returnTo") ||
    searchParams?.get("redirect") ||
    searchParams?.get("next") ||
    searchParams?.get("callbackUrl") ||
    null;
  const returnTo = safeReturnTo(rawParam);

  const { isAuthenticated, role, isLoading: authLoading, requestPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState("");

  const configured = firebaseClientConfigured();

  useEffect(() => {
    if (configured) void applyPersistence(true);
  }, [configured]);

  // Already signed in as admin - redirect immediately
  useEffect(() => {
    if (isAuthenticated && !authLoading && role === "admin") {
      window.location.replace(returnTo);
    }
  }, [isAuthenticated, authLoading, role, returnTo]);

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    if (!email.trim() || !password) {
      setErrorMsg("Enter both your administrator email and passkey.");
      return;
    }

    setLoading(true);
    try {
      // 1. Prove the password with Firebase.
      const cred = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);

      // 2. Hand the freshly-verified ID token to the server
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          idToken: await cred.user.getIdToken(),
          rememberMe: true,
          returnTo,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Sign out locally so a rejected admin does not keep a live Firebase session
        await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(
          () => undefined
        );
        setErrorMsg(
          typeof data.error === "string" && data.error
            ? data.error
            : "Administrative clearance required."
        );
        setLoading(false);
        return;
      }

      // The server set an httpOnly session cookie carrying the admin role claim.
      window.location.replace(returnTo);
    } catch (err) {
      const code = (err as { code?: string })?.code ?? "";
      setErrorMsg(
        code === "auth/invalid-credential"
          ? "Those sign-in details were not recognised."
          : code === "auth/too-many-requests"
            ? "Too many attempts. Please wait a moment and try again."
            : err instanceof Error && err.message
              ? err.message
              : "Access denied: administrative clearance required."
      );
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setResetNotice("");
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      const message = await requestPasswordReset(resetEmail.trim());
      setResetNotice(message);
    } catch (err) {
      setResetNotice(
        err instanceof Error
          ? err.message
          : "We could not send a reset email. Please try again shortly."
      );
    } finally {
      setResetLoading(false);
    }
  }

  if (!configured) {
    return (
      <Shell>
        <NotConfiguredState
          integration="Administrative access"
          missingKeys={[
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            "FIREBASE_PRIVATE_KEY",
            "FIREBASE_CLIENT_EMAIL",
          ]}
          steps={[
            "Add the Firebase Web keys and the Admin service-account keys to .env.local.",
            "Grant the admin claim to your account: npx tsx scripts/set-admin-claim.ts <uid>.",
          ]}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] transition-colors hover:text-[#5C3A1E]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to Studio</span>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5C3A1E] transition-colors hover:text-[#D4A35A]"
        >
          <span>Client Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>

      <div className="space-y-3 text-center">
        <div className="flex justify-center pb-1">
          <SutraLogo variant="horizontal" size="lg" href="/" />
        </div>
        <div className="pt-1">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-white shadow-xs">
            <Terminal className="w-3 h-3 text-[#D4A35A]" aria-hidden="true" />
            <span>Executive Terminal Gateway</span>
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
          Administrative Clearance
        </h2>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#64748B]">
          Restricted to Studio Administrators and Executive Producers. A valid client account cannot
          authenticate here.
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] px-6 py-8 shadow-warm sm:px-10">
        {errorMsg ? <FormAlert tone="error" message={errorMsg} /> : null}

        <form onSubmit={handleAdminSubmit} noValidate className="space-y-4">
          <TextField
            label="Admin Email Address"
            required
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            placeholder="yashjoshi20@zohomail.in"
            autoComplete="username"
            disabled={loading}
          />

          <div>
            <TextField
              label="Security Passkey"
              required
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => {
                setResetEmail(email);
                setResetNotice("");
                setForgotOpen(true);
              }}
              className="mt-1.5 cursor-pointer text-[11px] font-medium text-[#5C3A1E] hover:underline"
            >
              Forgot passkey?
            </button>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center !bg-[#171717] !text-[#FAF9F5] hover:!bg-[#262626] border-transparent"
              isLoading={loading}
              leftIcon={<ShieldCheck className="w-4 h-4 text-[#D4A35A]" />}
            >
              Authorize &amp; Open Terminal
            </Button>
          </div>
        </form>

        <div className="border-t border-[#EADFCB]/60 pt-4 text-center">
          <p className="text-[11px] leading-relaxed text-[#94A3B8]">
            Clearance is granted only by the <code>role: &quot;admin&quot;</code> custom claim on your
            Firebase account. It cannot be self-assigned from this page.
          </p>
        </div>
      </div>

      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Passkey">
        <div className="space-y-4 pt-1">
          {resetNotice ? (
            <div className="space-y-3 py-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#BBF7D0] bg-[#F0FDF4] text-[#16A34A]">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#0F172A]">Check your inbox</h4>
              <p className="text-xs leading-relaxed text-[#64748B] break-anywhere">{resetNotice}</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2 w-full !bg-[#171717] !text-[#FAF9F5] hover:!bg-[#262626] border-transparent"
                onClick={() => setForgotOpen(false)}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} noValidate className="space-y-4">
              <p className="text-xs leading-relaxed text-[#64748B]">
                Enter your administrator email address. We will send a secure link to reset your passkey.
              </p>
              <TextField
                label="Email Address"
                required
                type="email"
                inputMode="email"
                value={resetEmail}
                onChange={setResetEmail}
                placeholder="Enter your email"
                disabled={resetLoading}
              />
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full justify-center !bg-[#171717] !text-[#FAF9F5] hover:!bg-[#262626] border-transparent"
                isLoading={resetLoading}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </Modal>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-[#F8F5EF] py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-[0.025]">
        <LotusSymbol className="w-[850px] h-[850px]" color="watermark-dark" />
      </div>
      <div className="px-4 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-[#F8F5EF]">
          <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
