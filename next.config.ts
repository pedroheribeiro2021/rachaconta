import withPWA from "next-pwa";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {};

export default withPWA({
  dest: "public",
  disable: isDev,
})(nextConfig);
