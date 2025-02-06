/** @format */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: `/${process.env.FIREBASE_STORAGE_BUCKET}/**`,
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: `/${process.env.FIREBASE_STORAGE_BUCKET}/**`,
      },
    ],
  },

  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 사이드에서 서버 모듈을 사용하지 않도록 설정
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        punycode: false,
      };
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": ".",
    };
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "3mb", // Set your desired limit here (e.g., 2MB, 5MB, etc.)
    },
  },
};

export default nextConfig;
