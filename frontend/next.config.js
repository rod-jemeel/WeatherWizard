/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configure environment variables with fallbacks
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  },
  // Enable proper handling in different environments
  async rewrites() {
    // In local development, proxy API requests to the local Flask backend
    // In production on Vercel, this will be overridden by the vercel.json configuration
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },
  // Enable more strict type checking
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig;