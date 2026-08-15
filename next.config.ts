import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cataas.com', pathname: '/cat/**' }],
  },
};

export default nextConfig;
