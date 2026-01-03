import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit for image uploads (default is 1mb)
    },
    optimizePackageImports: [
      '@radix-ui/react-*',
      '@hookform/resolvers',
      'react-hook-form',
      'lucide-react',
      'sonner'
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ydvozkhxkumqzuuthsxp.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Add unoptimized mode as fallback
    unoptimized: false,
    // Increase timeout for external images
    minimumCacheTTL: 60,
    // Add formats support
    formats: ['image/webp', 'image/avif'],
    // Add custom loader to handle problematic domains
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during build (configured via .eslintrc.json)
  },
  typescript: {
    ignoreBuildErrors: false, // Check TypeScript during build
  },
  // Enable Turbopack for faster builds
  devIndicators: {
    position: 'bottom-right',
  },
  // Optimize static assets
  staticPageGenerationTimeout: 600,
  // Enable server components
  reactStrictMode: true,
};

export default nextConfig;