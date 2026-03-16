// ===== Financial Modeling Prep (FMP) Provider =====
// Uses the new /stable/ API format (legacy v3 deprecated Aug 2025)

const BASE = 'https://financialmodelingprep.com/stable';
const KEY = () => process.env.FMP_API_KEY || '';

// ── Global request throttle (prevents 429 rate-limit) ──
const MAX_CONCURRENT = 2;
const BASE_DELAY_MS = 400;
let delayMs = BASE_DELAY_MS;           // adaptive — increases on 429
let activeRequests = 0;
const queue: Array<() => void> = [];

// Track symbols that return 402 (Premium) so we skip them next time
// Pre-seeded with known premium symbols on FMP free tier
const premiumPaths = new Set<string>([
    '/ratios-ttm:AVGO', '/ratios-ttm:BRK-B', '/ratios-ttm:LLY',
    '/ratios-ttm:MA', '/ratios-ttm:PG', '/ratios-ttm:HD',
    '/ratios-ttm:ORCL', '/ratios-ttm:WMT', '/ratios-ttm:CRM',
    '/ratios-ttm:BAC', '/ratios-ttm:MRK', '/ratios-ttm:ABT',
    '/ratios-ttm:KO', '/ratios-ttm:PEP', '/ratios-ttm:TMO',
    '/ratios-ttm:CSCO', '/ratios-ttm:ACN', '/ratios-ttm:DHR',
    '/ratios-ttm:MCD', '/ratios-ttm:TXN', '/ratios-ttm:PM',
    '/ratios-ttm:NEE', '/ratios-ttm:ADBE', '/ratios-ttm:AMD',
    '/ratios-ttm:QCOM', '/ratios-ttm:INTC', '/ratios-ttm:MU',
    '/financial-growth:AVGO', '/financial-growth:BRK-B', '/financial-growth:LLY',
    '/financial-growth:MA', '/financial-growth:PG', '/financial-growth:HD',
    '/financial-growth:ORCL', '/financial-growth:WMT', '/financial-growth:CRM',
    '/financial-growth:AMD', '/financial-growth:QCOM', '/financial-growth:MU',
]);

function acquireSlot(): Promise<void> {
    return new Promise(resolve => {
        if (activeRequests < MAX_CONCURRENT) {
            activeRequests++;
            resolve();
        } else {
            queue.push(resolve);
        }
    });
}

function releaseSlot() {
    setTimeout(() => {
        if (queue.length > 0) {
            const next = queue.shift()!;
            next();
        } else {
            activeRequests--;
        }
    }, delayMs);
}

// Circuit breaker: after consecutive 429 exhaustions, flush queue to stop infinite retries
let consecutive429Exhausted = 0;
const CIRCUIT_BREAKER_THRESHOLD = 5;

// When 429 is hit, temporarily slow down ALL requests
function enter429Cooldown() {
    delayMs = Math.min(delayMs * 2, 3000);
    console.warn(`[FMP] 429 cooldown — delay now ${delayMs}ms (queue: ${queue.length})`);
    setTimeout(() => { delayMs = BASE_DELAY_MS; }, 15000);
}

