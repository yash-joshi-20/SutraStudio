import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparent Pricing & Investment Plans",
  description:
    "Honest studio commissions with zero hidden fees. Single deliverables from ₹99, bundled creative packs, and monthly creative retainers.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Transparent Pricing & Investment Plans | Sutra Studios",
    description:
      "Honest studio commissions with zero hidden fees. Single deliverables from ₹99, bundled creative packs, and monthly creative retainers.",
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
