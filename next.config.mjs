/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};
export default nextConfig;
