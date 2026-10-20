"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";

export interface CmsContent {
  theme?: {
    accentColor?: string;
    bodyBgColor?: string;
    bodyBgImage?: string;
    bodyFont?: string;
    headingFont?: string;
    texturePattern?: "none" | "subtle-dots" | "warm-grain" | "grid";
    navbarBgColor?: string;
    footerBgColor?: string;
  };
  hero?: any;
  about?: any;
  services?: any;
  pricing?: any;
  contact?: any;
  header?: any;
  footer?: any;
  branding?: any;
  payment?: any;
  [key: string]: any;
}

interface CmsContextValue {
  cmsData: CmsContent | null;
  loading: boolean;
  applyLiveCms: (data: CmsContent) => void;
  refreshCms: () => Promise<void>;
}

const CmsContext = createContext<CmsContextValue>({
  cmsData: null,
  loading: true,
  applyLiveCms: () => {},
  refreshCms: async () => {},
});

export const useCms = () => useContext(CmsContext);

export function CmsThemeProvider({ children }: { children: React.ReactNode }) {
  const [cmsData, setCmsData] = useState<CmsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const applyThemeVariables = (data: CmsContent) => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const theme = data.theme || {};

    if (theme.accentColor) {
      root.style.setProperty("--brass", theme.accentColor);
      root.style.setProperty("--saffron", theme.accentColor);
      root.style.setProperty("--theme-accent", theme.accentColor);
    }

    if (theme.bodyBgColor) {
      root.style.setProperty("--background", theme.bodyBgColor);
      document.body.style.backgroundColor = theme.bodyBgColor;
    }

    // Dynamic Google Fonts Loading if needed
    const fontsToLoad: string[] = [];
    if (theme.bodyFont && !["Inter", "Arial", "sans-serif"].includes(theme.bodyFont)) {
      fontsToLoad.push(theme.bodyFont);
      root.style.setProperty("--font-body-family", `"${theme.bodyFont}", sans-serif`);
    }
    if (theme.headingFont && !["Playfair Display", "Times New Roman", "serif"].includes(theme.headingFont)) {
      fontsToLoad.push(theme.headingFont);
      root.style.setProperty("--font-heading-family", `"${theme.headingFont}", serif`);
    }

    if (fontsToLoad.length > 0) {
      const linkId = "sutra-dynamic-cms-fonts";
      let linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
      if (!linkEl) {
        linkEl = document.createElement("link");
        linkEl.id = linkId;
        linkEl.rel = "stylesheet";
        document.head.appendChild(linkEl);
      }
      const families = fontsToLoad.map((f) => `family=${encodeURIComponent(f)}:wght@400;600;700`).join("&");
      linkEl.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    }

    // Body Texture Pattern / Image
    if (theme.bodyBgImage && theme.bodyBgImage.trim() !== "") {
      document.body.style.backgroundImage = `url("${theme.bodyBgImage}")`;
      document.body.style.backgroundRepeat = "repeat";
    } else if (theme.texturePattern === "subtle-dots") {
      document.body.style.backgroundImage = `radial-gradient(rgba(169, 139, 87, 0.08) 1px, transparent 1px)`;
      document.body.style.backgroundSize = "24px 24px";
    } else if (theme.texturePattern === "grid") {
      document.body.style.backgroundImage = `linear-gradient(to right, rgba(229, 225, 216, 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 225, 216, 0.3) 1px, transparent 1px)`;
      document.body.style.backgroundSize = "40px 40px";
    } else if (theme.texturePattern === "none") {
      document.body.style.backgroundImage = "none";
    }
  };

  const refreshCms = async () => {
    try {
      const res = await fetch("/api/cms", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json?.content) {
          startTransition(() => {
            setCmsData(json.content);
            applyThemeVariables(json.content);
          });
        }
      }
    } catch (e) {
      console.warn("[CmsThemeProvider] Failed to load CMS:", e);
    } finally {
      setLoading(false);
    }
  };

  const applyLiveCms = (data: CmsContent) => {
    setCmsData(data);
    applyThemeVariables(data);
  };

  useEffect(() => {
    refreshCms();

    const handleCustomUpdate = (e: any) => {
      if (e.detail) {
        applyLiveCms(e.detail);
      }
    };

    window.addEventListener("cms-content-updated", handleCustomUpdate);
    return () => {
      window.removeEventListener("cms-content-updated", handleCustomUpdate);
    };
  }, []);

  return (
    <CmsContext.Provider value={{ cmsData, loading, applyLiveCms, refreshCms }}>
      {children}
    </CmsContext.Provider>
  );
}
