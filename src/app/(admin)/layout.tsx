import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./admin.css";

// Same self-hosted Inter file as the public site (see src/app/fonts).
const inter = localFont({
  src: "../fonts/inter/Inter-Variable.woff2",
  variable: "--font-admin",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Quản trị | SuperLanding", template: "%s | Quản trị SuperLanding" },
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body className="adm">{children}</body>
    </html>
  );
}
