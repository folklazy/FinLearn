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
    exchange: string;
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

        const rawExchange: string = (pr as any)?.exchangeName ?? (pr as any)?.exchange ?? '';
        const exchange = rawExchange.toUpperCase().includes('NASDAQ') ? 'NASDAQ'
            : rawExchange.toUpperCase().includes('NYSE') ? 'NYSE'
            : rawExchange || '';

        return {
            name,
            description: (ap as any)?.longBusinessSummary?.slice(0, 300) ?? '',
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
        const period1 = new Date(Date.now() - 5 * 365 * 86400000);
        const ftOpts = { validateResult: false } as any;

        const [result, finArr, bsArr] = await Promise.all([
            yahooFinance.quoteSummary(symbol, {
                modules: ['financialData', 'defaultKeyStatistics', 'summaryDetail', 'incomeStatementHistory'],
            }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'financials', type: 'annual' }, ftOpts).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'balance-sheet', type: 'annual' }, ftOpts).catch(() => null),
        ]);

        const fd = (result as any)?.financialData;
        const ks = (result as any)?.defaultKeyStatistics;
        const sd = (result as any)?.summaryDetail;
        const is: any[] | undefined = (result as any)?.incomeStatementHistory?.incomeStatementHistory;

        if (!fd && !ks && !sd) return null;

        // fundamentalsTimeSeries rows sorted oldest-first
        const finRows: any[] = Array.isArray(finArr) ? finArr.filter((r: any) => r?.TYPE === 'FINANCIALS') : [];
        const bsRows: any[] = Array.isArray(bsArr) ? bsArr.filter((r: any) => r?.TYPE === 'BALANCE_SHEET') : [];

        // Build revenue history — prefer fundamentalsTimeSeries financials (more complete), fallback to incomeStatementHistory
        const revenueHistory: { year: string; value: number }[] = finRows.length >= 2
            ? finRows.slice(-5).map((s: any) => ({
                year: s.date ? new Date(s.date).getFullYear().toString() : '',
                value: s.totalRevenue ?? 0,
              })).filter((s: any) => s.year)
            : (is ?? []).slice(0, 5).map((s: any) => ({
                year: s.endDate ? new Date(s.endDate).getFullYear().toString() : '',
                value: s.totalRevenue ?? 0,
              })).filter((s: any) => s.year).reverse();

        // Build EPS history — compute from netIncome / ordinarySharesNumber matched by year
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
                return { year: yr, value: shares > 0 ? parseFloat((ni / shares).toFixed(2)) : 0 };
            }).filter((s: any) => s.year);
        } else {
            epsHistory = (is ?? []).slice(0, 5).map((s: any) => ({
                year: s.endDate ? new Date(s.endDate).getFullYear().toString() : '',
                value: s.epsdiluted ?? s.dilutedEps ?? s.eps ?? s.basicEps ?? 0,
            })).filter((s: any) => s.year).reverse();
        }

        // Revenue growth — prefer annual comparison (stable) over quarterly YoY from financialData
        let revenueGrowth: number | null = null;
        if (finRows.length >= 2) {
            const r0 = finRows[finRows.length - 1]?.totalRevenue;
            const r1 = finRows[finRows.length - 2]?.totalRevenue;
            if (r0 && r1) revenueGrowth = ((r0 - r1) / Math.abs(r1)) * 100;
        } else if (is && is.length >= 2 && is[1]?.totalRevenue) {
            revenueGrowth = ((is[0].totalRevenue - is[1].totalRevenue) / Math.abs(is[1].totalRevenue)) * 100;
        } else if (fd?.revenueGrowth != null) {
            revenueGrowth = fd.revenueGrowth * 100;
        }

        // EPS growth — from financialData or computed from EPS history
        let epsGrowth: number | null = null;
        if (fd?.earningsGrowth != null) {
            epsGrowth = fd.earningsGrowth * 100;
        } else if (epsHistory.length >= 2) {
            const e0 = epsHistory[epsHistory.length - 1]?.value;
            const e1 = epsHistory[epsHistory.length - 2]?.value;
            if (e0 != null && e1 != null && e1 !== 0) {
                epsGrowth = ((e0 - e1) / Math.abs(e1)) * 100;
            }
        } else if (is && is.length >= 2) {
            const e0 = is[0]?.epsdiluted ?? is[0]?.eps;
            const e1 = is[1]?.epsdiluted ?? is[1]?.eps;
            if (e0 != null && e1 != null && e1 !== 0) {
                epsGrowth = ((e0 - e1) / Math.abs(e1)) * 100;
            }
        }

        const rawDivYield = (sd as any)?.trailingAnnualDividendYield ?? sd?.dividendYield ?? null;
        return {
            pe: (sd?.trailingPE ?? (fd?.currentPrice && fd?.trailingEps && fd.trailingEps > 0 ? fd.currentPrice / fd.trailingEps : null)) ?? null,
            pb: ks?.priceToBook ?? null,
            dividendYield: rawDivYield != null && rawDivYield > 0 ? parseFloat((rawDivYield * 100).toFixed(2)) : null,
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

        // All historical statement modules broken since Nov 2024 → use fundamentalsTimeSeries
        const [incomeResult, bsArr, cfArr, finArr] = await Promise.all([
            yahooFinance.quoteSummary(symbol, { modules: ['incomeStatementHistory'] }).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'balance-sheet', type: 'annual' }, ftOpts).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'cash-flow', type: 'annual' }, ftOpts).catch(() => null),
            (yahooFinance as any).fundamentalsTimeSeries(symbol, { period1, module: 'financials', type: 'annual' }, ftOpts).catch(() => null),
        ]);

        // incomeStatementHistory fallback (still returns revenue/grossProfit but not EPS)
        const is = (incomeResult as any)?.incomeStatementHistory?.incomeStatementHistory?.[0];
        // fundamentalsTimeSeries results sorted oldest-first; take last entry for most recent
        const bsRows: any[] = Array.isArray(bsArr) ? bsArr.filter((r: any) => r?.TYPE === 'BALANCE_SHEET') : [];
        const cfRows: any[] = Array.isArray(cfArr) ? cfArr.filter((r: any) => r?.TYPE === 'CASH_FLOW') : [];
        const finRows: any[] = Array.isArray(finArr) ? finArr.filter((r: any) => r?.TYPE === 'FINANCIALS') : [];
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
}
