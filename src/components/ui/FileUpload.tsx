"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Link2,
  File as FileIcon,
  CheckCircle2,
  Image as ImageIcon,
} from "lucide-react";

export interface FileUploadProps {
  label?: string;
  helperText?: string;
  error?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  id?: string;
  value?: File | File[] | null;
  previewUrl?: string | null;
  onChange?: (files: File[] | File | null) => void;
  onClear?: () => void;
  // Optional external link fallback (e.g. Google Drive, Figma, Dropbox)
  allowUrlInput?: boolean;
  urlValue?: string;
  onUrlChange?: (url: string) => void;
  urlPlaceholder?: string;
  urlLabel?: string;
  compact?: boolean;
}

export function FileUpload({
  label,
  helperText,
  error: externalError,
  accept,
  multiple = false,
  maxSizeMB = 25,
  disabled = false,
  className = "",
  id,
  value,
  previewUrl,
  onChange,
  onClear,
  allowUrlInput = false,
  urlValue = "",
  onUrlChange,
  urlPlaceholder = "https://drive.google.com/... or Figma link",
  urlLabel = "Or provide external link",
  compact = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(previewUrl || null);

  // Sync external previewUrl if changed
  React.useEffect(() => {
    if (previewUrl !== undefined) {
      setLocalPreview(previewUrl);
    }
  }, [previewUrl]);

  const activeError = externalError || internalError;

  const validateAndHandleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setInternalError(null);

      const files = Array.from(fileList);
      const validFiles: File[] = [];

      for (const file of files) {
        const sizeInMB = file.size / (1024 * 1024);
        if (sizeInMB > maxSizeMB) {
          setInternalError(
            `"${file.name}" exceeds the maximum limit of ${maxSizeMB} MB.`
          );
          return;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        // Generate preview for image file
        const firstFile = validFiles[0];
        if (firstFile.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setLocalPreview(e.target?.result as string);
          };
          reader.readAsDataURL(firstFile);
        } else {
          setLocalPreview(null);
        }

        if (multiple) {
          onChange?.(validFiles);
        } else {
          onChange?.(validFiles[0]);
        }
      }
    },
    [maxSizeMB, multiple, onChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    validateAndHandleFiles(e.dataTransfer.files);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalPreview(null);
    setInternalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClear?.();
    onChange?.(multiple ? [] : null);
  };

  // Determine current files list for display
  const currentFiles: File[] = Array.isArray(value)
    ? value
    : value instanceof File
    ? [value]
    : [];

  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : "file-upload");

  return (
    <div className={`w-full space-y-2 text-left ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
        >
          {label}
        </label>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => validateAndHandleFiles(e.target.files)}
        className="hidden"
      />

      {/* Dropzone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`group relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none ${
          compact ? "p-3 sm:p-4" : "p-5 sm:p-6"
        } ${
          isDragOver
            ? "border-[#D4A35A] bg-[#FAF6EE] shadow-sm scale-[1.005]"
            : activeError
            ? "border-[#B42318] bg-[#FEF2F2]/40"
            : "border-[#EADFCB] bg-[#FFFDF9] hover:border-[#D4A35A] hover:bg-[#FAF6EE]/50"
        } ${disabled ? "opacity-50 cursor-not-allowed hover:border-[#EADFCB] hover:bg-[#FFFDF9]" : ""}`}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-2">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
              isDragOver
                ? "bg-[#D4A35A] text-white"
                : "bg-[#FAF6EE] text-[#A98B57] border border-[#EADFCB]"
            }`}
          >
            <Upload className="w-5 h-5" />
          </div>

          {/* Text Instructions */}
          <div className="space-y-0.5">
            <p className="text-xs sm:text-sm font-semibold text-[#0F172A]">
              <span className="text-[#5C3A1E] underline decoration-[#D4A35A] decoration-2 underline-offset-2">
                Click to upload
              </span>{" "}
              or drag &amp; drop
            </p>
            <p className="text-[11px] text-[#64748B]">
              {accept ? accept.replace(/,/g, ", ") : "All standard formats"} • Max {maxSizeMB} MB
            </p>
          </div>
        </div>

        {/* Live File or Image Preview */}
        {(localPreview || currentFiles.length > 0) && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-3 pt-3 border-t border-[#EADFCB]/80 flex flex-wrap items-center justify-between gap-2.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {localPreview ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#EADFCB] bg-white relative shrink-0 flex items-center justify-center">
                  <img
                    src={localPreview}
                    alt="Uploaded preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg border border-[#EADFCB] bg-white flex items-center justify-center text-[#A98B57] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}

              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-[#0F172A] truncate max-w-[200px] sm:max-w-xs">
                  {currentFiles.length > 0
                    ? currentFiles[0].name
                    : "Uploaded Asset"}
                </p>
                <p className="text-[10px] text-[#64748B]">
                  {currentFiles.length > 0
                    ? `${(currentFiles[0].size / 1024).toFixed(0)} KB`
                    : "Ready for processing"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#B42318] hover:bg-[#FDF2F2] transition-colors"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Alternative External Asset Link (Google Drive / Figma) */}
      {allowUrlInput && (
        <div className="pt-1.5">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-3.5 h-3.5 text-[#A98B57]" />
            <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
              {urlLabel}
            </span>
          </div>
          <input
            type="url"
            value={urlValue}
            disabled={disabled}
            onChange={(e) => onUrlChange?.(e.target.value)}
            placeholder={urlPlaceholder}
            className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] transition-all duration-150 focus:border-[#D4A35A] focus:outline-none focus:ring-0"
          />
        </div>
      )}

      {/* Helper text or Error message */}
      {activeError ? (
        <p role="alert" className="text-xs text-[#B42318] font-medium flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{activeError}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-[#64748B] pt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
