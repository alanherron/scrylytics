import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.scryfall.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "scryfall.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "art.hearthstonejson.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
