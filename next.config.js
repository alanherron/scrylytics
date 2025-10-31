/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.scryfall.com', 'scryfall.com', 'art.hearthstonejson.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
