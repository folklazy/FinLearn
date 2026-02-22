// ===== Twelve Data Provider =====
// Used for: Technical indicators (RSI, MACD, SMA/EMA), time series

const BASE = 'https://api.twelvedata.com';
const KEY = () => process.env.TWELVE_DATA_API_KEY || '';

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
    const url = new URL(`${BASE}${path}`);
    url.searchParams.set('apikey', KEY());
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

    try {
        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
        if (!res.ok) {
            console.warn(`[TwelveData] ${res.status} for ${path}`);
            return null;
        }
        const json = (await res.json()) as T & { status?: string; message?: string };
        if (json.status === 'error') {
            console.warn(`[TwelveData] API error: ${json.message}`);
            return null;
        }
        return json;
    } catch (err) {
        console.warn(`[TwelveData] Error fetching ${path}:`, (err as Error).message);
        return null;
    }
}

// ── RSI ──
export interface RSIResponse {
    values: { datetime: string; rsi: string }[];
}

export async function getRSI(symbol: string, period = 14): Promise<number | null> {
    const data = await get<RSIResponse>('/rsi', {
        symbol, interval: '1day', time_period: String(period), outputsize: '1',
    });
    const val = data?.values?.[0]?.rsi;
    return val ? parseFloat(val) : null;
}

// ── MACD ──
export interface MACDResponse {
    values: { datetime: string; macd: string; macd_signal: string; macd_hist: string }[];
}

export async function getMACD(symbol: string): Promise<{ macd: number; signal: number; hist: number } | null> {
    const data = await get<MACDResponse>('/macd', {
        symbol, interval: '1day', outputsize: '1',
    });
    const v = data?.values?.[0];
    if (!v) return null;
    return { macd: parseFloat(v.macd), signal: parseFloat(v.macd_signal), hist: parseFloat(v.macd_hist) };
}

// ── SMA (Simple Moving Average) ──
export interface SMAResponse {
    values: { datetime: string; sma: string }[];
}

export async function getSMA(symbol: string, period: number): Promise<number | null> {
    const data = await get<SMAResponse>('/sma', {
        symbol, interval: '1day', time_period: String(period), outputsize: '1',
    });
    const val = data?.values?.[0]?.sma;
    return val ? parseFloat(val) : null;
}

// ── EMA (Exponential Moving Average) ──
export async function getEMA(symbol: string, period: number): Promise<number | null> {
    const data = await get<SMAResponse>('/ema', {
        symbol, interval: '1day', time_period: String(period), outputsize: '1',
    });
    const val = data?.values?.[0]?.sma;
    return val ? parseFloat(val) : null;
}

// ── Time Series ──
export interface TimeSeriesResponse {
    values: { datetime: string; open: string; high: string; low: string; close: string; volume: string }[];
}

export async function getTimeSeries(symbol: string, outputsize = 365): Promise<TimeSeriesResponse['values']> {
    const data = await get<TimeSeriesResponse>('/time_series', {
        symbol, interval: '1day', outputsize: String(outputsize),
    });
    return data?.values ?? [];
}

// ── Get all technical indicators at once ──
export async function getAllTechnicals(symbol: string, currentPrice: number) {
    const [rsi, macd, sma50, sma200] = await Promise.all([
        getRSI(symbol),
        getMACD(symbol),
        getSMA(symbol, 50),
        getSMA(symbol, 200),
    ]);

    const rsiSignal: 'overbought' | 'oversold' | 'neutral' =
        rsi !== null ? (rsi > 70 ? 'overbought' : rsi < 30 ? 'oversold' : 'neutral') : 'neutral';

    const macdSignal: 'bullish' | 'bearish' | 'neutral' =
        macd ? (macd.hist > 0 ? 'bullish' : macd.hist < 0 ? 'bearish' : 'neutral') : 'neutral';

    const ma50Signal: 'above' | 'below' = sma50 !== null ? (currentPrice > sma50 ? 'above' : 'below') : 'above';
    const ma200Signal: 'above' | 'below' = sma200 !== null ? (currentPrice > sma200 ? 'above' : 'below') : 'above';

    // Calculate overall technical score (0-100)
    let score = 50;
    if (rsi !== null) {
        if (rsi >= 40 && rsi <= 60) score += 10;
        else if (rsi > 70) score -= 10;
        else if (rsi < 30) score += 5; // oversold = potential buy
    }
    if (macdSignal === 'bullish') score += 15;
    else if (macdSignal === 'bearish') score -= 10;
    if (ma50Signal === 'above') score += 10;
    if (ma200Signal === 'above') score += 15;

    score = Math.max(0, Math.min(100, score));

    return {
        ma50: ma50Signal,
        ma200: ma200Signal,
        rsi: rsi ?? 50,
        rsiSignal,
        macd: macdSignal,
        overallScore: score,
    };
}
