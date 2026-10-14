import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Packages & Pricing — One-Time Services & Monthly Retainers",
  description:
    "Compare one-time single-service prices and monthly creative packages in INR. Two clearly separated sections with category filters, scope ranges and package details.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Packages & Pricing | Sutra Studios",
    description:
      "Compare one-time single-service prices and monthly creative packages in INR — clearly separated, filterable and quote-backed.",
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
