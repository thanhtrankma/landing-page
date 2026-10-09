import type { ReactNode } from "react";
import type { InviteData, InviteEvent, parseDate } from "@/lib/invites/types";

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
  /** The ready-made wishes & RSVP section, or null when turned off. */
  wishes: ReactNode;
  /** The event held on the main date (else the first one): used for "17:00 · Chủ Nhật" lines. */
  mainEvent?: InviteEvent;
};
