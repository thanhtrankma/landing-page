import type { Viewport } from "next";
import { inviteFontVars } from "@/components/invite/fonts";

// Public invitation pages (/thiep/<slug>) stand alone: no site header, footer or chat buttons.

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#6c1014" };

export default function InviteRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inviteFontVars}>
      <body style={{ margin: 0, background: "#6c1014" }}>{children}</body>
    </html>
  );
}
