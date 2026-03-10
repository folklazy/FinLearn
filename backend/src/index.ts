import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import stockRoutes from './routes/stocks';
import healthRoutes from './routes/health';
import lessonRoutes from './routes/lessons';
import { StockService } from './services/stockService';

// Load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 4000;

// ===== Middleware =====
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

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
app.listen(PORT, () => {
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

    // ── Cache warming: pre-fetch popular stocks in background ──
    const stockService = new StockService();
    stockService.getPopularStocks()
        .then(stocks => console.log(`  ✅ Cache warmed: ${stocks.length} popular stocks ready`))
        .catch(() => console.warn('  ⚠️ Cache warming failed (will fetch on first request)'));
});

export default app;
