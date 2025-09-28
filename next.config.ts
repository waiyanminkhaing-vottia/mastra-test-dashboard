import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(process.env.NEXT_PUBLIC_BASE_PATH && {
    basePath: process.env.NEXT_PUBLIC_BASE_PATH,
  }),
};

export default nextConfig;
