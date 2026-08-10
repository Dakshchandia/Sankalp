import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
        pathname: "/uploads/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: "SANKALP",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle Node.js-only modules in the browser build
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
