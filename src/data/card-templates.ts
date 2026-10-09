import { BG_ROLE, HINT_PREFIX, type CardJson, type CardTemplate } from "@/lib/cards/types";

// Bundled starter templates for the wedding card tool. Shown when the database has none, and importable into
// the database from /admin/mau-thiep. Fabric v7 positions objects by their CENTER (left/top = center point).

type O = Record<string, unknown>;

const bg = (w: number, h: number, fill: unknown): O => ({
  type: "Rect", left: w / 2, top: h / 2, width: w, height: h, fill, strokeWidth: 0, selectable: false, evented: false, role: BG_ROLE,
});

const text = (t: string, x: number, y: number, width: number, o: O = {}): O => ({
  type: "Textbox", text: t, left: x, top: y, width, textAlign: "center", fontFamily: "Be Vietnam Pro", fontSize: 28,
  fontWeight: "normal", fontStyle: "normal", fill: "#333333", lineHeight: 1.25, charSpacing: 0, ...o,
});

const rect = (x: number, y: number, w: number, h: number, o: O = {}): O => ({
  type: "Rect", left: x, top: y, width: w, height: h, fill: "rgba(0,0,0,0)", strokeWidth: 0, ...o,
});

const circle = (x: number, y: number, r: number, o: O = {}): O => ({ type: "Circle", left: x, top: y, radius: r, fill: "#000000", strokeWidth: 0, ...o });

const path = (d: string, x: number, y: number, o: O = {}): O => ({ type: "Path", path: d, left: x, top: y, fill: "rgba(0,0,0,0)", strokeWidth: 0, ...o });

const linear = (from: string, to: string, vertical = true): O => ({
  type: "linear", gradientUnits: "percentage", coords: vertical ? { x1: 0, y1: 0, x2: 0, y2: 1 } : { x1: 0, y1: 0, x2: 1, y2: 1 },
  colorStops: [{ offset: 0, color: from }, { offset: 1, color: to }],
});

/** Arch (rounded top) centered on 0,0. */
const archPath = (w: number, h: number) => {
  const r = w / 2;
  return `M ${-r} ${h / 2} L ${-r} ${-h / 2 + r} A ${r} ${r} 0 0 1 ${r} ${-h / 2 + r} L ${r} ${h / 2} Z`;
};
const HEART = "M 0 18 C -30 -2 -28 -26 -12 -28 C -4 -29 0 -22 0 -18 C 0 -22 4 -29 12 -28 C 28 -26 30 -2 0 18 Z";
const LEAF = "M 0 -40 C 22 -20 22 20 0 40 C -22 20 -22 -20 0 -40 Z";
const divider = (half: number) => `M ${-half} 0 L -16 0 M 16 0 L ${half} 0 M 0 -9 L 9 0 L 0 9 L -9 0 Z`;

const placeholder = (from = "#efe7dc", to = "#d9cbb8") => linear(from, to, false);
const hint = (role: string, x: number, y: number, color = "#7a6a55"): O =>
  text("+ Thêm ảnh của bạn", x, y, 360, { fontFamily: "Montserrat", fontSize: 26, fontWeight: "600", fill: color, role: `${HINT_PREFIX}${role}` });

const sprig = (x: number, y: number, angle: number, color: string, scale = 1): O[] =>
  [0, 1, 2, 3].map((i) => {
    const rad = (angle * Math.PI) / 180;
    const d = i * 46 * scale;
    return path(LEAF, x + Math.cos(rad) * d, y + Math.sin(rad) * d, {
      fill: color, angle: angle + 90 + (i % 2 ? 38 : -38), scaleX: scale * (1 - i * 0.12), scaleY: scale * (1 - i * 0.12),
    });
  });

const card = (objects: O[]): CardJson => ({ version: "7.4.0", background: "#ffffff", objects });

// ───────────── templates ─────────────

