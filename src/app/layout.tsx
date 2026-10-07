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

export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#F8F5EF",
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudio-1.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | Sutra Studio — Autonomous AI Creative & 3D Engineering",
    default: "Sutra Studio — Tradition Meets Computational Technology",
  },
  description:
    "High-precision AI creative studio delivering 4K photorealistic product renders, 3D architectural modeling, 360 virtual tours, and autonomous commercial pipelines with zero hidden fees.",
  keywords: [
    "AI creative studio",
    "4K photorealistic product renders",
    "3D architectural modeling",
    "360 virtual tours",
    "Meta Ads automation",
    "Sutra Studio India",
    "Bespoke digital architecture",
    "Creative technology atelier",
  ],
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Sutra Studio — Tradition Meets Computational Technology",
    description:
      "Bespoke 3D product renders, spatial virtual tours, and autonomous video reels engineered under experienced art direction.",
    url: baseUrl,
    siteName: "Sutra Studio",
    images: [
      {
        url: "/brand/logo.svg",
        width: 1200,
        height: 630,
        alt: "Sutra Studio — Computational Art & 3D Atelier",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sutra Studio — Autonomous AI Creative & 3D Engineering",
    description:
      "High-precision 4K renders, spatial 3D architecture, and cinematic video reels delivered directly to your Sutra Cloud Vault.",
    images: ["/brand/logo.svg"],
  },
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

// JSON-LD Structured Data Schema for Search Engine Rich Snippets
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Sutra Studio",
      url: baseUrl,
      logo: `${baseUrl}/brand/logo.svg`,
      description:
        "High-precision creative technology studio combining Indian artistic heritage with cutting-edge AI and spatial 3D engineering.",
      founder: {
        "@type": "Person",
        name: "Yash Joshi",
      },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Concierge",
        email: "yashjoshi20@zohomail.in",
        availableLanguage: ["English", "Hindi", "Gujarati"],
      },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${baseUrl}/#service`,
      name: "Sutra Studio Creative Engineering",
      url: baseUrl,
      priceRange: "₹3,499 - ₹14,999",
      currenciesAccepted: "INR",
      paymentAccepted: "UPI, Google Pay, PhonePe, Paytm, NetBanking, Cards",
      areaServed: ["India", "Global"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Creative Engineering Disciplines",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Starter Creative Commission",
              description: "5x 4K Renders or 1x 10s Video Ad with 48h turnaround.",
            },
            price: "3499",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Studio Growth Commission",
              description: "15x 3D Assets, 3x 15s Video Ads, 360° Space Tour, and Meta Ads variation pack.",
            },
            price: "7999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Autonomous Growth Retainer",
              description: "30-day autonomous daily active queue: daily 4K render and video reel.",
            },
            price: "14999",
            priceCurrency: "INR",
          },
        ],
      },
    },
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
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden w-full relative selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]"
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
