# Butsó

**Where skills meet opportunity.** Find work, connect with skilled people, and help local businesses grow.

Butsó connects workers and employers, and helps shops get found and booked, with privacy built in: strangers see a username, not your real name or phone number, until you choose to share them. Launching first in Taraba State, Nigeria.

> *"Butsó" means "work" in Jukun.*

## Features

- **Jobs:** post a job, apply, and hire from the people who applied (up to 30 applicants per job). Hire someone directly from their profile.
- **Shops and bookings:** shops list services, prices, opening hours and up to 12 work photos. Customers book a time, and shops accept or decline.
- **Messages and requests:** first contact is a short message request. Contact details are shared only after a request is accepted, a hire, or an accepted booking.
- **Privacy by default:** real names, photos and phone numbers are hidden from strangers, enforced in the database, not just on screen.
- **Fair discovery:** everyone gets a turn. Same-area workers show first, serious new members get a 30-day boost, and a per-visit shuffle stops anyone owning the top spot. Rating and past jobs never decide who is seen.
- **Trust:** reviews only after a completed booking, block and report, and a Founding Member badge for the first 100 members.
- **Sharing:** every profile, job and shop has a share link with a WhatsApp preview.
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

### Cloudinary preset

Create an unsigned upload preset with unique filenames on, overwrite off, allowed formats jpg, png, webp and heic, a file size limit (about 5 MB), and image width and height limited to 2000. The app shrinks photos before upload and gives each a random name.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check. Run it before every push, because `next.config.mjs` does not fail builds on type errors |
| `npx tsx scripts/make-guide-md.ts` | Rebuild `docs/HOW-TO-USE.md` from `lib/guideContent.ts` |

## Project structure

```
app/
  (entry)/        sign-up, log-in, onboarding, phone verification
  (main)/         dashboard, jobs, bookings, messages, shop, notifications, payments
  u/[username]/   public profile links (/@username)
components/       UI and screens
lib/
  store.ts        app state and navigation helpers
  routes.ts       URL <-> screen mapping
  data*.ts        Supabase queries, one file per feature
  upload.ts       Cloudinary photo upload
  usernames.ts    reserved usernames
  guideContent.ts how-to guides (source for the in-app guides and docs/HOW-TO-USE.md)
docs/             user guide
scripts/          small build helpers
```

## Database and privacy model

Supabase Postgres with Row Level Security on every table. The key rules live in the database, not only in the app:

- A public view exposes only a username in place of the real name unless contact access exists.
- Message and contact requests, blocking, hiring and the applicant cap are enforced by database functions and triggers: one pending request per pair, a cooldown after a decline, and a daily request limit.
- Shop phone numbers are kept in a private table.
- Photo URLs must come from the project's own Cloudinary account.

> **Note:** the schema is currently managed in the Supabase dashboard. Exporting it as migrations into a `supabase/` folder is on the to-do list. Until then, new environments cannot be created from this repo alone.

## Deployment

Deploy on Vercel. Set the environment variables above, then redeploy. Run `npm run typecheck` before pushing.

## Roadmap

Built: jobs, shops, bookings, messaging, privacy, fair ranking, share links, photos, guides. Next: testing with real users, then payments, job alerts outside the app, and wider location support.

## License

No license has been chosen yet, so all rights are reserved by default.
