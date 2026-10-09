import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./editor.css";

// Full-screen tools (card editor) get their own root layout: no site header, footer or floating buttons.

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-ui",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
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
