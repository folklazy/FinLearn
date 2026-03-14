# FinLearn

> แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับผู้เริ่มต้น — ภาษาไทย/อังกฤษ

A bilingual Thai/English stock investment learning platform targeting retail investors with zero prior experience. Combines real-time market data, structured lessons, interactive quizzes, and paper trading to make investing education accessible and hands-on.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React 19)                │
│  Next.js 16 App Router · Tailwind CSS v4 · Recharts │
└──────────────────────┬──────────────────────────────┘
                       │ REST
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌───────────────────────┐
│  Next.js API     │    │   Express 5 Backend    │
│  Routes          │    │   :4000                │
│  (auth, user,    │    │   Stock data, lessons, │
│   portfolio,     │    │   health endpoints     │
│   watchlist)     │    └──────────┬────────────┘
└────────┬─────────┘               │
         │                         │ Parallel fetch + fallback
         ▼                         ▼
┌──────────────────┐    ┌──────────────────────────────┐
│  PostgreSQL DB   │    │  External APIs               │
│  (Neon)          │    │  FMP → Finnhub → Yahoo       │
│                  │    │  Twelve Data (technicals)    │
│  Users, auth,    │    │                              │
│  trades,         │◄───│  PostgreSQL cache (TTL)      │
│  favorites       │    │  api_cache table             │
└──────────────────┘    └──────────────────────────────┘
```

**Two distinct concerns share one PostgreSQL database:**
- `frontend/prisma/` — users, auth sessions, paper trades, watchlist
- `backend/prisma/` — API response cache (`api_cache`) and usage counters (`api_usage_daily`)

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend framework | Next.js 16 (App Router, React 19) | SSR + client components, built-in API routes |
| Styling | Tailwind CSS v4 + CSS custom properties | Utility-first, custom dark theme via design tokens |
| Charts | Recharts + Lightweight Charts | Recharts for metrics, TradingView charts for price |
| Icons | Lucide React | Consistent icon set, tree-shakable |
| Backend | Express 5 + TypeScript | Minimal overhead for a data aggregation API |
| ORM | Prisma 6 | Type-safe queries, schema-as-code, migrations |
| Database | PostgreSQL (Neon) | JSONB for cache blobs, reliable at free-tier cloud |
| Auth | NextAuth v5 (Auth.js) | Credentials + Google OAuth, JWT strategy |
| Email | Nodemailer | OTP verification & password reset emails |
| API providers | FMP, Finnhub, Twelve Data, Yahoo Finance | Free tiers sufficient; multi-provider for resilience |
| i18n | Custom hook (`useI18n`) | No external library needed for 2 languages |
| Currency | Custom context (`useCurrency`) | Dynamic USD/THB/EUR/JPY conversion with live rates |

---

## Features

### Authentication & User Management
- **Email/Password registration** with OTP email verification (6-digit code)
- **Google OAuth** login (one-click sign-in)
- **Forgot/Reset password** flow with OTP verification
- **Brute-force protection** — DB-backed rate limiter (5 attempts → 15min lockout)
- **Email change** with OTP verification (disabled for OAuth users — "Managed by Google")
- **Password change/set** — OAuth users can add a password for dual-login
- **Account deletion** with cascade cleanup of all user data
- **Full-screen onboarding** — dedicated 2-step setup wizard (experience + goals + risk + starting cash)

### Stock Data & Analysis
- **S&P 500 browser** — paginated list with sector filters, search, grid/table views
- **Stock detail page** — company profile, live price, financials, technicals, news, peer comparison
- **Beginner score** — proprietary 0–100 rating per stock (stability, dividend, brand recognition)
- **Technical indicators** — MA50/200, RSI, MACD with beginner-friendly explanations
- **Multi-provider data** — FMP → Finnhub → Yahoo fallback chain, field-by-field merge
- **PostgreSQL cache** — per-type TTLs (quote: 2min, full: 5min, profile: 24h) to stay within free quotas
- **Dynamic currency** — prices displayed in USD, THB, EUR, or JPY with live exchange rates

### Paper Trading
- **Buy/Sell execution** at real market prices
- **Portfolio dashboard** — holdings, P&L (realized + unrealized), allocation chart
- **Trade history** with timestamps and price records
- **Configurable starting cash** ($10K / $50K / $100K or custom)
- **PDT warning** detection for frequent traders

### Learning Platform
- **25 structured lessons** — from "What is a Stock?" to advanced analysis
- **Category filters** — basics, fundamental analysis, technical analysis, portfolio strategy
- **Interactive quizzes** at the end of each lesson
- **Bilingual content** — Thai primary, English translations merged at API level

### Watchlist
- **Star/unstar** any stock from detail pages or the stocks browser
- **Dedicated watchlist page** with live prices and quick access to detail

### Settings
- **Display name & avatar** management
- **Email change** (credential users) with OTP / "Managed by Google" (OAuth users)
- **Password management** — change or set new
- **Investment profile** editing (experience, goal, risk, starting cash)
- **Currency preference** — persisted per-user, synced with CurrencyContext
- **Email notifications** toggle
- **Danger zone** — account deletion with confirmation

### UX & Design
- **Soft dark theme** — #0e0e0e backgrounds, frosted glass navbar, green accents
- **Responsive** — mobile-first layouts with breakpoint-aware grids
- **Full-screen chromeless pages** — onboarding runs without navbar/footer for focus
- **Bilingual UI** — TH/EN toggle in navbar, persisted in localStorage
- **Auto-redirect auth flows** — no intermediate screens between verification → login

---

## Repository Structure

```
FinLearn/
├── .env                          # All env vars (single source of truth)
├── .env.example                  # Template — copy to .env
│
├── backend/                      # Express API server (port 4000)
│   ├── prisma/schema.prisma      # DB schema: ApiCache, ApiUsageDaily
│   ├── scripts/                  # Utility scripts (manual cache clear, etc.)
│   └── src/
│       ├── index.ts              # App bootstrap, middleware, port binding
│       ├── routes/
│       │   ├── stocks.ts         # GET /api/stocks/popular|search|sp500|:symbol
│       │   ├── lessons.ts        # GET /api/lessons, /api/lessons/:id
│       │   └── health.ts         # GET /api/health, cache stats/cleanup
│       ├── services/
│       │   ├── stockService.ts   # Core orchestrator — fetches, scores, assembles StockData
│       │   ├── cacheService.ts   # PostgreSQL TTL cache (get/set/del/cleanup)
│       │   ├── cachedProviders.ts# Wraps raw providers with cache layer
│       │   ├── apiUsageService.ts# Daily call counter per provider
│       │   └── providers/        # One file per external API
│       │       ├── fmp.ts        #   Financial Modeling Prep (primary)
│       │       ├── finnhub.ts    #   Finnhub (quotes, peers, news)
│       │       ├── twelveData.ts #   Twelve Data (MA50/200, RSI, MACD)
│       │       └── yahooFinance.ts#  Yahoo Finance (fallback metrics)
│       ├── data/
│       │   ├── lessons.ts        # 25 lessons — Thai content (sections, quiz)
│       │   ├── lessonsEn.ts      # English translations — merged in route handler
│       │   ├── mockData.ts       # Hard-coded fallback for 5 core stocks
│       │   ├── popularStocks.ts  # Curated list for homepage
│       │   └── sp500.ts          # S&P 500 constituents with sector tags
│       ├── types/stock.ts        # StockData, CompanyProfile, BeginnerTips, etc.
│       ├── lib/prisma.ts         # Prisma client singleton
│       └── middleware/           # Rate limiter
│
└── frontend/                     # Next.js app (port 3000)
    ├── prisma/schema.prisma      # DB schema: User, Auth, Portfolio, Favorites
    └── src/
        ├── app/
        │   ├── page.tsx          # Homepage: market overview, trending stocks
        │   ├── stocks/
        │   │   ├── page.tsx      # /stocks — S&P 500 browser with filters
        │   │   └── [symbol]/     # /stocks/AAPL — full stock detail page
        │   ├── learn/
        │   │   ├── page.tsx      # /learn — lesson grid with category filter
        │   │   └── [id]/         # /learn/what-is-stock — lesson reader + quiz
        │   ├── portfolio/        # Paper trading: buy/sell, P&L, history
        │   ├── watchlist/        # Starred stocks with live prices
        │   ├── settings/         # Profile, email, password, preferences, danger zone
        │   ├── onboarding/       # Full-screen multi-step new-user setup
        │   ├── (auth)/           # login, register, forgot/reset password, verify-email
        │   └── api/              # Next.js route handlers (server-side only)
        │       ├── auth/         #   NextAuth + register + OTP verification
        │       ├── portfolio/    #   Trade execution, history
        │       ├── watchlist/    #   Add/remove favorites
        │       └── user/         #   Profile, password, email change, delete
        ├── components/
        │   ├── layout/
        │   │   ├── Navbar.tsx    # Frosted glass nav: search, auth, locale toggle
        │   │   ├── Footer.tsx    # Site footer with links
        │   │   └── LayoutShell.tsx # Conditional chrome (hides nav/footer on onboarding)
        │   └── providers/
        │       ├── AuthProvider.tsx     # NextAuth SessionProvider
        │       └── OnboardingGuard.tsx  # Redirects new users to onboarding
        ├── lib/
        │   ├── api.ts            # Typed fetch wrapper → backend :4000
        │   ├── i18n.tsx          # All TH/EN strings + useI18n() hook
        │   ├── currency.tsx      # CurrencyContext — dynamic formatting + live rates
        │   ├── auth.ts           # NextAuth config (credentials + Google OAuth)
        │   ├── prisma.ts         # Prisma client singleton
        │   ├── email.ts          # Nodemailer — verification & reset emails
        │   ├── market-hours.ts   # NYSE/SET open/close schedule helpers
        │   ├── tokens.ts         # OTP/JWT generation & DB persistence
        │   └── utils.ts          # Number formatting (currency, %, K/M/B)
        └── types/stock.ts        # Frontend-side StockData interfaces
