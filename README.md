# Butsó — Your Local Work Network

Butsó connects skilled workers and employers in Wukari, Taraba State. Find jobs, hire locally, and get paid — no CV, no agency, no stress.

> *"Butsó" means "work" in Jukun — built for the people of Wukari.*

---

## What it does

- **Workers** browse and apply for local jobs across any skill — plumbing, cleaning, electrical, carpentry, cooking, and more
- **Employers** post jobs in seconds and get applications from verified locals fast
- **Everyone** can explore the platform, pick their interests, and see personalised job feeds from the first visit
- In-app messaging, booking slots, payment tracking, ratings and reviews — all in one place

## Tech Stack

- **Framework** — [Next.js 15](https://nextjs.org/) (App Router)
- **Styling** — [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations** — [Framer Motion](https://www.framer.com/motion/)
- **State** — [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **Data fetching** — [SWR](https://swr.vercel.app/)
- **Analytics** — [Vercel Analytics](https://vercel.com/analytics)
- **Language** — TypeScript

## Getting Started

```bash
# Clone
git clone https://github.com/your-username/butso-platform.git
cd butso-platform

# Install
pnpm install

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
pnpm build
pnpm start
```

## Project Structure

```
butso-platform/
├── app/                    # Next.js App Router — layout, page, global styles
├── components/             # All UI components
│   ├── LandingPage.tsx     # Landing page with situation picker
│   ├── ExploreOnboarding.tsx  # Interest picker for explore users
│   ├── UnifiedDashboard.tsx   # Worker + employer dashboard
│   ├── JobsBrowsing.tsx    # Personalised job feed
│   ├── ProfileSetup.tsx    # Onboarding flow
│   └── ui/                 # Reusable primitives
├── lib/
│   ├── store.ts            # Zustand store + behaviour tracking
│   ├── mockData.ts         # Seed data for testing
│   └── utils.ts
└── public/                 # Icons and static assets
```

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable codebase |
| `dev`  | Active development + testing |

## Contributing

This is a private project. If you've been given access for testing, please report bugs and feedback via the issues tab.

## License

Private — All rights reserved © 2026 Butsó, Wukari, Taraba State, Nigeria..