import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Featured Projects & Portfolio",
  description:
    "Explore our latest creative outputs across photorealistic 3D, architectural films, brand portals, and Meta growth campaigns.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Featured Projects & Portfolio | Sutra Studios",
    description:
      "Explore our latest creative outputs across photorealistic 3D, architectural films, brand portals, and Meta growth campaigns.",
    url: "/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
