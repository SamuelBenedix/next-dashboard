import type { NextConfig } from "next";
import webpack from 'webpack'; // Import webpack

const nextConfig: NextConfig = {
  images: {
    domains: ["img.freepik.com", "veterinaire-tour-hassan.com"],
  },
  webpack: (config, { isServer }) => {
    // Existing rule for .node files
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });

    // Add Buffer polyfill for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback, // Preserve existing fallbacks
        buffer: require.resolve('buffer/'),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }

    return config;
  },
};

export default nextConfig;