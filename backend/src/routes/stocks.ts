import { Router, Request, Response } from 'express';
import { stockService } from '../services/stockService';

const router = Router();

// GET /api/stocks/search?q=apple
router.get('/search', async (req: Request, res: Response) => {
    try {
        const query = (req.query.q as string) || '';
        if (!query || query.length < 1) {
            res.json([]);
            return;
        }
        const results = await stockService.searchStocks(query);
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search stocks' });
    }
});

// GET /api/stocks/popular — top 20 S&P 500 by market cap
router.get('/popular', async (_req: Request, res: Response) => {
    try {
        const stocks = await stockService.getPopularStocks();
        res.json(stocks);
    } catch (error) {
        console.error('Popular stocks error:', error);
        res.status(500).json({ error: 'Failed to get popular stocks' });
    }
});

// GET /api/stocks/sp500?page=1&limit=50&sector=Technology
router.get('/sp500', async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const sector = (req.query.sector as string) || undefined;
        const result = await stockService.getSP500List(page, limit, sector);
        res.json(result);
    } catch (error) {
        console.error('S&P 500 list error:', error);
        res.status(500).json({ error: 'Failed to get S&P 500 list' });
    }
});

// GET /api/stocks/:symbol — full stock detail
router.get('/:symbol', async (req: Request, res: Response) => {
    try {
        const symbol = req.params.symbol as string;
        const data = await stockService.getStockData(symbol);

        if (!data) {
            res.status(404).json({ error: `Stock ${symbol.toUpperCase()} not found` });
            return;
        }

        res.json(data);
    } catch (error) {
        const sym = req.params.symbol as string;
        console.error(`Stock data error for ${sym}:`, error);
        res.status(500).json({ error: 'Failed to get stock data' });
    }
});

export default router;
