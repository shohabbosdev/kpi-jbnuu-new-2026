import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NODE_ENV === "production" ? "/kpi" : (process.env.NEXT_PUBLIC_BASE_PATH || ""),
};

export default nextConfig;