const classicGold = (): CardJson => {
  const gold = "#b89257", brown = "#5b4630", soft = "#8a7350";
  return card([
    bg(1000, 1400, "#fbf6ec"),
    rect(500, 700, 920, 1320, { stroke: gold, strokeWidth: 3 }),
    rect(500, 700, 890, 1290, { stroke: gold, strokeWidth: 1 }),
    circle(500, 300, 170, { fill: placeholder(), role: "photo1" }),
    hint("photo1", 500, 300, soft),
    circle(500, 300, 184, { fill: "rgba(0,0,0,0)", stroke: gold, strokeWidth: 4 }),
    text("TRÂN TRỌNG KÍNH MỜI", 500, 540, 760, { fontFamily: "Montserrat", fontSize: 22, charSpacing: 380, fill: soft, role: "invite" }),
    text("Lễ Thành Hôn", 500, 598, 760, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 36, fill: brown }),
    text("Minh Anh", 500, 712, 800, { fontFamily: "Great Vibes", fontSize: 112, fill: "#8f6a35", role: "groomName" }),
    text("&", 500, 800, 200, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 54, fill: gold }),
    text("Thu Hà", 500, 888, 800, { fontFamily: "Great Vibes", fontSize: 112, fill: "#8f6a35", role: "brideName" }),
    path(divider(150), 500, 985, { stroke: gold, strokeWidth: 2, fill: gold }),
    text("THỨ BẢY · 11 GIỜ 00", 500, 1045, 760, { fontFamily: "Montserrat", fontSize: 24, charSpacing: 220, fill: soft, role: "weekday" }),
    text("12 . 12 . 2026", 500, 1112, 760, { fontFamily: "Cormorant Garamond", fontSize: 66, fontWeight: "600", fill: brown, role: "date" }),
    text("(Tức ngày 23 tháng 10 năm Bính Ngọ)", 500, 1176, 760, { fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 28, fill: soft, role: "lunarDate" }),
    text("TRUNG TÂM TIỆC CƯỚI HOA SEN", 500, 1240, 780, { fontFamily: "Montserrat", fontSize: 24, fontWeight: "600", charSpacing: 120, fill: brown, role: "venue" }),
    text("123 Lê Lợi, Quận 1, TP. Hồ Chí Minh", 500, 1286, 780, { fontSize: 21, fill: soft, role: "address" }),
  ]);
};

const pastelRose = (): CardJson => {
  const rose = "#c0566b", soft = "#9b6b74";
  return card([
    bg(1000, 1400, linear("#fde9ec", "#fffaf8")),
    circle(110, 110, 260, { fill: "#f8d7dc", opacity: 0.55 }),
    circle(920, 1330, 220, { fill: "#f6c9d0", opacity: 0.5 }),
    path(archPath(480, 600), 500, 410, { fill: placeholder("#f6dfe2", "#e9c3c9"), role: "photo1" }),
    hint("photo1", 500, 430, soft),
    path(archPath(512, 632), 500, 410, { stroke: "#e8a3ae", strokeWidth: 3 }),
    path(HEART, 470, 772, { fill: "#e8a3ae", scaleX: 0.7, scaleY: 0.7 }),
    path(HEART, 530, 772, { fill: rose, scaleX: 0.7, scaleY: 0.7 }),
    text("Minh Anh", 500, 852, 800, { fontFamily: "Dancing Script", fontSize: 92, fontWeight: "700", fill: rose, role: "groomName" }),
    text("&", 500, 922, 200, { fontFamily: "Dancing Script", fontSize: 58, fill: "#e8a3ae" }),
    text("Thu Hà", 500, 992, 800, { fontFamily: "Dancing Script", fontSize: 92, fontWeight: "700", fill: rose, role: "brideName" }),
    text("Trân trọng kính mời bạn đến chung vui cùng gia đình chúng tôi", 500, 1086, 720, { fontStyle: "italic", fontSize: 25, fill: soft, role: "invite" }),
    text("12 . 12 . 2026", 500, 1168, 760, { fontFamily: "Playfair Display", fontSize: 58, fontWeight: "700", fill: rose, role: "date" }),
    text("Thứ Bảy, lúc 11 giờ 00", 500, 1230, 760, { fontSize: 25, fill: soft, role: "weekday" }),
    text("Nhà hàng Hoa Hồng", 500, 1282, 780, { fontSize: 26, fontWeight: "600", fill: rose, role: "venue" }),
    text("45 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh", 500, 1324, 780, { fontSize: 21, fill: soft, role: "address" }),
  ]);
};

