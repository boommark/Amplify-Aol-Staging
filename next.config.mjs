/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed basePath and assetPrefix for clean deployment
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
