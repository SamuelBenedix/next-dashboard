import type { NextConfig } from 'next';
import webpack from 'webpack';

const nextConfig: NextConfig = {
  output: 'standalone', // <--- untuk build server-ready
  images: {
    domains: ['img.freepik.com', 'veterinaire-tour-hassan.com'],
  },
  webpack: (config, { isServer }) => {
    // Tambahkan loader untuk file .node
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });

    // Tambahkan polyfill Buffer hanya di client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
