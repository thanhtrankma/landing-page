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
    // Serve files as-is: the Vercel image optimizer is over its plan quota (402 on /_next/image),
    // so the images in public/ are pre-compressed to webp instead.
    unoptimized: true,
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
  // Large PNGs in public/images were converted to webp, but posts/projects stored in the database (and
  // links indexed elsewhere) still point at the old .png paths. afterFiles only runs when no public file
  // matched, so PNGs that still exist are served as before.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [{ source: "/images/:name([^/]+)\\.png", destination: "/images/:name.webp" }],
      fallback: [],
    };
  },
};

export default nextConfig;
