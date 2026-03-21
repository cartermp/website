const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify is no longer needed in Next.js 15 as it's enabled by default

  async redirects() {
    return [
      {
        source: "/email/:path*",
        destination: "https://email.phillipcarter.dev/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = withContentlayer(nextConfig);
