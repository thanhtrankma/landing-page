"use client";

import {
  Circle,
  FabricImage,
  FabricObject,
  Gradient,
  InteractiveFabricObject,
  Path,
  Point,
  Rect,
  Shadow,
  Textbox,
  type Canvas,
  type StaticCanvas,
} from "fabric";
import { BG_IMAGE_ROLE, BG_ROLE, CUSTOM_PROPS, HINT_PREFIX, type CardJson } from "@/lib/cards/types";
import { ensureFonts, textObjects } from "./fonts";

// Everything the editor does to Fabric objects lives here, so panels stay declarative.
// Fabric v7 positions objects by their center: left/top are the center point.

let configured = false;
export function setupFabric() {
  if (configured) return;
  configured = true;
  FabricObject.customProperties = [...CUSTOM_PROPS];
  Object.assign(InteractiveFabricObject.ownDefaults, {
    borderColor: "#1a86bd",
    borderScaleFactor: 1.5,
    cornerColor: "#ffffff",
    cornerStrokeColor: "#1a86bd",
    cornerStyle: "circle",
    cornerSize: 13,
    touchCornerSize: 34,
    transparentCorners: false,
    padding: 4,
  });
}

export type Obj = FabricObject & { role?: string; locked?: boolean };

export const roleOf = (o: FabricObject | undefined | null) => ((o as Obj | undefined)?.role ?? "") as string;
export const isText = (o: FabricObject | undefined | null): o is Textbox => o instanceof Textbox;
export const isImage = (o: FabricObject | undefined | null): o is FabricImage => o instanceof FabricImage;
export const isBackdrop = (o: FabricObject) => [BG_ROLE, BG_IMAGE_ROLE, "overlay"].includes(roleOf(o));
export const isHint = (o: FabricObject) => roleOf(o).startsWith(HINT_PREFIX);
/** An empty photo frame: a shape with a photoN role. A filled one is an image with that role. */
export const isPhotoFrame = (o: FabricObject | undefined | null) => Boolean(o && /^photo\d$/.test(roleOf(o)) && !isImage(o));
export const isPhoto = (o: FabricObject | undefined | null) => Boolean(o && /^photo\d$/.test(roleOf(o)) && isImage(o));

/** Re-applies behaviour that is derived from roles and is not part of the JSON. */
export function applyRuntime(o: FabricObject) {
  const obj = o as Obj;
  if (isBackdrop(o)) {
    o.set({ selectable: false, evented: false, hoverCursor: "default" });
    return;
  }
  if (isHint(o)) {
    o.set({ selectable: false, evented: false, hoverCursor: "default" });
    return;
  }
  const locked = Boolean(obj.locked);
  o.set({
    lockMovementX: locked,
    lockMovementY: locked,
    lockScalingX: locked,
    lockScalingY: locked,
    lockRotation: locked,
    hasControls: !locked,
  });
  if (isText(o)) o.set({ editable: !locked });
}

/** Images from our storage must load with CORS, or the export canvas is tainted. */
function prepareJson(json: CardJson): CardJson {
  const walk = (list: unknown[]) => {
    for (const o of list) {
      const r = o as Record<string, unknown>;
      if (String(r.type).toLowerCase() === "image") r.crossOrigin = "anonymous";
      if (Array.isArray(r.objects)) walk(r.objects);
    }
  };
  const copy = structuredClone(json);
  walk(copy.objects);
  return copy;
}

export async function loadInto(canvas: Canvas | StaticCanvas, json: CardJson, signal?: AbortSignal) {
  const data = prepareJson(json);
  await ensureFonts(textObjects(data.objects));
  if (signal?.aborted) return;
  await canvas.loadFromJSON(data, undefined, { signal });
  if (signal?.aborted) return;
  canvas.getObjects().forEach(applyRuntime);
  canvas.requestRenderAll();
}

export function serialize(canvas: Canvas | StaticCanvas): CardJson {
  return canvas.toObject([...CUSTOM_PROPS]) as CardJson;
}

/** Serialized canvas without the "+ Thêm ảnh" hints: what downloads, previews and thumbnails show. */
export const withoutHints = (json: CardJson): CardJson => ({
  ...json,
  objects: json.objects.filter((o) => !String(o.role ?? "").startsWith(HINT_PREFIX)),
});

export const normalizeText = (s: string) => s.normalize("NFC");

