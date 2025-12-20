import type { NextConfig } from "next";
import withPlaiceholder from "@plaiceholder/next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*",
        "127.0.0.1:8787",
        "localhost:3000",
        "aquafornais.dpdns.org",
        "*.dpdns.org",
        "8787-firebase-aquafornite-1747146266938.cluster-iesosxm5fzdewqvhlwn5qivgry.cloudworkstations.dev/",
      ],
    },
  },

  images: {
    unoptimized: true, // ✅ DESACTIVA EL IMAGE OPTIMIZER DE VERCEL (SOLUCIÓN AL 402)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.fortniteapi.io",
      },
      {
        protocol: "https",
        hostname: "fortnite-api.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fortnite-api.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "fakeimg.pl",
      },
    ],
  },
};

export default withPlaiceholder(nextConfig);
