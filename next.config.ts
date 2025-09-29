import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Only set basePath if NEXT_PUBLIC_BASE_PATH is defined and not empty
  ...(process.env.NEXT_PUBLIC_BASE_PATH &&
    process.env.NEXT_PUBLIC_BASE_PATH.trim() !== '' && {
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
    }),

  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,

  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    compiler: {
      removeConsole: process.env.LOG_LEVEL !== 'debug',
    },
  }),
};

export default nextConfig;
