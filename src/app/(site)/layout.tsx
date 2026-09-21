import type { Metadata } from "next";
import { Be_Vietnam_Pro, Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import AnimatedBackground from "@/components/AnimatedBackground";
import SkyCursor from "@/components/SkyCursor";
import Tracker from "@/components/Tracker";
import Footer from "@/components/Footer";
import { MobileBottomNav, ScrollToTop, ZaloFloat } from "@/components/FloatingUi";
import Header from "@/components/Header";
import ScrollReveal from "@/components/ScrollReveal";
import { SettingsProvider } from "@/components/SettingsProvider";
import { getSettings } from "@/lib/site-data";
import type { SiteSettings } from "@/lib/models";
import "./globals.css";
import "./theme.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin", "latin-ext"], weight: ["600", "700", "800"] });
const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["600", "700", "800"],
});

const SITE_URL = "https://web-landing.com";
const TITLE = "SuperLanding — Thiết Kế Website & Landing Page Theo Yêu Cầu";
const OG_DESCRIPTION = "Thiết kế Website và Landing Page theo yêu cầu, chú trọng trải nghiệm, tốc độ, SEO và chuyển đổi.";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "SuperLanding thiết kế Website và Landing Page theo yêu cầu cho cá nhân, cửa hàng và doanh nghiệp, chú trọng trải nghiệm, tốc độ, SEO và chuyển đổi.",
  authors: [{ name: "SuperLanding" }],
  creator: "SuperLanding",
  publisher: "SuperLanding",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/images/logo.png", shortcut: "/images/logo.png", apple: "/images/logo.png" },
  openGraph: {
    title: TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "SuperLanding",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SuperLanding — Thiết kế Website và Landing Page theo yêu cầu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: OG_DESCRIPTION,
    images: [`${SITE_URL}/images/og-image.png`],
  },
};

// The site is light-only; pin the theme attribute so any leftover theme hooks stay in light mode.
const themeScript = `document.documentElement.setAttribute('data-theme','light');`;

const organizationJsonLd = (settings: SiteSettings) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "SuperLanding",
      alternateName: ["SuperLanding Vietnam", "SuperLanding Studio"],
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/images/logo.png`, width: "200", height: "200" },
      address: { "@type": "PostalAddress", addressLocality: settings.address.split(",")[0].trim(), addressCountry: "VN" },
      description: "Đơn vị cung cấp giải pháp thiết kế và lập trình Website, Landing Page theo yêu cầu tại Việt Nam.",
      knowsAbout: [
        "Thiết kế Landing Page",
        "Thiết kế Website Doanh nghiệp",
        "Tối ưu tỷ lệ chuyển đổi (CRO)",
        "SEO Google & GEO (Generative Engine Optimization)",
        "Lập trình Next.js & React",
        "Tối ưu hóa tốc độ tải trang Core Web Vitals",
        "Quảng cáo Google Ads & TikTok Ads",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        telephone: settings.phoneIntl,
        email: settings.email,
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["Vietnamese", "English"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "SuperLanding",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "vi-VN",
    },
  ],
});

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${beVietnam.variable} ${outfit.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(settings)) }} />
      </head>
      <body>
        <SettingsProvider value={settings}>
          <AnimatedBackground />
          <div className="relative z-[1]">
            <ScrollReveal />
            <SkyCursor />
            <Tracker />
            <Header />
            {children}
            <ScrollToTop />
            <ZaloFloat />
            <MobileBottomNav />
            <Footer />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
