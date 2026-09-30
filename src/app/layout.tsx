import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        {children}
      </body>
    </html>
  );
}
