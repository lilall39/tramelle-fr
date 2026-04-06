import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/outils/correcteur-de-texte",
        destination: "/outils/sur-consigne",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
