import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/producto/**",
      },
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/OperaDely/**",
      },
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/KamutBakery/**",
      },
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/ElFrailer/**",
      },
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/home/**",
      },
      {
        protocol: "https",
        hostname: "ahnwufslxmgrfqywuoqe.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/Logos/**",
      },
    ],
  },
};

export default nextConfig;