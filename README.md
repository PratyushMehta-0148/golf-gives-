# ⛳ GolfGives — Play. Win. Give.

A subscription-driven golf performance tracking platform combining Stableford score tracking, monthly prize draws, and charity fundraising.


**Live Demo:** `[(https://golf-gives-8e6dwus7q-pratyushmehta-0148s-projects.vercel.app/signup)]`  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (JWT) |
| Deployment | Vercel |
| Styling | Custom CSS Design System |

---

## Features Implemented

### User-Facing
- [x] **Public landing page** — value proposition, how it works, charity showcase, prize tiers
- [x] **3-step signup** — Account → Plan selection → Charity + contribution %
- [x] **Monthly & Yearly subscription plans** — £9.99 / £99.99
- [x] **Golf score entry** — Stableford format (1–45), date required, one per date
- [x] **Rolling 5-score logic** — DB trigger auto-removes oldest when 6th score added
- [x] **Duplicate date prevention** — unique constraint on (user_id, score_date)
- [x] **Draw participation history** — view entered draws with number matching
- [x] **Winner proof upload** — upload screenshot to Supabase storage
- [x] **Winnings tracker** — prize amounts, payment status
- [x] **Charity management** — change charity and contribution % anytime
- [x] **Profile settings** — name, subscription details
- [x] **Public charities directory** — search, filter, featured spotlight
- [x] **Public draws page** — past results, how it works, prize tiers, countdown

### Admin Panel
- [x] **User management** — view all users, toggle subscription status, search
- [x] **Draw engine** — Random OR Algorithmic draw mode, simulate before publish
- [x] **Auto draw processing** — creates entries for all eligible subscribers on publish
- [x] **Winner detection** — 3/4/5-match detection, prize amount calculation
- [x] **Charity management** — add, edit, delete charities, toggle featured
- [x] **Winner verification** — approve / reject submissions, mark as paid

### Technical
- [x] Mobile-first responsive design
- [x] Row Level Security (RLS) on all Supabase tables
- [x] Protected routes (auth guard + admin guard)
- [x] JWT authentication via Supabase Auth
- [x] SPA routing configured for Vercel

---

## Project Structure

```
golfcharity/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── AuthContext.jsx       # Auth state, user profile
│   ├── lib/
│   │   └── supabase.js           # Supabase client + constants
│   ├── pages/
│   │   ├── HomePage.jsx          # Landing / marketing page
│   │   ├── LoginPage.jsx         # Sign in
│   │   ├── SignupPage.jsx        # 3-step onboarding
│   │   ├── DashboardPage.jsx     # User dashboard (6 sections)
│   │   ├── AdminPage.jsx         # Admin control panel (5 sections)
│   │   ├── CharitiesPage.jsx     # Public charity directory
│   │   └── DrawsPage.jsx         # Public draws + results
│   ├── App.jsx                   # Routes + auth/admin guards
│   ├── main.jsx                  # App entry point
│   └── index.css                 # Full design system
├── supabase_schema.sql           # Complete DB schema + RLS + seed data
├── vercel.json                   # SPA routing rewrites
├── vite.config.js
├── package.json
└── .env.example
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Extends auth.users — plan, status, charity, contribution % |
| `charities` | Charity directory with featured flag |
| `golf_scores` | User scores (unique per user+date, max 5 via trigger) |
| `draws` | Monthly draws — numbers, pool, status |
| `draw_entries` | Per-user draw participation + match count |
| `winners` | Prize winners with verification workflow |
| `subscription_events` | Subscription lifecycle log |

---

## Deployment Guide

### Prerequisites
- GitHub account
- **New** Supabase account (not personal/existing — per PRD requirement)
- **New** Vercel account (not personal/existing — per PRD requirement)



## Test Credentials

> Set these up after deploying:

| Role | Email | Password |
|------|-------|----------|
| Admin | abc@golfgives.com | (12345678) |
| Subscriber | user@golfgives.com | (123456789) |

---

## Design Decisions

**Why not a traditional golf aesthetic?**
Per the PRD: *"The platform must not resemble a traditional golf website. Design must be emotion-driven — leading with charitable impact, not sport."*

The design uses:
- Deep forest green + warm gold palette (nature / impact, not sport)
- Fraunces (editorial serif) + Clash Display (geometric) — not golf-club typography
- Charity impact leads every page section
- Clean, modern card-based layouts with subtle depth

**Score rolling logic — DB trigger vs. application layer**
Implemented as a PostgreSQL trigger (`enforce_rolling_scores`) so the 5-score cap is enforced at the database level regardless of which client or API path is used. This prevents edge cases from concurrent requests or direct API calls.

**Draw processing on publish**
When an admin publishes a draw, the system immediately:
1. Queries all active subscribers with 3+ scores
2. Creates `draw_entries` for each
3. Calculates match count vs drawn numbers
4. Creates `winners` records for 3/4/5-match entries

This keeps the draw results consistent and avoids re-computation on every page load.

---

## Known Limitations & Future Work

- **Stripe integration** — subscription billing is simulated (status set to `active` on signup). Real implementation would use Stripe Checkout + Supabase Edge Function webhook
- **Email notifications** — schema and triggers are in place; would wire to Supabase Edge Functions + Resend/SendGrid
- **Score proof verification** — currently accepts screenshot URL; full flow would use Supabase Storage for direct upload
- **Prize splitting** — current implementation assigns full tier pool to each winner; a post-publish step should divide equally among tier winners
- **Multi-country** — schema is currency-agnostic; adding `currency` field to profiles and plans would enable this

---

Built with ❤️ by Pratyush Mehta
