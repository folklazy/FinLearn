// ===== Yahoo Finance Provider =====
// Uses the yahoo-finance2 npm package (no API key required)
// Acts as the primary fallback for price history, financials, and key metrics

// yahoo-finance2 v3 requires instantiation from .default constructor
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceCtor = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceCtor({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });

// ── quoteSummary circuit breaker ──
// Yahoo crumb endpoint often returns 429; stop retrying after consecutive failures
let qsConsecutiveFails = 0;
let qsSkipUntil = 0;

async function quoteSummarySafe(symbol: string, modules: string[]): Promise<any> {
    if (Date.now() < qsSkipUntil) return null; // Circuit open
    try {
        const result = await yahooFinance.quoteSummary(symbol, { modules });
        if (qsConsecutiveFails > 0) console.log(`[Yahoo] quoteSummary recovered after ${qsConsecutiveFails} failures`);
        qsConsecutiveFails = 0;
        return result;
    } catch (err) {
        qsConsecutiveFails++;
        const msg = (err as Error).message;
        if (qsConsecutiveFails <= 3) console.warn(`[Yahoo] quoteSummary ${symbol} fail #${qsConsecutiveFails}: ${msg}`);
        if (qsConsecutiveFails >= 3) {
            qsSkipUntil = Date.now() + 5 * 60 * 1000;
            console.warn(`[Yahoo] quoteSummary circuit OPEN — skipping for 5 min`);
        }
        return null;
    }
}

// Warm crumb at startup so first real requests don't 429
export async function warmCrumb(): Promise<void> {
    for (let i = 0; i < 3; i++) {
        try {
            await yahooFinance.quoteSummary('AAPL', { modules: ['price'] });
            console.log('[Yahoo] ✅ Crumb initialized');
            qsConsecutiveFails = 0;
            return;
        } catch (err) {
            console.warn(`[Yahoo] Crumb init ${i + 1}/3: ${(err as Error).message}`);
            if (i < 2) await new Promise(r => setTimeout(r, 3000 * (i + 1)));
        }
    }
    console.warn('[Yahoo] ⚠️ Crumb init failed — quoteSummary may be unavailable');
}

// ── Global Yahoo request throttle ──
// Yahoo rate-limits crumb/cookie requests; serialize to avoid 429
const MAX_CONCURRENT = 2;
let activeRequests = 0;
const queue: Array<() => void> = [];

function yahooThrottle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        const run = () => {
            activeRequests++;
            fn().then(resolve, reject).finally(() => {
                activeRequests--;
                if (queue.length > 0) {
                    const next = queue.shift()!;
                    setTimeout(next, 300);
                }
            });
        };
        if (activeRequests < MAX_CONCURRENT) {
            run();
        } else {
            queue.push(run);
        }
    });
}

// ── Price History ──
export interface YFHistoricalPoint {
    date: string;   // YYYY-MM-DD
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export async function getHistoricalPrices(symbol: string, days = 365): Promise<YFHistoricalPoint[]> {
    try {
        // Use chart() instead of historical() — historical() throws
        // "SOME (but not all) null values" when latest bar has close=null
        // (e.g. during market hours or unsettled data). chart() gives raw
        // data without that validation so we can filter nulls ourselves.
        const period2 = new Date();
        const period1 = new Date(period2.getTime() - days * 86400000);
        const result: any = await yahooFinance.chart(symbol, {
            period1, period2, interval: '1d' as const,
        });
        const quotes: any[] = result?.quotes ?? [];
        return quotes
            .filter((r: any) => r.date && r.close != null)
            .map((r: any) => ({
                date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date).split('T')[0],
                open: r.open ?? r.close ?? 0,
                high: r.high ?? r.close ?? 0,
                low: r.low ?? r.close ?? 0,
                close: r.close,
                volume: r.volume ?? 0,
            }));
    } catch (err) {
        console.warn(`[Yahoo] Historical error for ${symbol}:`, (err as Error).message);
        return [];
    }
}

// ── Company Profile ──
export interface YFProfile {
    name: string;
    description: string;
    sector: string;
    industry: string;
    exchange: string;
    employees: number;
    headquarters: string;
    website: string;
    ceo: string;
    marketCap: number;
    logo: string;
}

export async function getProfile(symbol: string): Promise<YFProfile | null> {
    return yahooThrottle(async () => {
    try {
        const result: any = await quoteSummarySafe(symbol, ['assetProfile', 'summaryDetail', 'price']);
        const ap = result?.assetProfile;
        const sd = result?.summaryDetail;
        const pr = result?.price;
        if (!ap && !pr) return null;

        const name = pr?.longName || pr?.shortName || symbol;
        const officers = (ap as any)?.companyOfficers as Array<{ name: string; title?: string }> | undefined;
        const ceo = officers?.find(o => o.title?.toLowerCase().includes('ceo') || o.title?.toLowerCase().includes('chief executive'))?.name ?? 'N/A';

        const rawExchange: string = (pr as any)?.exchangeName ?? (pr as any)?.exchange ?? '';
        const exchange = rawExchange.toUpperCase().includes('NASDAQ') ? 'NASDAQ'
            : rawExchange.toUpperCase().includes('NYSE') ? 'NYSE'
            : rawExchange || '';

        return {
            name,
            description: (ap as any)?.longBusinessSummary?.slice(0, 800) ?? '',
            sector: ap?.sector ?? '',
            industry: ap?.industry ?? '',
            exchange,
            employees: (ap as any)?.fullTimeEmployees ?? 0,
            headquarters: [ap?.city, ap?.state, ap?.country].filter(Boolean).join(', '),
            website: ap?.website ?? '',
            ceo,
            marketCap: (sd as any)?.marketCap ?? (pr as any)?.marketCap ?? 0,
            logo: `https://financialmodelingprep.com/image-stock/${symbol}.png`,
        };
    } catch (err) {
        console.warn(`[Yahoo] Profile error for ${symbol}:`, (err as Error).message);
        return null;
    }
    });
}

