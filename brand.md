# Brand — Butsó

_Status: active_ · Last updated 2026-11-15

Butsó means "work" in Jukun. The brand should feel **warm, local and trustworthy**: real people, real trades, plain words. Not a slick startup, not a government form.

All colours below are CSS variables in `app/globals.css`, exposed to Tailwind as `bg-primary`, `text-muted-foreground`, `bg-brand-soft` and so on. **Use the tokens, never hex values in components.** Light and dark mode then work for free.

## Colour

### Brand

| Name | Hex | Use for |
| --- | --- | --- |
| Butsó green | `#1B9E6E` | The logo, illustrations, decorative fills (`bg-brand`). **Not** for text or button backgrounds with white text: only 3.4:1. |
| Deep green | `#15805A` | Primary buttons and green text in light mode (`primary`). 4.9:1 with white. |
| Light green | `#22C085` | Primary in dark mode. 7.9:1 on the dark background. |
| Hero green | `#5EE0A8` | Only for text on dark photos (hero, final call to action). |
| Butsó orange | `#F55D1E` | Decoration only. |
| Deep orange | `#C2410C` | Orange text and buttons in light mode (`accent`). 5.2:1 with white. |

### Tokens

| Token | Light | Dark | Notes |
| --- | --- | --- | --- |
| `background` | `#FAFAF8` warm white | `#141412` | Page |
| `card` | `#FFFFFF` | `#1E1E1B` | Raised surfaces |
| `foreground` | `#1A1A18` warm ink | `#F0EFEC` | Body text |
| `muted-foreground` | `#66655E` | `#9A9990` | Secondary text. 5.3:1+ light, 5.8:1+ dark |
| `primary` | `#15805A` | `#22C085` | Main actions, links |
| `accent` | `#C2410C` | `#FB7A45` | Rare highlights |
| `brand` / `brand-soft` | `#1B9E6E` / `#E8F7F1` | `#22C085` / green at 12% | Logo, icon chips, number badges |
| `secondary` | `#F5F4F1` | `#2A2A26` | Quiet buttons, alternating sections |
| `border` | `#E4E3DF` | `#2E2E2A` | Hairlines |
| `destructive` | `#C53030` | `#FC8181` | Delete, errors |
| `success` / `warning` | `#15805A` / `#B45309` | `#22C085` / `#F6AD55` | Status |
| `shadow-card` / `shadow-raised` | soft warm | deeper | `shadow-card`, `shadow-raised` |

Every text/background pair above passes **WCAG AA (4.5:1)**. If you add a colour, check it first.

### Theme

- Light and dark both ship. The **toggle** is on the landing page header, the sign-in screens, the app header and Settings.
- Until someone uses the toggle, the app follows the phone's light/dark setting (`themeChosen` in the store). After that, their choice wins on every visit.
- Text on photos is always white with a dark scrim behind it, in both themes.

## Type

| Role | Font | Notes |
| --- | --- | --- |
| Headings | **Fraunces** (`font-heading`), black weight, tight tracking | Warm, a little old-fashioned, very legible. `text-balance` on big headlines. |
| Body and UI | **Plus Jakarta Sans** (`font-sans`) | Friendly, clear at small sizes. |

Sizes: headlines `text-3xl`–`text-6xl`, body `text-base`, small print never below `text-xs`.

## Shape and space

- Rounded and friendly: `rounded-xl` for buttons and inputs, `rounded-2xl`/`rounded-3xl` for cards.
- Touch targets at least 44 px (`h-11`); main buttons 48 px (`h-12`).
- Content width `max-w-6xl`, side padding `px-4` on phones, `px-6` from `sm`.

## Motion

- Short and calm. Entrance: `.rise` (fade up, 0.7 s). Sections: `.reveal` (fades up as it scrolls in). Both are CSS, so content never waits for JavaScript, and both switch off for "reduce motion".
- Loading: skeletons in the shape of what is coming (`SkeletonAppFrame`, `animate-pulse`), never a spinner on a blank page.

## Photos

- Real Nigerian workers and streets, warm light. No stock-photo handshakes in suits.
- Always through `cldSized` / `cldThumb` / `cldSrcSet` (`lib/cloudinary.ts`) at the size shown. Never the original.

## Voice

- Plain, short, active: "Post a job", not "Click here to create a new job posting".
- Local and warm, lightly: "No wahala" once, not in every sentence.
- Honest: never fake numbers, fake reviews or features that are not there yet. Say "coming soon" or nothing.
- Privacy is a promise, said simply: "Your number stays yours."
