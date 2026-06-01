import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Next 16 requires local images with a query string (e.g. Payload media
    // served as /api/media/file/x.png?prefix=media) to be allow-listed. Defining
    // localPatterns turns it into an allow-list for ALL local images, so keep one
    // permissive same-origin pattern (search omitted = any query allowed).
    localPatterns: [{ pathname: '/**' }],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "strapi.sbryan.studio",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
