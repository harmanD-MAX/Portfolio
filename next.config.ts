import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
