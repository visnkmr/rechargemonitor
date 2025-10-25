import withPWA from 'next-pwa'

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/rechargemonitor',
  assetPrefix: '/rechargemonitor',
  images: {
    unoptimized: true
  },
  turbopack: {}
};

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})(nextConfig);