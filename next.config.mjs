/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  basePath: isProd ? '/mtbtest' : '',
  assetPrefix: isProd ? '/mtbtest/' : '',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
