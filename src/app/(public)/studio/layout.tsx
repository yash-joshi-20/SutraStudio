import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Craft, Technology & Spatial Engines",
  description:
    "Explore our WebGL 2.0 PBR 3D viewer, 360° virtual tours, particle light matrix, and high-precision production workflows.",
  alternates: {
    canonical: "/studio",
  },
  openGraph: {
    title: "Craft, Technology & Spatial Engines | Sutra Studios",
    description:
      "Explore our WebGL 2.0 PBR 3D viewer, 360° virtual tours, particle light matrix, and high-precision production workflows.",
    url: "/studio",
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
