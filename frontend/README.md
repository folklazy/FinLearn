# FinLearn Frontend — Next.js App

Bilingual (Thai/English) investment learning platform with real-time stock data, lessons, and paper trading.

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev                 # http://localhost:3000
```

Requires the backend running on port 4000 for stock/lesson data.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build (includes `prisma generate`) |
| `npm start` | Run production build |
| `npm run lint` | ESLint check |

## Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              #   Root layout (Navbar, Footer, Providers)
│   ├── page.tsx                #   Homepage / Dashboard
│   ├── globals.css             #   Global styles + responsive rules + theme tokens
│   │
│   ├── stocks/                 #   Stock pages
│   │   ├── page.tsx            #     /stocks — S&P 500 browser (grid/table, filters)
│   │   └── [symbol]/page.tsx   #     /stocks/AAPL — full stock detail
│   │
│   ├── learn/                  #   Lesson pages
│   │   ├── page.tsx            #     /learn — lesson listing with category filters
│   │   └── [id]/page.tsx       #     /learn/what-is-stock — lesson reader + quiz
│   │
│   ├── portfolio/page.tsx      #   Paper trading simulator
│   ├── watchlist/page.tsx      #   Watchlist with live prices
│   ├── glossary/page.tsx       #   Financial terms dictionary (TH/EN)
│   ├── settings/page.tsx       #   User settings (profile, security, preferences)
│   ├── onboarding/page.tsx     #   Full-screen new user onboarding wizard
│   │
│   ├── (auth)/                 #   Auth pages (route group, no layout nesting)
│   │   ├── login/              #     /login
│   │   ├── register/           #     /register
│   │   ├── forgot-password/    #     /forgot-password
│   │   ├── reset-password/     #     /reset-password
│   │   └── verify-email/       #     /verify-email + /verify-email/confirm
│   │
│   └── api/                    #   Next.js API routes (server-side)
│       ├── auth/               #     NextAuth + register/verify/reset/resend
│       ├── portfolio/          #     Portfolio trades & history
│       ├── watchlist/          #     Watchlist add/remove
│       ├── user/               #     Profile, password, email change, delete
│       └── health/             #     Frontend health check
│
├── components/                 #   Shared components
│   ├── layout/
│   │   ├── Navbar.tsx          #     Frosted glass nav: search, auth, locale, theme
│   │   ├── Footer.tsx          #     Site footer with links
│   │   └── LayoutShell.tsx     #     Conditional chrome (hides nav on onboarding)
│   ├── ui/
│   │   └── StockLogo.tsx       #     Reusable stock logo with fallback
│   ├── PageTip.tsx             #     Contextual page tips
│   ├── ProductTour.tsx         #     driver.js guided walkthrough
│   └── providers/
│       ├── AuthProvider.tsx    #     NextAuth session provider
│       └── OnboardingGuard.tsx #     Redirects new users to onboarding
│
├── lib/                        #   Utilities
│   ├── api.ts                  #     Backend API client (fetch wrapper → :4000)
│   ├── auth.ts                 #     NextAuth config (Credentials + Google OAuth)
│   ├── currency.tsx            #     CurrencyContext — USD/THB/EUR/JPY formatting
│   ├── email.ts                #     Nodemailer — verification & reset emails
│   ├── i18n.tsx                #     All TH/EN translations + useI18n() hook
│   ├── logger.ts               #     Structured logging utility
│   ├── login-limiter.ts        #     DB-backed brute-force protection (login)
│   ├── market-hours.ts         #     NYSE/SET open/close schedule helpers
│   ├── otp-limiter.ts          #     DB-backed brute-force protection (OTP)
│   ├── prisma.ts               #     Prisma client singleton
│   ├── rate-limiter.ts         #     Generic rate limiter utility
│   ├── theme.tsx               #     ThemeContext — dark/light mode toggle
│   ├── tokens.ts               #     OTP/JWT generation & DB persistence
│   └── utils.ts                #     Number formatting, helpers
│
├── types/
│   └── stock.ts                #     StockData, BeginnerTips, SearchResult
│
└── proxy.ts                    #     Dev proxy config (→ backend:4000)
```

## Key Architecture Decisions

### Internationalization (i18n)
All translations are in `lib/i18n.tsx` using a custom `useI18n()` hook that returns `{ t, locale, setLocale }`. No external i18n library needed.

### Styling
Tailwind CSS v4 + pure CSS with custom properties (design tokens) in `globals.css`. Supports dark/light mode via `ThemeContext`. Responsive mobile layouts with breakpoint-aware grids.

### Data Fetching
- **Stock/lesson data** → fetched client-side from Express backend (port 4000) via `lib/api.ts`
- **Auth/portfolio/watchlist** → handled by Next.js API routes → Prisma → PostgreSQL

### Auth Flow
NextAuth v5 with dual providers: Credentials (email/password + OTP verification) and Google OAuth. OAuth-aware settings page detects Google users and disables email changes.

### Currency
`CurrencyContext` provides `formatPrice()` and `formatLarge()` globally. Supports USD, THB, EUR, JPY with live exchange rates. User preference persisted in DB.

## Adding a New Page

1. Create `src/app/your-page/page.tsx`
2. Add `'use client'` directive if interactive
3. Use `useI18n()` for translations — add keys to `lib/i18n.tsx`
4. Add nav link in `components/layout/Navbar.tsx` if needed