const minimal = (): CardJson => card([
  bg(1000, 1400, "#ffffff"),
  rect(500, 410, 1000, 820, { fill: placeholder("#eceff1", "#cfd6db"), role: "photo1" }),
  hint("photo1", 500, 410, "#5d6b74"),
  rect(500, 900, 120, 2, { fill: "#111111" }),
  text("MINH ANH", 500, 975, 900, { fontFamily: "Montserrat", fontSize: 62, fontWeight: "600", charSpacing: 300, fill: "#111111", role: "groomName" }),
  text("&", 500, 1045, 200, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 42, fill: "#777777" }),
  text("THU HÀ", 500, 1115, 900, { fontFamily: "Montserrat", fontSize: 62, fontWeight: "600", charSpacing: 300, fill: "#111111", role: "brideName" }),
  text("12.12.2026", 500, 1220, 800, { fontFamily: "Montserrat", fontSize: 32, charSpacing: 500, fill: "#111111", role: "date" }),
  text("TRUNG TÂM TIỆC CƯỚI HOA SEN", 500, 1285, 860, { fontFamily: "Montserrat", fontSize: 21, charSpacing: 220, fill: "#555555", role: "venue" }),
  text("123 Lê Lợi, Quận 1, TP. Hồ Chí Minh", 500, 1325, 860, { fontSize: 19, fill: "#888888", role: "address" }),
]);

const songHy = (): CardJson => {
  const gold = "#e6c27a", cream = "#fbe9c6";
  return card([
    bg(1000, 1400, "#9e1b1e"),
    rect(500, 700, 930, 1330, { stroke: gold, strokeWidth: 4 }),
    rect(500, 700, 900, 1300, { stroke: gold, strokeWidth: 1.5 }),
    ...[[70, 70], [930, 70], [70, 1330], [930, 1330]].map(([x, y]) => path("M 0 -14 L 14 0 L 0 14 L -14 0 Z", x, y, { fill: gold })),
    text("囍", 500, 225, 400, { fontFamily: "serif", fontSize: 220, fontWeight: "700", fill: gold }),
    text("LỄ THÀNH HÔN", 500, 418, 860, { fontFamily: "Playfair Display", fontSize: 54, fontWeight: "700", charSpacing: 300, fill: gold }),
    text("NHÀ TRAI", 280, 515, 380, { fontFamily: "Montserrat", fontSize: 22, fontWeight: "600", charSpacing: 300, fill: gold }),
    text("Ông Nguyễn Văn A\nBà Trần Thị B", 280, 580, 380, { fontFamily: "Lora", fontSize: 25, fill: cream, role: "groomParents" }),
    text("NHÀ GÁI", 720, 515, 380, { fontFamily: "Montserrat", fontSize: 22, fontWeight: "600", charSpacing: 300, fill: gold }),
    text("Ông Lê Văn C\nBà Phạm Thị D", 720, 580, 380, { fontFamily: "Lora", fontSize: 25, fill: cream, role: "brideParents" }),
    text("Trân trọng báo tin lễ thành hôn của con chúng tôi", 500, 692, 780, { fontFamily: "Lora", fontStyle: "italic", fontSize: 26, fill: cream, role: "invite" }),
    text("Minh Anh", 500, 795, 800, { fontFamily: "Great Vibes", fontSize: 104, fill: gold, role: "groomName" }),
    text("&", 500, 876, 200, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 50, fill: cream }),
    text("Thu Hà", 500, 957, 800, { fontFamily: "Great Vibes", fontSize: 104, fill: gold, role: "brideName" }),
    path(divider(150), 500, 1040, { stroke: gold, strokeWidth: 2, fill: gold }),
    text("THỨ BẢY · 11 GIỜ 00", 500, 1095, 760, { fontFamily: "Montserrat", fontSize: 24, charSpacing: 220, fill: cream, role: "weekday" }),
    text("12 . 12 . 2026", 500, 1160, 760, { fontFamily: "Playfair Display", fontSize: 60, fontWeight: "700", fill: gold, role: "date" }),
    text("(Tức ngày 23 tháng 10 năm Bính Ngọ)", 500, 1220, 760, { fontFamily: "Lora", fontStyle: "italic", fontSize: 24, fill: cream, role: "lunarDate" }),
    text("TƯ GIA NHÀ TRAI", 500, 1278, 780, { fontFamily: "Montserrat", fontSize: 24, fontWeight: "600", charSpacing: 150, fill: gold, role: "venue" }),
    text("Thôn Đông, xã Tân Hòa, huyện Quốc Oai, Hà Nội", 500, 1320, 780, { fontFamily: "Lora", fontSize: 21, fill: cream, role: "address" }),
  ]);
};

