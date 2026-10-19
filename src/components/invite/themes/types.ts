import type { ReactNode } from "react";
import type { InviteData, InviteEvent, parseDate, SectionKey } from "@/lib/invites/types";

/** Everything a theme needs to lay out the invitation (computed once by <Invitation>). */
export type ThemeCtx = {
  d: InviteData;
  /** Couple names with each name kept on one line. */
  names: ReactNode;
  title: string;
  date: ReturnType<typeof parseDate>;
  mono: string;
  guestName: string;
  /** Three photos for day / month / year (falls back to cover & couple photo). */
  highlights: string[];
  /** Schedule, dress code, RSVP and guestbook (each already respecting its show/hide switch). */
  wishes: ReactNode;
  /** Section switches from the editor ("Hiện/Ẩn"). */
  show: Record<SectionKey, boolean>;
  /** "Chú rể"/"Cô dâu" in display order (the bride can come first). */
  labels: { first: string; second: string };
  /** The event held on the main date (else the first one): used for "17:00 · Chủ Nhật" lines. */
  mainEvent?: InviteEvent;
};
