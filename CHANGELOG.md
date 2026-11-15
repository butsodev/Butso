# Changelog

What changed in Butsó, newest first. Dates are when the work landed on `main`.

## Unreleased

### Loading, landing page and theme
- **No more blank loading screen.** Public screens (landing, jobs, shops, profiles, help, sign-in) render at once, including in the server HTML. Private screens show the app's frame with placeholders while the sign-in check runs, instead of a spinner on an empty page. Returning members opening `/` see the frame, not a flash of the landing page.
- **Landing page loads about 10x less.** Photos are fetched at the size shown (`cldSized`, `cldThumb`, `cldSrcSet`), and the hero slideshow only loads the current and next photo (it used to load all 16 full-size originals at once). On a slow mobile connection the page settles in about 6 s instead of 34 s, with ~230 KB of images instead of ~2 MB. The first hero photo is preloaded, and a branded backdrop shows until it arrives.
- **Landing page restructured** into one story: hero, people already on Butsó (real data), trades, how it works for hiring / working / shops, the privacy promise, join. Shorter (about 5,600 px on a phone, was 6,100), no repeated sections, no fake worker counts. Trade tiles and member cards are real links. Rebuilt on theme tokens, so dark mode works on it.
- **Theme polished**, same brand: buttons, links and secondary text now pass WCAG AA in light mode (they were 3.1 to 4.4:1). Bright green and orange stay for the logo and decoration. New tokens: `brand`, `brand-soft`, `success`, `warning`, `shadow-card`, `shadow-raised`. See `brand.md`.
- **Dark mode follows the phone** until you use the toggle; after that your choice wins. Existing members who had switched it on keep it.
- Entrance and scroll animations are plain CSS (`.rise`, `.reveal`), so content is never hidden waiting for JavaScript.

### Date of birth picker
- Date of birth is now three scroll wheels (day, month, year) that snap into place, with items fading, blurring and tilting away from the centre, like a phone's own picker. Tap any value to jump to it; works with the keyboard and screen readers (spin buttons); days follow the month and leap years; a line underneath confirms the date and age. Used at sign-up and on the age check screen (`components/DateWheelPicker.tsx`).

### Fixed (found by running every signed-in flow end to end with test accounts)
- **No booking could ever be completed, so reviews were impossible.** The database only lets the customer complete a booking, but the app showed "Mark completed" to the shop owner, who always got "Could not update that booking". The customer now has "Mark as done"; the shop sees who it is waiting on.
- **Phone users could not tap Send in chats**: the floating assistant button sat exactly on top of it (feedback button over the input). Both are hidden on the messages screen.
- **Sign-up could be lost at the last step**: the profile was only saved after picking an option on the "You're in" screen. It is now saved before that screen appears. "Just take me to my dashboard" also opened the wrong mode for people who came to hire.
- After picking a skill at sign-up, the suggestions list stayed open over Next, so a tap meant for Next added another skill.
- Rating a shop booking reviewed the owner's personal profile instead of the shop; it now opens the shop's reviews.
- Shop reviews would have stored the reviewer's real name in a public table; they now store the username.
- A blocked person was told "Check your connection and try again" (retrying can never work). They now see "You can no longer message this person", which does not reveal the block.
- Booking dates showed US-style (11/18/2026) and prices without commas; now "Wed, 18 Nov 2026" and "₦2,000".

