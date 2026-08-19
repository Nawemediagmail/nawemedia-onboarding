import type { NextConfig } from "next";

// Hosted at www.nawemedia.com/press-kit-web_formulario-DJ via a rewrite from
// the nawemedia-web project — basePath makes Next.js prefix all routes and
// static assets so they resolve correctly under that subpath.
const nextConfig: NextConfig = {
  basePath: "/press-kit-web_formulario-DJ",
  images: {
    remotePatterns: [new URL("https://*.supabase.co/storage/v1/object/public/**")],
  },
};

export default nextConfig;
