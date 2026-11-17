import localFont from "next/font/local";

// Invitation fonts, self-hosted from src/app/fonts (SIL OFL 1.1; each file covers latin, latin-ext and vietnamese).
// Used by the public page and by the builder's live preview.
const script = localFont({ src: "../../app/fonts/great-vibes/GreatVibes-Regular.woff2", weight: "400", variable: "--iv-script", display: "swap" });
const serif = localFont({
  src: [
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-400.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-400-Italic.woff2", weight: "400", style: "italic" },
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-600.woff2", weight: "600", style: "normal" },
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-600-Italic.woff2", weight: "600", style: "italic" },
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-700.woff2", weight: "700", style: "normal" },
    { path: "../../app/fonts/playfair-display/PlayfairDisplay-700-Italic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--iv-serif",
  display: "swap",
});
const sans = localFont({
  src: [
    { path: "../../app/fonts/be-vietnam-pro/BeVietnamPro-Light.woff2", weight: "300", style: "normal" },
    { path: "../../app/fonts/be-vietnam-pro/BeVietnamPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../app/fonts/be-vietnam-pro/BeVietnamPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../app/fonts/be-vietnam-pro/BeVietnamPro-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../app/fonts/be-vietnam-pro/BeVietnamPro-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--iv-sans",
  display: "swap",
});

// Song Hỷ: hairline calligraphy for names, classic display serif for headings.
const thin = localFont({ src: "../../app/fonts/ephesis/Ephesis-Regular.woff2", weight: "400", variable: "--iv-thin", display: "swap" });
const display = localFont({ src: "../../app/fonts/prata/Prata-Regular.woff2", weight: "400", variable: "--iv-display", display: "swap" });

export const inviteFontVars = `${script.variable} ${serif.variable} ${sans.variable} ${thin.variable} ${display.variable}`;
