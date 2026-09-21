import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { IconName } from "@/data/site";

const iconPaths: Record<IconName, ReactNode> = {
  arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
  check: <path d="m5 12 4 4L19 6" />,
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 7h2m4 0h2M8 11h2m4 0h2M9 21v-5h6v5" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 5c3-3 6-2 6-2s1 3-2 6l-5 5-4-4Z" />
      <path d="m9 10-4 1-2 2 6 1m4 0 1 6 2-2 1-5M7 17c-2 0-3 1-3 3 2 0 3-1 3-3Z" />
    </>
  ),
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 2 2 0 0 1 1-3.7h3A3 3 0 0 0 21 11a9 9 0 0 0-9-8Z" />
      <circle cx="8" cy="10" r=".5" />
      <circle cx="11" cy="7" r=".5" />
      <circle cx="16" cy="8" r=".5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  layout: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M9 9v11" />
    </>
  ),
  code: <path d="m8 8-5 4 5 4m8-8 5 4-5 4m-2-11-4 14" />,
  shield: (
    <>
      <path d="M12 3 4 6v5c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10V6Z" />
      <path d="m9 12 2 2 4-5" />
    </>
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m5 7H2" />,
  cloud: <path d="M7 18h11a4 4 0 0 0 .4-8A7 7 0 0 0 5 9a4.5 4.5 0 0 0 2 9Z" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  phone: (
    <path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-4-2-2 2c-3.5-1.5-6.5-4.5-8-8l2-2Z" />
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
};

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  return (
    <svg className="gv-icon" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {iconPaths[name]}
    </svg>
  );
}

export function Brand() {
  return (
    <Link href="/" className="gv-brand">
      <span
        className="gv-mark"
        style={{
          borderRadius: "50%",
          background: "white",
          border: "1.5px solid rgba(11,111,164,0.12)",
          overflow: "hidden",
          width: "36px",
          height: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image src="/images/logo.png" alt="SuperLanding" width={36} height={36} style={{ objectFit: "cover" }} />
      </span>
      <span>
        Super<b>Landing</b>
      </span>
    </Link>
  );
}

export function Button({ href, light = false, children }: { href: string; light?: boolean; children: ReactNode }) {
  return (
    <Link className={light ? "gv-btn light" : "gv-btn"} href={href}>
      {children}
      <Icon name="arrow" size={17} />
    </Link>
  );
}

export function Heading({
  eyebrow,
  title,
  text,
  center = false,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "gv-heading center" : "gv-heading"}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
