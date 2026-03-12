import { Router, Request, Response, NextFunction } from 'express';
import { apiUsageService } from '../services/apiUsageService';
import { cacheService } from '../services/cacheService';

const router = Router();

function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
    const adminKey = process.env.ADMIN_API_KEY;
    if (!adminKey) {
        res.status(503).json({ error: 'Admin endpoints not configured' });
        return;
    }
    const provided = req.headers['x-admin-key'];
    if (!provided || provided !== adminKey) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    next();
}

router.get('/', (_req: Request, res: Response) => {
    res.json({
        status: 'ok',
        message: 'FinLearn API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// GET /api/health/usage — API usage summary for today (admin only)
router.get('/usage', requireAdminKey, async (_req: Request, res: Response) => {
    try {
        const summary = await apiUsageService.summary();
        res.json({ date: new Date().toISOString().split('T')[0], providers: summary });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// GET /api/health/cache — Cache statistics (admin only)
router.get('/cache', requireAdminKey, async (_req: Request, res: Response) => {
    try {
        const stats = await cacheService.stats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

// POST /api/health/cache/cleanup — Remove expired cache entries (admin only)
router.post('/cache/cleanup', requireAdminKey, async (_req: Request, res: Response) => {
    try {
        const deleted = await cacheService.cleanup();
        res.json({ deleted, message: `Cleaned up ${deleted} expired cache entries` });
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;
