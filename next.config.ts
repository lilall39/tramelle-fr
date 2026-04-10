import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Évite les doubles instances du SDK Firebase entre bundles (SSR / métadonnées). */
  serverExternalPackages: ["firebase"],
};

export default nextConfig;
