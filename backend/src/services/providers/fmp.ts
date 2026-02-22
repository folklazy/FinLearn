// ===== Financial Modeling Prep (FMP) Provider =====
// Uses the new /stable/ API format (legacy v3 deprecated Aug 2025)

const BASE = 'https://financialmodelingprep.com/stable';
const KEY = () => process.env.FMP_API_KEY || '';

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('apikey', KEY());
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    try {
        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.warn(`[FMP] ${res.status} for ${path}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.warn(`[FMP] Error fetching ${path}:`, (err as Error).message);
        return null;
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
    const data = await get<FMPKeyMetrics[]>('/key-metrics-ttm', { symbol });
    return data?.[0] ?? null;
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
