import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "12 Creative Disciplines & Production Services",
  description:
    "Explore our 12 specialized disciplines from 4K image creation and cinematic reels to 3D spatial design, web engineering, and workflow automation.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "12 Creative Disciplines & Production Services | Sutra Studios",
    description:
      "Explore our 12 specialized disciplines from 4K image creation and cinematic reels to 3D spatial design, web engineering, and workflow automation.",
    url: "/services",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
