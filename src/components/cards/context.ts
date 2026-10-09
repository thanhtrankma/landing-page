"use client";

import { createContext, useContext } from "react";
import type { Canvas } from "fabric";

export type TemplateInfo = { id: string; name: string; slug: string; tags: string[]; published: boolean; sortOrder: number };

/** What panels and the inspector need from the editor shell. */
export type EditorApi = {
  mode: "design" | "template";
  canvas: () => Canvas | null;
  size: { width: number; height: number };
  /** Changes whenever the canvas or selection changes; read it to re-render. */
  tick: number;
  refresh: () => void;
  /** Records an undo step and marks the design as changed. */
  commit: () => void;
  /** Runs a task with a status message and turns thrown errors into a toast. */
  run: (label: string, fn: () => Promise<void>) => Promise<void>;
  busy: string | null;
  notify: (message: string, kind?: "ok" | "err") => void;
  /** Uploads photos and returns their URLs (also kept in the session library). */
  upload: (files: File[]) => Promise<string[]>;
  library: string[];
  template?: TemplateInfo;
  setTemplate?: (t: TemplateInfo) => void;
};

export const EditorContext = createContext<EditorApi | null>(null);

export function useEditor() {
  const api = useContext(EditorContext);
  if (!api) throw new Error("useEditor outside CardEditor");
  return api;
}
