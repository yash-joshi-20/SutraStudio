import React from "react";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "busy" | "offline";
  className?: string;
}

export function Avatar({
  name,
  src,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  const sizeStyles = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
  }[size];

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`rounded-full flex items-center justify-center font-semibold border border-[#EADFCB] overflow-hidden ${sizeStyles} ${
          src ? "bg-[#F8F5EF]" : "bg-[#F4EFE6] text-[#5C3A1E]"
        }`}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-[#FFFDF9] ${
            status === "online"
              ? "bg-[#2E7D4F]"
              : status === "busy"
              ? "bg-[#B45309]"
              : "bg-[#94A3B8]"
          }`}
        />
      )}
    </div>
  );
}
