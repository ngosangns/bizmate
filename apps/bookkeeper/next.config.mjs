/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolate production build from ENV `next dev` which races on default `.next/`
  // (pages-manifest / next-font-manifest ENOENT). Dev keeps `.next`; build/start use
  // BIZMATE_NEXT_DIST=.next-build (see package.json scripts).
  distDir: process.env.BIZMATE_NEXT_DIST || ".next",
  // Workspace packages ship ESM from dist/
  transpilePackages: ["@bizmate/core", "@bizmate/contracts", "@bizmate/billing"],
  serverExternalPackages: ["better-sqlite3"],
  // Domain lib uses NodeNext-style `.js` imports pointing at `.ts` sources
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
