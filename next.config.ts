import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/data',
        destination: 'https://script.google.com/macros/s/AKfycbz2AFDU7JhalEuBuAFxVOZ49lxOXpyDGEhjmEgavPQ7CLmsTUEEDz4sydXrkpsJq-gd/exec',
      },
    ];
  },
};

export default nextConfig;
