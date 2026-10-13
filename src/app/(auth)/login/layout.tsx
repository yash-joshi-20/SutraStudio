import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Workspace Sign In | Sutra Studios",
  description:
    "Securely access your Sutra Studio client workspace. Track active project deliverables, review 4K master assets, and collaborate with our atelier.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
