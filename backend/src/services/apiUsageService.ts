// ===== API Usage Tracking Service =====
// Tracks daily API calls per provider, prevents exceeding quotas

import { prisma } from '../lib/prisma';

// Daily limits per provider
const DAILY_LIMITS: Record<string, number> = {
    fmp: 800,             // free tier ~500-1000/day; raised from 250
    finnhub: 50000,       // 60/min ≈ 86k/day, but be conservative
    twelvedata: 800,
    alphavantage: 25,
    polygon: 5000,        // 5/min ≈ 7.2k/day
    yahoo: 99999,         // no API key, effectively unlimited
};

// Safety buffer — stop at 90% of limit
const SAFETY_FACTOR = 0.9;

function today(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

export class ApiUsageService {
    /**
     * Check if we can still make calls to this provider today
     */
    async canCall(provider: string): Promise<boolean> {
        const limit = DAILY_LIMITS[provider];
        if (!limit) return true; // Unknown provider = no limit

        try {
            const usage = await prisma.apiUsageDaily.findUnique({
                where: { provider_date: { provider, date: today() } },
            });
            if (!usage) return true;
            return usage.callCount < Math.floor(limit * SAFETY_FACTOR);
        } catch {
            return true; // On error, allow the call
        }
    }

    /**
     * Record an API call for tracking
     */
    async recordCall(provider: string, count = 1): Promise<void> {
        const limit = DAILY_LIMITS[provider] ?? 99999;
        try {
            await prisma.apiUsageDaily.upsert({
                where: { provider_date: { provider, date: today() } },
                update: {
                    callCount: { increment: count },
                    lastCallAt: new Date(),
                },
                create: {
                    provider,
                    date: today(),
                    callCount: count,
                    dailyLimit: limit,
                    lastCallAt: new Date(),
                },
            });
        } catch (err) {
            console.warn(`[ApiUsage] Record error for ${provider}:`, (err as Error).message);
        }
    }

    /**
     * Get remaining calls for a provider today
     */
    async remaining(provider: string): Promise<number> {
        const limit = DAILY_LIMITS[provider] ?? 99999;
        try {
            const usage = await prisma.apiUsageDaily.findUnique({
                where: { provider_date: { provider, date: today() } },
            });
            return limit - (usage?.callCount ?? 0);
        } catch {
            return limit;
        }
    }

    /**
     * Get usage summary for all providers today
     */
    async summary(): Promise<{ provider: string; used: number; limit: number; remaining: number; pct: number }[]> {
        const results = [];
        for (const [provider, limit] of Object.entries(DAILY_LIMITS)) {
            const remaining = await this.remaining(provider);
            const used = limit - remaining;
            results.push({
                provider,
                used,
                limit,
                remaining,
                pct: Math.round((used / limit) * 100),
            });
        }
        return results;
    }
}

export const apiUsageService = new ApiUsageService();
