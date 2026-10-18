# Acuity - Session Handoff & Progress Notes

**Last Updated:** October 2026
**Live URL:** `https://acuity.foo.ng`
**Vercel Alias:** `https://acuityv2.vercel.app`
**GitHub Repo:** `github.com/ebitimio/acuityv2`

---

## 1. Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with PostCSS via `@tailwindcss/postcss`)
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Bottom Sheets:** Vaul
- **Backend / Database:** Supabase (Postgres, Auth, RLS)
- **Email:** Resend (Custom SMTP)
- **AI:** OpenAI (GPT-4o-mini)
- **Hosting:** Vercel

## 2. Environment Variables (`.env.local`)
NEXT_PUBLIC_SUPABASE_URL=https://uxbuvfgxaklqcdvnppww.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
OPENAI_API_KEY=sk-proj-...
Note: These must also be set in Vercel -> Settings -> Environment Variables for Production and Preview.

## 3. Supabase Configuration
- **Auth Providers:** Email/Password (with OTP confirmation) and Google OAuth.
- **SMTP:** Resend (Custom SMTP enabled).
- **Site URL:** https://acuity.foo.ng
- **Redirect URLs:**
  - https://acuity.foo.ng/auth/callback
  - https://acuityv2.vercel.app/auth/callback
  - http://localhost:3000/auth/callback

## 4. Database Schema

### workspaces
- id UUID (PK) gen_random_uuid()
- owner_id UUID Ref auth.users(id) ON DELETE CASCADE
- name TEXT Default 'Personal'
- budget_limit_minor BIGINT Default 8000000
- created_at TIMESTAMPTZ Default now()

### accounts
- id UUID (PK)
- workspace_id UUID Ref workspaces(id) ON DELETE CASCADE
- name TEXT e.g. Main Checking
- institution TEXT e.g. GTBank
- type TEXT checking, savings, dom, wallet
- balance_minor BIGINT Default 0
- currency CHAR(3) Default NGN

### transactions
- id UUID (PK)
- account_id UUID Ref accounts(id) ON DELETE CASCADE
- amount_minor BIGINT Store as kobo
- direction TEXT CHECK (debit, credit)
- description_raw TEXT Original bank narration
- description_clean TEXT Cleaned merchant name
- category_name TEXT e.g. Groceries, Uncategorized, Split Parent
- date TIMESTAMPTZ
- parent_id UUID Ref transactions(id) for split children

### profiles
- id UUID (PK) Ref auth.users(id) ON DELETE CASCADE
- email TEXT Unique
- full_name TEXT
- avatar_url TEXT

### Triggers & Functions
- handle_new_user() Auto-creates a profile on signup.
- handle_new_user_workspace() Auto-creates a workspace on signup.
- get_home_metrics() RPC that returns the aggregated JSON for the home screen.

## 5. What Is Built & Working
- Design System: Liquid Glass surfaces.
- Auth: Email/Password with Strength + OTP, Google OAuth.
- Splash Screen: 3D VISA card animation.
- Home Dashboard: Live Net Worth, Pacing card, Hover feature cards.
- Floating Nav: Liquid drop, hide on scroll.
- Import Engine: Robust CSV parser (Opay/Nigerian formats).
- Transaction Detail: Modal with Split logic.
- AI Advisor: OpenAI chat with context.
- Accounts: Add/list accounts.
- Budget: Set monthly limit, gauge arc.
- Needs Review: Swipeable cards for uncategorized.
- Empty States: All other screens show No data yet.

## 6. Backlog (Next Priorities)

### Priority 1 - Micro-interactions & Polish
- [ ] Add hover/press animations to all buttons.
- [ ] Page transitions.
- [ ] Safe area padding fixes.

### Priority 2 - Settings Screen
- [ ] Functional Settings Sheet.
- [ ] Currency toggle.
- [ ] Delete Account.

### Priority 3 - Commitments & Ajo
- [ ] Add Bill modal.
- [ ] Add Sinking Fund modal.
- [ ] Create Ajo Group modal.

### Priority 4 - Reports & Export
- [ ] CSV/PDF Export.
- [ ] LIRS Tax PDF.

### Priority 5 - AI Upgrades
- [ ] Tool calling (RPC integration).
- [ ] SSE Streaming.

### Priority 6 - Bank Parsers
- [ ] GTBank, Kuda, Access, Zenith specific parsers.

### Priority 7 - Deployment
- [ ] Add real PWA icons.
- [ ] Add service worker.