const sageBoho = (): CardJson => {
  const green = "#4f6148", soft = "#6f8268";
  return card([
    bg(1000, 1400, "#eef1ea"),
    circle(500, 470, 360, { fill: "#dfe6d8" }),
    ...sprig(285, 735, -60, "#8da386", 1.1),
    ...sprig(735, 175, 120, "#a9bba2", 1),
    path(archPath(500, 640), 500, 450, { fill: placeholder("#e3e9df", "#c4d0bf"), role: "photo1" }),
    hint("photo1", 500, 470, soft),
    path(archPath(530, 670), 500, 450, { stroke: "#8da386", strokeWidth: 2 }),
    text("Minh Anh", 500, 880, 820, { fontFamily: "Pinyon Script", fontSize: 92, fill: green, role: "groomName" }),
    text("&", 500, 952, 200, { fontFamily: "Cormorant Garamond", fontStyle: "italic", fontSize: 50, fill: soft }),
    text("Thu Hà", 500, 1024, 820, { fontFamily: "Pinyon Script", fontSize: 92, fill: green, role: "brideName" }),
    text("12 · 12 · 2026", 500, 1124, 760, { fontFamily: "Cormorant Garamond", fontSize: 56, fontWeight: "600", fill: green, role: "date" }),
    text("THỨ BẢY · 11 GIỜ 00", 500, 1186, 760, { fontFamily: "Montserrat", fontSize: 22, charSpacing: 300, fill: soft, role: "weekday" }),
    text("Khu vườn tiệc cưới Green Garden", 500, 1250, 800, { fontFamily: "Montserrat", fontSize: 23, fontWeight: "600", fill: green, role: "venue" }),
    text("88 Xuân Thủy, Cầu Giấy, Hà Nội", 500, 1293, 800, { fontFamily: "Lora", fontSize: 21, fill: soft, role: "address" }),
  ]);
};

