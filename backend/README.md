# FinLearn Backend — Express API Server

Stock data aggregation API with multi-provider fallback, caching, and lesson content delivery.

## Quick Start

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev                 # http://localhost:4000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled production build |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio GUI |

## API Endpoints

### Stocks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stocks/popular` | Popular stocks with scores |
| GET | `/api/stocks/search?q=apple` | Search stocks by name/symbol |
| GET | `/api/stocks/sp500?page=1&limit=50` | Browse S&P 500 |
| GET | `/api/stocks/:symbol` | Full stock data (profile, price, financials, etc.) |

### Lessons
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/lessons` | All lessons (summary, no content) |
| GET | `/api/lessons/categories` | Lesson categories |
| GET | `/api/lessons/:id` | Full lesson with sections, quiz, English content |

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server status |
| GET | `/api/health/usage` | API usage stats for today |
| GET | `/api/health/cache` | Cache statistics |
| POST | `/api/health/cache/cleanup` | Remove expired cache entries |

## Folder Structure

```
src/
├── index.ts                 # Express app setup & middleware
├── routes/                  # HTTP route handlers (thin layer)
│   ├── stocks.ts            #   Stock endpoints
│   ├── lessons.ts           #   Lesson endpoints (merges EN content)
│   └── health.ts            #   Health/cache endpoints
├── services/                # Business logic
│   ├── stockService.ts      #   Core: fetches, scores, assembles StockData
│   ├── cacheService.ts      #   PostgreSQL cache with per-type TTL
│   ├── cachedProviders.ts   #   Wraps providers with caching
│   ├── apiUsageService.ts   #   Tracks daily API call counts
│   └── providers/           #   External API integrations
│       ├── fmp.ts           #     Financial Modeling Prep (primary)
│       ├── finnhub.ts       #     Finnhub (quotes, peers, news)
│       ├── twelveData.ts    #     Twelve Data (MA, RSI, MACD)
│       └── yahooFinance.ts  #     Yahoo Finance (fallback metrics)
├── data/                    # Static content & seed data
│   ├── lessons.ts           #   25 lessons in Thai (interfaces + data)
│   ├── lessonsEn.ts         #   English translations (merged by route)
│   ├── mockData.ts          #   Mock data for AAPL/GOOGL/MSFT/TSLA/AMZN
│   ├── popularStocks.ts     #   Popular stock list for homepage
│   └── sp500.ts             #   S&P 500 constituent list
├── types/
│   └── stock.ts             #   StockData, BeginnerTips, etc.
├── lib/
│   └── prisma.ts            #   Prisma client singleton
└── middleware/
    └── rateLimiter.ts       #   Rate limiting middleware
```

## Data Flow

```
Client Request
    ↓
Route Handler (routes/)
    ↓
StockService.getStockData(symbol)
    ↓
1. Check PostgreSQL cache (stockdata:full:SYMBOL, TTL 5min)
    ↓ miss
2. fetchFromAPIs() — parallel calls to FMP + Finnhub + Yahoo + TwelveData
    ↓
3. Assemble StockData (profile, price, metrics, financials, scores, tips)
    ↓
4. Store in cache → return to client
```

## Adding a New API Provider

1. Create `src/services/providers/newProvider.ts`
2. Export a class with fetch methods
3. Add cached wrapper in `cachedProviders.ts`
4. Integrate into `stockService.ts` → `fetchFromAPIs()`

## Lesson Content (i18n)

Thai content lives in `data/lessons.ts`. English translations are in `data/lessonsEn.ts` keyed by lesson ID. The `routes/lessons.ts` handler merges them at response time — no need to duplicate English content inline.
