# Launch checklist

Everything to check before real users get the link. Work top to bottom. Tick each box in your own copy.

## 1. Code

- [ ] `npm run typecheck` passes
- [ ] `npm run lint -- --max-warnings 0` passes (0 errors, 0 warnings)
- [ ] `npm run build` passes locally
- [ ] `docs/HOW-TO-USE.md` is up to date: `npx tsx scripts/make-guide-md.ts` makes no change

## 2. Vercel

- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set for Production
- [ ] `NEXT_PUBLIC_SITE_URL` set to the live address, `https://...`, **no trailing slash**
- [ ] `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` set
- [ ] No `service_role` key anywhere in Vercel's `NEXT_PUBLIC_` variables
- [ ] Redeployed after the last variable change
- [ ] Custom domain added and HTTPS working

## 3. Supabase

- [ ] **Authentication → URL configuration:** Site URL is the live address, and the live address is in Redirect URLs. Sign-up confirmation, Google sign-in and password reset all send people back to the site's own address, so they break without this.
- [ ] **Google provider:** the live domain is an authorised origin and redirect in Google Cloud Console.
- [ ] **Email:** a custom SMTP sender is set. Supabase's built-in sender is heavily rate-limited and not meant for real users.
- [ ] Row Level Security is **on for every table** (Database → Tables: no "RLS disabled" warnings).
- [ ] Database backups are on (Point-in-Time Recovery or daily backups on your plan).
- [ ] Schema exported to the repo (`supabase db pull`), so the project can be rebuilt if needed.

## 4. Cloudinary

- [ ] The upload preset is **unsigned**, with unique filenames, overwrite off, formats jpg/png/webp/heic, about 5 MB limit, max 2000×2000. See the README.

## 5. Legal and support

- [ ] Terms and Privacy Policy read through once more; contact details in them are correct
- [ ] `LEGAL_VERSION` in `lib/legal.ts` matches the date on those pages
- [ ] Someone owns these, with a weekly reminder:
  - new rows in `deletion_requests` (promised within 30 days)
  - new reports (no moderation dashboard yet)
  - support and feedback tickets

## 6. Smoke test on the live site

Use a real phone on mobile data, with two test accounts (A and B).

- [ ] A signs up with email, gets the confirmation email, confirms, passes the 18+ step, finishes the profile
- [ ] A signs in with Google
- [ ] A resets their password from the email link
- [ ] A posts a job; B finds it under Jobs and applies; A sees the notification and hires B; contact details show for both
- [ ] A sets up a shop with a photo; B books a service; A accepts; B leaves a review after it is completed
- [ ] B sends A a message request; A accepts; they chat; block works
- [ ] Report a job and a profile: the report is saved
- [ ] Settings → Download my data gives a file; Delete my account adds a request
- [ ] A brand-new account sees the welcome tour once after setup; Skip closes it; it does not come back after a reload or on a second phone. Settings → Replay the welcome tour shows it again
- [ ] Help & Support (from Settings on a phone): search "money", "scam" and "book a barber" and get sensible results; Show me plays; Try it now opens the right screen
- [ ] Share a profile, job and shop link on WhatsApp: the preview shows title and description, never a real name or phone number
- [ ] `/robots.txt` and `/sitemap.xml` load, and the sitemap uses the live domain, not `localhost`
- [ ] Turn data off: the offline banner shows; turn it back on: the app recovers
- [ ] Logged out, open a private page such as `/messages`: you are asked to log in and returned to it afterwards

## After launch

- [ ] Check Vercel Analytics and the Vercel function logs daily for the first week
- [ ] Submit the sitemap in Google Search Console
