/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/adapter-pg", "pg"],
  // Prisma's query compiler (a .wasm file) is loaded at runtime, so Vercel must be told to include it
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*", "./node_modules/@prisma/client/runtime/*.wasm*"],
  },
  experimental: { serverActions: { bodySizeLimit: "10mb" } },
};
export default nextConfig;
