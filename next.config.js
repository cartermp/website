const { withContentlayer } = require("next-contentlayer");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // configure-pages supplies /website for project Pages and an empty path for custom domains.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",

  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },

};

module.exports = withContentlayer(nextConfig);
