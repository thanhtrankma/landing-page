// Shared by the browser editor and the server: card formats, fonts, roles and record shapes.

export type CardFormat = { id: string; label: string; width: number; height: number; /** Print size in mm. */ mm: [number, number] };

// Logical canvas sizes (px). Exports scale these up, so they only fix the aspect ratio and text sizes.
export const CARD_FORMATS: CardFormat[] = [
  { id: "5x7", label: "Thiệp dọc 5×7", width: 1000, height: 1400, mm: [127, 177.8] },
  { id: "7x5", label: "Thiệp ngang 7×5", width: 1400, height: 1000, mm: [177.8, 127] },
  { id: "square", label: "Vuông", width: 1200, height: 1200, mm: [150, 150] },
  { id: "story", label: "Story 9:16", width: 1080, height: 1920, mm: [108, 192] },
];

export const formatById = (id: string | undefined | null) => CARD_FORMATS.find((f) => f.id === id);
export const formatBySize = (w: number, h: number) => CARD_FORMATS.find((f) => f.width === w && f.height === h);

/** Fonts with a Vietnamese subset (self-hosted through @fontsource, see components/cards/fonts.ts). */
export const CARD_FONTS: { family: string; label: string; kind: "script" | "serif" | "sans" | "display" }[] = [
  { family: "Great Vibes", label: "Great Vibes", kind: "script" },
  { family: "Dancing Script", label: "Dancing Script", kind: "script" },
  { family: "Pinyon Script", label: "Pinyon Script", kind: "script" },
  { family: "Alex Brush", label: "Alex Brush", kind: "script" },
  { family: "Charm", label: "Charm", kind: "script" },
  { family: "Playfair Display", label: "Playfair Display", kind: "serif" },
  { family: "Cormorant Garamond", label: "Cormorant Garamond", kind: "serif" },
  { family: "Lora", label: "Lora", kind: "serif" },
  { family: "Montserrat", label: "Montserrat", kind: "sans" },
  { family: "Be Vietnam Pro", label: "Be Vietnam Pro", kind: "sans" },
  { family: "Pacifico", label: "Pacifico", kind: "display" },
  { family: "Lobster", label: "Lobster", kind: "display" },
];

/** Text roles: the "Điền nhanh" form fills every text object carrying one of these. */
export const TEXT_ROLES: { role: string; label: string; placeholder: string; multiline?: boolean }[] = [
  { role: "groomName", label: "Tên chú rể", placeholder: "Minh Anh" },
  { role: "brideName", label: "Tên cô dâu", placeholder: "Thu Hà" },
  { role: "date", label: "Ngày cưới", placeholder: "12 . 12 . 2026" },
  { role: "weekday", label: "Thứ / giờ", placeholder: "Thứ Bảy, 11 giờ 00" },
  { role: "lunarDate", label: "Ngày âm lịch", placeholder: "(Tức ngày 23 tháng 10 năm Bính Ngọ)" },
  { role: "venue", label: "Nơi tổ chức", placeholder: "Trung tâm tiệc cưới Hoa Sen" },
  { role: "address", label: "Địa chỉ", placeholder: "123 Lê Lợi, Quận 1, TP. Hồ Chí Minh", multiline: true },
  { role: "groomParents", label: "Nhà trai", placeholder: "Ông Nguyễn Văn A\nBà Trần Thị B", multiline: true },
  { role: "brideParents", label: "Nhà gái", placeholder: "Ông Lê Văn C\nBà Phạm Thị D", multiline: true },
  { role: "invite", label: "Lời mời", placeholder: "Trân trọng kính mời", multiline: true },
];

/** Photo frames: a shape with one of these roles becomes a clip mask when the user adds a photo. */
export const PHOTO_ROLES = [
  { role: "photo1", label: "Ảnh chính" },
  { role: "photo2", label: "Ảnh phụ 1" },
  { role: "photo3", label: "Ảnh phụ 2" },
];

export const HINT_PREFIX = "hint:";
export const BG_ROLE = "background";
export const BG_IMAGE_ROLE = "bgImage";

/** Extra object properties kept in the saved JSON. */
export const CUSTOM_PROPS = ["role", "locked"];

/** Serialized canvas as stored: Fabric's toObject() output. */
export type CardJson = { version?: string; objects: Record<string, unknown>[]; background?: string };

export type CardTemplate = {
  id: string;
  slug: string;
  name: string;
  tags: string[];
  width: number;
  height: number;
  canvas: CardJson;
  thumbUrl: string;
  sortOrder: number;
  published: boolean;
  /** Bundled seed (not in the database). */
  seed?: boolean;
};

export type CardDesign = {
  id: string;
  title: string;
  templateSlug: string | null;
  width: number;
  height: number;
  canvas: CardJson;
  shareSlug: string | null;
  previewUrl: string;
  updatedAt: string;
};

export type SharedCard = {
  title: string;
  width: number;
  height: number;
  previewUrl: string;
  meta: CardMeta;
};

export type CardMeta = { groom?: string; bride?: string; date?: string; venue?: string };

export const TEMPLATE_TAGS: [id: string, label: string][] = [
  ["thanh-lich", "Thanh lịch"],
  ["toi-gian", "Tối giản"],
  ["hoa", "Hoa lá"],
  ["truyen-thong", "Truyền thống"],
  ["save-the-date", "Save the date"],
  ["story", "Story / mạng xã hội"],
];