### Fixed (found while testing against the live database)
- Worker share links (`/@username`) always showed the generic preview: the query asked for a `location` column that `public_profiles` does not have. Also escaped `_` in the username lookup.
- Help & Support sent signed-out visitors back to the landing page; it is now open to everyone (and in the sitemap).
- `/login` rendered the sign-up panel on the server, causing a hydration error.
- The saved dark-mode choice could be overwritten on load (hydration read the store's initial values), and the app header kept a second copy of the theme logic.
- New shops stored the owner's real name in a public column; they now store the username.
- Settings' dark mode row used bell / globe icons.

### Added
- **Welcome tour**, shown once to every member (new and existing) on a main screen after sign-in. Skip counts as seen. "Seen" is remembered on the device and on the account (Supabase user metadata, no migration), so a new phone does not show it again. It waits for the age / Terms check and never opens on top of another pop-up. Replay from Help & Support or Settings.
- **Help Center search** over guides and FAQs: accent-insensitive, handles word endings and partial words, understands everyday words (synonyms), highlights matches, and opens a guide at the step that matched. No results offers "Ask us", which carries the question into the support form.
- **Walkthrough player** upgrades: autoplay with a video-style progress bar, tap the screen to pause, swipe between steps, tap a dot to jump, "Try it now" on the last step, and optional real video (`guide.video`) with captions.
- Deep links: `/support?q=...` and `/support?guide=<id>&step=<n>`.
- Popular topic chips on Help & Support, and an FAQ for forgotten passwords.

### Fixed
- Help & Support could not be reached on phones once signed in (it was only in the desktop sidebar). It is now in Settings and on the Profile screen.
- Two FAQ answers described fields that do not exist (cover letter, portfolio link). They now match the real forms.

### Changed
- FAQs moved from the Support screen to `lib/faqContent.ts`; `HowToGuide` replaced by `HelpCenter`.

## 0.1.0 (MVP), 2026-11-14

Getting ready for the first real users.

### Fixed
- The dashboard no longer shows a fixed 0.8-second loading skeleton on every visit. It now shows the skeleton only while jobs are really loading for the first time.
- A build without Supabase keys (a preview deploy, CI) no longer crashes while prerendering pages. The app prints a clear `[butso] Missing NEXT_PUBLIC_SUPABASE_URL...` message instead.

### Added
- `robots.txt`: public pages open to search engines, private screens (messages, settings, bookings...) closed.
- `sitemap.xml`: static pages plus open jobs, shops and worker profiles, rebuilt at most once an hour. Only usernames, never real names or phone numbers.
- Site URL set as the base for all metadata, so link previews always use the full address.
- ESLint with the Next.js rules (`npm run lint`).
- New how-to guide: "Report a problem, and control your data" (in the app and in `docs/HOW-TO-USE.md`).
- `.env.example`, `docs/LAUNCH-CHECKLIST.md`, this changelog.

### Changed
- **Builds now fail on type errors and lint errors.** `next.config.mjs` used to ignore type errors.
- Lint is fully clean (0 errors, 0 warnings): removed unused imports and leftover directives, typed the remaining `any`s (including a typed global `window.showToast`), and made effects depend on ids rather than whole objects. Plain `<img>` is allowed on purpose, since photos are already shrunk before upload and `images.unoptimized` is on.
- Package renamed from `my-project` to `butso`.
- `tsconfig.tsbuildinfo` (a build cache) is no longer tracked in git.
- Removed unused placeholder images from `public/`.

## Before 0.1.0

### 2026-10-31: Consent and safety
- 18+ age and consent step at signup; date of birth stays private.
- Re-consent screen when the Terms or Privacy Policy version changes, with each agreement recorded.
- Download my data, and request account deletion, from Settings.
- Real Terms of Service and Privacy Policy pages.
- Report on jobs, shops, reviews and profiles.
- Removed the gender field and the placeholder phone-code screen.

### 2026-10-27 to 10-30: Photos and polish
- Shop banner and profile photos, up to 12 work photos, full-screen photo viewer with share and download.
- Founding Member badge, first-job checklist, reserved usernames, naira amount formatting.
- Confirm dialogs, bigger touch targets, long-press labels, offline banner.

### 2026-10-23 to 10-24: Privacy and trust
- Message requests, contact requests, block and report, private shop phone numbers.
- Hire from applicants or straight from a profile; applicant cap; edit, close and delete jobs; saved jobs.
- Fair worker ranking, share links with WhatsApp previews, return to the exact page after login.

### 2026-10-19 to 10-21: Real backend
- Bookings, notifications, shops, messaging (realtime), ratings and reviews on Supabase.
- Password reset, 404 / loading / error pages.
- Real Next.js routing (33 routes) and `/@username` public profiles; area dropdown and search filters.

### 2026-07 to 10-12: Foundations
- Supabase auth (email/password and Google), profile setup, username picker.
- Jobs loaded from and posted to Supabase.
- Removed fake stats and fake buttons; emoji replaced with icons; accessibility pass.
