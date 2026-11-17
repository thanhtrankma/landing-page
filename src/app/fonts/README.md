# Self-hosted fonts

Loaded with `next/font/local` from:

- `src/app/(site)/layout.tsx`: Inter, Be Vietnam Pro, Outfit, Plus Jakarta Sans
- `src/app/(admin)/layout.tsx`: Inter
- `src/app/(editor)/layout.tsx`: Be Vietnam Pro
- `src/components/invite/fonts.ts`: Great Vibes, Playfair Display, Be Vietnam Pro, Ephesis, Prata

They replace `next/font/google`, so builds no longer download anything from Google Fonts. In Next 16.3.5,
Turbopack's Google font loader breaks when Google answers with `/l/font?kit=…&skey=…` URLs.

## Licence

Every family is under the SIL Open Font License 1.1, which allows self-hosting and redistribution. Each folder
has its `OFL.txt`. Playfair Display has the Reserved Font Name "Playfair Display". Our subset is a Modified
Version, so its internal font names are changed to "SL Playfair". The CSS family name comes from next/font,
so this does not affect rendering.

## How the files were made

The sources are from [google/fonts](https://github.com/google/fonts) at commit
`7af0d90b4d532ffa4b041937b560c6df4e7b1e95` (`ofl/<family>/`). They were converted with `build_fonts.py`
(fontTools). Each woff2 holds all of the latin, latin-ext and vietnamese glyphs. This matters because
`next/font/local` cannot set a `unicode-range` per file. The total size is about the same as Google's
per-subset files, which a Vietnamese page already loads all of. All OpenType features are kept, and hinting
is removed, as Google does.

```sh
B="python build_fonts.py"; ALL=latin,latin-ext,vietnamese
$B 'Inter[opsz,wght].ttf' inter/Inter-Variable.woff2 $ALL opsz   # opsz pinned at default, like Google's wght-only Inter
for w in Light Regular Medium SemiBold Bold ExtraBold; do $B BeVietnamPro-$w.ttf be-vietnam-pro/BeVietnamPro-$w.woff2 $ALL; done
$B 'Outfit[wght].ttf' outfit/Outfit-Variable.woff2 latin,latin-ext
$B 'PlusJakartaSans[wght].ttf' plus-jakarta-sans/PlusJakartaSans-Variable.woff2 $ALL
$B GreatVibes-Regular.ttf great-vibes/GreatVibes-Regular.woff2 $ALL
$B Ephesis-Regular.ttf ephesis/Ephesis-Regular.woff2 $ALL
$B Prata-Regular.ttf prata/Prata-Regular.woff2 latin,vietnamese
for w in 400 600 700; do
  $B 'PlayfairDisplay[wght].ttf' playfair-display/PlayfairDisplay-$w.woff2 $ALL wght=$w "rename=Playfair Display:SL Playfair"
  $B 'PlayfairDisplay-Italic[wght].ttf' playfair-display/PlayfairDisplay-$w-Italic.woff2 $ALL wght=$w "rename=Playfair Display:SL Playfair"
done
```

To add a weight or family, run the same script on the upstream file and add an entry to the `localFont` call.
