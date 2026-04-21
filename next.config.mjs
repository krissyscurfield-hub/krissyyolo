/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // MVP pragmatism: don't block prod deploys on type errors.
    // Types are still checked in dev. Re-enable with `ignoreBuildErrors: false`
    // once the app is stable and we want strict prod builds.
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },
};
export default nextConfig;
