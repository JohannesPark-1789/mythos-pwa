const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/mythos-pwa',
  images: { unoptimized: true },
  reactStrictMode: true,
  trailingSlash: true,
};

module.exports = withPWA(nextConfig);
