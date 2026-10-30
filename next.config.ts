import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {},
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "gen.pollinations.ai",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
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
  async redirects() {
    return [
      {
        source: "/packages",
        destination: "/pricing#packages",
        permanent: false,
      },
      {
        source: "/service-plans",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/plans",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/order-plans",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/pricing-plans",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/client-plans",
        destination: "/pricing",
        permanent: false,
      },
      {
        source: "/dashboard/services",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/dashboard/pricing",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/dashboard/packages",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/dashboard/plans",
        destination: "/orders",
        permanent: false,
      },
    ];
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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
