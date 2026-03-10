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
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | ESLint check |

## Folder Structure

```
src/
├── app/                        # Next.js App Router
│   ├── layout.tsx              #   Root layout (Navbar, Footer, Providers)
│   ├── page.tsx                #   Homepage / Dashboard
│   ├── globals.css             #   Global styles (dark theme tokens)
│   │
│   ├── stocks/                 #   Stock pages
│   │   ├── page.tsx            #     /stocks — S&P 500 browser
│   │   └── [symbol]/page.tsx   #     /stocks/AAPL — full stock detail
│   │
│   ├── learn/                  #   Lesson pages
│   │   ├── page.tsx            #     /learn — lesson listing
│   │   └── [id]/page.tsx       #     /learn/what-is-stock — lesson detail
│   │
│   ├── portfolio/page.tsx      #   Paper trading simulator
│   ├── watchlist/page.tsx      #   Watchlist
│   ├── settings/page.tsx       #   User settings
│   ├── onboarding/page.tsx     #   New user onboarding
│   │
│   ├── (auth)/                 #   Auth pages (route group, no layout nesting)
│   │   ├── login/              #     /login
│   │   ├── register/           #     /register
│   │   ├── forgot-password/    #     /forgot-password
│   │   └── ...                 #     verify-email, reset-password
│   │
│   └── api/                    #   Next.js API routes (server-side)
│       ├── auth/               #     NextAuth + register/verify/reset
│       ├── portfolio/          #     Portfolio trades & history
│       ├── watchlist/          #     Watchlist add/remove
│       └── user/               #     Profile & settings
│
├── components/                 #   Shared components
│   ├── layout/
│   │   ├── Navbar.tsx          #     Top nav with search, auth, locale toggle
│   │   └── Footer.tsx          #     Site footer
│   └── providers/
│       ├── AuthProvider.tsx    #     NextAuth session provider
│       └── ThemeProvider.tsx   #     Theme context (dark mode)
│
├── lib/                        #   Utilities
│   ├── api.ts                  #     Backend API client (fetch wrapper)
│   ├── i18n.tsx                #     All TH/EN translations + useI18n hook
│   ├── auth.ts                 #     NextAuth configuration
│   ├── prisma.ts               #     Prisma client singleton
│   ├── email.ts                #     Email sending (nodemailer)
│   ├── market-hours.ts         #     US/Thai market open/close helpers
│   ├── tokens.ts               #     JWT utility functions
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
Pure CSS with custom properties (no CSS modules). Theme tokens are in `globals.css`. The app uses a "Soft Dark Minimal" theme.

### Data Fetching
- **Stock/lesson data** → fetched client-side from Express backend (port 4000) via `lib/api.ts`
- **Auth/portfolio/watchlist** → handled by Next.js API routes → Prisma → PostgreSQL

### Auth Flow
NextAuth v5 with credentials provider. Email verification via OTP codes sent by nodemailer.

## Adding a New Page

1. Create `src/app/your-page/page.tsx`
2. Add `'use client'` directive if interactive
3. Use `useI18n()` for translations — add keys to `lib/i18n.tsx`
4. Add nav link in `components/layout/Navbar.tsx` if needed
