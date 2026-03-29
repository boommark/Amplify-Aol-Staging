/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed basePath and assetPrefix for clean deployment
  // trailingSlash removed — incompatible with App Router route groups on Vercel
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
