"use client";

import React, { useState, useCallback } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
}

export function useConfirm() {
  const [promise, setPromise] = useState<{ resolve: (value: boolean) => void } | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPromise({ resolve });
      setOptions(opts);
    });
  }, []);

  const handleClose = useCallback(() => {
    promise?.resolve(false);
    setPromise(null);
  }, [promise]);

  const handleConfirm = useCallback(() => {
    promise?.resolve(true);
    setPromise(null);
  }, [promise]);

  const ConfirmationDialog = useCallback(() => {
    if (!options) return null;
    return (
      <ConfirmModal
        isOpen={promise !== null}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        isDangerous={options.isDangerous}
      />
    );
  }, [options, promise, handleClose, handleConfirm]);

  return { confirm, ConfirmationDialog };
}
