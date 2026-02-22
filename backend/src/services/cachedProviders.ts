// ===== Cached API Provider Layer =====
// Wraps raw providers with PostgreSQL cache + usage tracking
// This is what stockService should import instead of raw providers

import { cacheService } from './cacheService';
import { apiUsageService } from './apiUsageService';
import * as rawFmp from './providers/fmp';
import * as rawFinnhub from './providers/finnhub';
import * as rawTwelveData from './providers/twelveData';
import * as rawYahoo from './providers/yahooFinance';

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
    let data: T | null = null;
    try {
        data = await fetcher();
    } catch {
        return null;
    }

    // 4. Track usage (fire-and-forget — never block the response)
    apiUsageService.recordCall(provider).catch(() => {});

    // 5. Cache if successful (fire-and-forget)
    if (data !== null) {
        cacheService.set(provider, dataType, identifier, data, symbol)
            .then(() => console.log(`[Cache] MISS → stored ${provider}:${dataType}:${identifier}`))
            .catch(() => {});
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

    let data: T[] = [];
    try {
        data = await fetcher();
    } catch {
        return [];
    }

    apiUsageService.recordCall(provider).catch(() => {});

    if (data.length > 0) {
        cacheService.set(provider, dataType, identifier, data, symbol)
            .then(() => console.log(`[Cache] MISS → stored ${provider}:${dataType}:${identifier} (${data.length} items)`))
            .catch(() => {});
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
        cachedArray('fmp', 'search', `name:${query.toLowerCase()}`, () => rawFmp.searchStocks(query, limit)),

    searchBySymbol: (query: string, limit = 10) =>
        cachedArray('fmp', 'search', `sym:${query.toLowerCase()}`, () => rawFmp.searchBySymbol(query, limit)),

    // Batch profiles: each individual profile is cached separately via getProfile
    getBatchProfiles: async (symbols: string[]) => {
        const results = await Promise.allSettled(
            symbols.map(s => cached('fmp', 'profile', s, () => rawFmp.getProfile(s), s))
        );
        return results
            .filter((r): r is PromiseFulfilledResult<rawFmp.FMPProfile | null> => r.status === 'fulfilled' && r.value !== null)
            .map(r => r.value!);
    },
};

// ═══════════════════════════════════
// Finnhub (cached)
// ═══════════════════════════════════

export const finnhub = {
    getProfile: (symbol: string) =>
        cached('finnhub', 'profile', symbol, () => rawFinnhub.getProfile(symbol), symbol),

    getQuote: (symbol: string) =>
        cached('finnhub', 'quote', symbol, () => rawFinnhub.getQuote(symbol), symbol),

    getNews: (symbol: string, daysBack = 30) =>
        cachedArray('finnhub', 'news', symbol, () => rawFinnhub.getNews(symbol, daysBack), symbol),

    getPeers: (symbol: string) =>
        cachedArray('finnhub', 'peers', symbol, () => rawFinnhub.getPeers(symbol), symbol),

    getBasicFinancials: (symbol: string) =>
        cached('finnhub', 'metrics', symbol, () => rawFinnhub.getBasicFinancials(symbol), symbol),

    getEarningsCalendar: (symbol: string) =>
        cachedArray('finnhub', 'financials', `earnings:${symbol}`, () => rawFinnhub.getEarningsCalendar(symbol), symbol),

    searchSymbols: (query: string) =>
        cachedArray('finnhub', 'search', query.toLowerCase(), () => rawFinnhub.searchSymbols(query)),

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

// ═══════════════════════════════════
// Yahoo Finance (cached) — no API key, no rate limit
// ═══════════════════════════════════

export const yahoo = {
    getHistoricalPrices: (symbol: string, days = 365) =>
        cachedArray('yahoo', 'history', symbol, () => rawYahoo.getHistoricalPrices(symbol, days), symbol),

    getProfile: (symbol: string) =>
        cached('yahoo', 'profile', symbol, () => rawYahoo.getProfile(symbol), symbol),

    getKeyMetrics: (symbol: string) =>
        cached('yahoo', 'metrics', symbol, () => rawYahoo.getKeyMetrics(symbol), symbol),

    getFinancials: (symbol: string) =>
        cached('yahoo', 'financials', symbol, () => rawYahoo.getFinancials(symbol), symbol),
};
