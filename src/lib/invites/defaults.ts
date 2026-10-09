import { lunarLabel } from "./lunar";
import { demoSlug, emptyBank, INVITE_THEMES, type InviteData, type InviteTheme } from "./types";

// Starting content for a new invitation, and the public demo (/thiep/mau-song-hy).

/** A Saturday about four months from now, as yyyy-mm-dd. */
export function suggestedDate(now = new Date()) {
  const d = new Date(now.getFullYear(), now.getMonth() + 4, 1);
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const dayBefore = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d - 1));
  return t.toISOString().slice(0, 10);
};

export function defaultInvite(date = suggestedDate(), theme: InviteTheme = "song-hy"): InviteData {
  const eve = dayBefore(date);
  return {
    theme,
    groomName: "Minh Anh",
    brideName: "Thu Hà",
    groomFullName: "Nguyễn Minh Anh",
    brideFullName: "Trần Thu Hà",
    date,
    cover: "",
    couplePhoto: "",
    highlights: ["", "", ""],
    groomFamily: { title: "Nhà trai", parents: "Bố: Nguyễn Văn Bình\nMẹ: Lê Thị Hoa", address: "Phường Tân Định, TP. Hồ Chí Minh" },
    brideFamily: { title: "Nhà gái", parents: "Bố: Trần Văn Cường\nMẹ: Phạm Thị Lan", address: "Phường Thảo Điền, TP. Hồ Chí Minh" },
    inviteHeading: "Trân trọng kính mời",
    inviteLine: "Tham dự lễ cưới của chúng tôi",
    quote: "Hôn nhân là chuyện cả đời,\nYêu người vừa ý, cưới người mình thương…",
    defaultGuest: "Quý khách",
    events: [
      { id: "vu-quy", title: "Lễ vu quy", time: "09:00", date: eve, lunar: lunarLabel(eve), venue: "Tư gia nhà gái", address: "", mapUrl: "" },
      { id: "tiec-cuoi", title: "Tiệc mừng lễ cưới", time: "17:00", date, lunar: lunarLabel(date), venue: "Trung tâm tiệc cưới Hoa Sen", address: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh", mapUrl: "" },
    ],
    gallery: [],
    gift: { enabled: false, groom: emptyBank(), bride: emptyBank() },
    rsvp: { enabled: true },
    thanks: "Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.",
    thanksPhoto: "",
    music: { src: "", title: "" },
    petals: true,
    // Song Hỷ opens straight onto the card, like the printed original; the others start with the envelope.
    // The LoveCard-style themes open straight onto the card, like the originals.
    intro: !["song-hy", "vang-do", "do-do"].includes(theme),
  };
}

export const DEMO_SLUG = demoSlug("song-hy");
/** Theme demos live at /thiep/mau-<theme>, served from code. */
export const demoThemeBySlug = (slug: string) => INVITE_THEMES.find((t) => demoSlug(t.id) === slug)?.id;
export const demoInvite = (theme: InviteTheme = "song-hy"): InviteData => defaultInvite("2026-12-12", theme);
