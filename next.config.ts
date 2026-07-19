import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  // Allow Agora CDN for media
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },
};

export default nextConfig;