// ── Search ──
export interface YFSearchResult {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export async function searchStocks(query: string, limit = 15): Promise<YFSearchResult[]> {
    return yahooThrottle(async () => {
    try {
        const result: any = await yahooFinance.search(query, { newsCount: 0, quotesCount: limit });
        const quotes: any[] = result?.quotes ?? [];
        return quotes
            .filter((q: any) => q.symbol && (q.quoteType === 'EQUITY' || q.typeDisp === 'Equity'))
            .map((q: any) => ({
                symbol: q.symbol,
                name: q.longname || q.shortname || q.symbol,
                exchange: q.exchDisp || q.exchange || '',
                type: q.quoteType || 'EQUITY',
            }));
    } catch (err) {
        console.warn(`[Yahoo] Search error for ${query}:`, (err as Error).message);
        return [];
    }
    });
}

// ── Lightweight Quote (for batch fallback) ──
export interface YFQuote {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number;
    sector: string;
    logo: string;
}

export async function getQuote(symbol: string): Promise<YFQuote | null> {
    return yahooThrottle(async () => {
    try {
        const result: any = await yahooFinance.quoteSummary(symbol, {
            modules: ['price', 'assetProfile'],
        });
        const pr = result?.price;
        const ap = result?.assetProfile;
        if (!pr) return null;
        return {
            symbol: symbol.toUpperCase(),
            name: pr?.longName || pr?.shortName || symbol,
            price: pr?.regularMarketPrice ?? 0,
            change: pr?.regularMarketChange ?? 0,
            changePercent: pr?.regularMarketChangePercent ? pr.regularMarketChangePercent * 100 : 0,
            marketCap: pr?.marketCap ?? 0,
            sector: ap?.sector ?? '',
            logo: `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${symbol.toUpperCase()}.svg`,
        };
    } catch (err) {
        console.warn(`[Yahoo] Quote error for ${symbol}:`, (err as Error).message);
        return null;
    }
    });
}

// ── Key Metrics ──
export interface YFKeyMetrics {
    pe: number | null;
    pb: number | null;
    dividendYield: number | null;
    dividendPerShare: number | null;
    revenue: number | null;
    revenueGrowth: number | null; // already percentage e.g. 8.5 = 8.5%
    netIncome: number | null;
    profitMargin: number | null;   // already percentage e.g. 25.3 = 25.3%
    debtToEquity: number | null;
    currentRatio: number | null;
    roe: number | null;            // already percentage e.g. 22.3 = 22.3%
    eps: number;
    epsGrowth: number | null;      // already percentage
    revenueHistory: { year: string; value: number }[];
    epsHistory: { year: string; value: number }[];
    profile?: {
        name: string;
        description: string;
        sector: string;
        industry: string;
        website: string;
        employees: number;
        headquarters: string;
        ceo: string;
        exchange: string;
        marketCap: number;
    } | null;
}

export async function getKeyMetrics(symbol: string): Promise<YFKeyMetrics | null> {
    return yahooThrottle(async () => {
    try {
        const period1 = new Date(Date.now() - 5 * 365 * 86400000);

        // NOTE: Do NOT use { validateResult: false } for fundamentalsTimeSeries —
        // it causes raw prefixed field names (annualTotalRevenue instead of totalRevenue).
        // Without it, the library normalises fields to match the TypeScript interface.
        const [result, finArr, bsArr] = await Promise.all([
            quoteSummarySafe(symbol, ['financialData', 'defaultKeyStatistics', 'summaryDetail', 'incomeStatementHistory', 'earnings', 'assetProfile', 'price']),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'financials', type: 'annual' }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'balance-sheet', type: 'annual' }).catch(() => null),
        ]);

        const fd = (result as any)?.financialData;
        const ks = (result as any)?.defaultKeyStatistics;
        const sd = (result as any)?.summaryDetail;
        const ap = (result as any)?.assetProfile;
        const pr = (result as any)?.price;
        const is: any[] | undefined = (result as any)?.incomeStatementHistory?.incomeStatementHistory;
        const earningsYearly: any[] | undefined = (result as any)?.earnings?.financialsChart?.yearly;

        // fundamentalsTimeSeries rows sorted oldest-first
        const finRows: any[] = Array.isArray(finArr) ? finArr.filter((r: any) => r?.date) : [];
        const bsRows: any[] = Array.isArray(bsArr) ? bsArr.filter((r: any) => r?.date) : [];

        // Most-recent rows for current-period metrics
        const latestFin = finRows.length ? finRows[finRows.length - 1] : null;
        const latestBs = bsRows.length ? bsRows[bsRows.length - 1] : null;

        console.log(`[Yahoo] ${symbol} KeyMetrics: fd.totalRevenue=${fd?.totalRevenue} latestFin.totalRevenue=${latestFin?.totalRevenue} finRows=${finRows.length} bsRows=${bsRows.length} earningsYearly=${earningsYearly?.length ?? 0} finKeys=${latestFin ? Object.keys(latestFin).join(',') : 'none'}`);

        if (!fd && !ks && !sd && !latestFin) return null;

        // ── Revenue from fundamentalsTimeSeries (primary) or quoteSummary fallback ──
        const revenue = latestFin?.totalRevenue ?? fd?.totalRevenue ?? null;
        const netIncome = latestFin?.netIncome
            ?? latestFin?.netIncomeFromContinuingOperationNetMinorityInterest
            ?? latestFin?.netIncomeContinuousOperations
            ?? latestFin?.netIncomeFromContinuingAndDiscontinuedOperation
            ?? latestFin?.dilutedNIAvailtoComStockholders
            ?? fd?.netIncomeToCommon
            ?? null;

        // ── EPS: from fundamentalsTimeSeries (dilutedEPS) or quoteSummary ──
        const eps = latestFin?.dilutedEPS ?? latestFin?.basicEPS ?? ks?.trailingEps ?? 0;

        // ── D/E: from balance sheet ──
        const totalLiab = latestBs?.totalLiabilitiesNetMinorityInterest ?? latestBs?.totalLiabilities ?? 0;
        const equity = latestBs?.stockholdersEquity ?? latestBs?.commonStockEquity ?? latestBs?.totalEquityGrossMinorityInterest ?? 0;
        const debtToEquity = fd?.debtToEquity ?? (equity > 0 && totalLiab > 0 ? parseFloat((totalLiab / equity * 100).toFixed(1)) : null);

        // ── Current Ratio: from balance sheet ──
        const currentAssets = latestBs?.currentAssets ?? 0;
        const currentLiab = latestBs?.currentLiabilities ?? 0;
        const currentRatio = fd?.currentRatio ?? (currentAssets > 0 && currentLiab > 0 ? parseFloat((currentAssets / currentLiab).toFixed(2)) : null);

        // ── ROE: from fundamentalsTimeSeries or quoteSummary ──
        const roe = fd?.returnOnEquity != null ? fd.returnOnEquity * 100
            : (netIncome && equity > 0 ? parseFloat((netIncome / equity * 100).toFixed(1)) : null);

        // ── Profit margin ──
        const profitMargin = fd?.profitMargins != null ? fd.profitMargins * 100
            : (revenue && netIncome ? parseFloat((netIncome / revenue * 100).toFixed(2)) : null);

        // ── Build revenue history ──
        let revenueHistory: { year: string; value: number }[] = [];
        if (finRows.length >= 2) {
            revenueHistory = finRows.slice(-5).map((s: any) => ({
                year: s.date ? new Date(s.date).getFullYear().toString() : '',
                value: s.totalRevenue ?? 0,
            })).filter((s: { year: string; value: number }) => s.year && s.value);
        }
        if (revenueHistory.length < 2 && earningsYearly && earningsYearly.length >= 2) {
            revenueHistory = earningsYearly.map((e: any) => ({
                year: String(e.date),
                value: e.revenue ?? 0,
            })).filter((s: { year: string; value: number }) => s.year && s.value);
        }

        // ── Build EPS history ──
        let epsHistory: { year: string; value: number }[] = [];
        if (finRows.length >= 2 && bsRows.length >= 2) {
            const sharesMap: Record<string, number> = {};
            for (const b of bsRows) {
                const yr = b.date ? new Date(b.date).getFullYear().toString() : '';
                if (yr && b.ordinarySharesNumber) sharesMap[yr] = b.ordinarySharesNumber;
            }
            epsHistory = finRows.slice(-5).map((s: any) => {
                const yr = s.date ? new Date(s.date).getFullYear().toString() : '';
                const ni = s.netIncome ?? s.dilutedNIAvailtoComStockholders ?? 0;
                const shares = sharesMap[yr] ?? 0;
                const dilEps = s.dilutedEPS ?? (shares > 0 ? parseFloat((ni / shares).toFixed(2)) : 0);
                return { year: yr, value: dilEps };
            }).filter((s: { year: string; value: number }) => s.year);
        }
        if (epsHistory.length < 2 && earningsYearly && earningsYearly.length >= 2) {
            epsHistory = earningsYearly.map((e: any) => ({
                year: String(e.date),
                value: e.earnings != null ? parseFloat((e.earnings / 1e9).toFixed(2)) : 0,
            })).filter((s: { year: string; value: number }) => s.year && s.value);
        }

        // ── Revenue growth ──
        let revenueGrowth: number | null = null;
        if (finRows.length >= 2) {
            const r0 = finRows[finRows.length - 1]?.totalRevenue;
            const r1 = finRows[finRows.length - 2]?.totalRevenue;
            if (r0 && r1) revenueGrowth = ((r0 - r1) / Math.abs(r1)) * 100;
        }
        if (revenueGrowth == null && fd?.revenueGrowth != null) {
            revenueGrowth = fd.revenueGrowth * 100;
        }

        // ── EPS growth ──
        let epsGrowth: number | null = null;
        if (fd?.earningsGrowth != null) {
            epsGrowth = fd.earningsGrowth * 100;
        } else if (epsHistory.length >= 2) {
            const e0 = epsHistory[epsHistory.length - 1]?.value;
            const e1 = epsHistory[epsHistory.length - 2]?.value;
            if (e0 != null && e1 != null && e1 !== 0) {
                epsGrowth = ((e0 - e1) / Math.abs(e1)) * 100;
            }
        }

        // PE diagnostic: understand which source provides pe
        const sdPE = sd?.trailingPE ?? null;
        const fdPrice = fd?.currentPrice ?? null;
        const prPrice = pr?.regularMarketPrice ?? null;
        const calcPE = sdPE ?? (eps > 0 && (fdPrice || prPrice) ? parseFloat(((fdPrice || prPrice) / eps).toFixed(1)) : null);
        if (calcPE == null) console.log(`[Yahoo] ${symbol} PE=null: sdPE=${sdPE} fdPrice=${fdPrice} prPrice=${prPrice} eps=${eps} result=${result ? 'ok' : 'null'}`);

        const rawDivYield = (sd as any)?.trailingAnnualDividendYield ?? sd?.dividendYield ?? null;
        return {
            pe: calcPE,
            pb: ks?.priceToBook ?? null,
            dividendYield: rawDivYield != null && rawDivYield > 0 ? parseFloat((rawDivYield * 100).toFixed(2)) : null,
            dividendPerShare: sd?.dividendRate ?? null,
            revenue,
            revenueGrowth,
            netIncome,
            profitMargin,
            debtToEquity,
            currentRatio,
            roe,
            eps,
            epsGrowth,
            revenueHistory,
            epsHistory,
            profile: ap ? {
                name: pr?.longName || pr?.shortName || symbol,
                description: ap?.longBusinessSummary?.slice(0, 800) ?? '',
                sector: ap?.sector ?? '',
                industry: ap?.industry ?? '',
                website: ap?.website ?? '',
                employees: ap?.fullTimeEmployees ?? 0,
                headquarters: [ap?.city, ap?.state, ap?.country].filter(Boolean).join(', '),
                ceo: (ap?.companyOfficers as any[])?.find((o: any) => o.title?.toLowerCase().includes('ceo') || o.title?.toLowerCase().includes('chief executive'))?.name ?? 'N/A',
                exchange: (() => { const raw: string = pr?.exchangeName ?? pr?.exchange ?? ''; return raw.toUpperCase().includes('NASDAQ') ? 'NASDAQ' : raw.toUpperCase().includes('NYSE') ? 'NYSE' : raw || ''; })(),
                marketCap: sd?.marketCap ?? pr?.marketCap ?? 0,
            } : null,
        };
    } catch (err) {
        console.warn(`[Yahoo] KeyMetrics error for ${symbol}:`, (err as Error).message);
        return null;
    }
    });
}

