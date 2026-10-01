import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/admin/site-control",
        destination: "/admin?tab=site-control",
      },
      {
        source: "/admin/approvals",
        destination: "/admin?tab=approvals",
      },
      {
        source: "/admin/clients",
        destination: "/admin?tab=clients",
      },
      {
        source: "/admin/messages",
        destination: "/admin?tab=conversations",
      },
      {
        source: "/admin/workflows",
        destination: "/admin?tab=workflows",
      },
      {
        source: "/admin/audit",
        destination: "/admin?tab=audit",
      },
    ];
  },
};

export default nextConfig;
