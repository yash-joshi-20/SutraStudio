"use client";

import React from "react";

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  className = "",
}: TabsProps) {
  if (variant === "underline") {
    return (
      <div role="tablist" className={`flex items-center gap-6 border-b border-[#EADFCB] ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`focus-ring pb-3 text-sm font-medium transition-all relative cursor-pointer min-h-[44px] flex items-center ${
                isActive
                  ? "text-[#5C3A1E] font-semibold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-[#F4EFE6] text-[#5C3A1E]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4A35A] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="tablist"
      className={`inline-flex items-center p-1 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] gap-1 ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`interactive-pill focus-ring px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer min-h-[40px] flex items-center ${
              isActive
                ? "bg-[#FFFDF9] text-[#5C3A1E] shadow-sm border border-[#EADFCB]/80"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive
                    ? "bg-[#5C3A1E] text-white"
                    : "bg-[#EADFCB]/60 text-[#64748B]"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