// ── Financials ──
export interface YFFinancials {
    incomeStatement: {
        revenue: number;
        costOfRevenue: number;
        grossProfit: number;
        operatingExpenses: number;
        operatingIncome: number;
        netIncome: number;
    };
    balanceSheet: {
        totalAssets: number;
        currentAssets: number;
        nonCurrentAssets: number;
        totalLiabilities: number;
        currentLiabilities: number;
        nonCurrentLiabilities: number;
        totalEquity: number;
    };
    cashFlow: {
        operating: number;
        investing: number;
        financing: number;
        netCashFlow: number;
    };
}

export async function getFinancials(symbol: string): Promise<YFFinancials | null> {
    return yahooThrottle(async () => {
    try {
        const period1 = new Date(Date.now() - 5 * 365 * 86400000);

        // NOTE: Do NOT use { validateResult: false } — see getKeyMetrics comment
        const [incomeResult, bsArr, cfArr, finArr] = await Promise.all([
            yahooFinance.quoteSummary(symbol, { modules: ['incomeStatementHistory'] }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'balance-sheet', type: 'annual' }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'cash-flow', type: 'annual' }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'financials', type: 'annual' }).catch(() => null),
        ]);

        // incomeStatementHistory fallback (still returns revenue/grossProfit but not EPS)
        const is = (incomeResult as any)?.incomeStatementHistory?.incomeStatementHistory?.[0];
        // fundamentalsTimeSeries results sorted oldest-first; take last entry for most recent
        const bsRows: any[] = Array.isArray(bsArr) ? bsArr.filter((r: any) => r?.date) : [];
        const cfRows: any[] = Array.isArray(cfArr) ? cfArr.filter((r: any) => r?.date) : [];
        const finRows: any[] = Array.isArray(finArr) ? finArr.filter((r: any) => r?.date) : [];
        const bs = bsRows.length ? bsRows[bsRows.length - 1] : null;
        const cf = cfRows.length ? cfRows[cfRows.length - 1] : null;
        const fin = finRows.length ? finRows[finRows.length - 1] : null;

        if (!is && !bs && !cf && !fin) return null;

        // fundamentalsTimeSeries financials is primary; incomeStatementHistory as fallback
        const rev = fin?.totalRevenue ?? is?.totalRevenue ?? 0;
        const cogs = fin?.costOfRevenue ?? fin?.reconciledCostOfRevenue ?? is?.costOfRevenue ?? 0;
        const gp = fin?.grossProfit ?? is?.grossProfit ?? (rev && cogs ? rev - cogs : 0);
        const totalLiab = bs?.totalLiabilitiesNetMinorityInterest ?? 0;

        return {
            incomeStatement: {
                revenue: rev,
                costOfRevenue: cogs,
                grossProfit: gp,
                operatingExpenses: fin?.operatingExpense ?? is?.totalOperatingExpenses ?? is?.operatingExpenses ?? 0,
                operatingIncome: fin?.operatingIncome ?? fin?.EBIT ?? is?.operatingIncome ?? is?.ebit ?? 0,
                netIncome: fin?.netIncome ?? is?.netIncome ?? null,
            },
            balanceSheet: {
                totalAssets: bs?.totalAssets ?? 0,
                currentAssets: bs?.currentAssets ?? 0,
                nonCurrentAssets: bs?.totalNonCurrentAssets ?? ((bs?.totalAssets ?? 0) - (bs?.currentAssets ?? 0)),
                totalLiabilities: totalLiab,
                currentLiabilities: bs?.currentLiabilities ?? 0,
                nonCurrentLiabilities: bs?.totalNonCurrentLiabilitiesNetMinorityInterest ?? (totalLiab - (bs?.currentLiabilities ?? 0)),
                totalEquity: bs?.stockholdersEquity ?? bs?.commonStockEquity ?? bs?.totalEquityGrossMinorityInterest ?? 0,
            },
            cashFlow: {
                operating: cf?.operatingCashFlow ?? 0,
                investing: cf?.cashFlowFromContinuingInvestingActivities ?? cf?.investingCashFlow ?? 0,
                financing: cf?.cashFlowFromContinuingFinancingActivities ?? cf?.financingCashFlow ?? 0,
                netCashFlow: cf?.changesInCash ?? cf?.endCashPosition ?? 0,
            },
        };
    } catch (err) {
        console.warn(`[Yahoo] Financials error for ${symbol}:`, (err as Error).message);
        return null;
    }
    });
}
