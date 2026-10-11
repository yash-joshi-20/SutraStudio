import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparent Pricing & Investment Plans",
  description:
    "Honest studio commissions with zero hidden fees. Single deliverables from ₹499, bundled creative packs, and the 30-Day Growth Plan retainer.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Transparent Pricing & Investment Plans | Sutra Studios",
    description:
      "Honest studio commissions with zero hidden fees. Single deliverables from ₹499, bundled creative packs, and the 30-Day Growth Plan retainer.",
    url: "/pricing",
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
