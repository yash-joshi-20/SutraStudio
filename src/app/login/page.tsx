"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Card";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating Firebase auth session set
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8F5EF] p-4 text-[#0F172A] relative">
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#64748B] hover:text-[#5C3A1E] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Studio Home
      </Link>

      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm p-8 sm:p-10 space-y-6">
        <div className="text-center space-y-2">
          <SutraLogo variant="vertical" size="sm" showTagline={false} />
          <h2 className="font-serif text-2xl font-semibold text-[#0F172A] pt-4">
            {isRegister ? "Create Studio Account" : "Sign In to Client Portal"}
          </h2>
          <p className="text-xs text-[#64748B]">
            {isRegister
              ? "Start your private workspace to track orders and deliverables."
              : "Access your active orders, deliverables, and AI assistant."}
          </p>
        </div>

        {/* Google One-Click Button */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 rounded-full border border-[#EADFCB] bg-[#FFFFFF] py-2.5 px-4 text-sm font-medium text-[#0F172A] hover:bg-[#F8F5EF] transition-all hover:border-[#D4A35A]/60 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#EADFCB]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
            or with email
          </span>
          <div className="flex-1 h-px bg-[#EADFCB]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            required
            placeholder="yash@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={loading}
          >
            {isRegister ? "Create Account" : "Sign In to Portal"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#5C3A1E] font-medium hover:underline"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "New client? Create a free workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}
