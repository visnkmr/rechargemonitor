// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };
// import type { NextConfig } from "next";
// import withPWA from 'next-pwa'
// import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

// async function setup() {
//   if (process.env.NODE_ENV === 'development') {
//     await setupDevPlatform()
//   }
// }
// @ts-expect-error "ignore the error"
// import pkg from 'next-pwa/cache.js'
// const {runtimeCaching} = pkg

// setup()
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  // basePath: '/sortedprocs',
  // assetPrefix: '/sortedprocs',
  images: {
    unoptimized: true
  }
};

export default nextConfig;