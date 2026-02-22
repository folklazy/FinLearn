import { mockStocks, mockSearchResults, getPopularStocks as getMockPopular } from '../data/mockData';
import { StockData, SearchResult, PricePoint, NewsItem, CompetitorData } from '../types/stock';
import { fmp, finnhub, twelveData } from './cachedProviders';
import { cacheService } from './cacheService';

function marketCapLabel(cap: number): string {
    if (cap >= 200e9) return '🏢 บริษัทขนาดใหญ่มาก (Mega Cap)';
    if (cap >= 10e9) return '🏢 บริษัทขนาดใหญ่ (Large Cap)';
    if (cap >= 2e9) return '🏢 บริษัทขนาดกลาง (Mid Cap)';
    if (cap >= 300e6) return '🏢 บริษัทขนาดเล็ก (Small Cap)';
    return '🏢 บริษัทขนาดจิ๋ว (Micro Cap)';
}

export class StockService {
    /**
     * Get full stock data by symbol — tries real APIs first, falls back to mock
     */
    async getStockData(symbol: string): Promise<StockData | null> {
        const sym = symbol.toUpperCase();

        // 1. Check PostgreSQL cache for assembled StockData
        const cached = await cacheService.get<StockData>('stockdata', 'full', sym);
        if (cached) {
            console.log(`[StockService] ✅ Cache hit for ${sym}`);
            return cached;
        }

        // 2. Try real APIs
        try {
            const data = await this.fetchFromAPIs(sym);
            if (data) {
                // Cache the full assembled StockData for 5 min
                await cacheService.set('stockdata', 'quote', sym, data, sym);
                console.log(`[StockService] ✅ Live data for ${sym}`);
                return data;
            }
        } catch (err) {
            console.warn(`[StockService] API error for ${sym}:`, (err as Error).message);
        }

        // 3. Fallback to mock
        if (mockStocks[sym]) {
            console.log(`[StockService] Using mock data for ${sym}`);
            return mockStocks[sym];
        }

        return null;
    }

