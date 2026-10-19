"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { EnglishTexts, InviteData } from "@/lib/invites/types";

// Bilingual cards: fixed labels have built-in English, the couple's own texts take their English version
// from data.en. Vietnamese always comes first; English sits underneath in a smaller line.

export type GuestInfo = { code: string; name: string; greeting: string; maxPeople: number | null };
type Ctx = { d: InviteData; guest: GuestInfo | null; slug: string | null; preview: boolean; demo: boolean };

export const InviteCtx = createContext<Ctx | null>(null);
export const useInvite = () => useContext(InviteCtx)!;

/** Fixed label: <T vi="Chỉ đường" en="Directions" /> */
export function T({ vi, en }: { vi: ReactNode; en: ReactNode }) {
  const { d } = useInvite();
  if (d.lang !== "vi-en") return <>{vi}</>;
  return (
    <>
      {vi}
      <span className="iv-en">{en}</span>
    </>
  );
}

/** The same for plain strings (placeholders, aria labels): "Tên của bạn / Your name". */
export function useTt() {
  const { d } = useInvite();
  return (vi: string, en: string) => (d.lang === "vi-en" ? `${vi} / ${en}` : vi);
}

type BiKey = "inviteHeading" | "inviteLine" | "announcement" | "quote" | "thanks";

/** One of the couple's texts with its English line: <Bi k="inviteHeading" /> */
export function Bi({ k }: { k: BiKey }) {
  const { d } = useInvite();
  const vi = d[k];
  const en = d.en[k as keyof EnglishTexts];
  if (d.lang !== "vi-en" || !en) return <>{vi}</>;
  return (
    <>
      {vi}
      <span className="iv-en">{en}</span>
    </>
  );
}

/** Family block title: "Nhà trai" + "Groom's family". */
export function FamilyTitle({ which }: { which: "groomFamily" | "brideFamily" }) {
  const { d } = useInvite();
  const en = d.en[which];
  return (
    <>
      {d[which].title}
      {d.lang === "vi-en" && en && <span className="iv-en">{en}</span>}
    </>
  );
}

/** "Trân trọng báo tin lễ thành hôn của con chúng tôi" (hidden when empty). */
export function Announce({ className = "" }: { className?: string }) {
  const { d } = useInvite();
  if (!d.announcement) return null;
  return (
    <p className={`iv-announce iv-reveal ${className}`}>
      <Bi k="announcement" />
    </p>
  );
}

/** "Trưởng nam" / "Út nữ" under a name. */
export function PersonTitle({ which }: { which: "groom" | "bride" }) {
  const { d } = useInvite();
  const t = which === "groom" ? d.groomTitle : d.brideTitle;
  return t ? <small className="iv-person-title">{t}</small> : null;
}
