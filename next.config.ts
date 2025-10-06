import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Only set basePath if NEXT_PUBLIC_BASE_PATH is defined and not empty
  ...(process.env.NEXT_PUBLIC_BASE_PATH &&
    process.env.NEXT_PUBLIC_BASE_PATH.trim() !== '' && {
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
      assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,
    }),

  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-popover',
      'lucide-react',
    ],
  },

  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: process.env.LOG_LEVEL !== 'debug',
    },
  }),
};

export default nextConfig;
