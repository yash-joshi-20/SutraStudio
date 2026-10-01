import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    rectangular: "rounded-2xl",
    circular: "rounded-full",
    text: "rounded-md h-4 my-1",
  }[variant];

  return (
    <div
      className={`animate-pulse bg-[#EADFCB]/40 ${variantClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
}
