import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Sanity CDN (Added and Merged)
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      // News & Media
      {
        protocol: 'https',
        hostname: 'cdn.newsday.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.bwbx.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ichef.bbci.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bbc.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bbci.co.uk',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.rebelmouse.io',
        pathname: '/**',
      },
      // Stock Images
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
      // Wildcard patterns
      {
        protocol: 'https',
        hostname: '**.com', // Use double asterisks for subdomains if needed
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.co.uk',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;