```

---

## Local Development

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database — project uses [Neon](https://neon.tech) (free tier)
- API keys (all free tier):
  - [Financial Modeling Prep](https://financialmodelingprep.com/) — primary stock data
  - [Finnhub](https://finnhub.io/) — real-time quotes, peers, news
  - [Twelve Data](https://twelvedata.com/) — technical indicators (MA, RSI, MACD)
- Optional:
  - **Google OAuth** — [Google Cloud Console](https://console.cloud.google.com/) client ID/secret
  - **SMTP** — for email verification (Gmail App Password works for dev)

### 1. Environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, API keys, NEXTAUTH_SECRET, SMTP credentials
```

### 2. Install

```bash
cd backend  && npm install
cd ../frontend && npm install
```

### 3. Database Setup

```bash
# Frontend DB (users, auth, portfolio, watchlist)
cd frontend
npx prisma db push

# Backend DB (api cache + usage — tables must exist)
cd ../backend
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run

```bash
# Terminal 1
cd backend && npm run dev       # http://localhost:4000

# Terminal 2
cd frontend && npm run dev      # http://localhost:3000
```

---

## Key Design Decisions

### Multi-provider Stock Data with Graceful Fallback
The backend never relies on a single API. Each provider is tried in order — FMP → Finnhub → Yahoo Finance — and results are merged field-by-field. A missing metric from one provider is filled by another. All raw responses are cached in PostgreSQL with per-type TTLs to avoid redundant calls on free-tier quotas.

```
stockService.fetchFromAPIs(symbol)
  → parallel: FMP profile, Finnhub quote, Yahoo metrics, Twelve Data technicals
  → merge fields, compute scores
  → cache assembled StockData (TTL: 5 min)
  → return to client
