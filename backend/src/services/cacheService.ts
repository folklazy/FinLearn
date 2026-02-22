// ===== PostgreSQL-based API Cache Service =====
// Persistent cache with TTL per data type

import { prisma } from '../lib/prisma';

// TTL configuration (in seconds)
const TTL: Record<string, number> = {
    profile:     24 * 3600,  // 24h - rarely changes
    financials:  24 * 3600,  // 24h - quarterly data
    metrics:      6 * 3600,  // 6h  - changes with price
    history:     12 * 3600,  // 12h - adds 1 row/day
    news:         1 * 3600,  // 1h  - changes frequently
    technicals:      1800,   // 30min - needs freshness
    quote:            120,   // 2min - real-time
    peers:       24 * 3600,  // 24h - rarely changes
    search:       6 * 3600,  // 6h  - rarely changes
};

function buildKey(provider: string, dataType: string, identifier: string): string {
    return `${provider}:${dataType}:${identifier}`;
}

export class CacheService {
    /**
     * Get cached data if not expired
     */
    async get<T>(provider: string, dataType: string, identifier: string): Promise<T | null> {
        const key = buildKey(provider, dataType, identifier);
        try {
            const entry = await prisma.apiCache.findUnique({ where: { key } });
            if (!entry) return null;

            if (new Date() > entry.expiresAt) {
                // Expired — delete async, return null
                prisma.apiCache.delete({ where: { key } }).catch(() => {});
                return null;
            }

            return entry.data as T;
        } catch (err) {
            console.warn(`[Cache] Read error for ${key}:`, (err as Error).message);
            return null;
        }
    }

    /**
     * Store data with TTL
     */
    async set(provider: string, dataType: string, identifier: string, data: unknown, symbol?: string): Promise<void> {
        const key = buildKey(provider, dataType, identifier);
        const ttlSeconds = TTL[dataType] ?? 3600;
        const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

        try {
            await prisma.apiCache.upsert({
                where: { key },
                update: { data: data as any, expiresAt, updatedAt: new Date() },
                create: { key, provider, dataType, symbol: symbol ?? null, data: data as any, expiresAt },
            });
        } catch (err) {
            console.warn(`[Cache] Write error for ${key}:`, (err as Error).message);
        }
    }

    /**
     * Delete a specific cache entry
     */
    async del(provider: string, dataType: string, identifier: string): Promise<void> {
        const key = buildKey(provider, dataType, identifier);
        try {
            await prisma.apiCache.delete({ where: { key } }).catch(() => {});
        } catch {}
    }

    /**
     * Clean up all expired entries (call periodically)
     */
    async cleanup(): Promise<number> {
        try {
            const result = await prisma.apiCache.deleteMany({
                where: { expiresAt: { lt: new Date() } },
            });
            return result.count;
        } catch (err) {
            console.warn('[Cache] Cleanup error:', (err as Error).message);
            return 0;
        }
    }

    /**
     * Get cache stats
     */
    async stats(): Promise<{ total: number; expired: number; byProvider: Record<string, number> }> {
        const [total, expired, byProvider] = await Promise.all([
            prisma.apiCache.count(),
            prisma.apiCache.count({ where: { expiresAt: { lt: new Date() } } }),
            prisma.apiCache.groupBy({ by: ['provider'], _count: true }),
        ]);
        return {
            total,
            expired,
            byProvider: Object.fromEntries(byProvider.map(p => [p.provider, p._count])),
        };
    }
}

export const cacheService = new CacheService();
