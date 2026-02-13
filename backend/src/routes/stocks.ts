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

// GET /api/stocks/popular
router.get('/popular', async (_req: Request, res: Response) => {
    try {
        const stocks = await stockService.getPopularStocks();
        // Return simplified data for cards
        const simplified = stocks.map((s) => ({
            symbol: s.symbol,
            name: s.profile.name,
            logo: s.profile.logo,
            sector: s.profile.sector,
            price: s.price.current,
            change: s.price.change,
            changePercent: s.price.changePercent,
            marketCap: s.profile.marketCap,
            overallScore: s.scores.overall,
        }));
        res.json(simplified);
    } catch (error) {
        console.error('Popular stocks error:', error);
        res.status(500).json({ error: 'Failed to get popular stocks' });
    }
});

// GET /api/stocks/:symbol
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
