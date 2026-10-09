"use client";

import dynamic from "next/dynamic";
import type { CardEditorProps } from "./CardEditor";

// Fabric, jsPDF and the card fonts load only here, in the browser, never with the rest of the site.
const CardEditor = dynamic(() => import("./CardEditor"), {
  ssr: false,
  loading: () => (
    <div className="ce-boot">
      <span className="ce-boot-spinner" aria-hidden="true" />
      Đang mở trình thiết kế thiệp…
    </div>
  ),
});

export default function EditorLoader(props: CardEditorProps) {
  return <CardEditor {...props} />;
}
