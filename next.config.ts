import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.77.94.99', '100.92.216.115', '100.98.101.57', '100.117.71.8', 'localhost'],
  output: 'standalone',
};
export default nextConfig;