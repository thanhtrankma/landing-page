import { Be_Vietnam_Pro, Ephesis, Great_Vibes, Playfair_Display, Prata } from "next/font/google";

// Invitation fonts, self-hosted by next/font. Used by the public page and by the builder's live preview.
const script = Great_Vibes({ weight: "400", subsets: ["latin", "latin-ext", "vietnamese"], variable: "--iv-script", display: "swap" });
const serif = Playfair_Display({ weight: ["400", "600", "700"], style: ["normal", "italic"], subsets: ["latin", "latin-ext", "vietnamese"], variable: "--iv-serif", display: "swap" });
const sans = Be_Vietnam_Pro({ weight: ["300", "400", "500", "600", "700"], subsets: ["latin", "latin-ext", "vietnamese"], variable: "--iv-sans", display: "swap" });

// Song Hỷ: hairline calligraphy for names, classic display serif for headings.
const thin = Ephesis({ weight: "400", subsets: ["latin", "latin-ext", "vietnamese"], variable: "--iv-thin", display: "swap" });
const display = Prata({ weight: "400", subsets: ["latin", "vietnamese"], variable: "--iv-display", display: "swap" });

export const inviteFontVars = `${script.variable} ${serif.variable} ${sans.variable} ${thin.variable} ${display.variable}`;
