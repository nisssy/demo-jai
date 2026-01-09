/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // Make PAGE_RENDERING_SERVICE_URL available to both server and client
    NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL: process.env.PAGE_RENDERING_SERVICE_URL || process.env.NEXT_PUBLIC_PAGE_RENDERING_SERVICE_URL || 'http://localhost:3000',
  },
  basePath: process.env.PAGE_RENDERING_SERVICE_URL || '',
  assetPrefix: process.env.PAGE_RENDERING_SERVICE_URL || '',
}

export default nextConfig
