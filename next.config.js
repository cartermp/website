const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is no longer needed in Next.js 15 as it's enabled by default
};

module.exports = withContentlayer(nextConfig);