    /**
     * Orchestrate multiple API providers to build complete StockData
     * Strategy: FMP profile (free, has price) + Finnhub quote/news/peers + FMP financials + TwelveData technicals
     */
    private async fetchFromAPIs(symbol: string): Promise<StockData | null> {
        // Phase 1: Parallel fetch core data
        const [fmpProfile, finnhubQuote, fmpMetrics, fmpIncome, fmpBalance, fmpCash, fmpHistory, finnhubNews, finnhubPeers, finnhubFinancials] =
            await Promise.all([
                fmp.getProfile(symbol),
                finnhub.getQuote(symbol),
                fmp.getKeyMetrics(symbol),
                fmp.getIncomeStatements(symbol, 5),
                fmp.getBalanceSheet(symbol),
                fmp.getCashFlow(symbol),
                fmp.getHistoricalPrices(symbol, 365),
                finnhub.getNews(symbol, 30),
                finnhub.getPeers(symbol),
                finnhub.getBasicFinancials(symbol),
            ]);

        // Must have at least FMP profile
        if (!fmpProfile) return null;

        // Use Finnhub quote for real-time price, fallback to FMP profile
        const price = finnhubQuote?.c ?? fmpProfile.price;
        const change = finnhubQuote?.d ?? fmpProfile.change;
        const changePercent = finnhubQuote?.dp ?? fmpProfile.changePercentage;

        // Phase 2: Technical indicators from Twelve Data
        const technicals = await twelveData.getAllTechnicals(symbol, price);

        // Parse 52-week range from FMP profile
        const rangeParts = (fmpProfile.range || '').split('-').map(s => parseFloat(s.trim()));
        const week52Low = rangeParts[0] || 0;
        const week52High = rangeParts[1] || 0;

        // Build price history
        const history: PricePoint[] = fmpHistory.map(h => ({
            date: h.date, open: h.open, high: h.high, low: h.low, close: h.close, volume: h.volume,
        })).reverse(); // FMP returns newest first

        // Build news
        const news: NewsItem[] = finnhubNews.slice(0, 5).map((n, i) => ({
            id: String(i + 1),
            title: n.headline,
            summary: n.summary,
            source: n.source,
            date: new Date(n.datetime * 1000).toISOString().split('T')[0],
            url: n.url,
            sentiment: finnhub.classifySentiment(n.headline),
        }));

        // Build revenue/EPS history from income statements
        const revenueHistory = fmpIncome.map(s => ({ year: s.date.slice(0, 4), value: s.revenue })).reverse();
        const epsHistory = fmpIncome.map(s => ({ year: s.date.slice(0, 4), value: s.epsdiluted || s.eps })).reverse();

        // Build competitors from Finnhub peers + FMP profile data
        const competitors: CompetitorData[] = [];
        const peerSymbols = (finnhubPeers || []).filter(p => p !== symbol).slice(0, 4);
        if (peerSymbols.length > 0) {
            const peerProfiles = await Promise.all(peerSymbols.map(p => fmp.getProfile(p)));
            for (let i = 0; i < peerSymbols.length; i++) {
                const pp = peerProfiles[i];
                if (pp) {
                    competitors.push({
                        symbol: peerSymbols[i],
                        name: pp.companyName,
                        marketCap: pp.marketCap,
                        pe: null,
                        profitMargin: 0,
                        revenueGrowth: 0,
                        dividendYield: pp.lastDividend > 0 && pp.price > 0 ? (pp.lastDividend / pp.price) * 100 : null,
                    });
                }
            }
        }

        // Extract metrics
        const pe = fmpMetrics?.peRatioTTM ?? (finnhubFinancials?.peNormalizedAnnual ?? null);
        const roe = fmpMetrics?.roeTTM ?? (finnhubFinancials?.roeTTM ?? 0);
        const profitMargin = fmpMetrics?.netProfitMarginTTM ?? (finnhubFinancials?.netProfitMarginTTM ?? 0);
        const divYield = fmpMetrics?.dividendYieldTTM ?? (finnhubFinancials?.dividendYieldIndicatedAnnual ?? 0);
        const debtToEquity = fmpMetrics?.debtToEquityTTM ?? (finnhubFinancials?.totalDebt2TotalEquityQuarterly ?? 0);
        const currentRatio = fmpMetrics?.currentRatioTTM ?? (finnhubFinancials?.currentRatioQuarterly ?? 0);
        const pb = fmpMetrics?.priceToBookRatioTTM ?? (finnhubFinancials?.pbAnnual ?? null);
        const eps = fmpIncome[0]?.epsdiluted ?? 0;
        const epsGrowth = fmpMetrics?.epsGrowth ?? (finnhubFinancials?.epsGrowth5Y ?? 0);
        const revenueGrowth = fmpMetrics?.revenueGrowth ?? (finnhubFinancials?.revenueGrowth5Y ?? 0);

        // Calculate scores
        const valueScore = pe ? Math.max(1, Math.min(5, 5 - (pe - 15) / 10)) : 3;
        const growthScore = Math.max(1, Math.min(5, 2.5 + revenueGrowth / 10));
        const strengthScore = Math.max(1, Math.min(5, 2 + profitMargin / 10));
        const dividendScore = Math.max(1, Math.min(5, 1 + divYield * 20));
        const riskScore = Math.max(1, Math.min(5, 4 - debtToEquity / 100));
        const overall = parseFloat(((valueScore + growthScore + strengthScore + dividendScore + riskScore) / 5).toFixed(1));

        const fundScore = Math.round(
            (valueScore / 5 * 25) + (growthScore / 5 * 25) + (strengthScore / 5 * 25) + (riskScore / 5 * 25)
        );

        const data: StockData = {
            symbol,
            profile: {
                name: fmpProfile.companyName,
                symbol,
                logo: fmpProfile.image || `https://logo.clearbit.com/${symbol.toLowerCase()}.com`,
                description: `${fmpProfile.companyName} เป็นบริษัทในกลุ่ม ${fmpProfile.sector} อุตสาหกรรม ${fmpProfile.industry}`,
                descriptionEn: fmpProfile.description?.slice(0, 300) || '',
                sector: fmpProfile.sector || 'Other',
                industry: fmpProfile.industry || 'Unknown',
                marketCap: fmpProfile.marketCap,
                marketCapLabel: marketCapLabel(fmpProfile.marketCap),
                employees: parseInt(fmpProfile.fullTimeEmployees) || 0,
                founded: fmpProfile.ipoDate || 'N/A',
                headquarters: [fmpProfile.city, fmpProfile.state, fmpProfile.country].filter(Boolean).join(', '),
                website: fmpProfile.website || '',
                ceo: fmpProfile.ceo || 'N/A',
            },
            price: {
                current: price,
                previousClose: finnhubQuote?.pc ?? (price - change),
                change,
                changePercent,
                high: finnhubQuote?.h ?? price,
                low: finnhubQuote?.l ?? price,
                open: finnhubQuote?.o ?? price,
                volume: fmpProfile.volume,
                avgVolume: fmpProfile.averageVolume,
                week52High,
                week52Low,
                history,
            },
            keyMetrics: {
                pe,
                peIndustryAvg: pe ? parseFloat((pe * 0.9).toFixed(1)) : null,
                pb,
                dividendYield: divYield > 0 ? parseFloat((divYield * 100).toFixed(2)) : null,
                dividendPerShare: fmpMetrics?.dividendPerShareTTM ?? (fmpProfile.lastDividend || null),
                revenue: fmpIncome[0]?.revenue ?? 0,
                revenueGrowth: parseFloat((revenueGrowth * 100).toFixed(1)),
                netIncome: fmpIncome[0]?.netIncome ?? 0,
                profitMargin: parseFloat(profitMargin.toFixed(2)),
                debtToEquity: parseFloat(debtToEquity.toFixed(1)),
                currentRatio: parseFloat(currentRatio.toFixed(2)),
                roe: parseFloat((roe * 100).toFixed(1)),
                eps,
                epsGrowth: parseFloat((epsGrowth * 100).toFixed(1)),
                revenueHistory,
                epsHistory,
            },
            financials: {
                incomeStatement: {
                    revenue: fmpIncome[0]?.revenue ?? 0,
                    costOfRevenue: fmpIncome[0]?.costOfRevenue ?? 0,
                    grossProfit: fmpIncome[0]?.grossProfit ?? 0,
                    operatingExpenses: fmpIncome[0]?.operatingExpenses ?? 0,
                    operatingIncome: fmpIncome[0]?.operatingIncome ?? 0,
                    netIncome: fmpIncome[0]?.netIncome ?? 0,
                },
                balanceSheet: {
                    totalAssets: fmpBalance?.totalAssets ?? 0,
                    currentAssets: fmpBalance?.totalCurrentAssets ?? 0,
                    nonCurrentAssets: fmpBalance?.totalNonCurrentAssets ?? 0,
                    totalLiabilities: fmpBalance?.totalLiabilities ?? 0,
                    currentLiabilities: fmpBalance?.totalCurrentLiabilities ?? 0,
                    nonCurrentLiabilities: fmpBalance?.totalNonCurrentLiabilities ?? 0,
                    totalEquity: fmpBalance?.totalStockholdersEquity ?? 0,
                },
                cashFlow: {
                    operating: fmpCash?.operatingCashFlow ?? 0,
                    investing: fmpCash?.netCashUsedForInvestingActivites ?? 0,
                    financing: fmpCash?.netCashUsedProvidedByFinancingActivities ?? 0,
                    netCashFlow: fmpCash?.netChangeInCash ?? 0,
                },
            },
            news,
            events: [],
            signals: {
                technical: technicals,
                fundamental: {
                    earningsGrowth: epsGrowth > 0 ? 'positive' : epsGrowth < 0 ? 'negative' : 'flat',
                    peVsAvg: pe ? (pe < 20 ? 'undervalued' : pe > 30 ? 'overvalued' : 'fair') : 'fair',
                    cashPosition: currentRatio > 1.5 ? 'strong' : currentRatio > 1 ? 'moderate' : 'weak',
                    debtLevel: debtToEquity < 50 ? 'low' : debtToEquity < 150 ? 'moderate' : 'high',
                    overallScore: fundScore,
                },
                summary: {
                    longTermInvest: Math.round(overall / 5 * 70 + 10),
                    waitForTiming: Math.round((1 - overall / 5) * 30 + 10),
                    notRecommended: Math.max(5, 100 - Math.round(overall / 5 * 70 + 10) - Math.round((1 - overall / 5) * 30 + 10)),
                },
            },
            competitors,
            scores: {
                overall,
                dimensions: {
                    value: parseFloat(valueScore.toFixed(1)),
                    growth: parseFloat(growthScore.toFixed(1)),
                    strength: parseFloat(strengthScore.toFixed(1)),
                    dividend: parseFloat(dividendScore.toFixed(1)),
                    risk: parseFloat(riskScore.toFixed(1)),
                },
            },
            beginnerTips: this.generateTips(overall, pe, divYield, debtToEquity, profitMargin),
        };

        return data;
    }

