"use client";

// Self-hosted card fonts (each @fontsource CSS covers the Vietnamese, Latin and Latin-ext subsets through
// unicode-range). Imported only by the editor chunk, so the rest of the site never downloads them.
import "@fontsource/great-vibes/400.css";
import "@fontsource/dancing-script/400.css";
import "@fontsource/dancing-script/700.css";
import "@fontsource/pinyon-script/400.css";
import "@fontsource/alex-brush/400.css";
import "@fontsource/charm/400.css";
import "@fontsource/charm/700.css";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/700.css";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/400-italic.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/pacifico/400.css";
import "@fontsource/lobster/400.css";
import { cache } from "fabric";
import { CARD_FONTS } from "@/lib/cards/types";

const KNOWN = new Set(CARD_FONTS.map((f) => f.family));
// Covers the Vietnamese subset files, not only Latin, so diacritics never render in a fallback font.
const SAMPLE = "Aa Ăă Ââ Đđ Êê Ôô Ơơ Ưư ạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ 0123";
const loaded = new Set<string>();

type FontFace = { fontFamily?: unknown; fontWeight?: unknown; fontStyle?: unknown };

/** Waits until every font face the given objects use is ready, so Fabric measures text with the real glyphs. */
export async function ensureFonts(objects: FontFace[]) {
  const wanted = new Map<string, string>();
  for (const o of objects) {
    const family = String(o.fontFamily ?? "");
    if (!KNOWN.has(family)) continue;
    const spec = `${o.fontStyle === "italic" ? "italic" : "normal"} ${o.fontWeight === "bold" ? 700 : Number(o.fontWeight) || 400} 40px "${family}"`;
    if (!loaded.has(spec)) wanted.set(spec, family);
  }
  if (!wanted.size || typeof document === "undefined" || !document.fonts) return;
  await Promise.all(
    [...wanted.keys()].map((spec) =>
      document.fonts.load(spec, SAMPLE).then(
        () => loaded.add(spec),
        () => undefined,
      ),
    ),
  );
  // Fabric caches glyph widths per family; drop them so text measured with a fallback font is re-measured.
  for (const family of new Set(wanted.values())) cache.clearFontCache(family);
}

/** Every text-like object in a serialized canvas (including group children). */
export function textObjects(objects: unknown[]): FontFace[] {
  const out: FontFace[] = [];
  const walk = (list: unknown[]) => {
    for (const o of list) {
      if (!o || typeof o !== "object") continue;
      const r = o as Record<string, unknown>;
      if (typeof r.fontFamily === "string") out.push(r);
      if (Array.isArray(r.objects)) walk(r.objects);
    }
  };
  walk(objects);
  return out;
}
