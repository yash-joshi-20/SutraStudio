"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Subtle warm backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
          />

          {/* Modal Surface */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-accessible-title" : undefined}
            aria-describedby={description ? "modal-accessible-desc" : undefined}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`relative w-full ${maxWidthClasses} rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl p-6 sm:p-8 z-10 overflow-hidden`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EADFCB]/60">
              <div>
                {title && (
                  <h3 id="modal-accessible-title" className="font-serif text-xl font-semibold text-[#0F172A]">
                    {title}
                  </h3>
                )}
                {description && (
                  <p id="modal-accessible-desc" className="text-xs text-[#64748B] mt-1">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F5EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] flex items-center justify-center cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="pt-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
