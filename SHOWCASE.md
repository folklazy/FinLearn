<div align="center">

# 📈 FinLearn

### Learn to Invest — Without Risking Real Money

A full-stack stock investment learning platform with real market data, paper trading, and structured lessons.

**Thai / English** · **Dark Theme** · **Mobile Responsive**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## What is FinLearn?

FinLearn is a **bilingual (Thai/English)** platform designed for people who want to learn stock investing from zero. It combines:

- **Real market data** from S&P 500 stocks (live prices, financials, technicals)
- **Paper trading** — practice buying and selling with virtual money
- **25 structured lessons** — from "What is a Stock?" to advanced analysis
- **Beginner-friendly scoring** — every stock gets a 0–100 beginner score

Built as a full-stack project demonstrating modern web development practices.

---

## Core Features

### 🏠 Dashboard & Market Overview
Real-time market summary with trending stocks, portfolio snapshot, and quick access to all features. Market status indicator shows NYSE open/close times.

### 📊 S&P 500 Stock Browser
Browse all 500 stocks with **sector filters**, **search**, and **grid/table toggle**. Each stock shows live price, change %, market cap, and beginner score.

### 📈 Stock Detail Page
Deep-dive into any stock with:
- **Company profile** — sector, industry, HQ, CEO, employees
- **Live price chart** — 1M to All-time ranges with TradingView-style charts
- **Financial metrics** — P/E, revenue, profit margin, debt-to-equity
- **Technical indicators** — MA50/200, RSI, MACD with plain-English explanations
- **News feed** — latest headlines from Finnhub
- **Peer comparison** — side-by-side with similar companies
- **Beginner tips** — AI-generated advice based on the stock's profile
- **One-click trade** — buy/sell directly from the detail page

### 💼 Paper Trading Portfolio
- Start with **$10K–$100K virtual cash** (configurable)
- Buy and sell at **real market prices**
- Track **holdings, P&L, allocation** in real-time
- Full **trade history** with timestamps
- **PDT warning** detection

### 📚 Learning Center
- **25 structured lessons** covering fundamentals, technical analysis, and portfolio strategy
- Each lesson has **multiple sections** with clear explanations
- **Interactive quizzes** to test understanding
- **Category filters** — find lessons by topic
- **Bilingual** — full Thai and English content

### ⭐ Watchlist
Star any stock and track it from a dedicated watchlist page with live prices.

### ⚙️ Settings & Account
- Display name and avatar
- Email change with OTP verification (disabled for Google OAuth users)
- Password management
- Currency preference (USD / THB / EUR / JPY with live exchange rates)
- Investment profile editing
- Account deletion

---

## Technical Highlights

### Architecture

```
Frontend (Next.js 16)          Backend (Express 5)
  ├── React 19 (App Router)      ├── Multi-provider stock API
  ├── NextAuth v5 (Auth.js)      │   FMP → Finnhub → Yahoo → Twelve Data
  ├── Prisma 6 ORM               ├── PostgreSQL cache (TTL-based)
  ├── Tailwind CSS v4             ├── Rate limiting + security
  └── Recharts + LW Charts       └── Bilingual lesson delivery
           │                              │
           └──────── PostgreSQL (Neon) ───┘
```

### What Makes This Interesting

| Challenge | Solution |
|---|---|
| Free API rate limits | **Multi-provider fallback** — FMP → Finnhub → Yahoo, field-by-field merge. PostgreSQL cache with per-type TTLs |
| Bilingual content | **Custom i18n** — single `useI18n()` hook, no library overhead. Lesson translations merged at API level |
| Auth complexity | **Dual auth** — Email/Password (OTP verification) + Google OAuth. OAuth-aware settings (email locked for Google users) |
| Currency conversion | **CurrencyContext** — live exchange rates, user preference persisted, all pages reactive |
| Onboarding UX | **Full-screen chromeless** — LayoutShell hides navbar/footer during setup wizard |
| Beginner accessibility | **Proprietary scoring** — 0–100 beginner score per stock based on stability, dividends, brand recognition |

### Security

- **bcrypt** password hashing (cost 12)
- **JWT** auth with NextAuth + jose verification
- **Brute-force protection** — DB-backed rate limiter (5 attempts → 15min lockout)
- **Helmet** + CSP + HSTS security headers
- **OTP** email verification for registration and password reset
- **Middleware** route protection with callbackUrl support

---

## Tech Stack

| | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts, Lucide Icons |
| **Backend** | Express 5, TypeScript, Prisma 6, PostgreSQL |
| **Auth** | NextAuth v5 (Auth.js) — Credentials + Google OAuth |
| **Data** | Financial Modeling Prep, Finnhub, Twelve Data, Yahoo Finance |
| **Database** | PostgreSQL on Neon (free tier) |
| **Email** | Nodemailer (SMTP) |
| **Deployment** | Vercel (frontend) + Railway/Render (backend) |

---

## Project Scale

| Metric | Count |
|---|---|
| Pages / Routes | 15 pages + 20 API routes |
| Lesson content | 25 lessons with quizzes (TH + EN) |
| Stock coverage | Full S&P 500 (503 stocks) |
| External APIs | 4 providers with fallback chain |
| Database models | 15 Prisma models across 2 schemas |
| i18n strings | 200+ keys in Thai and English |

---

## Auth Flow

```
Register → Email OTP → Login (auto-redirect, email pre-filled)
                              ↓
                        Onboarding (full-screen)
                        Step 1: Experience + Goal
                        Step 2: Risk + Starting Cash
                              ↓
                         Dashboard ✨

Google OAuth → Onboarding → Dashboard
Forgot Password → OTP → New Password → Login (auto-redirect)
```

---

## Design Philosophy

- **Soft Dark Theme** — easy on the eyes for extended reading
- **Minimal UI** — no clutter, data-focused layouts
- **Progressive Disclosure** — complex data revealed in tabs/sections
- **Mobile-First** — responsive grids, touch-friendly controls
- **Accessibility** — proper contrast ratios, keyboard navigation
- **No Intermediate Screens** — all auth flows redirect instantly

---

<div align="center">

Built with Next.js 16 · React 19 · Express 5 · PostgreSQL · TypeScript

</div>
