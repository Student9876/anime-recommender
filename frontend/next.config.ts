import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'api-cdn.myanimelist.net',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img.myanimelist.net',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
