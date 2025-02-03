import type { NextConfig } from "next";
import WebpackObfuscator from "webpack-obfuscator";

const nextConfig: NextConfig = {
  images: {
    domains: ["img.youtube.com", "firebasestorage.googleapis.com", "storage.googleapis.com"],
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
