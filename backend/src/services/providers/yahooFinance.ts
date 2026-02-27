// ===== Yahoo Finance Provider =====
// Uses the yahoo-finance2 npm package (no API key required)
// Acts as the primary fallback for price history, financials, and key metrics

// yahoo-finance2 v3 requires instantiation from .default constructor
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceCtor = require('yahoo-finance2').default;
const yahooFinance = new YahooFinanceCtor({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });

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
                value: s.epsdiluted ?? s.dilutedEps ?? s.eps ?? s.basicEps ?? 0,
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
            const e0 = is[0]?.epsdiluted ?? is[0]?.dilutedEps ?? is[0]?.eps ?? is[0]?.basicEps;
            const e1 = is[1]?.epsdiluted ?? is[1]?.dilutedEps ?? is[1]?.eps ?? is[1]?.basicEps;
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
        const period1 = new Date(Date.now() - 5 * 365 * 86400000);
        const ftOpts = { validateResult: false } as any;

        // incomeStatementHistory still returns revenue/netIncome/grossProfit (just not EPS)
        // balanceSheetHistory + cashflowStatementHistory broken since Nov 2024 → use fundamentalsTimeSeries
        const [incomeResult, bsArr, cfArr] = await Promise.all([
            yahooFinance.quoteSummary(symbol, { modules: ['incomeStatementHistory'] }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'balance-sheet', type: 'annual' }, ftOpts).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'cash-flow', type: 'annual' }, ftOpts).catch(() => null),
        ]);

        const is = (incomeResult as any)?.incomeStatementHistory?.incomeStatementHistory?.[0];
        // results are sorted oldest-first; take last entry for most recent annual data
        const bsRows: any[] = Array.isArray(bsArr) ? bsArr.filter((r: any) => r?.TYPE === 'BALANCE_SHEET') : [];
        const cfRows: any[] = Array.isArray(cfArr) ? cfArr.filter((r: any) => r?.TYPE === 'CASH_FLOW') : [];
        const bs = bsRows.length ? bsRows[bsRows.length - 1] : null;
        const cf = cfRows.length ? cfRows[cfRows.length - 1] : null;

        if (!is && !bs && !cf) return null;

        const rev = is?.totalRevenue ?? 0;
        const cogs = is?.costOfRevenue ?? 0;
        const gp = is?.grossProfit ?? (rev && cogs ? rev - cogs : 0);
        const totalLiab = bs?.totalLiabilitiesNetMinorityInterest ?? 0;

        return {
            incomeStatement: {
                revenue: rev,
                costOfRevenue: cogs,
                grossProfit: gp,
                operatingExpenses: is?.totalOperatingExpenses ?? is?.operatingExpenses ?? 0,
                operatingIncome: is?.operatingIncome ?? is?.ebit ?? 0,
                netIncome: is?.netIncome ?? null,
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
}
