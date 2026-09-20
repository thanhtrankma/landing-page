import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const rule = (userAgent: string | string[]) => ({ userAgent, allow: "/", disallow: ["/admin/", "/api/"] });

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      rule(["Googlebot", "Googlebot-Image", "Bingbot", "Slurp", "DuckDuckBot"]),
      rule([
        "GPTBot",
        "ChatGPT-User",
        "Google-Extended",
        "PerplexityBot",
        "ClaudeBot",
        "Claude-Web",
        "Applebot-Extended",
        "Bytespider",
        "CCBot",
        "FacebookBot",
      ]),
      rule("*"),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
