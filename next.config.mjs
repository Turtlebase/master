/** @type {import('next').NextConfig} */
const nextConfig = {
  serverActions: {
    bodySizeLimit: '10mb',
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
