import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "zustand"],
  },
  // Turbopack configuration (empty to allow webpack config when --webpack is used)
  // For production builds, we use --webpack flag to leverage webpack's IgnorePlugin
  turbopack: {},
  // Webpack configuration (for explicit --webpack usage)
  webpack: (config, { webpack }) => {
    // Ignore test files in node_modules to prevent bundling issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\.test\.(js|mjs|ts|tsx)$/,
        contextRegExp: /node_modules/,
      }),
    );

    return config;
  },
};

export default nextConfig;
