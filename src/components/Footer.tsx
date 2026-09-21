import Image from "next/image";
import Link from "next/link";
import {
  ADDRESS,
  EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  PHONE,
  PHONE_DISPLAY,
  SHOW_SOCIALS,
  TIKTOK_URL,
  ZALO_URL,
  facebookPath,
} from "@/data/site";
import { Brand } from "./ui";

const tiktokPath =
  "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.17 8.17 0 0 0 4.76 1.53V6.78a4.85 4.85 0 0 1-.85-.09z";

const instagramPath =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Footer() {
  return (
    <footer>
      <div className="gv-wrap footer-grid">
        <div>
          <Brand />
          <p>
            SuperLanding thiết kế website và landing page tối ưu SEO, tốc độ và
            tỷ lệ chuyển đổi cho cá nhân và doanh nghiệp.
          </p>
          <div className="footer-socials">
            {SHOW_SOCIALS && (
              <a href={FACEBOOK_URL} {...external} aria-label="Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d={facebookPath} />
                </svg>
              </a>
            )}
            <a href={ZALO_URL} {...external} aria-label="Zalo">
              <Image
                src="/images/zalo-icon.png"
                alt="Tư vấn Zalo thiết kế website SuperLanding"
                width={24}
                height={24}
              />
            </a>
            {SHOW_SOCIALS && (
              <>
                <a href={TIKTOK_URL} {...external} aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={tiktokPath} />
                  </svg>
                </a>
                <a href={INSTAGRAM_URL} {...external} aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d={instagramPath} />
                  </svg>
                </a>
              </>
            )}
          </div>
        </div>
        <div>
          <b>Khám phá</b>
          <Link href="/dich-vu">Dịch vụ</Link>
          <Link href="/thiet-ke-website">Thiết kế Website</Link>
          <Link href="/thiet-ke-landing-page">Thiết kế Landing Page</Link>
          <Link href="/du-an">Dự án</Link>
          <Link href="/bang-gia">Bảng giá</Link>
          <Link href="/tin-tuc">Tin tức</Link>
          <Link href="/lien-he">Liên hệ</Link>
        </div>
        <div>
          <b>Liên hệ</b>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={`tel:${PHONE}`}>Hotline: {PHONE_DISPLAY}</a>
          <a href={ZALO_URL} {...external}>
            Zalo: {PHONE_DISPLAY}
          </a>
          {SHOW_SOCIALS && (
            <>
              <a href={FACEBOOK_URL} {...external}>
                Facebook cá nhân
              </a>
              <a href={TIKTOK_URL} {...external}>
                TikTok: @thietkeweblandingpage
              </a>
              <a href={INSTAGRAM_URL} {...external}>
                Instagram: weblandingthietke
              </a>
            </>
          )}
          <a>{ADDRESS}</a>
        </div>
      </div>
      <div className="gv-wrap footer-bottom">
        <span>© 2026 SuperLanding. All rights reserved.</span>
        <span>Chính sách bảo mật · Điều khoản dịch vụ</span>
      </div>
    </footer>
  );
}
