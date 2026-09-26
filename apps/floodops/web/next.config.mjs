/** @type {import('next').NextConfig} */
const nextConfig = {
  // Monorepo: transpile workspace packages if needed
  transpilePackages: ["@bizmate/billing", "@bizmate/contracts", "@bizmate/core"],
  // Allow reading fixtures/data outside web/
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
