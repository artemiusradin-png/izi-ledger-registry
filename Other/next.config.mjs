const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isProduction = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isProduction ? "export" : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath,
  assetPrefix: basePath || undefined,
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