```

**Cache TTLs**: `full=5min` · `quote=2min` · `technicals=30min` · `profile/financials=24h`

### Authentication Architecture
- **Dual auth** — Credentials (email/password with OTP verification) + Google OAuth
- **OAuth-aware settings** — email changes disabled for Google users, password section adapts
- **Seamless flows** — registration → verification → login with auto-redirect, no intermediate screens
- **callbackUrl support** — middleware-protected routes redirect back after login

### Bilingual Content Architecture (i18n)
- **UI strings**: all in `frontend/src/lib/i18n.tsx`, consumed via `useI18n()` hook — no external library, no file splitting.
- **Lesson content**: Thai lives in `backend/src/data/lessons.ts`. English translations are in a parallel `lessonsEn.ts` file keyed by lesson ID. The route handler merges them at response time so the Thai source stays clean.
- **Stock descriptions**: Live API data is always English (FMP). The backend generates a structured Thai summary from available metadata (sector, market cap, HQ, CEO, employees) and returns both.

### Dynamic Currency System
- **CurrencyContext** provides `formatPrice()` and `formatLarge()` globally
- Exchange rates fetched from a free API, cached client-side
- User preference persisted in DB via profile settings
- All pages (homepage, stocks list, stock detail, portfolio) use the context

### Paper Trading without a Ledger Table
Portfolio value and position data are **computed on-the-fly** from the `paper_trades` ledger on every request rather than materialized into daily snapshot tables. This keeps the schema simple while the trade count per user stays small.

### Schema Separation
The frontend and backend share one PostgreSQL database but have **separate Prisma schemas** with clear ownership. The backend only owns `api_cache` and `api_usage_daily`. The frontend owns everything user-related. This makes it safe to deploy them independently.

### Chromeless Pages via LayoutShell
Pages like onboarding use `LayoutShell` to hide the Navbar and Footer, creating a focused full-screen experience. The component checks `usePathname()` against a configurable `CHROMELESS_PATHS` list.

---

## API Reference

Full documentation: [`backend/README.md`](./backend/README.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stocks/popular` | Top 20 stocks with beginner scores |
| `GET` | `/api/stocks/:symbol` | Full stock profile, financials, technicals, news |
| `GET` | `/api/stocks/search?q=` | Symbol/name search |
| `GET` | `/api/stocks/sp500` | Paginated S&P 500 list with sector filters |
| `GET` | `/api/stocks/batch?symbols=` | Batch price lookup for multiple symbols |
| `GET` | `/api/lessons` | All 25 lessons (summary) |
| `GET` | `/api/lessons/:id` | Full lesson with sections, quiz, TH+EN content |
| `GET` | `/api/lessons/categories` | Available lesson categories |
| `GET` | `/api/health` | Server status |
| `GET` | `/api/health/cache` | Cache hit/miss stats |
| `GET` | `/api/health/usage` | Daily API usage per provider |
| `POST` | `/api/health/cache/cleanup` | Evict expired cache entries |