    /**
     * Auto-generate beginner tips based on metrics
     */
    private generateTips(overall: number, pe: number | null, divYield: number, debtToEquity: number, profitMargin: number) {
        const goodFor: string[] = [];
        const cautionFor: string[] = [];

        if (overall >= 4) goodFor.push('💎 คะแนนรวมสูง เหมาะสำหรับการลงทุนระยะยาว');
        if (pe && pe < 20) goodFor.push('📊 P/E ต่ำ อาจเป็นหุ้นที่ราคาไม่แพง');
        if (divYield > 0.02) goodFor.push('💰 มีเงินปันผล เหมาะสำหรับนักลงทุนที่ต้องการรายได้');
        if (profitMargin > 20) goodFor.push('🏦 อัตรากำไรสูง แสดงว่าบริษัทมีอำนาจในตลาด');
        if (debtToEquity < 50) goodFor.push('🛡️ หนี้ต่ำ ความเสี่ยงทางการเงินน้อย');

        if (pe && pe > 35) cautionFor.push('📈 P/E สูง หุ้นอาจแพงเกินไป');
        if (debtToEquity > 150) cautionFor.push('💳 หนี้สูง มีความเสี่ยงทางการเงิน');
        if (profitMargin < 5) cautionFor.push('📉 อัตรากำไรต่ำ บริษัทอาจมีปัญหาทำกำไร');
        if (overall < 3) cautionFor.push('⚠️ คะแนนรวมต่ำ ควรศึกษาเพิ่มเติมก่อนลงทุน');

        if (goodFor.length === 0) goodFor.push('📘 ศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจ');
        if (cautionFor.length === 0) cautionFor.push('✅ ไม่พบจุดเตือนที่ชัดเจน');

        return {
            goodFor,
            cautionFor,
            relatedLessons: [
                { title: 'P/E Ratio คืออะไร? ทำไมสำคัญ', url: '/learn/pe-ratio' },
                { title: 'วิธีอ่านงบการเงินเบื้องต้น', url: '/learn/financial-statements' },
                { title: 'เงินปันผลคืออะไร?', url: '/learn/dividends' },
            ],
        };
    }

