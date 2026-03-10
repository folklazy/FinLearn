# FinLearn

> แพลตฟอร์มเรียนรู้การลงทุนหุ้นสำหรับผู้เริ่มต้น — ภาษาไทย/อังกฤษ

A bilingual Thai/English stock investment learning platform targeting retail investors with zero prior experience. Combines real-time market data with structured lessons, interactive quizzes, and paper trading to make investing education accessible and hands-on.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React)                   │
│  Next.js 16 App Router · Tailwind CSS · Recharts    │
└──────────────────────┬──────────────────────────────┘
                       │ REST
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
┌──────────────────┐    ┌───────────────────────┐
│  Next.js API     │    │   Express Backend      │
│  Routes          │    │   :4000                │
│  (auth, user,    │    │   Stock data, lessons, │
│   portfolio,     │    │   health endpoints     │
│   watchlist)     │    └──────────┬────────────┘
└────────┬─────────┘               │
         │                         │ Parallel fetch + fallback
         ▼                         ▼
┌──────────────────┐    ┌──────────────────────────────┐
│  PostgreSQL DB   │    │  External APIs               │
│  (Neon/Supabase) │    │  FMP → Finnhub → Yahoo       │
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
| Frontend framework | Next.js 16 (App Router) | SSR + client components, built-in API routes |
| Styling | Tailwind CSS v4 + CSS variables | Utility-first, single dark theme via tokens |
| Charts | Recharts | Lightweight, React-native, no canvas setup |
| Backend | Express 5 + TypeScript | Minimal overhead for a data aggregation API |
| ORM | Prisma 6 | Type-safe queries, schema-as-code |
| Database | PostgreSQL | JSONB for cache blobs, reliable at free-tier cloud |
| Auth | NextAuth v5 (credentials) | Email+password + OTP email verification |
| API providers | FMP, Finnhub, Twelve Data, Yahoo Finance | Free tiers sufficient; multi-provider for resilience |
| i18n | Custom hook (`useI18n`) | No external library needed for 2 languages |

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
        │   ├── page.tsx          # Dashboard: market overview, portfolio snapshot
        │   ├── stocks/
        │   │   ├── page.tsx      # /stocks — S&P 500 browser with filters
        │   │   └── [symbol]/     # /stocks/AAPL — full stock detail
        │   ├── learn/
        │   │   ├── page.tsx      # /learn — lesson grid with category filter
        │   │   └── [id]/         # /learn/what-is-stock — lesson reader + quiz
        │   ├── portfolio/        # Paper trading: buy/sell, P&L, history
        │   ├── watchlist/        # Starred stocks
        │   ├── settings/         # Profile, language, currency, password
        │   ├── onboarding/       # Multi-step new-user setup
        │   ├── (auth)/           # login, register, forgot/reset password, verify-email
        │   └── api/              # Next.js route handlers (server-side only)
        │       ├── auth/         #   NextAuth + register + OTP email verification
        │       ├── portfolio/    #   Trade execution, history
        │       ├── watchlist/    #   Add/remove favorites
        │       └── user/         #   Profile update, password change, email change
        ├── components/
        │   ├── layout/Navbar.tsx # Top nav: search, auth state, locale toggle (TH/EN)
        │   └── providers/        # SessionProvider, ThemeProvider
        ├── lib/
        │   ├── api.ts            # Typed fetch wrapper → backend :4000
        │   ├── i18n.tsx          # All TH/EN strings + useI18n() hook
        │   ├── auth.ts           # NextAuth config (credentials provider)
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
- **PostgreSQL** database — [Neon](https://neon.tech) free tier works perfectly
- API keys (all free tier):
  - [Financial Modeling Prep](https://financialmodelingprep.com/) — primary stock data
  - [Finnhub](https://finnhub.io/) — real-time quotes, peers, news
  - [Twelve Data](https://twelvedata.com/) — technical indicators (MA, RSI, MACD)

### 1. Environment

```bash
cp .env.example .env
# Fill in DATABASE_URL, API keys, NEXTAUTH_SECRET
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

### Bilingual Content Architecture (i18n)
- **UI strings**: all in `frontend/src/lib/i18n.tsx`, consumed via `useI18n()` hook — no external library, no file splitting.
- **Lesson content**: Thai lives in `backend/src/data/lessons.ts`. English translations are in a parallel `lessonsEn.ts` file keyed by lesson ID. The route handler merges them at response time so the Thai source stays clean.
- **Stock descriptions**: Live API data is always English (FMP). The backend generates a structured Thai summary from available metadata (sector, market cap, HQ, CEO, employees) and returns both.

### Paper Trading without a Ledger Table
Portfolio value and position data are **computed on-the-fly** from the `paper_trades` ledger on every request rather than materialized into daily snapshot tables. This keeps the schema simple while the trade count per user stays small.

### Schema Separation
The frontend and backend share one PostgreSQL database but have **separate Prisma schemas** with clear ownership. The backend only owns `api_cache` and `api_usage_daily`. The frontend owns everything user-related. This makes it safe to deploy them independently.

---

## API Reference

Full documentation: [`backend/README.md`](./backend/README.md)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stocks/popular` | Top 20 stocks with beginner scores |
| `GET` | `/api/stocks/:symbol` | Full stock profile, financials, technicals, news |
| `GET` | `/api/stocks/search?q=` | Symbol/name search |
| `GET` | `/api/stocks/sp500` | Paginated S&P 500 list |
| `GET` | `/api/lessons` | All 25 lessons (summary) |
| `GET` | `/api/lessons/:id` | Full lesson with sections, quiz, TH+EN content |
| `GET` | `/api/health/cache` | Cache hit/miss stats |
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

## Known Limitations & Future Work

- **No real-time WebSocket** — stock prices refresh on page load / manual trigger. Add Socket.io or SSE for live ticking.
- **Paper trading settlement** — trades execute at the current API price regardless of market hours; no bid/ask spread simulation.
- **Lesson progress not persisted** — `UserLessonProgress` schema exists but is not wired up yet.
- **Thai lesson descriptions** — live API stocks get a structured Thai summary; only mock stocks (AAPL, MSFT, etc.) have hand-written Thai descriptions in `mockData.ts`.
- **Single database** — both frontend and backend point to the same PostgreSQL instance. For production, split into two DBs with the backend cache DB on a faster/cheaper storage tier.
