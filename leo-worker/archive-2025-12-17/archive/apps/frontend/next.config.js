/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  },
  // In demo mode, we don't need API URL
  webpack: (config, { isServer: _isServer }) => {
    // Removed production check since we're using demo mode
    return config;
  },
}

module.exports = nextConfig