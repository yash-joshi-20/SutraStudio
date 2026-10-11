import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Discovery Desk & Studio Concierge",
  description:
    "Connect directly with Sutra Studio. Discuss bespoke creative commissions, 3D spatial models, enterprise web development, or workflow automation.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Client Discovery Desk & Studio Concierge | Sutra Studios",
    description:
      "Connect directly with Sutra Studio. Discuss bespoke creative commissions, 3D spatial models, enterprise web development, or workflow automation.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
