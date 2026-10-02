import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#F8F5EF",
};

export const metadata: Metadata = {
  title: "Sutra Studio — Tradition Meets Technology | Creative & AI Studio",
  description:
    "AI-Powered Creative, Design, Development & Digital Marketing Solutions for Modern Businesses. Ideas ◆ Design ◆ Development ◆ Growth.",
  keywords: [
    "Sutra Studio",
    "Creative Studio",
    "AI Studio",
    "3D Modeling",
    "Interior Design",
    "Digital Marketing",
    "Web Development",
    "Video Creation",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sutra Studio",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/brand/app_icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]"
      >
        {/* Accessible Skip-to-Content Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#5C3A1E] focus:text-[#FFFDF9] focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#D4A35A] text-xs font-semibold uppercase tracking-wider"
        >
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
