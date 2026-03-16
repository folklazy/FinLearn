import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import stockRoutes from './routes/stocks';
import healthRoutes from './routes/health';
import lessonRoutes from './routes/lessons';
import { StockService } from './services/stockService';
import { prisma } from './lib/prisma';
import { warmCrumb } from './services/providers/yahooFinance';

// Load environment variables from monorepo root (dev only — production uses platform env vars)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = '0.0.0.0';

// Trust first proxy (Render) — required for express-rate-limit X-Forwarded-For
app.set('trust proxy', 1);

// ===== Middleware =====
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ===== Rate Limiting =====
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 300,                   // 300 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});
app.use(globalLimiter);

const stockLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,   // 1 minute
    max: 60,                    // 60 requests/min for stock data
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many stock requests, please slow down' },
});
app.use('/api/stocks', stockLimiter);

// ===== Routes =====
app.use('/api/health', healthRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/lessons', lessonRoutes);

// ===== Error handling =====
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ===== Start server =====
app.listen(PORT, HOST, () => {
    console.log(`
  🚀 FinLearn API Server
  ━━━━━━━━━━━━━━━━━━━━━
  📡 Running on: http://localhost:${PORT}
  🔗 Health:     http://localhost:${PORT}/api/health
  📊 Stocks:     http://localhost:${PORT}/api/stocks/popular
  🔍 Search:     http://localhost:${PORT}/api/stocks/search?q=apple
  📖 Lessons:    http://localhost:${PORT}/api/lessons
  📋 S&P 500:    http://localhost:${PORT}/api/stocks/sp500
  ━━━━━━━━━━━━━━━━━━━━━
  `);

    // ── One-time cache flush when code changes data shape ──
    const CACHE_VERSION = '5'; // Bump to invalidate stale cache after deploy
    prisma.apiCache.findUnique({ where: { key: 'system:cache_version' } })
        .then(async (entry) => {
            const stored = (entry?.data as any);
            if (stored === CACHE_VERSION) return;
            // Flush stale yahoo:metrics (missing profile field) and assembled stockdata
            const [m, s] = await Promise.all([
                prisma.apiCache.deleteMany({ where: { key: { startsWith: 'yahoo:metrics:' } } }),
                prisma.apiCache.deleteMany({ where: { key: { startsWith: 'stockdata:full:' } } }),
            ]);
            console.log(`[Startup] Cache v${CACHE_VERSION}: flushed ${m.count} yahoo:metrics + ${s.count} stockdata:full`);
            await prisma.apiCache.upsert({
                where: { key: 'system:cache_version' },
                update: { data: CACHE_VERSION as any, expiresAt: new Date('2099-01-01'), updatedAt: new Date() },
                create: { key: 'system:cache_version', provider: 'system', dataType: 'version', data: CACHE_VERSION as any, expiresAt: new Date('2099-01-01') },
            });
        })
        .catch((err: Error) => console.warn('[Startup] Cache flush error:', err.message));

    // ── Warm Yahoo crumb before any stock requests ──
    warmCrumb()
        .then(() => {
            // ── Cache warming: pre-fetch popular stocks in background ──
            const stockService = new StockService();
            return stockService.getPopularStocks()
                .then(stocks => console.log(`  ✅ Cache warmed: ${stocks.length} popular stocks ready`))
                .catch(() => console.warn('  ⚠️ Cache warming failed (will fetch on first request)'));
        })
        .catch(() => console.warn('  ⚠️ Crumb warming failed'));
});

export default app;
