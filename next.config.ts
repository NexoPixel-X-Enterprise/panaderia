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
    ],
  },
};

export default nextConfig;