/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@bizmate/billing", "@bizmate/contracts", "@bizmate/core"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
