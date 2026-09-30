// Full-page mobile screenshots (430px wide, dpr 2) of the live site and demo pages, for the ad's phone mockup.
import { spawn } from "node:child_process"; import fs from "node:fs"; import { setTimeout as sleep } from "node:timers/promises";
const OUT = process.argv[2];
const PORT = 9400 + Math.floor(Math.random() * 90); const profile = fs.mkdtempSync("/tmp/adcap-");
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (list.length) break; } catch {} await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 1; const pend = new Map(); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = id++; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.value;
await send("Page.enable");
const W = 430, H = 932;
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 2, mobile: true });
// pre-accept consent + mark promo seen on our own origin so overlays don't cover the shots
await send("Page.navigate", { url: "http://localhost:3000/robots.txt" }); await sleep(800);
await ev(`localStorage.setItem('sl_consent', JSON.stringify({v:1,analytics:false,thirdParty:false,ts:Date.now()})); localStorage.setItem('sl_promo_seen', String(Date.now())); 1`);
const targets = process.argv.slice(3);
for (const t of targets) {
  const [name, path] = t.split("=");
  await send("Page.navigate", { url: `http://localhost:3000${path}` }); await sleep(3500);
  await ev(`(async()=>{for(let y=0;y<9000;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,120));}scrollTo(0,0);await new Promise(r=>setTimeout(r,1200));document.querySelectorAll('.sky-cursor,.consent,.promo-overlay,nextjs-portal,.mobile-bottom-nav,.zalo-float,.zalo-tooltip,.scroll-top,[class*=zalo],[class*=scroll-to],[aria-label="Lên đầu trang"]').forEach(e=>e.remove());return 1})()`);
  const h = Math.min(await ev("document.documentElement.scrollHeight"), 7000);
  const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 88, captureBeyondViewport: true, clip: { x: 0, y: 0, width: W, height: h, scale: 1 } });
  fs.writeFileSync(`${OUT}/${name}.jpg`, Buffer.from(r.data, "base64"));
  console.log(name, h);
}
chrome.kill("SIGKILL"); fs.rmSync(profile, { recursive: true, force: true }); process.exit(0);
