import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "standalone",
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "*.googleusercontent.com",
      port: "",
      pathname: "**"
    },
    {
      protocol:"https",
      hostname: "avatars.githubusercontent.com",
      port:"",
      pathname:"**"
    }]
  }
};

export default nextConfig;
