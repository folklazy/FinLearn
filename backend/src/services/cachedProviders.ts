// ===== Cached API Provider Layer =====
// Wraps raw providers with PostgreSQL cache + usage tracking
// This is what stockService should import instead of raw providers

import { cacheService } from './cacheService';
import { apiUsageService } from './apiUsageService';
import * as rawFmp from './providers/fmp';
import * as rawFinnhub from './providers/finnhub';
import * as rawTwelveData from './providers/twelveData';

// ── Generic cached fetch wrapper ──
async function cached<T>(
    provider: string,
    dataType: string,
    identifier: string,
    fetcher: () => Promise<T | null>,
    symbol?: string,
): Promise<T | null> {
    // 1. Check PostgreSQL cache
    const hit = await cacheService.get<T>(provider, dataType, identifier);
    if (hit !== null) {
        console.log(`[Cache] HIT ${provider}:${dataType}:${identifier}`);
        return hit;
    }

    // 2. Check rate limit
    const canCall = await apiUsageService.canCall(provider);
    if (!canCall) {
        console.warn(`[RateLimit] ${provider} daily limit reached, skipping ${dataType}:${identifier}`);
        return null;
    }

    // 3. Fetch from API
    const data = await fetcher();

    // 4. Track usage
    await apiUsageService.recordCall(provider);

    // 5. Cache if successful
    if (data !== null) {
        await cacheService.set(provider, dataType, identifier, data, symbol);
        console.log(`[Cache] MISS → stored ${provider}:${dataType}:${identifier}`);
    }

    return data;
}

// Wrapper for array responses
async function cachedArray<T>(
    provider: string,
    dataType: string,
    identifier: string,
    fetcher: () => Promise<T[]>,
    symbol?: string,
): Promise<T[]> {
    const hit = await cacheService.get<T[]>(provider, dataType, identifier);
    if (hit !== null) {
        console.log(`[Cache] HIT ${provider}:${dataType}:${identifier}`);
        return hit;
    }

    const canCall = await apiUsageService.canCall(provider);
    if (!canCall) {
        console.warn(`[RateLimit] ${provider} daily limit reached`);
        return [];
    }

    const data = await fetcher();
    await apiUsageService.recordCall(provider);

    if (data.length > 0) {
        await cacheService.set(provider, dataType, identifier, data, symbol);
        console.log(`[Cache] MISS → stored ${provider}:${dataType}:${identifier} (${data.length} items)`);
    }

    return data;
}

// ═══════════════════════════════════
// FMP (cached)
// ═══════════════════════════════════

export const fmp = {
    getProfile: (symbol: string) =>
        cached('fmp', 'profile', symbol, () => rawFmp.getProfile(symbol), symbol),

    getKeyMetrics: (symbol: string) =>
        cached('fmp', 'metrics', symbol, () => rawFmp.getKeyMetrics(symbol), symbol),

    getIncomeStatements: (symbol: string, limit = 5) =>
        cachedArray('fmp', 'financials', `income:${symbol}`, () => rawFmp.getIncomeStatements(symbol, limit), symbol),

    getBalanceSheet: (symbol: string) =>
        cached('fmp', 'financials', `balance:${symbol}`, () => rawFmp.getBalanceSheet(symbol), symbol),

    getCashFlow: (symbol: string) =>
        cached('fmp', 'financials', `cashflow:${symbol}`, () => rawFmp.getCashFlow(symbol), symbol),

    getHistoricalPrices: (symbol: string, days = 365) =>
        cachedArray('fmp', 'history', symbol, () => rawFmp.getHistoricalPrices(symbol, days), symbol),

    searchStocks: (query: string, limit = 10) =>
        cachedArray('fmp', 'search', query.toLowerCase(), () => rawFmp.searchStocks(query, limit)),
};

// ═══════════════════════════════════
// Finnhub (cached)
// ═══════════════════════════════════

export const finnhub = {
    // Quotes have very short TTL (2 min) - defined in cacheService
    getQuote: (symbol: string) =>
        cached('finnhub', 'quote', symbol, () => rawFinnhub.getQuote(symbol), symbol),

    getProfile: (symbol: string) =>
        cached('finnhub', 'profile', symbol, () => rawFinnhub.getProfile(symbol), symbol),

    getNews: (symbol: string, daysBack = 30) =>
        cachedArray('finnhub', 'news', symbol, () => rawFinnhub.getNews(symbol, daysBack), symbol),

    getPeers: (symbol: string) =>
        cachedArray('finnhub', 'peers', symbol, () => rawFinnhub.getPeers(symbol), symbol),

    getBasicFinancials: (symbol: string) =>
        cached('finnhub', 'metrics', symbol, () => rawFinnhub.getBasicFinancials(symbol), symbol),

    getEarningsCalendar: (symbol: string) =>
        cachedArray('finnhub', 'financials', `earnings:${symbol}`, () => rawFinnhub.getEarningsCalendar(symbol), symbol),

    classifySentiment: rawFinnhub.classifySentiment,
};

// ═══════════════════════════════════
// Twelve Data (cached)
// ═══════════════════════════════════

export const twelveData = {
    getAllTechnicals: async (symbol: string, currentPrice: number) => {
        // Cache the combined result
        const hit = await cacheService.get<Awaited<ReturnType<typeof rawTwelveData.getAllTechnicals>>>('twelvedata', 'technicals', symbol);
        if (hit) {
            console.log(`[Cache] HIT twelvedata:technicals:${symbol}`);
            return hit;
        }

        const canCall = await apiUsageService.canCall('twelvedata');
        if (!canCall) {
            console.warn('[RateLimit] TwelveData daily limit reached, using defaults');
            return { ma50: 'above' as const, ma200: 'above' as const, rsi: 50, rsiSignal: 'neutral' as const, macd: 'neutral' as const, overallScore: 50 };
        }

        const data = await rawTwelveData.getAllTechnicals(symbol, currentPrice);
        // getAllTechnicals makes 4 API calls internally (RSI, MACD, SMA50, SMA200)
        await apiUsageService.recordCall('twelvedata', 4);
        await cacheService.set('twelvedata', 'technicals', symbol, data, symbol);
        console.log(`[Cache] MISS → stored twelvedata:technicals:${symbol}`);
        return data;
    },

    getTimeSeries: (symbol: string, outputsize = 365) =>
        cachedArray('twelvedata', 'history', symbol, () => rawTwelveData.getTimeSeries(symbol, outputsize), symbol),
};
