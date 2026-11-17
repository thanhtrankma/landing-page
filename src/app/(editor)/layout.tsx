import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./editor.css";

// Full-screen tools (card editor) get their own root layout: no site header, footer or floating buttons.

// Self-hosted Be Vietnam Pro (src/app/fonts), shared with the public site.
const beVietnam = localFont({
  src: [
    { path: "../fonts/be-vietnam-pro/BeVietnamPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/be-vietnam-pro/BeVietnamPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/be-vietnam-pro/BeVietnamPro-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/be-vietnam-pro/BeVietnamPro-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-ui",
});

export const metadata: Metadata = {
  title: "Thiết kế thiệp cưới | SuperLanding",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: "/favicon.ico", sizes: "48x48" }], apple: "/images/logo-apple.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function EditorRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body>{children}</body>
    </html>
  );
}