---

## Internationalization

Switch language via the globe icon in the navbar. State persists in `localStorage`.

| Scope | Location | How to add a string |
|---|---|---|
| UI labels | `frontend/src/lib/i18n.tsx` | Add key to both `th` and `en` objects |
| Lesson content | `backend/src/data/lessons.ts` + `lessonsEn.ts` | Add matching entry by lesson ID |
| Stock descriptions | Auto-generated in `stockService.ts` | Edit the Thai template / English source |

---

## Production Deployment

### Pre-deploy Checklist

```bash
# 1. Generate secrets
openssl rand -hex 32   # → NEXTAUTH_SECRET
openssl rand -hex 32   # → ADMIN_API_KEY

# 2. Set all env vars (see .env.example for full list)
#    ⚠️ NODE_ENV=production
#    ⚠️ Real DATABASE_URL with ?sslmode=require
#    ⚠️ Real domain URLs (NEXTAUTH_URL, FRONTEND_URL, NEXT_PUBLIC_SITE_URL)
#    ⚠️ SMTP credentials for email verification
#    ⚠️ Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

# 3. Database migration (NOT db push)
cd frontend && npx prisma migrate deploy
cd ../backend && npx prisma migrate deploy

# 4. Build
cd frontend && npm run build    # includes prisma generate
cd ../backend && npm run build  # tsc → dist/

# 5. Start
cd frontend && npm start        # Next.js production server
cd ../backend && npm start      # node dist/index.js
```

### Security Features (production)

| Feature | Implementation |
|---|---|
| Rate limiting (backend) | `express-rate-limit` — 300 req/15min global, 60 req/min stocks |
| Login brute-force | DB-backed limiter — 5 attempts then 15-min lockout |
| OTP brute-force | DB-backed limiter — 5 attempts then 15-min lockout |
| Body size limit | `express.json({ limit: '1mb' })` |
| Security headers | Helmet + CSP + HSTS + X-Frame-Options |
| Route protection | Next.js middleware — redirects unauthenticated users |
| Input validation | All API routes validate enums, ranges, formats |
| Password hashing | bcrypt cost 12 |
| JWT auth | NextAuth jwt strategy + jose verification |
| OAuth security | Google OAuth via Auth.js, email changes blocked for OAuth users |
| Structured logging | JSON logs in production (compatible with log aggregators) |

### ⚠️ Known: NextAuth v5 Beta

The project uses `next-auth@5.0.0-beta.30` which is not yet stable. Monitor [releases](https://github.com/nextauthjs/next-auth/releases) and upgrade when v5 stable ships.

---

## Known Limitations & Future Work

- **No real-time WebSocket** — stock prices refresh on page load / manual trigger. Add Socket.io or SSE for live ticking.
- **Paper trading settlement** — trades execute at the current API price regardless of market hours; no bid/ask spread simulation.
- **Lesson progress not persisted** — `UserLessonProgress` schema exists but is not wired up yet.
- **Thai lesson descriptions** — live API stocks get a structured Thai summary; only mock stocks (AAPL, MSFT, etc.) have hand-written Thai descriptions in `mockData.ts`.
- **Single database** — both frontend and backend point to the same PostgreSQL instance. For production, split into two DBs with the backend cache DB on a faster/cheaper storage tier.
- **No SSO linking** — users who register with email and later try Google OAuth with the same email get a separate account.
