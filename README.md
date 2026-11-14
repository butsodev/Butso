# Butsó

**A free local marketplace for jobs, skilled workers and small shops.**

Butsó connects workers and employers, and helps shops get found and booked, with privacy built in: strangers see a username, not your real name or phone number, until you choose to share them. Launching first in Taraba State, Nigeria.

> *"Butsó" means "work" in Jukun.*

## Features

- **Jobs:** post a job, apply, and hire from the people who applied (up to 30 applicants per job). Hire someone directly from their profile.
- **Shops and bookings:** shops list services, prices, opening hours and up to 12 work photos. Customers book a time, and shops accept or decline.
- **Messages and requests:** first contact is a short message request. Contact details are shared only after a request is accepted, a hire, or an accepted booking.
- **18+ only for now:** an age and consent step at signup, with the date of birth kept private. Junior accounts with guardian approval are planned.
- **Privacy by default:** real names, photos and phone numbers are hidden from strangers, enforced in the database, not just on screen.
- **Fair discovery:** everyone gets a turn. Same-area workers show first, serious new members get a 30-day boost, and a per-visit shuffle stops anyone owning the top spot. Rating and past jobs never decide who is seen.
- **Your data:** download a copy of your data or request account deletion from Settings. When the Terms or Privacy Policy change, everyone is asked to agree again, and each agreement is recorded.
- **Trust:** reviews only after a completed booking, block, report (on any job, shop, review or profile), and a Founding Member badge for the first 100 members.
- **Sharing and search:** every profile, job and shop has a share link with a WhatsApp preview. A sitemap and robots.txt let search engines find public pages, and keep them off private ones.
- **Help built in:** step-by-step guides in the app (Help & Support). See also [docs/HOW-TO-USE.md](docs/HOW-TO-USE.md).

Everything is free to use for now. Payments are "coming soon".

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [Next.js 15](https://nextjs.org/) (App Router), React 19, TypeScript |
| Styling and motion | Tailwind CSS v4, Framer Motion, lucide-react |
| State | Zustand |
| Backend | [Supabase](https://supabase.com/): Postgres, Auth, Row Level Security, database functions |
| Photos | [Cloudinary](https://cloudinary.com/) (unsigned uploads, shrunk on the phone first) |
| Hosting | [Vercel](https://vercel.com/) + Vercel Analytics |

## Getting started

**You need:** Node.js 20 or newer, npm, a Supabase project, and a Cloudinary account.

```bash
git clone https://github.com/butsodev/Butso.git
cd Butso
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | What it is |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Your live site address, no trailing slash. Used for share links and WhatsApp previews |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | For photos | Name of an **unsigned** Cloudinary upload preset |

Never put a Supabase `service_role` key in any `NEXT_PUBLIC_` variable.

If the Supabase variables are missing, the app still builds (static pages do not need the database), but it prints `[butso] Missing NEXT_PUBLIC_SUPABASE_URL...` and every query fails. If you see that message, check `.env.local`: one `NAME=value` per line, no spaces around `=`, no quotes needed.

If `NEXT_PUBLIC_SITE_URL` is not set, share links fall back to Vercel's production address, then to `http://localhost:3000`.

### Cloudinary preset

Create an unsigned upload preset with unique filenames on, overwrite off, allowed formats jpg, png, webp and heic, a file size limit (about 5 MB), and image width and height limited to 2000. The app shrinks photos before upload and gives each a random name.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint (Next.js rules). Must show 0 errors; warnings are allowed but worth fixing |
| `npm run typecheck` | TypeScript check |
| `npx tsx scripts/make-guide-md.ts` | Rebuild `docs/HOW-TO-USE.md` from `lib/guideContent.ts` |

### Before every push

```bash
npm run typecheck && npm run lint && npm run build
```

`npm run build` also runs type checks and lint, and **fails on any type error or lint error**, so a broken commit will not deploy. There are no automated tests yet; check changes by hand in the app (see [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md) for the smoke test).

## Project structure

```
app/
  (entry)/        sign-up, log-in, onboarding
  (main)/         dashboard, jobs, bookings, messages, shop, notifications, payments
  u/[username]/   public profile links (/@username)
  robots.ts       robots.txt: public pages allowed, private screens disallowed
  sitemap.ts      sitemap.xml: static pages + open jobs, shops, worker profiles (hourly)
components/       UI and screens
lib/
  store.ts        app state and navigation helpers
  routes.ts       URL <-> screen mapping
  data*.ts        Supabase queries, one file per feature
  upload.ts       Cloudinary photo upload
  usernames.ts    reserved usernames
  seo.ts          site URL and link-preview metadata (public fields only)
  supabase.ts     Supabase client
  guideContent.ts how-to guides (source for the in-app guides and docs/HOW-TO-USE.md)
docs/             user guide (HOW-TO-USE.md) and go-live list (LAUNCH-CHECKLIST.md)
scripts/          small build helpers
```

## Database and privacy model

Supabase Postgres with Row Level Security on every table. The key rules live in the database, not only in the app:

- A public view exposes only a username in place of the real name unless contact access exists.
- Message and contact requests, blocking, hiring and the applicant cap are enforced by database functions and triggers: one pending request per pair, a cooldown after a decline, and a daily request limit.
- Shop phone numbers are kept in a private table.
- Photo URLs must come from the project's own Cloudinary account.

> **Note:** the schema is currently managed in the Supabase dashboard and is **not** in this repo. Exporting it as migrations (`supabase db pull` into a `supabase/` folder) is the top item under [Known limitations](#known-limitations). Until then, a new environment cannot be created from this repo alone.

## Common changes

- **Terms or Privacy Policy changed?** Edit the page, then set `LEGAL_VERSION` in `lib/legal.ts` to today's date. Everyone is asked to agree again on their next visit, and the version they agreed to is saved.
- **Guide changed?** Edit `lib/guideContent.ts`, then run `npx tsx scripts/make-guide-md.ts` so `docs/HOW-TO-USE.md` matches.
- **New area?** Add it to `lib/areas.ts`. It is used by profiles, job posts and search filters.
- **New private page?** Add it to the `disallow` list in `app/robots.ts`.

## Deployment

Deploy on Vercel. Set the environment variables above for **Production** (and Preview, if you use preview deploys), then redeploy. Environment variable changes only take effect after a redeploy.

The full go-live list (Supabase auth URLs, Cloudinary preset, legal pages, smoke test) is in [docs/LAUNCH-CHECKLIST.md](docs/LAUNCH-CHECKLIST.md).

## Known limitations

Honest list of what the MVP does not do yet:

- **Schema not in the repo.** Tables, RLS policies, views and functions live only in the Supabase dashboard. Export them before anyone else needs to set up the project.
- **No automated tests.** Type checks and lint run on every build; behaviour is checked by hand.
- **No phone verification.** Phone numbers are optional and not checked. The old phone-code screen accepted any code and was removed; `/verify-phone` now redirects to sign-up. Unused phone sign-in code is still in `components/AuthPage.tsx` for when an SMS provider is added.
- **No in-app payments.** Customers pay workers and shops directly.
- **Account deletion is a request.** Settings files a request in `deletion_requests`; someone has to process it (promised within 30 days).
- **Reports are reviewed by hand.** There is no moderation dashboard yet.
- **18+ only.** Junior accounts with guardian approval are planned.
- **Location is a fixed list of areas** around the launch region.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## Roadmap

Built: jobs, shops, bookings, messaging, privacy, fair ranking, share links, photos, guides. Next: testing with real users, then payments, job alerts outside the app, and wider location support.

## License

No license has been chosen yet, so all rights are reserved by default.
