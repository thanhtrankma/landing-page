import { lunarLabel } from "./lunar";
import { demoSlug, emptyBank, INVITE_THEMES, themeDef, SECTION_KEYS, type InviteData, type InviteTheme, type SectionKey } from "./types";

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

export function defaultInvite(date = suggestedDate(), theme: InviteTheme = "song-hy", color = ""): InviteData {
  const eve = dayBefore(date);
  return {
    theme,
    color: themeDef(theme).variants.some((v) => v.id === color) ? color : "",
    groomName: "Dũng Thành",
    brideName: "Thuỳ Trang",
    groomFullName: "Nguyễn Dũng Thành",
    brideFullName: "Trần Thuỳ Trang",
    groomTitle: "Trưởng nam",
    brideTitle: "Út nữ",
    groomFirst: true,
    announcement: "Trân trọng báo tin lễ thành hôn của con chúng tôi",
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
      { id: "vu-quy", kind: "ceremony", title: "Lễ vu quy", time: "09:00", welcomeTime: "", startTime: "", date: eve, lunar: lunarLabel(eve), venue: "Tư gia nhà gái", address: "", mapUrl: "", showMap: false },
      { id: "tiec-cuoi", kind: "party", title: "Tiệc mừng lễ cưới", time: "17:00", welcomeTime: "17:00", startTime: "18:00", date, lunar: lunarLabel(date), venue: "Trung tâm tiệc cưới Hoa Sen", address: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh", mapUrl: "", showMap: true },
    ],
    gallery: [],
    gift: { enabled: false, groom: emptyBank(), bride: emptyBank() },
    rsvp: {
      enabled: true,
      mode: "button",
      limit: null,
      questions: [{ id: "xe", label: "Bạn có cần xe đưa đón không?", type: "choice", options: ["Có", "Không"] }],
    },
    thanks: "Từ tận đáy lòng, chúng mình cảm ơn bạn đã dành tình cảm và sự hiện diện cho ngày vui này. Chính bạn đã góp phần làm nên một kỷ niệm hạnh phúc mà chúng mình sẽ luôn trân trọng.",
    thanksPhoto: "",
    music: { src: "", title: "" },
    petals: true,
    // Song Hỷ opens straight onto the card, like the printed original; the others start with the envelope.
    // The LoveCard-style themes open straight onto the card, like the originals.
    intro: !["song-hy", "vang-do", "do-do"].includes(theme),
    show: Object.fromEntries(SECTION_KEYS.map((k) => [k, !["schedule", "dressCode"].includes(k)])) as Record<SectionKey, boolean>,
    schedule: {
      title: "Lịch trình ngày cưới",
      items: [
        { time: "17:00", label: "Đón khách" },
        { time: "18:00", label: "Khai tiệc" },
        { time: "19:00", label: "Cắt bánh & nâng ly" },
        { time: "21:00", label: "Kết thúc tiệc" },
      ],
    },
    dressCode: { note: "Rất vui nếu bạn chọn trang phục theo tông màu của tiệc cưới", colors: ["#f5efe6", "#d9b5a0", "#8a5a44"] },
    lang: "vi",
    en: {
      inviteHeading: "Respectfully invite",
      inviteLine: "to celebrate our wedding",
      announcement: "We joyfully announce the wedding of our children",
      quote: "",
      thanks: "Thank you from the bottom of our hearts for sharing this special day with us.",
      groomFamily: "Groom's family",
      brideFamily: "Bride's family",
    },
  };
}

export const DEMO_SLUG = demoSlug("song-hy");
/** Theme demos live at /thiep/mau-<theme>, served from code. */
export const demoBySlug = (slug: string) => {
  const [base, color = ""] = slug.split("--");
  const t = INVITE_THEMES.find((x) => demoSlug(x.id) === base);
  if (!t || (color && !t.variants.some((v) => v.id === color))) return undefined;
  return { theme: t.id, color };
};
/** Demos also show the album (empty frames) and the gift box with a placeholder account (no QR). */
export const demoInvite = (theme: InviteTheme = "song-hy", color = ""): InviteData => {
  const d = defaultInvite("2026-12-12", theme, color);
  const bank = (holder: string) => ({ ...emptyBank(), bank: "Vietcombank", account: "0000 000 000", holder });
  return { ...d, gallery: ["", "", "", "", ""], gift: { enabled: true, groom: bank("NGUYEN DUNG THANH"), bride: bank("TRAN THUY TRANG") } };
};
