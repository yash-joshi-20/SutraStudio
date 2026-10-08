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
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sutrastudios.in";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: "%s | Sutra Studios — Enterprise Software & 3D Spatial Engineering",
    default: "Sutra Studios — Tradition Meets Computational Technology",
  },
  description:
    "Enterprise creative technology atelier delivering 4K photorealistic product renders, 3D architectural spatial systems, 360 virtual tours, and bespoke web applications with zero hidden fees.",
  keywords:
    "Enterprise creative technology, 4K photorealistic product renders, 3D architectural spatial systems, 360 virtual tours, Bespoke software architecture, Sutra Studios India, Digital architecture atelier, Creative technology firm",
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    title: "Sutra Studios — Tradition Meets Computational Technology",
    description:
      "Bespoke 3D product renders, spatial virtual tours, and commercial motion shorts engineered under experienced art direction.",
    url: baseUrl,
    siteName: "Sutra Studios",
    images: [
      {
        url: "/brand/sutra-logo-primary.png",
        width: 1200,
        height: 630,
        alt: "Sutra Studios — Computational Art & 3D Atelier",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sutra Studios — Enterprise Software & 3D Spatial Engineering",
    description:
      "High-precision 4K renders, spatial 3D architecture, and cinematic commercial reels delivered directly to your Sutra Cloud Vault.",
    images: ["/brand/sutra-logo-primary.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/brand/sutra-favicon.png",
    apple: "/brand/sutra-app-icon.png",
  },
};

// JSON-LD Structured Data Schema for Search Engine Rich Snippets
const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "Sutra Studios",
      url: baseUrl,
      logo: `${baseUrl}/brand/sutra-logo-primary.png`,
      description:
        "High-precision creative technology studio combining Indian artistic heritage with computational technology and spatial 3D engineering.",
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
      priceRange: "₹499 - ₹9,999",
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
              name: "5x 4K Photorealistic Master Renders",
              description: "5x 4K Master Product & Space Renders with 24h turnaround.",
            },
            price: "499",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "2x Commercial Video Reels",
              description: "2x 15-30s Commercial Video Reels with high-fidelity studio voiceover & motion typography.",
            },
            price: "1499",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Starter Creative Commission",
              description: "5x 4K UHD Master Renders + 1x 10s Cinematic Video Ad with 48h turnaround.",
            },
            price: "1999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Studio Growth Commission",
              description: "15x 3D Assets, 3x 15s Video Ads, 360° Space Tour, and Meta Ads variation pack.",
            },
            price: "4999",
            priceCurrency: "INR",
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Autonomous Growth Retainer",
              description: "30-day active queue: daily 4K renders and commercial video shorts.",
            },
            price: "9999",
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
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-x-hidden w-full relative selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]"
      >
        <script
          id="sutra-schema-jsonld"
          key="sutra-schema-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
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
