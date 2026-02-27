// ===== Yahoo Finance Provider =====
// Uses the yahoo-finance2 npm package (no API key required)
// Acts as the primary fallback for price history, financials, and key metrics

// yahoo-finance2 v3 requires instantiation from .default constructor
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceCtor = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceCtor({ suppressNotices: ['ripHistorical'] });

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
        const period2 = new Date();
        const period1 = new Date(Date.now() - days * 86400000);
        const rows: any[] = await yahooFinance.historical(symbol, { period1, period2, interval: '1d' });
        return rows.map((r: any) => ({
            date: r.date.toISOString().split('T')[0],
            open: r.open ?? 0,
            high: r.high ?? 0,
            low: r.low ?? 0,
            close: r.close ?? 0,
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
    employees: number;
    headquarters: string;
    website: string;
    ceo: string;
    marketCap: number;
    logo: string;
}

export async function getProfile(symbol: string): Promise<YFProfile | null> {
    try {
        const result: any = await yahooFinance.quoteSummary(symbol, {
            modules: ['assetProfile', 'summaryDetail', 'price'],
        });
        const ap = result?.assetProfile;
        const sd = result?.summaryDetail;
        const pr = result?.price;
        if (!ap && !pr) return null;

        const name = pr?.longName || pr?.shortName || symbol;
        const officers = (ap as any)?.companyOfficers as Array<{ name: string; title?: string }> | undefined;
        const ceo = officers?.find(o => o.title?.toLowerCase().includes('ceo') || o.title?.toLowerCase().includes('chief executive'))?.name ?? 'N/A';

        return {
            name,
            description: (ap as any)?.longBusinessSummary?.slice(0, 300) ?? '',
            sector: ap?.sector ?? '',
            industry: ap?.industry ?? '',
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
}

export async function getKeyMetrics(symbol: string): Promise<YFKeyMetrics | null> {
    try {
        const result: any = await yahooFinance.quoteSummary(symbol, {
            modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail', 'incomeStatementHistory', 'incomeStatementHistoryQuarterly'],
        });
        const fd = result?.financialData;
        const ks = result?.defaultKeyStatistics;
        const sd = result?.summaryDetail;
        const is: any[] | undefined = result?.incomeStatementHistory?.incomeStatementHistory
            ?? result?.incomeStatementHistoryQuarterly?.incomeStatementHistory;

        if (!fd && !ks && !sd) return null;

        // Revenue history from income statements
        const revenueHistory: { year: string; value: number }[] = (is ?? [])
            .slice(0, 5)
            .map((s: any) => ({
                year: s.endDate ? new Date(s.endDate).getFullYear().toString() : '',
                value: s.totalRevenue ?? 0,
            }))
            .filter((s: any) => s.year)
            .reverse();

        const epsHistory: { year: string; value: number }[] = (is ?? [])
            .slice(0, 5)
            .map((s: any) => ({
                year: s.endDate ? new Date(s.endDate).getFullYear().toString() : '',
                value: s.dilutedEps ?? s.basicEps ?? 0,
            }))
            .filter((s: any) => s.year)
            .reverse();

        // Compute revenue growth from history when direct value unavailable
        let revenueGrowth: number | null = null;
        if (fd?.revenueGrowth != null) {
            revenueGrowth = fd.revenueGrowth * 100;
        } else if (is && is.length >= 2 && is[1]?.totalRevenue) {
            revenueGrowth = ((is[0].totalRevenue - is[1].totalRevenue) / Math.abs(is[1].totalRevenue)) * 100;
        }

        // Compute EPS growth from history when direct value unavailable
        let epsGrowth: number | null = null;
        if (fd?.earningsGrowth != null) {
            epsGrowth = fd.earningsGrowth * 100;
        } else if (is && is.length >= 2) {
            const e0 = is[0]?.dilutedEps ?? is[0]?.basicEps;
            const e1 = is[1]?.dilutedEps ?? is[1]?.basicEps;
            if (e0 != null && e1 != null && e1 !== 0) {
                epsGrowth = ((e0 - e1) / Math.abs(e1)) * 100;
            }
        }

        return {
            pe: sd?.trailingPE ?? (fd?.currentPrice && fd?.trailingEps ? fd.currentPrice / fd.trailingEps : null) ?? (ks?.forwardPE ?? null),
            pb: ks?.priceToBook ?? null,
            dividendYield: sd?.dividendYield ? sd.dividendYield * 100 : null,
            dividendPerShare: sd?.dividendRate ?? null,
            revenue: fd?.totalRevenue ?? (is?.[0]?.totalRevenue ?? null),
            revenueGrowth,
            netIncome: fd?.netIncomeToCommon ?? (is?.[0]?.netIncome ?? null),
            profitMargin: fd?.profitMargins != null ? fd.profitMargins * 100 : null,
            debtToEquity: fd?.debtToEquity ?? null,
            currentRatio: fd?.currentRatio ?? null,
            roe: fd?.returnOnEquity != null ? fd.returnOnEquity * 100 : null,
            eps: ks?.trailingEps ?? 0,
            epsGrowth,
            revenueHistory,
            epsHistory,
        };
    } catch (err) {
        console.warn(`[Yahoo] KeyMetrics error for ${symbol}:`, (err as Error).message);
        return null;
    }
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
    try {
        const result: any = await yahooFinance.quoteSummary(symbol, {
            modules: [
                'incomeStatementHistory', 'incomeStatementHistoryQuarterly',
                'balanceSheetHistory', 'balanceSheetHistoryQuarterly',
                'cashflowStatementHistory', 'cashflowStatementHistoryQuarterly',
            ],
        });
        const is = result?.incomeStatementHistory?.incomeStatementHistory?.[0]
            ?? result?.incomeStatementHistoryQuarterly?.incomeStatementHistory?.[0];
        const bs = result?.balanceSheetHistory?.balanceSheetStatements?.[0]
            ?? result?.balanceSheetHistoryQuarterly?.balanceSheetStatements?.[0];
        const cf = result?.cashflowStatementHistory?.cashflowStatements?.[0]
            ?? result?.cashflowStatementHistoryQuarterly?.cashflowStatements?.[0];

        if (!is && !bs && !cf) return null;

        return {
            incomeStatement: {
                revenue: is?.totalRevenue ?? 0,
                costOfRevenue: is?.costOfRevenue ?? 0,
                grossProfit: is?.grossProfit ?? 0,
                operatingExpenses: is?.totalOperatingExpenses ?? 0,
                operatingIncome: is?.operatingIncome ?? is?.ebit ?? 0,
                netIncome: is?.netIncome ?? null,
            },
            balanceSheet: {
                totalAssets: bs?.totalAssets ?? 0,
                currentAssets: bs?.totalCurrentAssets ?? 0,
                nonCurrentAssets: (bs?.totalAssets ?? 0) - (bs?.totalCurrentAssets ?? 0),
                totalLiabilities: bs?.totalLiab ?? 0,
                currentLiabilities: bs?.totalCurrentLiabilities ?? 0,
                nonCurrentLiabilities: (bs?.totalLiab ?? 0) - (bs?.totalCurrentLiabilities ?? 0),
                totalEquity: bs?.totalStockholderEquity ?? 0,
            },
            cashFlow: {
                operating: cf?.totalCashFromOperatingActivities ?? 0,
                investing: cf?.totalCashflowsFromInvestingActivities ?? 0,
                financing: cf?.totalCashFromFinancingActivities ?? 0,
                netCashFlow: cf?.changeInCash ?? 0,
            },
        };
    } catch (err) {
        console.warn(`[Yahoo] Financials error for ${symbol}:`, (err as Error).message);
        return null;
    }
}
