"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "modal" | "sheet" | "auto"; // "auto" uses bottom-sheet on phone (<640px) and centered on desktop
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
  variant = "auto",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // Esc key and focus trap
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
        previouslyFocusedElement.current?.focus();
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  const maxWidthClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    full: "sm:max-w-3xl",
  }[maxWidth];

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If swiped down more than 80px or velocity > 400, close
    if (info.offset.y > 80 || info.velocity.y > 400) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4">
          {/* Subtle warm backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/45 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal / Bottom Sheet Surface */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-accessible-title" : undefined}
            aria-describedby={description ? "modal-accessible-desc" : undefined}
            drag={variant !== "modal" ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className={`relative w-full ${maxWidthClasses} bg-[#FFFDF9] border border-[#EADFCB] shadow-2xl rounded-t-3xl sm:rounded-3xl z-10 flex flex-col max-h-[90dvh] sm:max-h-[85vh] overflow-hidden pb-safe`}
          >
            {/* Mobile Drag Indicator Handle */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="bottom-sheet-drag-handle" />
            </div>

            {/* Sticky Header */}
            {(title || description) && (
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-3 pb-4 border-b border-[#EADFCB]/70 shrink-0 bg-[#FFFDF9]">
                <div className="pr-2">
                  {title && (
                    <h3
                      id="modal-accessible-title"
                      className="font-serif text-lg sm:text-xl font-semibold text-[#0F172A] leading-tight"
                    >
                      {title}
                    </h3>
                  )}
                  {description && (
                    <p id="modal-accessible-desc" className="text-xs text-[#64748B] mt-1">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F5EF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] flex items-center justify-center shrink-0 min-h-[44px] min-w-[44px] cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 overscroll-contain">
              {children}
            </div>

            {/* Sticky Action Footer (if provided) */}
            {footer && (
              <div className="px-5 sm:px-6 py-3.5 border-t border-[#EADFCB]/70 shrink-0 bg-[#FFFDF9] flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
