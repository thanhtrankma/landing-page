# WebLanding — Design System (Master)

Direction: **Airy Sky** — light-only, white surfaces washed with sky blue. Built with the `ui-ux-pro-max` skill
(design-system search + UX rules); the palette is fixed by the brand brief: **#BBE4F6 + white**.
Implementation lives in `src/app/theme.css`, layered over the original compiled stylesheet `src/app/globals.css`.

## Colour tokens
| Token | Value | Use |
|---|---|---|
| `--sky-300` (brand) | `#BBE4F6` | Fills only: primary buttons, active tabs/pills, featured card, CTA wash |
| `--sky-50/100/200` | `#F4FAFE / #E8F5FC / #D3EDFA` | Page wash, chips, icon tiles, borders |
| `--sky-400/500` | `#8FD0EE / #4FB3E0` | Hover fills, button borders, decorative particles |
| `--sky-700` (`--primary`) | `#0B6FA4` | Text accents, links, icons — 5.5:1 on white |
| `--sky-800` | `#08507A` | Eyebrows/labels on sky fills — 6.4:1 on #BBE4F6 |
| `--ink` (`--neutral`) | `#0B2A3C` | Body/heading text, text on sky fills — 11:1 on #BBE4F6 |
| `--tertiary` | `#52697A` | Secondary text — 5.7:1 on white |

Rules: never put white or sky text on `#BBE4F6`; never use `#BBE4F6` as text. Anything written on a sky fill is ink.

## Components
- **Primary button**: `#BBE4F6` fill, 1px `#4FB3E0` border, ink text, soft blue shadow. **Secondary**: white, `#8FD0EE` border.
- **Cards**: white, 1px `#D3EDFA`, `--shadow-soft`; lift on hover (`--shadow-lift`, border `#8FD0EE`).
- **Focus**: 3px white + 3px `#0B6FA4` ring on every `:focus-visible`.
- **Icons**: SVG only (no emoji); stroke 2, `currentColor`.
- **Motion**: transform/opacity only; `prefers-reduced-motion` stops orbs, badges and the cursor trail.

## Signature: paper-plane cursor (`src/components/SkyCursor.tsx`)
- Paper plane on the pointer, banking toward the direction of travel; 9 cloud puffs trail behind it.
- Over clickable elements the plane folds into a sky lens ring; over project previews the lens grows with a ↗ glyph.
- Native cursor is restored over text fields and iframes; disabled on touch / coarse pointers.

## Assets
Green artwork was hue-shifted to sky blue (hero backgrounds, FAQ/process illustrations, logo). Originals are not
kept in the repo. Hero banners (photo collages) and demo mini-sites keep their own colours.
