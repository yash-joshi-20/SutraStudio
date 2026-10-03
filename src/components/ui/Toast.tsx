"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, TriangleAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  durationMs?: number;
  /** Optional single action, e.g. "Undo" or "View order". */
  action?: { label: string; onClick: () => void };
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, "id">) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, durationMs = 4500, action }: Omit<ToastItem, "id">): string => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message, durationMs, action }]);
      if (durationMs > 0) {
        setTimeout(() => dismiss(id), durationMs);
      }
      return id;
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => showToast({ type: "success", message, title }),
    [showToast]
  );
  const error = useCallback(
    (message: string, title?: string) => showToast({ type: "error", message, title, durationMs: 7000 }),
    [showToast]
  );
  const info = useCallback(
    (message: string, title?: string) => showToast({ type: "info", message, title }),
    [showToast]
  );
  const warning = useCallback(
    (message: string, title?: string) => showToast({ type: "warning", message, title, durationMs: 6000 }),
    [showToast]
  );

  const value = useMemo<ToastContextType>(
    () => ({ showToast, success, error, info, warning, dismiss }),
    [showToast, success, error, info, warning, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/*
        Toasts sit above modals (--z-toast) and are pushed clear of the mobile
        bottom navigation (--nav-space) so they are never half-hidden behind it.
        `pointer-events-none` on the stack keeps it from blocking the page while
        each toast re-enables pointer events.
      */}
      <div
        role="region"
        aria-label="Notifications"
        className="fixed bottom-[calc(var(--nav-space)+0.5rem)] sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-6 z-[var(--z-toast)] flex flex-col gap-2 pointer-events-none max-w-sm w-[calc(100vw-2rem)]"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon =
              toast.type === "success"
                ? CheckCircle2
                : toast.type === "error"
                  ? AlertCircle
                  : toast.type === "warning"
                    ? TriangleAlert
                    : Info;

            const tone =
              toast.type === "success"
                ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
                : toast.type === "error"
                  ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                  : toast.type === "warning"
                    ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
                    : "bg-[#FFFDF9] border-[#EADFCB] text-[#5C3A1E]";

            return (
              <motion.div
                key={toast.id}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: 15, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start gap-3 backdrop-blur-md ${tone}`}
              >
                <Icon className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 space-y-0.5 text-xs min-w-0">
                  {toast.title && <p className="font-bold leading-tight">{toast.title}</p>}
                  <p className="leading-relaxed opacity-90 break-anywhere">{toast.message}</p>
                  {toast.action && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.action?.onClick();
                        dismiss(toast.id);
                      }}
                      className="mt-1 font-semibold underline underline-offset-2 min-h-[32px]"
                    >
                      {toast.action.label}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="p-1 opacity-60 hover:opacity-100 transition-opacity shrink-0"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>.");
  }
  return context;
}