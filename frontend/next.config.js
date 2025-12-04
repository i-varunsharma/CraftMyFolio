/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true
  },
// Temporarily disabled CSP for login/signup functionality
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'Content-Security-Policy',
  //           value: "default-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' 'unsafe-inline' https: http: data: blob:; frame-src 'self'; object-src 'none';"
  //         }
  //       ]
  //     }
  //   ]
  // }
};

export default nextConfig;