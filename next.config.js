/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.scryfall.com', 'scryfall.com', 'art.hearthstonejson.com'],
    formats: ['image/webp', 'image/avif'],
  },
  eslint: {
    // Temporarily ignore linting errors during builds to allow incremental fixes
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on TypeScript errors (we want to catch these)
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;
