<div align="center">

# FinLearn

**A bilingual stock investment learning platform for beginners.**  
Real market data · Paper trading · 25 structured lessons · Thai / English

**[→ Live Demo](https://fin-learn-nu.vercel.app/)**

---

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_6-2D3748?style=flat-square&logo=prisma)
![Tailwind](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## Overview

FinLearn lets beginners learn stock investing hands-on — without risking real money. It pulls live data from the S&P 500, teaches investing concepts through structured lessons, and lets users practice with a paper trading portfolio.

The project is separated into two services that share a single PostgreSQL database:

- **Frontend** — Next.js 16 app with built-in API routes handling auth, portfolio, and user data
- **Backend** — Express 5 service responsible for stock data aggregation, caching, and lesson delivery

---

## Architecture

```
┌─────────────────────────────────────────────┐
│           Next.js 16  (Vercel)               │
│  App Router · NextAuth v5 · Prisma 6         │
└───────────────┬─────────────────────────────┘
                │ REST
                ▼
┌───────────────────────────────────────────────────┐
│             Express 5 Backend  (:4000)             │
│                                                   │
│  GET /api/stocks/:symbol                          │
│    → parallel: FMP + Finnhub + Yahoo + TwelveData │
│    → merge fields, score, cache                   │
│  GET /api/lessons/:id  (TH + EN merged)           │
└───────────────┬───────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────┐
│          PostgreSQL  (Neon)                        │
│                                                   │
│  frontend/prisma  — users, sessions, trades,      │
│                     watchlist, OTP tokens         │
│  backend/prisma   — api_cache (TTL), api_usage    │
└───────────────────────────────────────────────────┘
```

---

## Key Engineering Decisions

**Multi-provider data with graceful fallback**  
The backend never depends on a single API. FMP, Finnhub, Yahoo Finance, and Twelve Data are called in parallel. Fields are merged one-by-one, so a missing value from one provider is filled by another. All results are cached in PostgreSQL with per-type TTLs — `quote: 2min`, `full: 5min`, `profile: 24h` — to stay within free-tier quotas.

**Dual authentication with OAuth-aware settings**  
Credentials (email + OTP verification) and Google OAuth coexist via Auth.js. The settings page detects OAuth users and disables email changes with a "Managed by Google" message — matching the behaviour of Notion, Linear, and other production SaaS apps. `callbackUrl` is propagated through middleware so protected routes redirect correctly after login.

**Custom i18n without a library**  
A single `useI18n()` hook holds all Thai and English strings. Lesson content lives in two parallel files keyed by lesson ID and is merged in the Express route handler at response time. No file splitting, no external dependency, no bundle overhead.

**Dynamic currency context**  
`CurrencyContext` exposes `formatPrice()` and `formatLarge()` globally. Exchange rates are fetched and cached client-side. The user's preference is persisted in the database and restored on login — every page reacts to the change without a reload.

**Chromeless onboarding**  
`LayoutShell` (a client component) checks `usePathname()` against a `CHROMELESS_PATHS` list and conditionally suppresses Navbar and Footer. The onboarding wizard runs as a full-screen experience — no escape routes, no distractions — matching the pattern used by Slack, Vercel, and Duolingo.

**Portfolio computed on-the-fly**  
Portfolio positions and P&L are derived from the raw `paper_trades` ledger on every request rather than stored in snapshot tables. This keeps the schema flat while trade counts per user remain manageable.

---

## Features

| Area | What's included |
|---|---|
| **Auth** | Email/password + Google OAuth, OTP email verification, forgot/reset password, brute-force lockout |
| **Onboarding** | Full-screen 2-step wizard — experience level, goal, risk tolerance, starting cash |
| **Stocks** | S&P 500 browser (503 stocks), sector filters, grid/table view, search |
| **Stock detail** | Live price, chart, financials, technicals (MA50/200, RSI, MACD), news, peer comparison |
| **Beginner score** | 0–100 proprietary rating per stock based on stability, dividend history, brand recognition |
| **Paper trading** | Buy/sell at real prices, P&L tracking (realized + unrealized), allocation chart, trade history |
| **Learning** | 25 lessons with sections and quizzes, category filters, bilingual (TH + EN) |
| **Watchlist** | Per-user starred stocks with live prices |
| **Settings** | Display name, email (OTP-verified or Google-locked), password, currency, investment profile, account deletion |
| **i18n** | Full Thai/English — UI strings, lessons, stock summaries, auth flows |
| **Currency** | USD · THB · EUR · JPY — live exchange rates, persisted per user |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS custom properties (design tokens) |
| Charts | Recharts, Lightweight Charts |
| Icons | Lucide React |
| Backend | Express 5, TypeScript |
| ORM | Prisma 6 |
| Database | PostgreSQL on Neon |
| Auth | NextAuth v5 (Auth.js) — Credentials + Google OAuth |
| Email | Nodemailer (SMTP) |
| External data | Financial Modeling Prep, Finnhub, Twelve Data, Yahoo Finance |

---

## Security

| Control | Implementation |
|---|---|
| Password hashing | bcrypt, cost factor 12 |
| Session tokens | JWT via NextAuth + jose verification |
| Brute-force protection | DB-backed counter — 5 failures → 15 min lockout (login + OTP) |
| Security headers | Helmet, CSP, HSTS, X-Frame-Options |
| Rate limiting | `express-rate-limit` — 300 req/15 min global, 60 req/min on stock endpoints |
| Route protection | Next.js middleware with `callbackUrl` propagation |
| Input validation | Enum checks, range guards, format validation on all API routes |

---

## Local Development

**Prerequisites:** Node.js ≥ 18, a PostgreSQL database ([Neon free tier](https://neon.tech) works), and API keys from [FMP](https://financialmodelingprep.com/), [Finnhub](https://finnhub.io/), and [Twelve Data](https://twelvedata.com/).

```bash
# 1. Clone and configure
cp .env.example .env   # fill in DATABASE_URL, API keys, NEXTAUTH_SECRET, SMTP

# 2. Install
cd backend   && npm install
cd ../frontend && npm install

# 3. Database
cd frontend  && npx prisma db push
cd ../backend && npm run prisma:migrate

# 4. Run
cd backend   && npm run dev   # http://localhost:4000
cd ../frontend && npm run dev  # http://localhost:3000
```

Full setup and deployment guide: [`DOCS.md`](./DOCS.md)

---

<div align="center">

**[Try it live →](https://fin-learn-nu.vercel.app/)**

</div>
