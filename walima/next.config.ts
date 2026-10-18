import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // This project sits inside the combined repo, which has its own lockfile.
  // Pin tracing here so the build never reaches outside this folder.
  outputFileTracingRoot: path.join(__dirname),
  // This deployment holds one invitation only, so the bare domain opens it.
  async redirects() {
    return [{ source: "/", destination: "/walima", permanent: false }];
  },
};

export default nextConfig;
