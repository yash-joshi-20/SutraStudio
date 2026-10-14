import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eight Core Studio Services & Production Disciplines",
  description:
    "Explore the eight core Sutra Studio services — image creation, video creation, 3D modeling, 360° views, web design, digital marketing, web development and app development.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Eight Core Studio Services & Production Disciplines | Sutra Studios",
    description:
      "Explore the eight core Sutra Studio services — image creation, video creation, 3D modeling, 360° views, web design, digital marketing, web development and app development.",
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
