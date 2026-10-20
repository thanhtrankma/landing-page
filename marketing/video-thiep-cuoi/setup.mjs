// Builds the demo data for the promo video on the LOCAL sandbox (port 3100, JSON store in .data/) — never production.
import { createRequire } from "node:module";
import { createHmac, randomUUID } from "node:crypto";
import fs from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("/Users/thanhtran/Documents/wetraver-admin/node_modules/playwright-core");
const ROOT = "/Users/thanhtran/Documents/landing-page";
const BASE = "http://localhost:3100";
const secret = fs.readFileSync(`${ROOT}/.env`, "utf8").match(/^USER_SESSION_SECRET=(.*)$/m)[1].trim();

// 1. a local user + a signed session cookie
const usersFile = `${ROOT}/.data/app_users.json`;
const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, "utf8")) : [];
let user = users.find((u) => u.email === "video@superlanding.vn");
if (!user) {
  user = { id: randomUUID(), created_at: new Date().toISOString(), email: "video@superlanding.vn", name: "Thành & Trang", avatar_url: "", google_sub: null, last_login_at: null };
  users.push(user);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
const b64 = (b) => Buffer.from(b).toString("base64url");
const payload = b64(JSON.stringify({ uid: user.id, exp: Math.floor(Date.now() / 1000) + 86400 * 30 }));
const cookie = `${payload}.${b64(createHmac("sha256", secret).update(payload).digest())}`;

const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addCookies([{ name: "sl_user", value: cookie, url: BASE }]);
fs.writeFileSync("cookie.json", JSON.stringify({ name: "sl_user", value: cookie, url: BASE }));
const page = await ctx.newPage();
const api = async (method, path, body) => {
  const r = await page.evaluate(async ([m, p, b]) => {
    const res = await fetch(p, { method: m, headers: { "Content-Type": "application/json" }, body: b ? JSON.stringify(b) : undefined });
    return { status: res.status, json: await res.json().catch(() => null) };
  }, [method, path, body]);
  if (r.status >= 400) throw new Error(`${method} ${path} → ${r.status} ${JSON.stringify(r.json)}`);
  return r.json;
};

// 2. create the card through the real editor (first edit autosaves the draft)
await page.goto(`${BASE}/cong-cu/thiep-cuoi-online/tao?mau=hoang-kim`, { waitUntil: "networkidle" });
const field = page.locator('input[type="text"]').first();
await field.fill((await field.inputValue()) + " ");
await field.fill((await field.inputValue()).trim());
await page.waitForURL(/\/sua\//, { timeout: 20000 });
const id = page.url().split("/sua/")[1].split(/[?#]/)[0];
const { invite } = await api("GET", `/api/invites/${id}`);
const d = invite.data;
d.events = d.events.map((e) => (e.kind === "party" ? { ...e, venue: "Trung tâm tiệc cưới Hoa Sen", address: "Lạch Tray, Ngô Quyền, Hải Phòng" } : e));
d.gift = { ...d.gift, enabled: false };
await api("PUT", `/api/invites/${id}`, { data: d });
const pub = await api("POST", `/api/invites/${id}/publish`, { slug: "thanh-trang" });
console.log("published", pub.slug);

// 3. guests, groups and RSVPs
const groups = { "Gia đình nhà trai": ["Ông bà nội", "Bác Cả & bác gái", "Chú Hai", "Cô Út", "Anh Tuấn & chị Hà"], "Gia đình nhà gái": ["Ông bà ngoại", "Cậu Bình", "Dì Ba", "Chị Mai & anh Long"], "Bạn chú rể": ["Anh Trọng", "Hoàng Nam", "Đức Anh", "Quang Huy", "Minh Khôi"], "Bạn cô dâu": ["Ngọc Ánh", "Phương Thảo", "Thu Hằng", "Lan Anh", "Bảo Ngọc"], "Đồng nghiệp": ["Anh Phong (Trưởng phòng)", "Chị Hương", "Team Marketing", "Anh Khánh", "Chị Vy"] };
const guests = Object.entries(groups).flatMap(([g, names]) => names.map((name) => ({ name, groupName: g, maxPeople: /&|Ông bà|Team/.test(name) ? 2 : null })));
await api("POST", `/api/invites/${id}/guests`, { action: "add", guests });
const list = (await api("GET", `/api/invites/${id}/guests`)).guests;
const answers = ["yes", "yes", "yes", "no", "yes", "yes", null, "yes", "yes", null, "yes", "yes", "no", "yes", "yes", null, "yes", "yes", "yes", null, "yes", "yes", null, "yes"];
let i = 0;
for (const g of list) {
  const st = g.name === "Anh Trọng" ? null : answers[i++ % answers.length];
  if (!st) continue;
  await api("POST", `/api/thiep/thanh-trang/rsvp`, { code: g.code, status: st, people: st === "yes" ? (g.maxPeople ?? 1) : 1, answers: {} });
}
const trong = list.find((g) => g.name === "Anh Trọng");
fs.writeFileSync("demo.json", JSON.stringify({ id, slug: "thanh-trang", trongCode: trong.code }, null, 2));
console.log("guests", list.length, "trong", trong.code);
await browser.close();