    /**
     * Search stocks — tries FMP API, falls back to mock
     */
    async searchStocks(query: string): Promise<SearchResult[]> {
        try {
            const results = await fmp.searchStocks(query, 10);
            if (results.length > 0) {
                return results.map(r => ({
                    symbol: r.symbol,
                    name: r.name,
                    sector: '',
                    exchange: r.exchangeShortName,
                }));
            }
        } catch (err) {
            console.warn('[StockService] Search API error:', (err as Error).message);
        }

        // Fallback to mock
        const lowerQuery = query.toLowerCase();
        return mockSearchResults.filter(
            (s) =>
                s.symbol.toLowerCase().includes(lowerQuery) ||
                s.name.toLowerCase().includes(lowerQuery) ||
                s.sector.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get popular/featured stocks — uses mock list but enriches with live prices
     */
    async getPopularStocks(): Promise<StockData[]> {
        const mockPopular = getMockPopular();

        // Try to update prices from Finnhub (fast, 60 calls/min)
        try {
            const updated = await Promise.all(
                mockPopular.map(async (stock) => {
                    const quote = await finnhub.getQuote(stock.symbol);
                    if (quote && quote.c > 0) {
                        return {
                            ...stock,
                            price: {
                                ...stock.price,
                                current: quote.c,
                                change: quote.d,
                                changePercent: quote.dp,
                                high: quote.h,
                                low: quote.l,
                                open: quote.o,
                                previousClose: quote.pc,
                            },
                        };
                    }
                    return stock;
                })
            );
            return updated;
        } catch (err) {
            console.warn('[StockService] Popular stocks live price error:', (err as Error).message);
            return mockPopular;
        }
    }
}

export const stockService = new StockService();
