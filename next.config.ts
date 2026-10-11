import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  experimental: {
    cpus: 2,
    workerThreads: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sutrastudios.in",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "(?<subhost>.*)\\.onrender\\.com",
          },
        ],
        destination: "https://sutrastudios.in/:path*",
        permanent: true,
      },
      {
        source: "/service-plans",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/packages",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/plans",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/order-plans",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/pricing-plans",
        destination: "/orders",
        permanent: false,
      },
      {
        source: "/client-plans",
        destination: "/orders",
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://sutrastudios.in",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-sutra-secret",
          },
        ],
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
