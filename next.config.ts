import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove assetPrefix to fix image loading issues
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Production optimizations
  output: 'standalone',
  serverExternalPackages: ['@mendable/firecrawl-js'],
};

export default nextConfig;
