"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm Action",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const Icon = variant === "danger" ? AlertCircle : variant === "warning" ? AlertTriangle : HelpCircle;

  const iconStyles = {
    danger: "bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]",
    warning: "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]",
    primary: "bg-[#F4EFE6] text-[#5C3A1E] border-[#EADFCB]",
  }[variant];

  const confirmVariant = variant === "danger" ? "primary" : "primary";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={
              variant === "danger"
                ? "!bg-[#DC2626] hover:!bg-[#B91C1C] text-white"
                : variant === "warning"
                ? "!bg-[#D97706] hover:!bg-[#B45309] text-white"
                : ""
            }
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      }
    >
      <div className="space-y-3.5 text-xs text-[#0F172A]">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB]">
          <div className={`p-2 rounded-xl border shrink-0 ${iconStyles}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[#64748B] text-xs leading-relaxed">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </Modal>
  );
}
