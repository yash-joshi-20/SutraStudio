import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Heritage, Philosophy & Creative Direction",
  description:
    "Bridging millennia of Indian aesthetic doctrines (Pramana, Rasa, Yantra) with modern spatial workflows and digital engineering.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "Heritage, Philosophy & Creative Direction | Sutra Studios",
    description:
      "Bridging millennia of Indian aesthetic doctrines (Pramana, Rasa, Yantra) with modern spatial workflows and digital engineering.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
