import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mobile App for iOS & Android",
  description:
    "Your bespoke creative studio in your pocket. Approve deliverables in 1-click, manage commissions, and access your private media library.",
  alternates: {
    canonical: "/mobile-app",
  },
  openGraph: {
    title: "Mobile App for iOS & Android | Sutra Studios",
    description:
      "Your bespoke creative studio in your pocket. Approve deliverables in 1-click, manage commissions, and access your private media library.",
    url: "/mobile-app",
  },
};

export default function MobileAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
