/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Robots-Tag', value: 'noai, noimageai, nosnippet' },
          { key: 'Permissions-Policy', value: 'interest-cohort=()' }
        ],
      },
    ];
  },
};
module.exports = nextConfig;
