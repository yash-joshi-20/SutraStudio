"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="sm:w-auto w-full">
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? "secondary" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
            className={`sm:w-auto w-full ${isDangerous ? "bg-red-600 text-white hover:bg-red-700 border-transparent" : ""}`}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4 mt-2">
        <div className={`p-2 rounded-full shrink-0 ${isDangerous ? "bg-red-100 text-red-600" : "bg-[#F8F5EF] text-[#D4A35A]"}`}>
          {isDangerous ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
        </div>
        <div className="text-sm text-[#475569] leading-relaxed mt-1">
          {description}
        </div>
      </div>
    </Modal>
  );
}
