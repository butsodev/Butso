/** @type {import('next').NextConfig} */
const nextConfig = {
  // Folders starting with @ are parallel-route slots in the App Router, not URL segments,
  // so /@username is served by app/u/[username] through this rewrite.
  async rewrites() {
    return [{ source: '/@:username', destination: '/u/:username' }]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dupugzphf/**',
      },
    ],
  },
}

export default nextConfig
