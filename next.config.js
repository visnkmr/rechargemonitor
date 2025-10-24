import withPWA from 'next-pwa'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath: '/sortedprocs',
  // assetPrefix: '/sortedprocs',
  images: {
    unoptimized: true
  }
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})(nextConfig);