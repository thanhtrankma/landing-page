"use client";

import { StaticCanvas } from "fabric";
import type { CardJson } from "@/lib/cards/types";
import { loadInto, setupFabric, withoutHints } from "./fabric-kit";

// Rendering a card outside the editor: downloads, share previews and template thumbnails. Each render uses its
// own offscreen canvas at the logical size, so the editor's zoom and selection never leak into the output.

export type RenderOptions = { width: number; height: number; multiplier: number; format: "png" | "jpeg"; quality?: number; hints?: boolean };

/** iOS Safari silently returns a blank image above ~16.7M canvas pixels; stay well under it. */
export function safeMultiplier(width: number, height: number, wanted: number) {
  const mobile = typeof navigator !== "undefined" && /iPhone|iPad|Android/i.test(navigator.userAgent);
  const budget = mobile ? 12e6 : 16e6;
  return Math.max(0.1, Math.min(wanted, Math.sqrt(budget / (width * height))));
}

export async function renderCard(json: CardJson, o: RenderOptions): Promise<string> {
  setupFabric();
  const el = document.createElement("canvas");
  const sc = new StaticCanvas(el, { width: o.width, height: o.height, enableRetinaScaling: false, renderOnAddRemove: false });
  try {
    await loadInto(sc, o.hints ? json : withoutHints(json));
    sc.renderAll();
    return sc.toDataURL({ multiplier: o.multiplier, format: o.format, quality: o.quality ?? 0.92 });
  } finally {
    sc.dispose();
  }
}

export const dataUrlToBlob = async (url: string) => (await fetch(url)).blob();

function saveBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}

const fileBase = (title: string) =>
  (title || "thiep-cuoi")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "thiep-cuoi";

export type DownloadKind = "png" | "jpg" | "pdf";

/**
 * PNG/JPG at 2× the logical size (2000×2800 for a 5×7 card ≈ 400 DPI). PDF embeds a 300 DPI JPEG on a page of
 * the exact print size.
 */
export async function downloadCard(json: CardJson, size: { width: number; height: number; mm: [number, number] }, kind: DownloadKind, title: string) {
  const name = fileBase(title);
  if (kind === "pdf") {
    const dpiMultiplier = ((size.mm[0] / 25.4) * 300) / size.width;
    const url = await renderCard(json, { ...size, multiplier: safeMultiplier(size.width, size.height, Math.max(1, dpiMultiplier)), format: "jpeg", quality: 0.95 });
    const { jsPDF } = await import("jspdf");
    const [w, h] = size.mm;
    const doc = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "mm", format: [w, h], compress: true });
    doc.addImage(url, "JPEG", 0, 0, w, h);
    doc.save(`${name}.pdf`);
    return;
  }
  const format = kind === "png" ? "png" : "jpeg";
  const url = await renderCard(json, { ...size, multiplier: safeMultiplier(size.width, size.height, 2), format, quality: 0.92 });
  saveBlob(await dataUrlToBlob(url), `${name}.${kind}`);
}

/** JPEG ~1080px wide for share pages and Open Graph. */
export async function renderPreview(json: CardJson, size: { width: number; height: number }) {
  const url = await renderCard(json, { ...size, multiplier: Math.min(1.2, 1080 / size.width), format: "jpeg", quality: 0.86 });
  return dataUrlToBlob(url);
}

/** Small JPEG for template galleries. */
export async function renderThumb(json: CardJson, size: { width: number; height: number }, targetWidth = 480, hints = true) {
  return renderCard(json, { ...size, multiplier: targetWidth / size.width, format: "jpeg", quality: 0.82, hints });
}
