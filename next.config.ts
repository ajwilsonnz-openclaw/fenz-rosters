import type { NextConfig } from "next";
// @ts-expect-error next-pwa doesn't have reliable community types
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  customWorkerDir: "worker",
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['100.77.94.99', '100.92.216.115', '100.98.101.57', '100.117.71.8', 'localhost'],
  output: 'standalone',
};

export default withPWA(nextConfig);