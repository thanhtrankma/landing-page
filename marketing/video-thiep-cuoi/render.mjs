// Renders the promo video frame by frame: a real phone page (local sandbox :3100) is driven and screenshotted,
// then composed into stage.html (1080x1920) and written to frames/. Animations on the phone are paused and
// stepped exactly one frame per capture, so motion is smooth regardless of how long screenshots take.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/thanhtran/Documents/wetraver-admin/node_modules/playwright-core");

const DIR = path.dirname(new URL(import.meta.url).pathname);
const BASE = "http://localhost:3100";
const FPS = 30;
const DT = 1000 / FPS;
const demo = JSON.parse(fs.readFileSync(path.join(DIR, "demo.json"), "utf8"));
const cookie = JSON.parse(fs.readFileSync(path.join(DIR, "cookie.json"), "utf8"));
// One video per theme: THEME=song-hy COLOR=do OUT=thiep-song-hy ACCENT=#b3262c node render.mjs
const THEME = process.env.THEME || "hoang-kim";
const COLOR = process.env.COLOR || "";
const OUT = process.env.OUT || "thiep-cuoi-online";
const LOOK = { accent: process.env.ACCENT || "#c2416b", soft: process.env.SOFT || "#ffd2de", bg1: process.env.BG1 || "#ffe3ea", bg2: process.env.BG2 || "#dceefb" };
const MONTAGE = (process.env.MONTAGE || "mau-song-hy,mau-long-phung,mau-mau-nuoc,mau-chibi,mau-lau-dai,mau-bach-su--do,mau-anh-dao,mau-ren-theu--do").split(",");
const ONLY = null;
const FR = path.join(DIR, `frames-${OUT}`);

// Point the demo card at this theme and reset Anh Trọng's answer (local JSON store of the sandbox only).
{
  const D = "/Users/thanhtran/Documents/landing-page/.data/";
  const read = (t) => JSON.parse(fs.readFileSync(D + t + ".json", "utf8"));
  const write = (t, v) => fs.writeFileSync(D + t + ".json", JSON.stringify(v, null, 2));
  const invs = read("invitations");
  const inv = invs.find((i) => i.slug === demo.slug);
  inv.data = { ...inv.data, theme: THEME, color: COLOR, intro: true, petals: true };
  write("invitations", invs);
  const guests = read("guests");
  const trong = guests.find((g) => g.invitation_id === inv.id && g.name === "Anh Trọng");
  Object.assign(trong, { rsvp_status: null, rsvp_people: null, rsvp_answers: {}, rsvp_at: null });
  write("guests", guests);
  write("rsvps", read("rsvps").filter((r) => r.guest_id !== trong.id));
}
fs.rmSync(FR, { recursive: true, force: true });
fs.mkdirSync(FR, { recursive: true });

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const phoneCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: "vi-VN" });
await phoneCtx.addCookies([cookie]);
await phoneCtx.addInitScript(() => {
  // Pause every animation/transition and advance it by hand, one frame at a time.
  window.__step = (ms) => {
    for (const a of document.getAnimations()) {
      if (a.playState !== "paused") a.pause();
      a.currentTime = (Number(a.currentTime) || 0) + ms;
    }
    const h = innerHeight;
    document.querySelectorAll(".iv-reveal:not(.in)").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < h * 0.94 && r.bottom > 0) el.classList.add("in");
    });
  };
  document.addEventListener("DOMContentLoaded", () => {
    const s = document.createElement("style");
    s.textContent = "html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none}";
    document.head.appendChild(s);
  });
});
const phone = await phoneCtx.newPage();
const stage = await (await browser.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
await stage.goto(`file://${path.join(DIR, "stage.html")}`);
await stage.evaluate(() => document.fonts.ready);
await stage.evaluate((l) => {
  const r = document.documentElement.style;
  r.setProperty("--accent", l.accent); r.setProperty("--soft", l.soft); r.setProperty("--bg1", l.bg1); r.setProperty("--bg2", l.bg2);
}, LOOK);

let n = 0;
let lastShot = null;
const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x) => Math.max(0, Math.min(1, x));

