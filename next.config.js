/** @type {import('next').NextConfig} */
const TWO_YEARS = 63072000;

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }
  { key: 'X-Robots-Tag', value: 'noai, noimageai, nosnippet' },
  { key: 'Permissions-Policy', value: 'interest-cohort=()' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
