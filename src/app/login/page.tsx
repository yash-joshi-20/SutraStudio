"use client";

/**
 * Client sign-in + registration.
 *
 * Every credential check is performed by Firebase Auth. This page contains no
 * password comparison, no role decision, and no session fabrication: it calls
 * the real AuthContext actions, which exchange the Firebase ID token for a
 * server session cookie.
 *
 * When the Firebase client keys are absent the page renders the honest
 * "not configured" state instead of a form that cannot possibly work.
 */

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/authContext";
import { TextField, Checkbox, FormAlert } from "@/components/ui/FormField";
import { NotConfiguredState } from "@/components/ui/States";
import { ArrowLeft, CheckCircle2, Lock, PlugZap, ShieldCheck } from "lucide-react";

/** Only same-site, non-protocol-relative paths are ever honoured. */
function safeReturnTo(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/dashboard";
  return raw;
}

function ClientLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnTo(searchParams?.get("returnTo") ?? null);

  const {
    loginWithEmail,
    loginWithGoogle,
    register,
    requestPasswordReset,
    isAuthenticated,
    isLoading: authLoading,
    configurationError,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState("");

  // An already-signed-in visitor has no business on this page.
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      window.location.href = returnTo;
    }
  }, [isAuthenticated, authLoading, returnTo]);

  if (configurationError) {
    return (
      <Shell>
        <NotConfiguredState
          integration="Accounts and sign-in"
          missingKeys={configurationError
            .replace(/.*?Missing environment key\(s\): /, "")
            .replace(/\.$/, "")
            .split(", ")
            .filter((k) => /^[A-Z0-9_]+$/.test(k))}
          steps={[
            "Add the Firebase Web keys to .env.local and restart the dev server.",
            "Enable the Email/Password provider in Firebase → Authentication → Sign-in method.",
            "Create a Web app in Firebase and copy its config values.",
          ]}
        />
      </Shell>
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Enter your work email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      errs.email = "That does not look like a valid email address.";

    if (!password) errs.password = "Enter your password.";
    else if (mode === "register" && password.length < 8)
      errs.password = "Use at least 8 characters.";

    if (mode === "register") {
      if (!fullName.trim()) errs.fullName = "Tell us who we are working with.";
      if (!acceptedTerms) errs.terms = "Please accept the Terms of Service.";
      if (!acceptedPrivacy) errs.privacy = "Please accept the Privacy Policy.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === "signin") {
        await loginWithEmail(email, password, rememberMe);
        setSuccessMsg("Welcome back. Opening your workspace…");
        window.location.href = returnTo;
        return;
      }

      const { emailVerificationSent } = await register({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        companyName: companyName.trim(),
        password,
        acceptedTerms,
        acceptedPrivacy,
        marketingOptIn,
        rememberMe,
        returnTo,
      });

      setSuccessMsg(
        emailVerificationSent
          ? "Account created. Check your inbox to verify your email, then sign in."
          : "Account created. Opening your workspace…"
      );
      if (emailVerificationSent) {
        setMode("signin");
        setPassword("");
      } else {
        window.location.href = returnTo;
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await loginWithGoogle(true);
      window.location.href = returnTo;
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Google sign-in was cancelled or unavailable. Please use email and password."
      );
    } finally {
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

  function switchMode(next: "signin" | "register") {
    setMode(next);
    setErrorMsg("");
    setSuccessMsg("");
    setFieldErrors({});
  }

  const busy = loading || authLoading;

  return (
    <Shell>
      {/*
        The admin gateway is deliberately NOT linked from here. It stays
        undiscoverable to anonymous visitors; the real protection is the
        `role: "admin"` custom claim, which is checked server-side.
      */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[#64748B] transition-colors hover:text-[#5C3A1E]"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to Studio</span>
        </Link>
      </div>

      <div className="space-y-3 text-center">
        <div className="flex justify-center pb-1">
          <SutraLogo variant="horizontal" size="lg" href="/" />
        </div>
        <h2 className="pt-2 font-serif text-2xl font-bold tracking-tight text-[#0F172A] sm:text-3xl">
          {mode === "signin" ? "Client Workspace" : "Create Studio Account"}
        </h2>
        <p className="mx-auto max-w-sm text-xs leading-relaxed text-[#64748B]">
          {mode === "signin"
            ? "Access your live creative commissions, render passes, deliverables and media storage."
            : "Register to commission services, track 3D and video pipelines, and activate your free trial."}
        </p>
      </div>

      <div className="mt-8 space-y-6 rounded-3xl border border-[#EADFCB] bg-[#FFFDF9] px-6 py-8 shadow-warm sm:px-10">
        <div
          role="tablist"
          aria-label="Sign in or register"
          className="flex rounded-2xl border border-[#EADFCB] bg-[#F8F5EF] p-1"
        >
          {(["signin", "register"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={mode === tab}
              onClick={() => switchMode(tab)}
              className={`min-h-[40px] flex-1 cursor-pointer rounded-xl text-xs font-semibold transition-all ${
                mode === tab
                  ? "border border-[#EADFCB]/80 bg-[#FFFDF9] text-[#5C3A1E] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab === "signin" ? "Sign In" : "Register New Workspace"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] px-4 py-2.5 text-xs font-semibold text-[#0F172A] shadow-2xs transition-all hover:border-[#D4A35A] hover:bg-[#F8F5EF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google Workspace</span>
        </button>

        <div className="relative flex items-center py-1">
          <div className="grow border-t border-[#EADFCB]" />
          <span className="mx-4 shrink-0 text-[11px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Or with email
          </span>
          <div className="grow border-t border-[#EADFCB]" />
        </div>

        {errorMsg ? <FormAlert tone="error" message={errorMsg} /> : null}
        {successMsg ? <FormAlert tone="success" message={successMsg} /> : null}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === "register" ? (
            <>
              <TextField
                label="Full Name"
                required
                value={fullName}
                onChange={setFullName}
                placeholder="e.g. Yash Joshi"
                autoComplete="name"
                error={fieldErrors.fullName}
                disabled={busy}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Company / Studio"
                  optional
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder="Company Name"
                  autoComplete="organization"
                  disabled={busy}
                />
                <TextField
                  label="Mobile Number"
                  optional
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  disabled={busy}
                />
              </div>
            </>
          ) : null}

          <TextField
            label="Work Email Address"
            required
            type="email"
            inputMode="email"
            value={email}
            onChange={setEmail}
            placeholder="you@company.com"
            autoComplete="email"
            error={fieldErrors.email}
            disabled={busy}
          />

          <div>
            <TextField
              label="Password"
              required
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••••••"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              error={fieldErrors.password}
              hint={mode === "register" ? "At least 8 characters." : undefined}
              disabled={busy}
            />
            {mode === "signin" ? (
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetNotice("");
                  setForgotOpen(true);
                }}
                className="mt-1.5 cursor-pointer text-[11px] font-medium text-[#5C3A1E] hover:underline"
              >
                Forgot password?
              </button>
            ) : null}
          </div>

          {mode === "signin" ? (
            <Checkbox
              label="Keep me signed in for 30 days"
              checked={rememberMe}
              onChange={setRememberMe}
              disabled={busy}
            />
          ) : (
            <div className="space-y-3 pt-1">
              <Checkbox
                label="I accept the Terms of Service"
                required
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
                error={fieldErrors.terms}
                disabled={busy}
              />
              <Checkbox
                label="I accept the Privacy Policy and consent to data processing"
                required
                checked={acceptedPrivacy}
                onChange={setAcceptedPrivacy}
                error={fieldErrors.privacy}
                disabled={busy}
              />
              <Checkbox
                label="Send me occasional studio updates"
                checked={marketingOptIn}
                onChange={setMarketingOptIn}
                hint="You can change this any time in your profile."
                disabled={busy}
              />
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              isLoading={busy}
              withArrow
            >
              {mode === "signin" ? "Enter Client Workspace" : "Complete Registration"}
            </Button>
          </div>
        </form>

        <p className="flex items-start gap-2 text-[11px] leading-relaxed text-[#94A3B8]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Credentials are verified by Firebase Authentication. Sutra Studio never sees or stores your
          password.
        </p>
      </div>

      <Modal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} title="Reset Password">
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
                className="mt-2 w-full"
                onClick={() => setForgotOpen(false)}
              >
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} noValidate className="space-y-4">
              <p className="text-xs leading-relaxed text-[#64748B]">
                Enter your registered work email address. If an account exists we will send a secure
                link to reset your passkey.
              </p>
              <TextField
                label="Email Address"
                required
                type="email"
                inputMode="email"
                value={resetEmail}
                onChange={setResetEmail}
                placeholder="you@company.com"
                autoComplete="email"
                disabled={resetLoading}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => setForgotOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" isLoading={resetLoading}>
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between">
      <Navbar />
      <main className="relative flex-1 flex flex-col justify-center overflow-hidden py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 opacity-[0.035]">
          <LotusSymbol className="w-[850px] h-[850px]" color="gold" />
        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <PlugZap className="h-4 w-4" aria-hidden="true" />
              <span>Preparing sign-in…</span>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ClientLoginForm />
    </Suspense>
  );
}
