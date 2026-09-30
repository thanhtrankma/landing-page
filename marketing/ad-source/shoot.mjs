// Renders each post of posts.html (?p=p1..p7) at 2x, saved as PNG.
import { spawn } from "node:child_process"; import fs from "node:fs"; import { setTimeout as sleep } from "node:timers/promises";
const [html, out, ...ids] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const PORT = 9700 + Math.floor(Math.random() * 90); const profile = fs.mkdtempSync("/tmp/posts-");
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (list.length) break; } catch {} await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 1; const pend = new Map(); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = id++; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.value;
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1350, deviceScaleFactor: 2, mobile: false });
for (const p of ids) {
  await send("Page.navigate", { url: `file://${html}?p=${p}` }); await sleep(700);
  await ev("window.ready"); await sleep(300);
  const r = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(`${out}/${p}@2x.png`, Buffer.from(r.data, "base64"));
  console.log(p);
}
chrome.kill("SIGKILL"); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(0);