function flushQueue() {
    const count = queue.length;
    // Resolve all waiting callers so they proceed past acquireSlot and hit the circuit breaker fast-fail
    while (queue.length > 0) {
        const next = queue.shift()!;
        activeRequests++;
        next();
    }
    if (count > 0) {
        console.warn(`[FMP] Circuit breaker: flushed ${count} queued requests after ${CIRCUIT_BREAKER_THRESHOLD} consecutive 429 exhaustions`);
    }
    // Auto-reset after 5 minutes so FMP can recover
    setTimeout(() => {
        consecutive429Exhausted = 0;
        console.log('[FMP] Circuit breaker reset — resuming requests');
    }, 5 * 60 * 1000);
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
    // Fast-fail for known premium paths (e.g. /ratios-ttm?symbol=AVGO)
    const cacheKey = `${path}:${params.symbol ?? ''}`;
    if (premiumPaths.has(cacheKey)) return null;

    // Circuit breaker: skip if we've had too many consecutive 429 exhaustions
    if (consecutive429Exhausted >= CIRCUIT_BREAKER_THRESHOLD) return null;

    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('apikey', KEY());
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    await acquireSlot();
    try {
        // Exponential backoff: up to 3 attempts on 429
        const RETRIES = 3;
        let res: Response | null = null;
        for (let attempt = 0; attempt < RETRIES; attempt++) {
            res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
            if (res.status !== 429) break;
            enter429Cooldown();
            const wait = 800 * Math.pow(2, attempt); // 800ms, 1600ms, 3200ms
            console.warn(`[FMP] 429 for ${path} — retry ${attempt + 1}/${RETRIES} in ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
        }
        if (!res || res.status === 429) {
            console.warn(`[FMP] 429 exhausted retries for ${path}`);
            consecutive429Exhausted++;
            if (consecutive429Exhausted >= CIRCUIT_BREAKER_THRESHOLD) {
                flushQueue();
            }
            return null;
        }
        // Success — reset circuit breaker
        consecutive429Exhausted = 0;
        if (res.status === 402) {
            premiumPaths.add(cacheKey);
            return null;
        }
        if (!res.ok) {
            console.warn(`[FMP] ${res.status} for ${path}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.warn(`[FMP] Error fetching ${path}:`, (err as Error).message);
        return null;
    } finally {
        releaseSlot();
    }
}

// ── Company Profile (also includes live price data) ──
export interface FMPProfile {
    symbol: string;
    companyName: string;
    image: string;
    description: string;
    sector: string;
    industry: string;
    marketCap: number;
    fullTimeEmployees: string;
    ipoDate: string;
    address: string;
    city: string;
    state: string;
    country: string;
    website: string;
    ceo: string;
    price: number;
    change: number;
    changePercentage: number;
    range: string;
    volume: number;
    averageVolume: number;
    beta: number;
    lastDividend: number;
    exchange: string;
    currency: string;
}

export async function getProfile(symbol: string): Promise<FMPProfile | null> {
    const data = await get<FMPProfile[]>('/profile', { symbol });
    return data?.[0] ?? null;
}

// NOTE: /stable/quote requires paid plan. Use profile + Finnhub for price data instead.

// ── Key Metrics TTM ──
export interface FMPKeyMetrics {
    revenuePerShareTTM: number;
    netIncomePerShareTTM: number;
    peRatioTTM: number;
    priceToBookRatioTTM: number;
    dividendYieldTTM: number;
    dividendPerShareTTM: number;
    epsGrowth: number;
    roeTTM: number;
    debtToEquityTTM: number;
    currentRatioTTM: number;
    netProfitMarginTTM: number;
    revenueGrowth: number;
}

export async function getKeyMetrics(symbol: string): Promise<FMPKeyMetrics | null> {
    // /stable/ratios-ttm has PE, margins, dividend yield, debt ratios
    const ratiosArr = await get<Record<string, number>[]>('/ratios-ttm', { symbol });
    const r = ratiosArr?.[0];
    if (!r) return null;

    // /stable/financial-growth has revenue/EPS growth (best-effort, non-blocking)
    let g: Record<string, number> | null = null;
    try {
        const growthArr = await get<Record<string, number>[]>('/financial-growth', { symbol, period: 'annual', limit: '1' });
        g = growthArr?.[0] ?? null;
    } catch { /* growth is optional */ }

    return {
        revenuePerShareTTM: r.revenuePerShareTTM ?? 0,
        netIncomePerShareTTM: r.netIncomePerShareTTM ?? 0,
        peRatioTTM: r.priceToEarningsRatioTTM ?? 0,
        priceToBookRatioTTM: r.priceToBookRatioTTM ?? 0,
        dividendYieldTTM: r.dividendYieldTTM ?? 0,
        dividendPerShareTTM: r.dividendPerShareTTM ?? 0,
        epsGrowth: g?.epsgrowth ?? 0,
        roeTTM: 0, // ROE available from key-metrics-ttm; fallback providers handle this
        debtToEquityTTM: r.debtToEquityRatioTTM ?? 0,
        currentRatioTTM: r.currentRatioTTM ?? 0,
        netProfitMarginTTM: r.netProfitMarginTTM ?? 0,
        revenueGrowth: g?.revenueGrowth ?? 0,
    };
}

// ── Income Statement ──
export interface FMPIncomeStatement {
    date: string;
    revenue: number;
    costOfRevenue: number;
    grossProfit: number;
    operatingExpenses: number;
    operatingIncome: number;
    netIncome: number;
    eps: number;
    epsdiluted: number;
}

export async function getIncomeStatements(symbol: string, limit = 5): Promise<FMPIncomeStatement[]> {
    return (await get<FMPIncomeStatement[]>('/income-statement', { symbol, period: 'annual', limit: String(limit) })) ?? [];
}

// ── Balance Sheet ──
export interface FMPBalanceSheet {
    date: string;
    totalAssets: number;
    totalCurrentAssets: number;
    totalNonCurrentAssets: number;
    totalLiabilities: number;
    totalCurrentLiabilities: number;
    totalNonCurrentLiabilities: number;
    totalStockholdersEquity: number;
}

export async function getBalanceSheet(symbol: string): Promise<FMPBalanceSheet | null> {
    const data = await get<FMPBalanceSheet[]>('/balance-sheet-statement', { symbol, period: 'annual', limit: '1' });
    return data?.[0] ?? null;
}

// ── Cash Flow ──
export interface FMPCashFlow {
    date: string;
    operatingCashFlow: number;
    capitalExpenditure: number;
    netCashUsedForInvestingActivites: number;
    netCashUsedProvidedByFinancingActivities: number;
    netChangeInCash: number;
}

export async function getCashFlow(symbol: string): Promise<FMPCashFlow | null> {
    const data = await get<FMPCashFlow[]>('/cash-flow-statement', { symbol, period: 'annual', limit: '1' });
    return data?.[0] ?? null;
}

// ── Historical Prices ──
export interface FMPHistorical {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export async function getHistoricalPrices(symbol: string, days = 365): Promise<FMPHistorical[]> {
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    // /stable/ API returns flat array, not { historical: [...] }
    const data = await get<FMPHistorical[]>('/historical-price-eod/full', { symbol, from, to });
    return data ?? [];
}

// NOTE: /stable/stock_peers returns 404 on free tier. Use Finnhub peers instead.

// ── Search ──
export interface FMPSearchResult {
    symbol: string;
    name: string;
    currency: string;
    stockExchange: string;
    exchangeShortName: string;
}

export async function searchStocks(query: string, limit = 10): Promise<FMPSearchResult[]> {
    return (await get<FMPSearchResult[]>('/search-name', { query, limit: String(limit) })) ?? [];
}

export async function searchBySymbol(query: string, limit = 10): Promise<FMPSearchResult[]> {
    return (await get<FMPSearchResult[]>('/search', { query, limit: String(limit) })) ?? [];
}

// ── Batch profiles (for listing pages) ──
// FMP /stable/profile does NOT support comma-separated symbols, so we fetch individually in parallel
export async function getBatchProfiles(symbols: string[]): Promise<FMPProfile[]> {
    if (symbols.length === 0) return [];
    const results = await Promise.allSettled(symbols.map(s => getProfile(s)));
    return results
        .filter((r): r is PromiseFulfilledResult<FMPProfile | null> => r.status === 'fulfilled' && r.value !== null)
        .map(r => r.value!);
}