// ───────────── creating objects ─────────────

export type TextPreset = "heading" | "names" | "body" | "caps" | "date";

const TEXT_PRESETS: Record<TextPreset, Partial<Textbox>> = {
  heading: { text: "Lễ Thành Hôn", fontFamily: "Playfair Display", fontSize: 64, fontWeight: "700" },
  names: { text: "Minh Anh & Thu Hà", fontFamily: "Great Vibes", fontSize: 96 },
  body: { text: "Trân trọng kính mời bạn đến dự", fontFamily: "Be Vietnam Pro", fontSize: 30 },
  caps: { text: "TRÂN TRỌNG KÍNH MỜI", fontFamily: "Montserrat", fontSize: 24, charSpacing: 360 },
  date: { text: "12 . 12 . 2026", fontFamily: "Cormorant Garamond", fontSize: 60, fontWeight: "600" },
};

export async function addText(canvas: Canvas, preset: TextPreset, size: { width: number; height: number }) {
  const p = TEXT_PRESETS[preset];
  await ensureFonts([p]);
  const t = new Textbox(String(p.text), {
    ...p,
    left: size.width / 2,
    top: size.height / 2,
    width: Math.round(size.width * 0.8),
    textAlign: "center",
    fill: "#333333",
    lineHeight: 1.25,
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.requestRenderAll();
  return t;
}

export type ShapeKind = "rect" | "rounded" | "circle" | "line" | "heart" | "diamond" | "divider" | "leaf" | "ring" | "songhy";

const HEART = "M 0 18 C -30 -2 -28 -26 -12 -28 C -4 -29 0 -22 0 -18 C 0 -22 4 -29 12 -28 C 28 -26 30 -2 0 18 Z";
const LEAF = "M 0 -40 C 22 -20 22 20 0 40 C -22 20 -22 -20 0 -40 Z";

export async function addShape(canvas: Canvas, kind: ShapeKind, size: { width: number; height: number }, color = "#b89257") {
  const c = { left: size.width / 2, top: size.height / 2 };
  const unit = Math.min(size.width, size.height);
  let o: FabricObject;
  switch (kind) {
    case "rect":
      o = new Rect({ ...c, width: unit * 0.4, height: unit * 0.3, fill: color, strokeWidth: 0 });
      break;
    case "rounded":
      o = new Rect({ ...c, width: unit * 0.4, height: unit * 0.3, rx: 28, ry: 28, fill: color, strokeWidth: 0 });
      break;
    case "circle":
      o = new Circle({ ...c, radius: unit * 0.15, fill: color, strokeWidth: 0 });
      break;
    case "ring":
      o = new Circle({ ...c, radius: unit * 0.15, fill: "rgba(0,0,0,0)", stroke: color, strokeWidth: 4 });
      break;
    case "line":
      o = new Rect({ ...c, width: unit * 0.5, height: 3, fill: color, strokeWidth: 0 });
      break;
    case "heart":
      o = new Path(HEART, { ...c, fill: color, scaleX: 2.4, scaleY: 2.4, strokeWidth: 0 });
      break;
    case "leaf":
      o = new Path(LEAF, { ...c, fill: color, scaleX: 1.6, scaleY: 1.6, strokeWidth: 0 });
      break;
    case "diamond":
      o = new Path("M 0 -30 L 30 0 L 0 30 L -30 0 Z", { ...c, fill: color, strokeWidth: 0 });
      break;
    case "divider":
      o = new Path("M -160 0 L -16 0 M 16 0 L 160 0 M 0 -9 L 9 0 L 0 9 L -9 0 Z", { ...c, fill: color, stroke: color, strokeWidth: 2 });
      break;
    case "songhy":
      o = new Textbox("囍", { ...c, width: 260, fontSize: 200, fontFamily: "serif", fontWeight: "700", fill: color, textAlign: "center" });
      break;
  }
  canvas.add(o);
  canvas.setActiveObject(o);
  canvas.requestRenderAll();
  return o;
}

const loadImage = (url: string) => FabricImage.fromURL(url, { crossOrigin: "anonymous" });

/** A free-floating photo, sized to 60% of the card width. */
export async function addImage(canvas: Canvas, url: string, size: { width: number; height: number }) {
  const img = await loadImage(url);
  const scale = Math.min((size.width * 0.6) / img.width, (size.height * 0.6) / img.height);
  img.set({ left: size.width / 2, top: size.height / 2, scaleX: scale, scaleY: scale });
  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
  return img;
}

/** Puts a photo into a frame (or replaces the photo already there): the frame shape becomes its clip mask. */
export async function fillPhoto(canvas: Canvas, target: FabricObject, url: string) {
  const role = roleOf(target);
  const frame = isPhoto(target) ? (target.clipPath as FabricObject) : target;
  const bounds = frame.getBoundingRect();
  const center = frame.getCenterPoint();
  const img = await loadImage(url);
  const scale = Math.max(bounds.width / img.width, bounds.height / img.height);
  const clip = await frame.clone([...CUSTOM_PROPS]);
  clip.set({ absolutePositioned: true, fill: "#000000", stroke: null, strokeWidth: 0, opacity: 1, shadow: null });
  img.set({ left: center.x, top: center.y, scaleX: scale, scaleY: scale, clipPath: clip });
  (img as Obj).role = role;
  const index = canvas.getObjects().indexOf(target);
  canvas.remove(target);
  canvas.insertAt(Math.max(index, 0), img);
  for (const h of canvas.getObjects().filter((o) => roleOf(o) === `${HINT_PREFIX}${role}`)) canvas.remove(h);
  applyRuntime(img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
  return img;
}

/** Takes the photo out of its frame and puts the empty placeholder back. */
export async function clearPhoto(canvas: Canvas, img: FabricImage) {
  const clip = img.clipPath as FabricObject | undefined;
  if (!clip) return;
  const role = roleOf(img);
  const frame = await clip.clone([...CUSTOM_PROPS]);
  frame.set({ absolutePositioned: false, fill: PLACEHOLDER_FILL() });
  (frame as Obj).role = role;
  const index = canvas.getObjects().indexOf(img);
  canvas.remove(img);
  canvas.insertAt(index, frame);
  applyRuntime(frame);
  canvas.setActiveObject(frame);
  canvas.requestRenderAll();
}

const PLACEHOLDER_FILL = () =>
  new Gradient({
    type: "linear",
    gradientUnits: "percentage",
    coords: { x1: 0, y1: 0, x2: 1, y2: 1 },
    colorStops: [
      { offset: 0, color: "#eef0f2" },
      { offset: 1, color: "#d5dade" },
    ],
  });

export function setLocked(o: FabricObject, locked: boolean) {
  (o as Obj).locked = locked;
  applyRuntime(o);
}

/** Template editor: tags text for "Điền nhanh", or turns a shape into a photo frame (with its hint label). */
export function assignRole(canvas: Canvas, o: FabricObject, role: string | undefined) {
  const old = roleOf(o);
  for (const h of canvas.getObjects().filter((x) => old && roleOf(x) === `${HINT_PREFIX}${old}`)) canvas.remove(h);
  if (role && /^photo\d$/.test(role) && !isText(o) && !isPhoto(o)) {
    makeFrame(o, role);
    const center = o.getCenterPoint();
    const hint = new Textbox("+ Thêm ảnh của bạn", { left: center.x, top: center.y, width: 360, fontSize: 26, fontFamily: "Montserrat", fontWeight: "600", fill: "#5d6b74", textAlign: "center" });
    (hint as unknown as Obj).role = `${HINT_PREFIX}${role}`;
    applyRuntime(hint);
    canvas.insertAt(canvas.getObjects().indexOf(o) + 1, hint);
  } else (o as Obj).role = role;
  canvas.requestRenderAll();
}

/** Turns the selected shape into a photo frame (template editor). */
export function makeFrame(o: FabricObject, role: string) {
  (o as Obj).role = role;
  o.set({ fill: PLACEHOLDER_FILL() });
}

// ───────────── background ─────────────

function backgroundRect(canvas: Canvas, size: { width: number; height: number }) {
  let bg = canvas.getObjects().find((o) => roleOf(o) === BG_ROLE) as Rect | undefined;
  if (!bg) {
    bg = new Rect({ left: size.width / 2, top: size.height / 2, width: size.width, height: size.height, fill: "#ffffff", strokeWidth: 0 });
    (bg as unknown as Obj).role = BG_ROLE;
    applyRuntime(bg);
    canvas.insertAt(0, bg);
  }
  return bg;
}

export type Fill = string | { from: string; to: string; diagonal?: boolean };

export const toFabricFill = (fill: Fill) =>
  typeof fill === "string"
    ? fill
    : new Gradient({
        type: "linear",
        gradientUnits: "percentage",
        coords: fill.diagonal ? { x1: 0, y1: 0, x2: 1, y2: 1 } : { x1: 0, y1: 0, x2: 0, y2: 1 },
        colorStops: [
          { offset: 0, color: fill.from },
          { offset: 1, color: fill.to },
        ],
      });

export function setBackground(canvas: Canvas, size: { width: number; height: number }, fill: Fill) {
  backgroundRect(canvas, size).set({ fill: toFabricFill(fill) });
  canvas.requestRenderAll();
}

export async function setBackgroundImage(canvas: Canvas, size: { width: number; height: number }, url: string | null) {
  for (const o of canvas.getObjects().filter((x) => roleOf(x) === BG_IMAGE_ROLE)) canvas.remove(o);
  if (url) {
    const img = await loadImage(url);
    const scale = Math.max(size.width / img.width, size.height / img.height);
    img.set({ left: size.width / 2, top: size.height / 2, scaleX: scale, scaleY: scale });
    (img as Obj).role = BG_IMAGE_ROLE;
    applyRuntime(img);
    const bgIndex = canvas.getObjects().findIndex((o) => roleOf(o) === BG_ROLE);
    canvas.insertAt(bgIndex + 1, img);
  }
  canvas.requestRenderAll();
}

export const backgroundFill = (canvas: Canvas) => canvas.getObjects().find((o) => roleOf(o) === BG_ROLE)?.fill;
export const hasBackgroundImage = (canvas: Canvas) => canvas.getObjects().some((o) => roleOf(o) === BG_IMAGE_ROLE);

// ───────────── arranging ─────────────

/** Index just above the background layers: nothing may go below them. */
const floor = (canvas: Canvas) => canvas.getObjects().filter(isBackdrop).filter((o) => roleOf(o) !== "overlay").length;

export function arrange(canvas: Canvas, o: FabricObject, how: "front" | "back" | "forward" | "backward") {
  if (how === "front") canvas.bringObjectToFront(o);
  else if (how === "forward") canvas.bringObjectForward(o);
  else if (how === "back") canvas.moveObjectTo(o, floor(canvas));
  else if (canvas.getObjects().indexOf(o) > floor(canvas)) canvas.sendObjectBackwards(o);
  canvas.requestRenderAll();
}

export async function duplicate(canvas: Canvas, o: FabricObject) {
  const copy = await o.clone([...CUSTOM_PROPS]);
  copy.set({ left: (o.left ?? 0) + 24, top: (o.top ?? 0) + 24 });
  if (/^photo\d$/.test(roleOf(copy))) (copy as Obj).role = undefined;
  applyRuntime(copy);
  canvas.add(copy);
  canvas.setActiveObject(copy);
  canvas.requestRenderAll();
  return copy;
}

export const SOFT_SHADOW = () => new Shadow({ color: "rgba(0,0,0,0.35)", blur: 12, offsetX: 0, offsetY: 4 });

export function align(canvas: Canvas, objs: FabricObject[], how: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom", size: { width: number; height: number }) {
  // A single object aligns to the card; several align to their shared bounds.
  const boxes = objs.map((o) => o.getBoundingRect());
  const area =
    objs.length === 1
      ? { left: 0, top: 0, right: size.width, bottom: size.height }
      : {
          left: Math.min(...boxes.map((b) => b.left)),
          top: Math.min(...boxes.map((b) => b.top)),
          right: Math.max(...boxes.map((b) => b.left + b.width)),
          bottom: Math.max(...boxes.map((b) => b.top + b.height)),
        };
  objs.forEach((o, i) => {
    const b = boxes[i];
    const c = o.getCenterPoint();
    let dx = 0, dy = 0;
    if (how === "left") dx = area.left - b.left;
    if (how === "right") dx = area.right - (b.left + b.width);
    if (how === "hcenter") dx = (area.left + area.right) / 2 - (b.left + b.width / 2);
    if (how === "top") dy = area.top - b.top;
    if (how === "bottom") dy = area.bottom - (b.top + b.height);
    if (how === "vcenter") dy = (area.top + area.bottom) / 2 - (b.top + b.height / 2);
    o.setXY(c.add(new Point(dx, dy)), "center", "center");
    o.setCoords();
  });
  canvas.requestRenderAll();
}