async function snapPhone() {
  await phone.evaluate((ms) => window.__step?.(ms), DT);
  const buf = await phone.screenshot({ type: "jpeg", quality: 88 });
  lastShot = `data:image/jpeg;base64,${buf.toString("base64")}`;
}
async function emit(state, { phoneLive = true } = {}) {
  if (phoneLive) await snapPhone();
  await stage.evaluate((s) => window.setFrame(s), { t: n / FPS, shot: lastShot, ...state });
  await stage.screenshot({ path: path.join(FR, `${String(n).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
  n++;
}
const box = async (sel) => {
  const b = await phone.locator(sel).first().boundingBox();
  if (!b) throw new Error(`not found: ${sel}`);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
};
const scrollTo = (y) => phone.evaluate((v) => window.scrollTo(0, v), y);
const offsetOf = (sel) => phone.evaluate((s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY : null; }, sel);
/** A tap: ripple over 14 frames, real click on frame 6. */
async function tap(sel, state, after) {
  const p = await box(sel);
  for (let i = 0; i < 14; i++) {
    if (i === 6) { await phone.mouse.click(p.x, p.y); if (after) await after(); }
    await emit({ ...state, tap: { x: p.x, y: p.y, p: i / 13 } });
  }
}
const capIn = (i) => ease(clamp(i / 10));

// ── 1. lock screen notification (2.5s) ───────────────────────────────────────
async function sceneLock() {
  await phone.goto(`${BASE}/thiep/${demo.slug}?k=${demo.trongCode}`, { waitUntil: "networkidle" });
  await phone.evaluate(() => document.fonts.ready);
  const cap = { kicker: "POV", title: "Nhận thiệp cưới mà thấy…<br><em>tên mình</em> trên đó 🥹" };
  for (let i = 0; i < 75; i++) {
    const tapState = i >= 58 ? { tap: { x: 195, y: 360, p: (i - 58) / 16 } } : {};
    await emit({ ...cap, capIn: capIn(i), lock: true, notif: ease(clamp((i - 12) / 14)), ...tapState }, { phoneLive: false });
  }
}

// ── 2. the intro greets the guest by name, tap "Mở thiệp" (4s) ────────────────
async function sceneIntro() {
  const cap = { kicker: "Thiệp có tên riêng", title: "Mỗi khách một link<br>ghi <em>đúng tên mình</em>" };
  for (let i = 0; i < 40; i++) await emit({ ...cap, capIn: capIn(i) });
  await tap(".iv-intro button", cap);
  for (let i = 0; i < 66; i++) await emit(cap);
}

// ── 3. scroll through the card (6.5s) ────────────────────────────────────────
async function sceneScroll() {
  const ev = (await offsetOf(".iv-page [class*='event']")) ?? 2600;
  const cal = (await offsetOf(".iv-calendar")) ?? ev + 900;
  const keys = [
    [0, 0], [70, Math.round(ev * 0.55)], [110, ev - 90], [150, ev - 90], [195, cal - 140],
  ];
  const yAt = (f) => {
    for (let k = 1; k < keys.length; k++) {
      const [f0, y0] = keys[k - 1], [f1, y1] = keys[k];
      if (f <= f1) return y0 + (y1 - y0) * ease((f - f0) / (f1 - f0));
    }
    return keys.at(-1)[1];
  };
  for (let i = 0; i < 195; i++) {
    await scrollTo(Math.round(yAt(i)));
    const cap = i < 100
      ? { kicker: "Đầy đủ như thiệp in", title: "Ảnh cưới · Lời mời<br><em>Gia đình hai bên</em>" }
      : i < 160 ? { kicker: "Tiện cho khách", title: "Bản đồ chỉ đường<br>& <em>lưu vào lịch</em>" }
      : { kicker: "Tiện cho khách", title: "Lịch cưới<br>& <em>đếm ngược</em> ngày vui" };
    const local = i < 100 ? i : i < 160 ? i - 100 : i - 160;
    await emit({ ...cap, capIn: capIn(local) });
  }
}

// ── 4. RSVP from the card (5s) ───────────────────────────────────────────────
async function sceneRsvp() {
  const cap = { kicker: "Xác nhận tham dự", title: "Khách bấm một cái<br>là <em>xác nhận đi dự</em>" };
  const from = await phone.evaluate(() => scrollY);
  const to = ((await offsetOf(".iv-rsvp-block")) ?? from) - 120;
  for (let i = 0; i < 30; i++) {
    await scrollTo(Math.round(from + (to - from) * ease(i / 29)));
    await emit({ ...cap, capIn: capIn(i) });
  }
  const opener = await phone.locator(".iv-rsvp-block .iv-rsvp-open").count();
  if (opener) {
    await tap(".iv-rsvp-open", cap);
    for (let i = 0; i < 12; i++) await emit(cap);
  }
  await tap(".iv-rsvp-choices [role=radio] >> nth=0", cap);
  const sel = phone.locator(".iv-rsvp-form select").first();
  if (await sel.count()) {
    await tap(".iv-rsvp-form select", cap, async () => { await sel.selectOption("2").catch(() => {}); });
    for (let i = 0; i < 8; i++) await emit(cap);
  }
  await tap(".iv-rsvp-form button[type=submit]", cap);
  for (let i = 0; i < 40; i++) await emit({ ...cap, title: "Khách bấm một cái<br>là <em>xác nhận đi dự</em> ✅" });
}

// ── 5. the couple's guest dashboard (4.3s) ───────────────────────────────────
async function sceneGuests() {
  await phone.goto(`${BASE}/cong-cu/thiep-cuoi-online/khach-moi/${demo.id}`, { waitUntil: "networkidle" });
  await phone.waitForSelector(".gm-stats", { timeout: 15000 });
  await phone.evaluate(() => document.fonts.ready);
  const top = ((await offsetOf(".gm-stats")) ?? 120) - 70;
  const list = ((await offsetOf(".gm-list")) ?? top + 700) - 140;
  const cap1 = { kicker: "Dành cho cô dâu chú rể", title: "Biết ngay <em>ai sẽ đến</em><br>và bao nhiêu người" };
  const cap2 = { kicker: "Dành cho cô dâu chú rể", title: "Tải danh sách Excel<br><em>mỗi khách một link</em>" };
  for (let i = 0; i < 130; i++) {
    const y = i < 20 ? top : i < 70 ? top : top + (list - top) * ease((i - 70) / 50);
    await scrollTo(Math.round(y));
    await emit(i < 70 ? { ...cap1, capIn: capIn(i) } : { ...cap2, capIn: capIn(i - 70) });
  }
}

// ── 6. template montage (4s) ─────────────────────────────────────────────────
async function sceneTemplates() {
  const slugs = MONTAGE;
  const shots = [];
  for (const s of slugs) {
    await phone.goto(`${BASE}/thiep/${s}?khach=Anh%20Tr%E1%BB%8Dng`, { waitUntil: "networkidle" });
    await phone.evaluate(() => document.fonts.ready);
    await phone.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation-play-state:paused!important}" });
    await phone.locator(".iv-intro button").click({ timeout: 2000 }).catch(() => {});
    await phone.waitForTimeout(400);
    await phone.evaluate(() => document.querySelectorAll(".iv-reveal").forEach((e) => e.classList.add("in")));
    await phone.waitForTimeout(150);
    shots.push(`data:image/jpeg;base64,${(await phone.screenshot({ type: "jpeg", quality: 88 })).toString("base64")}`);
  }
  const cap = { kicker: "88 mẫu thiệp", title: "Truyền thống, tối giản,<br><em>dễ thương</em> – đổi màu tuỳ ý" };
  for (let i = 0; i < 120; i++) {
    lastShot = shots[Math.min(shots.length - 1, Math.floor(i / 15))];
    await emit({ ...cap, capIn: capIn(i) }, { phoneLive: false });
  }
}

// ── 7. end card (3s) ─────────────────────────────────────────────────────────
async function sceneEnd() {
  for (let i = 0; i < 90; i++) await emit({ end: ease(clamp(i / 15)) }, { phoneLive: false });
}

const scenes = { lock: sceneLock, intro: sceneIntro, scroll: sceneScroll, rsvp: sceneRsvp, guests: sceneGuests, templates: sceneTemplates, end: sceneEnd };
const order = ["lock", "intro", "scroll", "rsvp", "guests", "templates", "end"];
const t0 = Date.now();
for (const name of order) {
  if (ONLY && name !== ONLY && !(ONLY === "intro" && name === "lock") && !(["scroll", "rsvp"].includes(ONLY) && ["lock", "intro", "scroll"].includes(name) && order.indexOf(name) < order.indexOf(ONLY))) continue;
  await scenes[name]();
  console.log(`${name} done: ${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
