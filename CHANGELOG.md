# Changelog

What changed in Butsó, newest first. Dates are when the work landed on `main`.

## Unreleased

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
