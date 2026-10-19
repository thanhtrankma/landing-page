import type { NextConfig } from "next";

const hostOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).hostname : null;
  } catch {
    return null;
  }
};

// Images uploaded from the admin live in Supabase Storage, user uploads (wedding cards) in Cloudflare R2,
// so next/image must be allowed to load from both.
const supabaseHost = hostOf(process.env.SUPABASE_URL);
const r2Host = hostOf(process.env.R2_PUBLIC_URL);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : []),
      ...(r2Host ? [{ protocol: "https" as const, hostname: r2Host, pathname: "/cards/**" }] : []),
    ],
  },
  // One canonical host: the bare domain goes to www, so login cookies, Google sign-in (whose callback is
  // registered on www) and SEO all see the same origin.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "superlanding.vn" }],
        destination: "https://www.superlanding.vn/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
