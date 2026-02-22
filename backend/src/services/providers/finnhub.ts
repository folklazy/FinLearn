// ===== Finnhub Provider =====
// Used for: Real-time quotes, company news, peers, earnings calendar

const BASE = 'https://finnhub.io/api/v1';
const KEY = () => process.env.FINNHUB_API_KEY || '';

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('token', KEY());
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    try {
        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.warn(`[Finnhub] ${res.status} for ${path}`);
            return null;
        }
        return (await res.json()) as T;
    } catch (err) {
        console.warn(`[Finnhub] Error fetching ${path}:`, (err as Error).message);
        return null;
    }
}

// ── Real-time Quote ──
export interface FinnhubQuote {
    c: number;  // current
    d: number;  // change
    dp: number; // change percent
    h: number;  // high
    l: number;  // low
    o: number;  // open
    pc: number; // previous close
    t: number;  // timestamp
}

export async function getQuote(symbol: string): Promise<FinnhubQuote | null> {
    return get<FinnhubQuote>('/quote', { symbol });
}

// ── Company Profile ──
export interface FinnhubProfile {
    country: string;
    currency: string;
    exchange: string;
    finnhubIndustry: string;
    ipo: string;
    logo: string;
    marketCapitalization: number;
    name: string;
    phone: string;
    shareOutstanding: number;
    ticker: string;
    weburl: string;
}

export async function getProfile(symbol: string): Promise<FinnhubProfile | null> {
    return get<FinnhubProfile>('/stock/profile2', { symbol });
}

// ── Company News ──
export interface FinnhubNews {
    id: number;
    category: string;
    datetime: number;
    headline: string;
    image: string;
    related: string;
    source: string;
    summary: string;
    url: string;
}

export async function getNews(symbol: string, daysBack = 30): Promise<FinnhubNews[]> {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - daysBack * 86400000).toISOString().split('T')[0];
    return (await get<FinnhubNews[]>('/company-news', { symbol, from, to })) ?? [];
}

// ── Peers ──
export async function getPeers(symbol: string): Promise<string[]> {
    return (await get<string[]>('/stock/peers', { symbol })) ?? [];
}

// ── Earnings Calendar ──
export interface FinnhubEarnings {
    date: string;
    epsActual: number | null;
    epsEstimate: number | null;
    hour: string;
    quarter: number;
    revenueActual: number | null;
    revenueEstimate: number | null;
    symbol: string;
    year: number;
}

export async function getEarningsCalendar(symbol: string): Promise<FinnhubEarnings[]> {
    const data = await get<{ earningsCalendar: FinnhubEarnings[] }>('/calendar/earnings', { symbol });
    return data?.earningsCalendar?.filter(e => e.symbol === symbol) ?? [];
}

// ── Basic Financials ──
export interface FinnhubBasicFinancials {
    metric: {
        '52WeekHigh': number;
        '52WeekLow': number;
        '10DayAverageTradingVolume': number;
        peNormalizedAnnual: number;
        pbAnnual: number;
        dividendYieldIndicatedAnnual: number;
        epsGrowth5Y: number;
        roeTTM: number;
        currentRatioQuarterly: number;
        totalDebt2TotalEquityQuarterly: number;
        netProfitMarginTTM: number;
        revenueGrowth5Y: number;
    };
}

export async function getBasicFinancials(symbol: string): Promise<FinnhubBasicFinancials['metric'] | null> {
    const data = await get<FinnhubBasicFinancials>('/stock/metric', { symbol, metric: 'all' });
    return data?.metric ?? null;
}

// ── News Sentiment ──
export function classifySentiment(headline: string): 'positive' | 'negative' | 'neutral' {
    const lower = headline.toLowerCase();
    const positiveWords = ['surge', 'soar', 'jump', 'rally', 'gain', 'beat', 'record', 'growth', 'profit', 'upgrade', 'สูง', 'เพิ่ม', 'กำไร', 'เติบโต', 'สถิติ'];
    const negativeWords = ['drop', 'fall', 'crash', 'decline', 'loss', 'miss', 'cut', 'downgrade', 'warn', 'ลด', 'ตก', 'ขาดทุน', 'ถอย', 'เตือน'];

    const posScore = positiveWords.filter(w => lower.includes(w)).length;
    const negScore = negativeWords.filter(w => lower.includes(w)).length;

    if (posScore > negScore) return 'positive';
    if (negScore > posScore) return 'negative';
    return 'neutral';
}
