import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "ywcannj.org",
      },
      {
        protocol: "https",
        hostname: "www.caldwell.edu",
      },
      {
        protocol: "https",
        hostname: "images.clubexpress.com",
      },
      {
        protocol: "https",
        hostname: "www.tesu.edu",
      },
      {
        protocol: "https",
        hostname: "www.gardenstateequality.org",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "librarylinknj.org",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
