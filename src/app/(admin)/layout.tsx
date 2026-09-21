import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./admin.css";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-admin", display: "swap" });

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
