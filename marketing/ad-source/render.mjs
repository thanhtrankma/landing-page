// Deterministic frame renderer: seeks the composition to each timestamp and screenshots it.
// usage: node render.mjs <html> <outDir> <fps> [t1,t2,... stills only]
import { spawn } from "node:child_process"; import fs from "node:fs"; import { setTimeout as sleep } from "node:timers/promises";
const [html, out, fpsArg, stills] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const PORT = 9500 + Math.floor(Math.random() * 90); const profile = fs.mkdtempSync("/tmp/adr-");
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
let list; for (let i = 0; i < 40; i++) { try { list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); if (list.length) break; } catch {} await sleep(250); }
const ws = new WebSocket(list.find((t) => t.type === "page").webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
ws.binaryType = "arraybuffer";
let id = 1; const pend = new Map(); ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result ?? m); pend.delete(m.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = id++; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.value;
await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: "file://" + html }); await sleep(1500);
console.log("ready:", await ev("window.ready"), "duration:", await ev("window.DURATION"));
const times = stills ? stills.split(",").map(Number) : Array.from({ length: Math.round((await ev("window.DURATION")) * fps) }, (_, i) => i / fps);
const t0 = Date.now();
for (let i = 0; i < times.length; i++) {
  await ev(`new Promise(r => { seek(${times[i]}); requestAnimationFrame(() => requestAnimationFrame(r)); })`);
  const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 94 });
  const name = stills ? `still_${String(times[i]).replace(".", "_")}.jpg` : `f${String(i).padStart(5, "0")}.jpg`;
  fs.writeFileSync(`${out}/${name}`, Buffer.from(shot.data, "base64"));
  if (!stills && i % 150 === 0) console.log(`frame ${i}/${times.length} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
console.log("done", times.length, "frames in", ((Date.now() - t0) / 1000).toFixed(1), "s");
chrome.kill("SIGKILL"); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(0);