const saveTheDate = (): CardJson => card([
  bg(1200, 1200, "#2b2622"),
  rect(600, 600, 1200, 1200, { fill: placeholder("#cfc7bc", "#8e857a"), role: "photo1" }),
  hint("photo1", 600, 330, "#ffffff"),
  rect(600, 870, 1200, 660, {
    fill: { ...linear("rgba(0,0,0,0)", "rgba(0,0,0,0.68)") }, selectable: false, evented: false, role: "overlay",
  }),
  text("Save the Date", 600, 730, 1100, { fontFamily: "Great Vibes", fontSize: 140, fill: "#ffffff" }),
  text("MINH ANH", 300, 860, 500, { fontFamily: "Montserrat", fontSize: 44, fontWeight: "600", charSpacing: 300, textAlign: "right", fill: "#ffffff", role: "groomName" }),
  text("&", 600, 860, 60, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 44, fill: "#ffffff" }),
  text("THU HÀ", 900, 860, 500, { fontFamily: "Montserrat", fontSize: 44, fontWeight: "600", charSpacing: 300, textAlign: "left", fill: "#ffffff", role: "brideName" }),
  text("12.12.2026", 600, 965, 900, { fontFamily: "Montserrat", fontSize: 40, charSpacing: 500, fill: "#ffffff", role: "date" }),
  text("TP. HỒ CHÍ MINH", 600, 1035, 900, { fontFamily: "Montserrat", fontSize: 22, charSpacing: 300, fill: "#ffffff", opacity: 0.85, role: "venue" }),
]);

const storyNavy = (): CardJson => {
  const gold = "#d4b26a";
  return card([
    bg(1080, 1920, "#14213d"),
    text("CHÚNG MÌNH CƯỚI RỒI!", 540, 170, 960, { fontFamily: "Montserrat", fontSize: 32, fontWeight: "600", charSpacing: 400, fill: gold, role: "invite" }),
    rect(540, 760, 860, 1000, { rx: 40, ry: 40, fill: placeholder("#2a3a5e", "#1b2747"), role: "photo1" }),
    hint("photo1", 540, 760, gold),
    rect(540, 760, 896, 1036, { rx: 54, ry: 54, stroke: gold, strokeWidth: 3 }),
    text("Minh Anh", 540, 1405, 1000, { fontFamily: "Great Vibes", fontSize: 124, fill: "#ffffff", role: "groomName" }),
    text("&", 540, 1495, 200, { fontFamily: "Playfair Display", fontStyle: "italic", fontSize: 58, fill: gold }),
    text("Thu Hà", 540, 1585, 1000, { fontFamily: "Great Vibes", fontSize: 124, fill: "#ffffff", role: "brideName" }),
    text("12 . 12 . 2026", 540, 1725, 1000, { fontFamily: "Montserrat", fontSize: 46, charSpacing: 400, fill: gold, role: "date" }),
    text("TRUNG TÂM TIỆC CƯỚI HOA SEN", 540, 1805, 1000, { fontFamily: "Montserrat", fontSize: 26, charSpacing: 160, fill: "#ffffff", role: "venue" }),
  ]);
};

const seed = (slug: string, name: string, tags: string[], width: number, height: number, canvas: CardJson, sortOrder: number): CardTemplate => ({
  id: `seed-${slug}`, slug, name, tags, width, height, canvas, thumbUrl: "", sortOrder, published: true, seed: true,
});

export const seedTemplates = (): CardTemplate[] => [
  seed("co-dien-kem-vang", "Cổ điển kem vàng", ["thanh-lich"], 1000, 1400, classicGold(), 10),
  seed("hoa-hong-pastel", "Hồng pastel", ["hoa", "thanh-lich"], 1000, 1400, pastelRose(), 20),
  seed("toi-gian-hien-dai", "Tối giản hiện đại", ["toi-gian"], 1000, 1400, minimal(), 30),
  seed("song-hy-do", "Song Hỷ đỏ truyền thống", ["truyen-thong"], 1000, 1400, songHy(), 40),
  seed("xanh-sage-boho", "Xanh sage boho", ["hoa", "toi-gian"], 1000, 1400, sageBoho(), 50),
  seed("save-the-date-anh-nen", "Save the date ảnh nền", ["save-the-date"], 1200, 1200, saveTheDate(), 60),
  seed("story-navy-vang", "Story navy ánh vàng", ["story", "thanh-lich"], 1080, 1920, storyNavy(), 70),
];

/** Empty card of the given size: just a white background. */
export const blankCanvas = (w: number, h: number): CardJson => card([bg(w, h, "#ffffff")]);
