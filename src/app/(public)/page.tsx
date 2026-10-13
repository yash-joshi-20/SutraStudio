import type { Metadata } from "next";
import HomePage from "../HomeClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sutra Studios — Tradition Meets Modern Creative Technology",
  description:
    "Bespoke Creative Technology, 3D Spatial Design, Full-Stack Engineering & Digital Marketing Solutions rooted in traditional Indian aesthetics.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Sutra Studios — Tradition Meets Modern Creative Technology",
    description:
      "Bespoke Creative Technology, 3D Spatial Design, Full-Stack Engineering & Digital Marketing Solutions rooted in traditional Indian aesthetics.",
    url: "/",
  },
};

export default function Page() {
  return <HomePage />;
}
