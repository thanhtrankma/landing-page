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
};

export default nextConfig;
