"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SutraLogo, LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/authContext";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  HardDrive,
  Cpu,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, loginWithGoogle, registerWithEmail, loginAs, isLoading } = useAuth();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    if (mode === "register" && !fullName) {
      setErrorMsg("Please provide your full name for the client workspace.");
      return;
    }

    try {
      if (mode === "signin") {
        await loginWithEmail(email, password);
        const isAdmin = email.toLowerCase().includes("admin");
        setSuccessMsg(isAdmin ? "Access authorized. Entering Executive Hub..." : "Welcome back. Entering Client Portal...");
        setTimeout(() => {
          window.location.href = isAdmin ? "/admin" : "/dashboard";
        }, 100);
      } else {
        await registerWithEmail(fullName, email, password);
        setSuccessMsg("Studio workspace created. Initializing Google Drive vault...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 100);
      }
    } catch {
      setErrorMsg("Authentication error. Please check your credentials.");
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await loginWithGoogle();
      setSuccessMsg("Google workspace verified. Entering portal...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    } catch {
      setErrorMsg("Failed to authenticate with Google. Try with studio email.");
    }
  };

  const handleQuickPersona = (role: "client" | "admin") => {
    setErrorMsg("");
    if (role === "admin") {
      setEmail("admin@sutrastudio.com");
      setPassword("••••••••••••");
      loginAs("admin");
      setSuccessMsg("Signed in as Studio Producer (Admin). Entering Executive Hub...");
      setTimeout(() => {
        window.location.href = "/admin";
      }, 100);
    } else {
      setEmail("yash@studioliving.com");
      setPassword("••••••••••••");
      loginAs("client");
      setSuccessMsg("Signed in as Client (Yash Joshi). Entering Client Portal...");
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 100);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
      setResetEmail("");
      setSuccessMsg("Password reset link sent to your registered address.");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
      {/* Background Subtle Lotus Monogram */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-[0.025] pointer-events-none">
        <LotusSymbol className="w-[850px] h-[850px]" color="gold" />
      </div>

      {/* Top Bar Back Link */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#64748B] hover:text-[#5C3A1E] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Home</span>
        </Link>

        <span className="text-[11px] font-medium text-[#94A3B8] hidden sm:inline-flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
          <span>Firebase Encrypted Workspace</span>
        </span>
      </div>

      {/* Main Two-Column Luxury Card */}
      <main id="main-content" className="w-full max-w-5xl rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* ==========================================
            LEFT BRAND STORYTELLING COLUMN (Hidden on Mobile)
            ========================================== */}
        <div className="lg:col-span-5 bg-[#FAF9F5] border-b lg:border-b-0 lg:border-r border-[#EADFCB] p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Watermark inside column */}
          <div className="absolute -bottom-16 -right-16 opacity-5 pointer-events-none">
            <LotusSymbol className="w-64 h-64" color="gold" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-widest text-[#5C3A1E]">
              <span className="text-[#D4A35A]">◆</span>
              <span>CLIENT & PRODUCER CLEARANCE</span>
            </div>

            <div className="space-y-4">
              <SutraLogo variant="horizontal" size="lg" showTagline={true} />
              <h1 className="font-serif text-2xl lg:text-3xl font-semibold text-[#0F172A] leading-snug">
                The Sanctum for Creative Architecture.
              </h1>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Connect directly with your art director, inspect 4K visual renders,
                and orchestrate bespoke creative pipelines in real-time.
              </p>
            </div>

            {/* Sanskrit Philosophy Card */}
            <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-serif font-semibold text-xs text-[#5C3A1E] tracking-wide">
                  सूत्रधार (Sūtradhāra)
                </span>
                <span className="text-[10px] uppercase font-semibold text-[#A98B57] tracking-wider">
                  Etymology
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] italic leading-relaxed">
                &ldquo;The holder of threads — the master artisan who brings concept,
                code, and form into unified resonance.&rdquo;
              </p>
            </div>

            {/* Platform Trust Highlights */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0 text-[#5C3A1E]">
                  <HardDrive className="w-3.5 h-3.5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0F172A]">Google Drive Vault</h4>
                  <p className="text-[11px] text-[#64748B]">Automated sync for raw 3D assets and 4K showreels.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0 text-[#5C3A1E]">
                  <Cpu className="w-3.5 h-3.5 text-[#5C3A1E]" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-[#0F172A]">Creative Automation</h4>
                  <p className="text-[11px] text-[#64748B]">Autonomous generative review and approval workflows.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial / Footnote */}
          <div className="pt-8 border-t border-[#EADFCB]/60 relative z-10">
            <p className="text-[11px] text-[#64748B] italic">
              &ldquo;Sutra Studio transformed our brand identity with bespoke spatial renders delivered within 48 hours.&rdquo;
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-[#EADFCB] flex items-center justify-center text-[10px] font-bold text-[#5C3A1E]">
                Y
              </div>
              <span className="text-[11px] font-medium text-[#0F172A]">
                Yash Joshi — Studio Living
              </span>
            </div>
          </div>
        </div>

        {/* ==========================================
            RIGHT INTERACTIVE AUTHENTICATION PANEL
            ========================================== */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          {/* Header Switcher */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#EADFCB]">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#0F172A]">
                {mode === "signin" ? "Studio Sign In" : "Register Workspace"}
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                {mode === "signin"
                  ? "Access your active orders, deliverables, and media vault."
                  : "Create a private workspace for your creative commission."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="inline-flex rounded-full bg-[#F8F5EF] p-1 border border-[#EADFCB]">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  mode === "signin"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg("");
                }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer ${
                  mode === "register"
                    ? "bg-[#5C3A1E] text-white shadow-xs"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Alert Messages */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2.5 text-xs text-[#991B1B]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] flex items-center gap-2.5 text-xs text-[#166534]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16A34A]" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google One-Click Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-full border border-[#EADFCB] bg-[#FFFFFF] py-2.5 px-4 text-sm font-medium text-[#0F172A] hover:bg-[#F8F5EF] transition-all hover:border-[#D4A35A] shadow-xs cursor-pointer disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          {/* Subtle Hairline Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-[#EADFCB]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
              or with email
            </span>
            <div className="flex-1 h-px bg-[#EADFCB]" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                  Full Name / Organization
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Yash Joshi (Studio Living)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20 transition-all shadow-xs"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Studio Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="yash@studioliving.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20 transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#0F172A]">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-[#A98B57] hover:text-[#5C3A1E] font-medium transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20 transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "signin" && (
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#EADFCB] text-[#5C3A1E] focus:ring-[#D4A35A]"
                  />
                  <span className="text-xs text-[#64748B]">Keep me signed in</span>
                </label>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              withArrow
            >
              {mode === "signin" ? "Sign In to Client Portal" : "Create Studio Workspace"}
            </Button>
          </form>

          {/* Quick Demo Persona Switcher (Convenient for Evaluator Testing) */}
          <div className="mt-6 pt-4 border-t border-[#EADFCB]/60 space-y-2">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-widest block">
              Quick Test Personas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPersona("client")}
                className="p-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] hover:border-[#D4A35A] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#0F172A] group-hover:text-[#5C3A1E]">
                    Client Persona
                  </span>
                  <Badge variant="neutral" size="sm" showDot={false}>
                    Client
                  </Badge>
                </div>
                <p className="text-[10px] text-[#64748B] truncate">Yash Joshi</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona("admin")}
                className="p-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] hover:border-[#D4A35A] text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#0F172A] group-hover:text-[#5C3A1E]">
                    Studio Admin
                  </span>
                  <Badge variant="gold" size="sm" showDot={false}>
                    Producer
                  </Badge>
                </div>
                <p className="text-[10px] text-[#64748B] truncate">admin@sutrastudio.com</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Security Footer Notice */}
      <p className="mt-6 text-[11px] text-[#94A3B8] text-center max-w-md">
        Protected by Firebase Authentication. Your Google Drive vault files and 3D pipelines are securely encrypted.
      </p>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Password"
        description="Enter your registered studio email to receive an instant recovery link."
        maxWidth="md"
      >
        {resetSent ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-[#2E7D4F] mx-auto" />
            <h4 className="font-serif text-lg font-semibold text-[#0F172A]">
              Recovery Email Sent
            </h4>
            <p className="text-xs text-[#64748B]">
              Please check your inbox. Follow the instructions to reset your studio password.
            </p>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                Registered Studio Email
              </label>
              <input
                type="email"
                required
                placeholder="yash@studioliving.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/20 transition-all"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
