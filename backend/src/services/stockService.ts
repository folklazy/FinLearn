import { mockStocks, mockSearchResults, getPopularStocks as getMockPopular } from '../data/mockData';
import { StockData, SearchResult, PricePoint, NewsItem, CompetitorData } from '../types/stock';
import { fmp, finnhub, twelveData, yahoo, wikipedia } from './cachedProviders';
import { cacheService } from './cacheService';
import { SP500_CONSTITUENTS, SP500_SECTORS } from '../data/sp500';
import { POPULAR_STOCKS, MAJOR_EXCHANGES } from '../data/popularStocks';

/** Translate English text to Thai using Google Translate free endpoint */
async function translateToThai(text: string): Promise<string> {
    if (!text || text.length < 20) return '';
    try {
        const trimmed = text.slice(0, 1500); // keep within reasonable size
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=th&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return '';
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
            return data[0].map((seg: any[]) => seg[0] || '').join('');
        }
        return '';
    } catch (err) {
        console.warn('[Translate] Error:', (err as Error).message);
        return '';
    }
}

function normalizeExchange(ex: string): string {
    if (!ex) return '';
    const u = ex.toUpperCase();
    if (u.includes('NASDAQ')) return 'NASDAQ';
    if (u.includes('NYSE ARCA') || u.includes('NYSEARCA')) return 'NYSE ARCA';
    if (u.includes('NEW YORK') || u === 'NYSE') return 'NYSE';
    if (u.includes('AMEX') || u.includes('AMERICAN STOCK')) return 'AMEX';
    if (u.includes('OTC') || u.includes('PINK')) return 'OTC';
    if (u.includes('CBOE')) return 'CBOE';
    return ex;
}

/** Known symbol → domain overrides for stocks with short/ambiguous tickers */
const SYMBOL_DOMAINS: Record<string, string> = {
    // Single-letter / two-letter symbols
    'A': 'agilent.com', 'B': 'barnescorp.com', 'C': 'citigroup.com', 'D': 'dominionenergy.com',
    'E': 'eni.com', 'F': 'ford.com', 'G': 'genpact.com', 'H': 'hyatt.com',
    'I': 'inteliq.com', 'J': 'jacobs.com', 'K': 'kellanova.com', 'L': 'loews.com',
    'M': 'macy.com', 'N': 'netsuite.com', 'O': 'realtyincome.com', 'P': 'pandora.net',
    'Q': 'qantas.com', 'R': 'ryder.com', 'S': 'sentinelone.com', 'T': 'att.com',
    'U': 'unity.com', 'V': 'visa.com', 'W': 'wayfair.com', 'X': 'ussteel.com',
    'Y': 'yum.com', 'Z': 'zillow.com',
    'AI': 'c3.ai', 'ON': 'onsemi.com', 'SE': 'sea.com', 'NU': 'nu.com.br',
    'LI': 'lixiang.com', 'JD': 'jd.com', 'TD': 'td.com', 'TM': 'toyota.com',
    // Common well-known tickers
    'AAPL': 'apple.com', 'MSFT': 'microsoft.com', 'GOOGL': 'google.com', 'GOOG': 'google.com',
    'AMZN': 'amazon.com', 'META': 'meta.com', 'TSLA': 'tesla.com', 'NVDA': 'nvidia.com',
    'NFLX': 'netflix.com', 'SPOT': 'spotify.com', 'UBER': 'uber.com', 'LYFT': 'lyft.com',
    'SNAP': 'snap.com', 'PINS': 'pinterest.com', 'HOOD': 'robinhood.com', 'COIN': 'coinbase.com',
    'SHOP': 'shopify.com', 'SNOW': 'snowflake.com', 'DDOG': 'datadoghq.com', 'CRWD': 'crowdstrike.com',
    'PLTR': 'palantir.com', 'ABNB': 'airbnb.com', 'DASH': 'doordash.com', 'RBLX': 'roblox.com',
    'DUOL': 'duolingo.com', 'TWLO': 'twilio.com', 'OKTA': 'okta.com', 'NET': 'cloudflare.com',
    'ZS': 'zscaler.com', 'MDB': 'mongodb.com', 'PATH': 'uipath.com', 'CFLT': 'confluent.io',
    'BILL': 'bill.com', 'TTD': 'thetradedesk.com', 'ETSY': 'etsy.com', 'CHWY': 'chewy.com',
    'LULU': 'lululemon.com', 'DKS': 'dickssportinggoods.com', 'GME': 'gamestop.com',
    'AMC': 'amctheatres.com', 'MSTR': 'microstrategy.com', 'MARA': 'mara.com',
    'RIOT': 'riotplatforms.com', 'IBIT': 'ishares.com', 'SPY': 'ssga.com',
    'QQQ': 'invesco.com', 'VOO': 'vanguard.com', 'VTI': 'vanguard.com',
    'SCHD': 'schwab.com', 'GLD': 'spdrgoldshares.com', 'TLT': 'ishares.com',
    'BABA': 'alibaba.com', 'NIO': 'nio.com', 'PDD': 'pddholdings.com', 'BIDU': 'baidu.com',
    'XPEV': 'xpeng.com', 'BILI': 'bilibili.com', 'FUTU': 'futuhk.com',
    'TSM': 'tsmc.com', 'ASML': 'asml.com', 'ARM': 'arm.com', 'SONY': 'sony.com',
    'NVO': 'novonordisk.com', 'SAP': 'sap.com', 'MELI': 'mercadolibre.com',
    'GRAB': 'grab.com', 'MRNA': 'modernatx.com', 'BNTX': 'biontech.com',
    'SMCI': 'supermicro.com', 'MRVL': 'marvell.com', 'ENPH': 'enphase.com',
    // Major S&P 500 stocks
    'JPM': 'jpmorganchase.com', 'BAC': 'bankofamerica.com', 'WFC': 'wellsfargo.com',
    'GS': 'goldmansachs.com', 'MS': 'morganstanley.com', 'BLK': 'blackrock.com',
    'UNH': 'unitedhealthgroup.com', 'JNJ': 'jnj.com', 'PFE': 'pfizer.com',
    'ABBV': 'abbvie.com', 'MRK': 'merck.com', 'ABT': 'abbott.com', 'LLY': 'lilly.com',
    'TMO': 'thermofisher.com', 'DHR': 'danaher.com', 'MDT': 'medtronic.com',
    'BMY': 'bmy.com', 'AMGN': 'amgen.com', 'GILD': 'gilead.com', 'ISRG': 'intuitive.com',
    'MA': 'mastercard.com', 'AXP': 'americanexpress.com', 'BRK-B': 'berkshirehathaway.com',
    'AVGO': 'broadcom.com', 'INTC': 'intel.com', 'AMD': 'amd.com', 'QCOM': 'qualcomm.com',
    'TXN': 'ti.com', 'AMAT': 'appliedmaterials.com', 'LRCX': 'lamresearch.com',
    'KLAC': 'kla.com', 'MU': 'micron.com', 'WDC': 'westerndigital.com',
    'CRM': 'salesforce.com', 'ORCL': 'oracle.com', 'ADBE': 'adobe.com',
    'NOW': 'servicenow.com', 'INTU': 'intuit.com', 'ADP': 'adp.com',
    'PYPL': 'paypal.com', 'FIS': 'fisglobal.com', 'FISV': 'fiserv.com',
    'COST': 'costco.com', 'WMT': 'walmart.com', 'HD': 'homedepot.com', 'LOW': 'lowes.com',
    'TGT': 'target.com', 'MCD': 'mcdonalds.com', 'SBUX': 'starbucks.com',
    'NKE': 'nike.com', 'PG': 'pg.com', 'KO': 'coca-cola.com', 'PEP': 'pepsico.com',
    'PM': 'pmi.com', 'MO': 'altria.com', 'CL': 'colgate.com',
    'XOM': 'exxonmobil.com', 'CVX': 'chevron.com', 'COP': 'conocophillips.com',
    'LIN': 'linde.com', 'APD': 'airproducts.com', 'ECL': 'ecolab.com',
    'NEE': 'nexteraenergy.com', 'DUK': 'duke-energy.com', 'SO': 'southerncompany.com',
    'RTX': 'rtx.com', 'LMT': 'lockheedmartin.com', 'BA': 'boeing.com', 'GD': 'gd.com',
    'NOC': 'northropgrumman.com', 'GE': 'ge.com', 'HON': 'honeywell.com', 'MMM': '3m.com',
    'CAT': 'cat.com', 'DE': 'deere.com', 'UPS': 'ups.com', 'FDX': 'fedex.com',
    'DIS': 'thewaltdisneycompany.com', 'CMCSA': 'comcast.com',
    'VZ': 'verizon.com', 'TMUS': 't-mobile.com',
};

/** Finnhub static logo CDN — publicly accessible SVG logos for US stocks (same source the detail page uses) */
function finnhubLogo(symbol: string): string {
    return `https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/${symbol.toUpperCase()}.svg`;
}

/** Build a logo URL. Prefer direct logo URL, fallback to Finnhub static logo CDN */
function buildLogoUrl(directLogo: string | undefined | null, website: string | undefined | null, symbol: string): string {
    // 1. Direct logo URL from provider (e.g. Finnhub profile) — but reject FMP image-stock URLs (need auth in browser)
    if (directLogo && !directLogo.includes('financialmodelingprep.com/image-stock')) return directLogo;
    // 2. Finnhub static logo CDN — works for most US-listed stocks
    return finnhubLogo(symbol);
}

/**
 * Normalize any sector/industry name to a standard GICS-like sector.
 * FMP, Finnhub, and Yahoo all use different naming conventions.
 * This maps them all to a consistent set that matches S&P 500 data.
 * IMPORTANT: More specific compound terms are checked BEFORE generic single words
 * to prevent e.g. "Internet Retail" matching Technology via "internet".
 */
function normalizeSector(raw: string): string {
    if (!raw) return '';
    const l = raw.toLowerCase().trim();
    if (l === 'other' || l === 'unknown' || l === 'n/a') return '';

    // ── Phase 1: Exact / compound matches (most specific first) ──

    // Consumer Discretionary — must check "internet retail", "auto" etc. BEFORE Technology catches "internet"
    if (/\b(consumer cyclical|consumer discretionary|internet retail|e-commerce|auto manufacturer|automobile|auto dealer|auto part|apparel|restaurant|leisure|hotel|travel|luxury|home improvement|homebuilder|department store|specialty retail|footwear|home furnish|gambling|resort)\b/.test(l))
        return 'Consumer Discretionary';
    // "retail" alone (not "internet retail" which matched above)
    if (l === 'retail' || /\bretail\b/.test(l)) return 'Consumer Discretionary';

    // Communication Services — "internet content", "media", etc. before Technology catches "internet"
    if (/\b(communication service|internet content|social media|entertainment|gaming|advertising|broadcast|telecom|publishing|interactive media|cable television|electronic gaming)\b/.test(l))
        return 'Communication Services';
    if (l === 'communication services' || l === 'media') return 'Communication Services';

    // Consumer Staples / Defensive
    if (/\b(consumer defensive|consumer staples|food|beverage|tobacco|household|personal product|grocery|packaged goods|farm product|confection)\b/.test(l))
        return 'Consumer Staples';

    // Financials — check "financial" before generic terms
    if (/\b(financial|banking|bank|insurance|asset management|capital market|credit service|fintech|payment|brokerage|diversified financial|mortgage|exchange traded)\b/.test(l))
        return 'Financials';

    // Healthcare
    if (/\b(health|medical|biotech|pharma|drug|diagnostic|hospital|therapeutics|medical device|medical instrument)\b/.test(l))
        return 'Healthcare';

    // Energy
    if (/\b(energy|oil|gas|petroleum|solar|wind|renewable|fossil|coal|exploration|refining|uranium)\b/.test(l))
        return 'Energy';

    // Industrials
    if (/\b(industrial|aerospace|defense|machinery|construction|engineering|logistics|freight|manufacturing|conglomerate|building product|waste management|rental|staffing|trucking|railroad|airline)\b/.test(l))
        return 'Industrials';

    // Real Estate
    if (/\b(real estate|reit|property)\b/.test(l))
        return 'Real Estate';

    // Materials
    if (/\b(basic material|material|chemical|mining|metal|steel|gold|silver|paper|packaging|fertilizer|lumber|copper|aluminum)\b/.test(l))
        return 'Materials';

    // Utilities
    if (/\b(utilit|electric|water|gas distribution|regulated|independent power)\b/.test(l))
        return 'Utilities';

    // ── Phase 2: Technology (generic — checked last so compound terms above win) ──
    if (/\b(technology|information technology|software|semiconductor|electronic|computer|hardware|it service|data processing|cloud|saas|cyber|artificial intelligence)\b/.test(l))
        return 'Technology';

    return raw; // return as-is if no match
}

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
                // Cache the full assembled StockData (TTL = quote = 2 min)
                await cacheService.set('stockdata', 'full', sym, data, sym);
                console.log(`[StockService] ✅ Live data for ${sym}`);
                return data;
            }
        } catch (err) {
            console.log(`[StockService] ERROR for ${sym}:`, (err as Error).message, (err as Error).stack?.split('\n')[1]);
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
     * Strategy: FMP profile (cached) + Finnhub quote/news/peers + Yahoo financials/metrics/history + TwelveData technicals
     */
    private async fetchFromAPIs(symbol: string): Promise<StockData | null> {
        // Phase 1: Parallel fetch from all providers
        // FMP free tier is heavily rate-limited (429s) — only fetch profile (usually cached)
        // Yahoo Finance provides all financials, metrics, and history without API key limits
        const [fmpProfile, finnhubProfile, finnhubQuote, finnhubNews, finnhubPeers, finnhubFinancials, yahooMetrics, yahooFinancials] =
            await Promise.all([
                fmp.getProfile(symbol).catch(() => null),
                finnhub.getProfile(symbol).catch(() => null),
                finnhub.getQuote(symbol).catch(() => null),
                finnhub.getNews(symbol, 30).catch(() => []),
                finnhub.getPeers(symbol).catch(() => []),
                finnhub.getBasicFinancials(symbol).catch(() => null),
                yahoo.getKeyMetrics(symbol).catch(() => null),
                yahoo.getFinancials(symbol).catch(() => null),
            ]);

        // Yahoo profile is now embedded in getKeyMetrics (assetProfile+price modules)
        // This saves a separate Yahoo API call that was getting 429'd on crumb requests
        const yahooProfile = yahooMetrics?.profile ?? null;

        // Need at least one profile source to build the page
        if (!fmpProfile && !finnhubProfile && !yahooProfile) return null;

        // Merge profile — FMP → Finnhub → Yahoo fallback chain
        const profileName = fmpProfile?.companyName || finnhubProfile?.name || yahooProfile?.name || symbol;
        // Logo: Finnhub direct → Finnhub static CDN fallback
        const profileWebsiteForLogo = fmpProfile?.website || finnhubProfile?.weburl || yahooProfile?.website || '';
        const profileLogo = buildLogoUrl(finnhubProfile?.logo || fmpProfile?.image, profileWebsiteForLogo || null, symbol);
        // Prefer Yahoo sector/industry — it uses proper GICS classification
        // FMP free tier returns simplified names (e.g. "Automobiles" instead of "Consumer Cyclical")
        const rawSector = yahooProfile?.sector || fmpProfile?.sector || finnhubProfile?.finnhubIndustry || 'Other';
        const rawIndustry = yahooProfile?.industry || fmpProfile?.industry || finnhubProfile?.finnhubIndustry || 'Unknown';
        const profileSector = rawSector;
        const profileIndustry = rawIndustry;
        const profileMarketCap = fmpProfile?.marketCap || (finnhubProfile?.marketCapitalization ? finnhubProfile.marketCapitalization * 1e6 : 0) || yahooProfile?.marketCap || 0;
        const profileWebsite = fmpProfile?.website || finnhubProfile?.weburl || yahooProfile?.website || '';
        const profileEmployees = parseInt(fmpProfile?.fullTimeEmployees || '0') || yahooProfile?.employees || 0;
        const profileIpo = fmpProfile?.ipoDate || finnhubProfile?.ipo || 'N/A';
        const profileHQ = fmpProfile ? [fmpProfile.city, fmpProfile.state, fmpProfile.country].filter(Boolean).join(', ') : (finnhubProfile?.country || yahooProfile?.headquarters || '');
        const profileCeo = fmpProfile?.ceo || yahooProfile?.ceo || 'N/A';
        // Description: FMP → Yahoo → Wikipedia (free, no rate limit) → generic fallback
        let profileDescEn = fmpProfile?.description?.slice(0, 800) || yahooProfile?.description || '';
        if (!profileDescEn || profileDescEn.length < 150) {
            const wikiDesc = await wikipedia.getDescription(profileName, symbol).catch(() => null);
            if (wikiDesc && wikiDesc.length > (profileDescEn?.length || 0)) profileDescEn = wikiDesc;
        }
        if (!profileDescEn) profileDescEn = `${profileName} is a company in the ${profileSector} sector, ${profileIndustry} industry.`;

        // Translate English description to Thai
        const translatedDesc = await translateToThai(profileDescEn);
        console.log(`[StockService] ${symbol} translate: en=${profileDescEn.length}ch → th=${translatedDesc.length}ch`);

        const sectorThMap: Record<string, string> = {
            'Technology': 'เทคโนโลยี', 'Healthcare': 'สุขภาพ', 'Health Care': 'สุขภาพ',
            'Financial Services': 'บริการทางการเงิน',
            'Consumer Cyclical': 'สินค้าอุปโภคบริโภค', 'Consumer Defensive': 'สินค้าจำเป็น',
            'Communication Services': 'สื่อสาร', 'Industrials': 'อุตสาหกรรม', 'Energy': 'พลังงาน',
            'Real Estate': 'อสังหาริมทรัพย์', 'Utilities': 'สาธารณูปโภค', 'Basic Materials': 'วัตถุดิบ',
            'Materials': 'วัตถุดิบ',
        };
        const sectorTh = sectorThMap[profileSector] || profileSector;
        const mcapTh = profileMarketCap >= 200e9 ? 'บริษัทขนาดใหญ่มาก (Mega Cap)' : profileMarketCap >= 10e9 ? 'บริษัทขนาดใหญ่ (Large Cap)' : profileMarketCap >= 2e9 ? 'บริษัทขนาดกลาง (Mid Cap)' : 'บริษัทขนาดเล็ก (Small Cap)';
        const mcapFormatted = profileMarketCap >= 1e12 ? `$${(profileMarketCap / 1e12).toFixed(2)} ล้านล้าน` : profileMarketCap >= 1e9 ? `$${(profileMarketCap / 1e9).toFixed(2)} พันล้าน` : profileMarketCap >= 1e6 ? `$${(profileMarketCap / 1e6).toFixed(0)} ล้าน` : '';
        // Build auto-generated Thai facts
        const facts: string[] = [];
        facts.push(`${profileName} เป็น${mcapTh}ในกลุ่ม${sectorTh} อุตสาหกรรม ${profileIndustry}`);
        if (mcapFormatted) facts.push(`มูลค่าตลาดประมาณ ${mcapFormatted}`);
        if (profileHQ) facts.push(`สำนักงานใหญ่ตั้งอยู่ที่ ${profileHQ}`);
        if (profileCeo && profileCeo !== 'N/A') facts.push(`CEO คือ ${profileCeo}`);
        if (profileEmployees) facts.push(`มีพนักงานประมาณ ${profileEmployees.toLocaleString()} คน`);
        if (profileIpo && profileIpo !== 'N/A') facts.push(`เข้าตลาดหลักทรัพย์เมื่อปี ${profileIpo.split('-')[0]}`);
        if (profileWebsite) facts.push(`เว็บไซต์: ${profileWebsite}`);
        // Combine: translated description + auto-generated facts
        const profileDescTh = translatedDesc
            ? `${translatedDesc}\n\n${facts.join(' · ')}`
            : facts.join(' · ');

        // Use Finnhub quote for real-time price, fallback to FMP profile, then 0
        const price = finnhubQuote?.c ?? fmpProfile?.price ?? 0;
        const change = finnhubQuote?.d ?? fmpProfile?.change ?? 0;
        const changePercent = finnhubQuote?.dp ?? fmpProfile?.changePercentage ?? 0;

        // Phase 2: Technical indicators from Twelve Data
        const technicals = await twelveData.getAllTechnicals(symbol, price).catch(() => ({ ma50: 'above' as const, ma200: 'above' as const, rsi: 50, rsiSignal: 'neutral' as const, macd: 'neutral' as const, overallScore: 50 }));

        // Parse 52-week range — FMP "low-high" string or Finnhub metrics
        const rangeStr = fmpProfile?.range || '';
        const dashIdx = rangeStr.lastIndexOf('-');
        const week52Low = (dashIdx > 0 ? parseFloat(rangeStr.slice(0, dashIdx)) : NaN) || finnhubFinancials?.['52WeekLow'] || 0;
        const week52High = (dashIdx > 0 ? parseFloat(rangeStr.slice(dashIdx + 1)) : NaN) || finnhubFinancials?.['52WeekHigh'] || 0;

        // Build price history from Yahoo Finance (FMP free tier too rate-limited)
        // Fallback to TwelveData if Yahoo returns 0 points
        const yhist = await yahoo.getHistoricalPrices(symbol, 1825);
        let history: PricePoint[] = yhist.filter(h => h.close != null && h.close > 0);
        console.log(`[StockService] Yahoo history for ${symbol}: ${history.length} points`);
        if (history.length === 0) {
            try {
                const tdHist = await twelveData.getTimeSeries(symbol, 365);
                history = tdHist
                    .filter(h => h.close && parseFloat(h.close) > 0)
                    .map(h => ({
                        date: h.datetime.split(' ')[0],
                        open: parseFloat(h.open) || 0,
                        high: parseFloat(h.high) || 0,
                        low: parseFloat(h.low) || 0,
                        close: parseFloat(h.close),
                        volume: parseInt(h.volume) || 0,
                    }))
                    .reverse(); // TwelveData returns newest-first
                console.log(`[StockService] TwelveData fallback history for ${symbol}: ${history.length} points`);
            } catch (e) {
                console.warn(`[StockService] TwelveData history fallback failed for ${symbol}:`, (e as Error).message);
            }
        }

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

        // Build revenue/EPS history from Yahoo Finance
        const revenueHistory = yahooMetrics?.revenueHistory ?? [];
        const epsHistory = yahooMetrics?.epsHistory ?? [];

        // Build competitors — use all sector/industry data from every API
        const competitors: CompetitorData[] = [];

        // Normalize sector from all sources for matching
        const normalizedSector = normalizeSector(profileSector);
        const normalizedIndustry = normalizeSector(profileIndustry);
        const normalizedFinnhub = normalizeSector(finnhubProfile?.finnhubIndustry || '');
        const normalizedFmpSector = normalizeSector(fmpProfile?.sector || '');
        const matchNormalized = [...new Set([normalizedSector, normalizedIndustry, normalizedFinnhub, normalizedFmpSector].filter(Boolean))];
        console.log(`[StockService] ${symbol} sector matching: raw=(${profileSector}/${profileIndustry}) normalized=(${matchNormalized.join(',')})`);

        // Step 1: Finnhub peers — filter out non-US symbols
        const finnhubCandidates = (finnhubPeers || [])
            .filter(p => p !== symbol && !p.includes('.'))
            .slice(0, 10);

        // Step 2: S&P 500 same-sector stocks — always gather these
        let sp500Candidates: string[] = [];
        if (matchNormalized.length > 0) {
            sp500Candidates = SP500_CONSTITUENTS
                .filter(s => {
                    if (s.symbol === symbol) return false;
                    if (finnhubCandidates.includes(s.symbol)) return false;
                    const sp500Norm = normalizeSector(s.sector);
                    return matchNormalized.includes(sp500Norm);
                })
                .sort((a, b) => b.name.localeCompare(a.name))
                .slice(0, 8)
                .map(s => s.symbol);
        }

        // Step 3: Description-based fallback when sector is unknown/other and no peers found
        if (finnhubCandidates.length === 0 && sp500Candidates.length === 0 && profileDescEn) {
            const descNorm = normalizeSector(profileDescEn);
            if (descNorm) {
                sp500Candidates = SP500_CONSTITUENTS
                    .filter(s => s.symbol !== symbol && normalizeSector(s.sector) === descNorm)
                    .slice(0, 8)
                    .map(s => s.symbol);
                if (sp500Candidates.length > 0) {
                    console.log(`[StockService] ${symbol} description-based sector fallback (${descNorm}): ${sp500Candidates.join(',')}`);
                }
            }
        }

        // Combine: Finnhub peers + S&P 500 sector peers, deduplicated, cap at 8
        const peerCandidates = [...new Set([...finnhubCandidates, ...sp500Candidates])].slice(0, 8);

        if (finnhubCandidates.length > 0) console.log(`[StockService] ${symbol} Finnhub peers: ${finnhubCandidates.join(',')}`);
        if (sp500Candidates.length > 0) console.log(`[StockService] ${symbol} S&P 500 sector peers: ${sp500Candidates.join(',')}`);

        if (peerCandidates.length > 0) {
            // ── Phase 1: Profiles via Finnhub (free, no crumbs) + S&P 500 data ──
            // Do NOT use Yahoo getProfile for peers — crumb 429 kills all 8 parallel calls
            const peerFinnhubProfiles = await Promise.all(
                peerCandidates.map(p => finnhub.getProfile(p).catch(() => null))
            );

            // Build lightweight candidate list from Finnhub profiles + S&P 500 data
            const profileCandidates: { sym: string; name: string; marketCap: number; normSector: string; divYield: number | null }[] = [];
            for (let i = 0; i < peerCandidates.length; i++) {
                const fp = peerFinnhubProfiles[i];
                const sp = SP500_CONSTITUENTS.find(s => s.symbol === peerCandidates[i]);
                const peerRawSector = fp?.finnhubIndustry || sp?.sector || '';
                profileCandidates.push({
                    sym: peerCandidates[i],
                    name: fp?.name || sp?.name || peerCandidates[i],
                    marketCap: fp?.marketCapitalization ? fp.marketCapitalization * 1e6 : 0,
                    normSector: normalizeSector(peerRawSector),
                    divYield: null,
                });
            }

            // Sort: same sector first → rest, by market cap desc
            const sameSector = profileCandidates.filter(c => matchNormalized.includes(c.normSector));
            const rest = profileCandidates.filter(c => !sameSector.includes(c));
            const sorted = [
                ...sameSector.sort((a, b) => b.marketCap - a.marketCap),
                ...rest.sort((a, b) => b.marketCap - a.marketCap),
            ];
            const picks = sorted.slice(0, 4);

            // ── Phase 2: Metrics for picked peers — sequential Yahoo to avoid 429, parallel Finnhub ──
            for (const p of picks) {
                const [ym, ff] = await Promise.all([
                    yahoo.getKeyMetrics(p.sym).catch(() => null),
                    finnhub.getBasicFinancials(p.sym).catch(() => null),
                ]);
                // Mirror main-stock pe logic: Finnhub peNormalizedAnnual → Yahoo pe → calculate from price/EPS
                const rawPe = ff?.peNormalizedAnnual ?? ym?.pe ?? null;
                let cPe = rawPe != null && rawPe > 0 && rawPe < 500 ? parseFloat(rawPe.toFixed(1)) : null;
                if (cPe == null && ym?.eps && ym.eps > 0) {
                    const fq = await finnhub.getQuote(p.sym).catch(() => null);
                    if (fq?.c && fq.c > 0) {
                        const calc = fq.c / ym.eps;
                        if (calc > 0 && calc < 500) cPe = parseFloat(calc.toFixed(1));
                    }
                }
                const cPm = ym?.profitMargin != null ? parseFloat(ym.profitMargin.toFixed(2)) : null;
                const cRg = ym?.revenueGrowth != null ? parseFloat(ym.revenueGrowth.toFixed(1)) : null;
                console.log(`[StockService] Peer ${p.sym}: pe=${cPe} (finnhub=${ff?.peNormalizedAnnual} yahoo=${ym?.pe}) pm=${cPm} rg=${cRg} rev=${ym?.revenue} ni=${ym?.netIncome}`);
                competitors.push({
                    symbol: p.sym,
                    name: p.name,
                    marketCap: p.marketCap,
                    pe: cPe,
                    profitMargin: cPm ?? 0,
                    revenueGrowth: cRg ?? 0,
                    dividendYield: p.divYield ?? ff?.dividendYieldIndicatedAnnual ?? ym?.dividendYield ?? null,
                });
            }
        }

        // Compute growth from Yahoo annual history
        const yahooRevHist = yahooMetrics?.revenueHistory ?? [];
        const yahooRevGrowth = yahooRevHist.length >= 2
            ? (() => {
                const sorted = [...yahooRevHist].sort((a, b) => a.year.localeCompare(b.year));
                const r0 = sorted[sorted.length - 1]?.value;
                const r1 = sorted[sorted.length - 2]?.value;
                return r0 && r1 ? ((r0 - r1) / Math.abs(r1)) * 100 : null;
            })()
            : null;
        const yahooEpsHist = yahooMetrics?.epsHistory ?? [];
        const yahooEpsGrowth = yahooEpsHist.length >= 2
            ? (() => {
                const sorted = [...yahooEpsHist].sort((a, b) => a.year.localeCompare(b.year));
                const e0 = sorted[sorted.length - 1]?.value;
                const e1 = sorted[sorted.length - 2]?.value;
                return e0 != null && e1 != null && e1 !== 0 ? ((e0 - e1) / Math.abs(e1)) * 100 : null;
            })()
            : null;

        // Extract metrics — Finnhub (percentage) → Yahoo Finance (percentage)
        // FMP free tier removed from metrics chain due to persistent 429 rate limits
        const peRaw = finnhubFinancials?.peNormalizedAnnual ?? yahooMetrics?.pe ?? null;
        const roeRaw = finnhubFinancials?.roeTTM ?? yahooMetrics?.roe ?? 0;
        const profitMarginRaw = finnhubFinancials?.netProfitMarginTTM ?? yahooMetrics?.profitMargin ?? 0;
        // Resolve dividendPerShare first so we can compute yield from it (most accurate)  
        const resolvedDivPerShare = (fmpProfile?.lastDividend || null) ?? yahooMetrics?.dividendPerShare ?? null;
        const divYieldFromPerShare = resolvedDivPerShare != null && resolvedDivPerShare > 0 && price > 0
            ? parseFloat(((resolvedDivPerShare / price) * 100).toFixed(2))
            : null;
        // divYieldFromPerShare overrides stale pre-computed yields
        const divYieldRaw = divYieldFromPerShare
            || finnhubFinancials?.dividendYieldIndicatedAnnual
            || yahooMetrics?.dividendYield
            || 0;
        // D/E: Finnhub → Yahoo → compute from balance sheet
        const debtToEquityRaw = finnhubFinancials?.totalDebt2TotalEquityQuarterly ?? yahooMetrics?.debtToEquity ?? null;
        const debtToEquity = debtToEquityRaw != null ? debtToEquityRaw
            : (yahooFinancials?.balanceSheet.totalLiabilities && yahooFinancials?.balanceSheet.totalEquity && yahooFinancials.balanceSheet.totalEquity > 0)
                ? parseFloat((yahooFinancials.balanceSheet.totalLiabilities / yahooFinancials.balanceSheet.totalEquity * 100).toFixed(1))
                : null;
        const currentRatio = finnhubFinancials?.currentRatioQuarterly ?? yahooMetrics?.currentRatio ?? null;
        const pb = finnhubFinancials?.pbAnnual ?? yahooMetrics?.pb ?? null;
        // EPS: Yahoo → Finnhub fallback
        const eps = yahooMetrics?.eps || finnhubFinancials?.epsAnnual || 0;
        // PE: trust provider PE if available; only guard for absurd values
        // Fallback: calculate PE from price / EPS when providers don't return it
        let pe = peRaw != null && peRaw > 0 && peRaw < 500 ? parseFloat(peRaw.toFixed(1)) : null;
        if (pe == null && eps > 0 && price > 0) {
            const calcPe = price / eps;
            if (calcPe > 0 && calcPe < 500) {
                pe = parseFloat(calcPe.toFixed(1));
                console.log(`[StockService] ${symbol} PE calculated from price/EPS: ${price}/${eps} = ${pe}`);
            }
        }
        // Yahoo annual comparison is primary growth source
        const epsGrowthRaw = yahooEpsGrowth ?? yahooMetrics?.epsGrowth ?? finnhubFinancials?.epsGrowth5Y ?? 0;
        const revenueGrowthRaw = yahooRevGrowth ?? yahooMetrics?.revenueGrowth ?? finnhubFinancials?.revenueGrowth5Y ?? 0;

        console.log(`[StockService] ${symbol} metrics: eps=${eps} pe=${pe} peRaw=${peRaw} rev=${yahooMetrics?.revenue} de=${debtToEquity} revHist=${revenueHistory.length} epsHist=${epsHistory.length}`);

        // Volume fallback: Finnhub → Yahoo
        const finnhubAvgVol = finnhubFinancials?.['10DayAverageTradingVolume'];
        const volumeFallback = finnhubAvgVol ? Math.round(finnhubAvgVol * 1e6) : 0;

        // Calculate scores (all values are now in percentage form)
        // Guard: if we have zero meaningful data, scores stay at 0
        const hasMetricData = pe !== null || revenueGrowthRaw !== 0 || profitMarginRaw !== 0 || divYieldRaw !== 0 || debtToEquity !== null;
        const valueScore = hasMetricData ? (pe ? Math.max(1, Math.min(5, 5 - (pe - 15) / 10)) : 3) : 0;
        const growthScore = hasMetricData ? Math.max(1, Math.min(5, 2.5 + revenueGrowthRaw / 10)) : 0;
        const strengthScore = hasMetricData ? Math.max(1, Math.min(5, 2 + profitMarginRaw / 10)) : 0;
        // If no dividend: score neutral (2.5) for high-growth stocks, mild penalty (1.5) for low-growth — avoids unfairly punishing NVDA/GOOGL/META
        const dividendScore = hasMetricData ? (divYieldRaw > 0
            ? Math.max(1, Math.min(5, 1 + divYieldRaw / 5))
            : revenueGrowthRaw >= 15 ? 2.5 : revenueGrowthRaw >= 5 ? 2.0 : 1.5) : 0;
        const riskScore = hasMetricData ? Math.max(1, Math.min(5, 4 - (debtToEquity ?? 50) / 100)) : 0;
        const overall = hasMetricData ? parseFloat(((valueScore + growthScore + strengthScore + dividendScore + riskScore) / 5).toFixed(1)) : 0;

        const fundScore = hasMetricData ? Math.round(
            (valueScore / 5 * 25) + (growthScore / 5 * 25) + (strengthScore / 5 * 25) + (riskScore / 5 * 25)
        ) : 0;

        const data: StockData = {
            symbol,
            profile: {
                name: profileName,
                symbol,
                logo: profileLogo,
                description: profileDescTh,
                descriptionEn: profileDescEn,
                sector: profileSector,
                industry: profileIndustry,
                exchange: normalizeExchange(fmpProfile?.exchange || yahooProfile?.exchange || ''),
                marketCap: profileMarketCap,
                marketCapLabel: marketCapLabel(profileMarketCap),
                employees: profileEmployees,
                founded: profileIpo,
                headquarters: profileHQ,
                website: profileWebsite,
                ceo: profileCeo,
            },
            price: {
                current: price,
                previousClose: finnhubQuote?.pc ?? (price - change),
                change,
                changePercent,
                high: finnhubQuote?.h ?? price,
                low: finnhubQuote?.l ?? price,
                open: finnhubQuote?.o ?? price,
                volume: fmpProfile?.volume || volumeFallback,
                avgVolume: fmpProfile?.averageVolume || volumeFallback,
                week52High,
                week52Low,
                history,
            },
            keyMetrics: {
                pe: pe ? parseFloat(pe.toFixed(1)) : null,
                peIndustryAvg: pe ? parseFloat((pe * 0.9).toFixed(1)) : null,
                pb: pb ? parseFloat(pb.toFixed(1)) : null,
                dividendYield: divYieldRaw > 0 ? parseFloat(divYieldRaw.toFixed(2)) : null,
                dividendPerShare: resolvedDivPerShare,
                revenue: yahooMetrics?.revenue ?? yahooFinancials?.incomeStatement.revenue ?? null,
                revenueGrowth: parseFloat(revenueGrowthRaw.toFixed(1)),
                netIncome: yahooMetrics?.netIncome ?? yahooFinancials?.incomeStatement.netIncome ?? null,
                profitMargin: parseFloat(profitMarginRaw.toFixed(2)),
                debtToEquity: debtToEquity != null ? parseFloat(debtToEquity.toFixed(1)) : null,
                currentRatio: currentRatio != null ? parseFloat(currentRatio.toFixed(2)) : null,
                roe: parseFloat(roeRaw.toFixed(1)),
                eps,
                epsGrowth: parseFloat(epsGrowthRaw.toFixed(1)),
                revenueHistory,
                epsHistory,
            },
            financials: {
                incomeStatement: {
                    revenue: yahooFinancials?.incomeStatement.revenue ?? 0,
                    costOfRevenue: yahooFinancials?.incomeStatement.costOfRevenue ?? 0,
                    grossProfit: yahooFinancials?.incomeStatement.grossProfit ?? 0,
                    operatingExpenses: yahooFinancials?.incomeStatement.operatingExpenses ?? 0,
                    operatingIncome: yahooFinancials?.incomeStatement.operatingIncome ?? 0,
                    netIncome: yahooFinancials?.incomeStatement.netIncome ?? 0,
                },
                balanceSheet: {
                    totalAssets: yahooFinancials?.balanceSheet.totalAssets ?? 0,
                    currentAssets: yahooFinancials?.balanceSheet.currentAssets ?? 0,
                    nonCurrentAssets: yahooFinancials?.balanceSheet.nonCurrentAssets ?? 0,
                    totalLiabilities: yahooFinancials?.balanceSheet.totalLiabilities ?? 0,
                    currentLiabilities: yahooFinancials?.balanceSheet.currentLiabilities ?? 0,
                    nonCurrentLiabilities: yahooFinancials?.balanceSheet.nonCurrentLiabilities ?? 0,
                    totalEquity: yahooFinancials?.balanceSheet.totalEquity ?? 0,
                },
                cashFlow: {
                    operating: yahooFinancials?.cashFlow.operating ?? 0,
                    investing: yahooFinancials?.cashFlow.investing ?? 0,
                    financing: yahooFinancials?.cashFlow.financing ?? 0,
                    netCashFlow: yahooFinancials?.cashFlow.netCashFlow ?? 0,
                },
            },
            news,
            events: [],
            signals: {
                technical: technicals,
                fundamental: {
                    earningsGrowth: epsGrowthRaw > 0 ? 'positive' : epsGrowthRaw < 0 ? 'negative' : 'flat',
                    peVsAvg: pe ? (pe < 20 ? 'undervalued' : pe > 30 ? 'overvalued' : 'fair') : 'fair',
                    cashPosition: currentRatio == null ? 'moderate' : currentRatio > 1.5 ? 'strong' : currentRatio > 1 ? 'moderate' : 'weak',
                    debtLevel: debtToEquity == null ? 'moderate' : debtToEquity < 50 ? 'low' : debtToEquity < 150 ? 'moderate' : 'high',
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
            beginnerTips: this.generateTips(overall, pe, divYieldRaw, debtToEquity ?? 0, profitMarginRaw),
        };

        return data;
    }

    /**
     * Auto-generate beginner tips based on metrics
     */
    private generateTips(overall: number, pe: number | null, divYield: number, debtToEquity: number, profitMargin: number) {
        const goodFor: string[] = [];
        const goodForEn: string[] = [];
        const cautionFor: string[] = [];
        const cautionForEn: string[] = [];

        if (overall >= 4) { goodFor.push('💎 คะแนนรวมสูง เหมาะสำหรับการลงทุนระยะยาว'); goodForEn.push('💎 High overall score — suitable for long-term investing'); }
        if (pe && pe < 20) { goodFor.push('📊 P/E ต่ำ อาจเป็นหุ้นที่ราคาไม่แพง'); goodForEn.push('📊 Low P/E — the stock may be reasonably priced'); }
        if (divYield > 0.02) { goodFor.push('💰 มีเงินปันผล เหมาะสำหรับนักลงทุนที่ต้องการรายได้'); goodForEn.push('💰 Pays dividends — suitable for income-seeking investors'); }
        if (profitMargin > 20) { goodFor.push('🏦 อัตรากำไรสูง แสดงว่าบริษัทมีอำนาจในตลาด'); goodForEn.push('🏦 High profit margin — indicates strong market power'); }
        if (debtToEquity < 50) { goodFor.push('🛡️ หนี้ต่ำ ความเสี่ยงทางการเงินน้อย'); goodForEn.push('🛡️ Low debt — lower financial risk'); }

        if (pe && pe > 35) { cautionFor.push('📈 P/E สูง หุ้นอาจแพงเกินไป'); cautionForEn.push('📈 High P/E — the stock may be overpriced'); }
        if (debtToEquity > 150) { cautionFor.push('💳 หนี้สูง มีความเสี่ยงทางการเงิน'); cautionForEn.push('💳 High debt — carries financial risk'); }
        if (profitMargin < 5) { cautionFor.push('📉 อัตรากำไรต่ำ บริษัทอาจมีปัญหาทำกำไร'); cautionForEn.push('📉 Low profit margin — the company may struggle to generate profit'); }
        if (overall < 3) { cautionFor.push('⚠️ คะแนนรวมต่ำ ควรศึกษาเพิ่มเติมก่อนลงทุน'); cautionForEn.push('⚠️ Low overall score — do more research before investing'); }

        if (goodFor.length === 0) { goodFor.push('📘 ศึกษาข้อมูลเพิ่มเติมก่อนตัดสินใจ'); goodForEn.push('📘 Do more research before making a decision'); }
        if (cautionFor.length === 0) { cautionFor.push('✅ ไม่พบจุดเตือนที่ชัดเจน'); cautionForEn.push('✅ No clear warning signs found'); }

        return {
            goodFor,
            goodForEn,
            cautionFor,
            cautionForEn,
            relatedLessons: [
                { title: 'P/E Ratio คืออะไร? ทำไมสำคัญ', titleEn: 'What is P/E Ratio & Why It Matters', url: '/learn/pe-ratio' },
                { title: 'วิธีอ่านงบการเงินเบื้องต้น', titleEn: 'Reading Financial Statements', url: '/learn/reading-financial-statements' },
                { title: 'เงินปันผลคืออะไร?', titleEn: 'What are Dividends?', url: '/learn/dividends' },
            ],
        };
    }

    /**
     * Search stocks — blends S&P 500 + Popular stocks local lists + FMP search + Finnhub search
     * Filters to major US exchanges only, removes foreign listings, and ranks by popularity
     */
    async searchStocks(query: string): Promise<SearchResult[]> {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        // ── Common aliases: maps nicknames → ticker symbols ──
        const ALIASES: Record<string, string[]> = {
            'google': ['GOOGL', 'GOOG'], 'alphabet': ['GOOGL', 'GOOG'],
            'facebook': ['META'], 'instagram': ['META'], 'whatsapp': ['META'],
            'youtube': ['GOOGL'], 'aws': ['AMZN'], 'azure': ['MSFT'],
            'iphone': ['AAPL'], 'ipad': ['AAPL'], 'mac': ['AAPL'], 'macbook': ['AAPL'],
            'xbox': ['MSFT'], 'windows': ['MSFT'], 'teams': ['MSFT'],
            'chatgpt': ['MSFT'], 'openai': ['MSFT'],
            'alexa': ['AMZN'], 'prime': ['AMZN'], 'kindle': ['AMZN'],
            'tiktok': ['BABA', 'SE'], 'wechat': ['PDD'],
            'bitcoin': ['MSTR', 'COIN', 'MARA', 'RIOT', 'IBIT'],
            'btc': ['MSTR', 'COIN', 'IBIT'], 'crypto': ['COIN', 'MSTR', 'IBIT'],
            'ev': ['TSLA', 'RIVN', 'NIO', 'LCID', 'LI', 'XPEV'],
            'electric vehicle': ['TSLA', 'RIVN', 'NIO', 'LCID'],
            'self driving': ['TSLA', 'GOOGL'], 'autonomous': ['TSLA', 'GOOGL'],
            'cloud': ['AMZN', 'MSFT', 'GOOGL', 'SNOW', 'NET'],
            'semiconductor': ['NVDA', 'AMD', 'TSM', 'INTC', 'AVGO', 'ASML'],
            'chip': ['NVDA', 'AMD', 'TSM', 'INTC', 'AVGO'],
            'gpu': ['NVDA', 'AMD'], 'gaming': ['NVDA', 'AMD', 'RBLX', 'U'],
            'meme': ['GME', 'AMC'], 'reddit': ['GME', 'AMC'],
            'vaccine': ['MRNA', 'BNTX', 'PFE', 'JNJ'],
            'space': ['RKLB', 'LUNR', 'ASTS'],
            'drone': ['PLTR'], 'quantum': ['IONQ', 'RGTI'],
            'streaming': ['NFLX', 'DIS', 'ROKU', 'SPOT'],
            'social media': ['META', 'SNAP', 'PINS'],
            'fintech': ['SQ', 'SOFI', 'HOOD', 'AFRM', 'UPST', 'NU'],
            'payment': ['V', 'MA', 'PYPL', 'SQ'],
            'oil': ['XOM', 'CVX', 'COP', 'XLE'],
            'gold': ['GLD', 'NEM', 'GOLD'],
            'etf': ['SPY', 'QQQ', 'IWM', 'DIA', 'VOO', 'VTI', 'ARKK'],
        };

        // ── Lookup maps for instant enrichment ──
        const sp500Map = new Map(SP500_CONSTITUENTS.map(s => [s.symbol, s]));
        const popularMap = new Map(POPULAR_STOCKS.map(s => [s.symbol, s]));
        const isKnownStock = (sym: string) => sp500Map.has(sym) || popularMap.has(sym);

        // ── Resolve aliases: expand query to include aliased symbols ──
        const aliasMatches = new Set<string>();
        for (const [alias, symbols] of Object.entries(ALIASES)) {
            if (alias.includes(q) || q.includes(alias)) {
                symbols.forEach(s => aliasMatches.add(s));
            }
        }

        // ── Score helper: higher = more relevant ──
        // Priority: 1) exact symbol  2) symbol startsWith  3) symbol contains
        //           4) alias keyword  5) name startsWith  6) name word match  7) name contains
        const score = (symbol: string, name: string): number => {
            const sym = symbol.toLowerCase();
            const nm = name.toLowerCase();
            let s = 0;
            // Tier 1 — Exact symbol match (user typed exactly this ticker)
            if (sym === q) s = 200;
            // Tier 2 — Symbol starts with query (GO → GOOG, GOOGL, GOLD)
            else if (sym.startsWith(q)) s = 150;
            // Tier 3 — Symbol contains query (AVGO contains "go")
            else if (sym.includes(q)) s = 100;
            // Tier 4 — Name starts with query ("apple" → Apple Inc.)
            else if (nm.startsWith(q)) s = 80;
            // Tier 5 — A word in the name starts with query
            else if (nm.split(/\s+/).some(w => w.startsWith(q))) s = 60;
            // Tier 6 — Name contains query anywhere
            else if (nm.includes(q)) s = 40;
            // Tier 7 — Alias-only match (no direct text match)
            else if (aliasMatches.has(symbol)) s = 30;
            else return 0;
            // Bonus: alias match adds extra relevance within its tier
            if (aliasMatches.has(symbol) && s < 200) s += 10;
            return s;
        };

        // ── Filter: is this a valid major-exchange stock? ──
        const isMajorExchange = (exchange: string): boolean => {
            if (!exchange) return false;
            const normalized = normalizeExchange(exchange);
            if (normalized === 'OTC') return false;
            if (MAJOR_EXCHANGES.has(exchange) || MAJOR_EXCHANGES.has(normalized)) return true;
            const u = exchange.toUpperCase();
            if (u.includes('LONDON') || u.includes('PARIS') || u.includes('TOKYO') ||
                u.includes('HONG KONG') || u.includes('SHANGHAI') || u.includes('FRANKFURT') ||
                u.includes('TORONTO') || u.includes('MUMBAI') || u.includes('MEXICO') ||
                u.includes('SAO PAULO') || u.includes('BUCHAREST') || u.includes('EURONEXT') ||
                u.includes('OTC') || u.includes('PINK')) {
                return false;
            }
            return false; // unknown exchange = reject by default
        };

        const isAllowed = (sym: string, exchange: string): boolean => {
            // Always allow known S&P 500 / popular stocks
            if (isKnownStock(sym)) return true;
            // Reject foreign listings (AAPL.MX, AAPL.RO, etc.)
            if (sym.includes('.')) return false;
            // Reject very long symbols (usually OTC/penny stocks like TXLZF)
            if (sym.length > 4) return false;
            // Must have a confirmed major exchange
            return isMajorExchange(exchange);
        };

        // ── Local search: S&P 500 + Popular stocks (instant, no API call) ──
        const localResults: SearchResult[] = [];
        for (const s of SP500_CONSTITUENTS) {
            if (score(s.symbol, s.name) > 0) {
                localResults.push({
                    symbol: s.symbol,
                    name: s.name,
                    sector: s.sector,
                    exchange: 'NASDAQ',
                    logo: buildLogoUrl(null, null, s.symbol),
                });
            }
        }
        for (const s of POPULAR_STOCKS) {
            if (score(s.symbol, s.name) > 0 && !sp500Map.has(s.symbol)) {
                localResults.push({
                    symbol: s.symbol,
                    name: s.name,
                    sector: s.sector,
                    exchange: 'NASDAQ',
                    logo: buildLogoUrl(null, null, s.symbol),
                });
            }
        }

        // ── API sources in parallel — Yahoo (primary) + Finnhub (no FMP to avoid 429) ──
        const [yahooSearchResults, finnhubResults] = await Promise.all([
            yahoo.searchStocks(query, 15).catch(() => []),
            finnhub.searchSymbols(query).catch(() => []),
        ]);

        // Normalize Yahoo search results
        const fromYahoo: SearchResult[] = yahooSearchResults
            .filter(r => isAllowed(r.symbol, r.exchange))
            .map(r => ({
                symbol: r.symbol,
                name: r.name,
                sector: '',
                exchange: r.exchange || '',
                logo: buildLogoUrl(null, null, r.symbol),
            }));

        // Normalize Finnhub results (already filtered to Common Stock by provider)
        const fromFinnhub: SearchResult[] = finnhubResults
            .filter(r => isAllowed(r.symbol, ''))
            .map(r => ({
                symbol: r.symbol,
                name: r.description,
                sector: '',
                exchange: '',
                logo: buildLogoUrl(null, null, r.symbol),
            }));

        // ── Merge all sources — local first for priority, then API results ──
        const seen = new Set<string>();
        const merged: SearchResult[] = [];

        for (const r of [...localResults, ...fromYahoo, ...fromFinnhub]) {
            const sym = r.symbol.toUpperCase();
            if (seen.has(sym)) continue;
            seen.add(sym);
            // Enrich with S&P 500 or popular stock data
            const sp = sp500Map.get(sym);
            const pop = popularMap.get(sym);
            if (sp) {
                if (!r.sector) r.sector = sp.sector;
                if (!r.exchange || r.exchange === '') r.exchange = 'NASDAQ';
            } else if (pop) {
                if (!r.sector) r.sector = pop.sector;
            }
            merged.push(r);
        }

        // ── Sort by relevance + popularity boost ──
        merged.sort((a, b) => {
            const sa = score(a.symbol, a.name)
                + (sp500Map.has(a.symbol) ? 20 : 0)
                + (popularMap.has(a.symbol) ? 15 : 0);
            const sb = score(b.symbol, b.name)
                + (sp500Map.has(b.symbol) ? 20 : 0)
                + (popularMap.has(b.symbol) ? 15 : 0);
            return sb - sa;
        });

        // ── Fallback to mock if nothing found ──
        if (merged.length === 0) {
            return mockSearchResults
                .filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
                .map(s => ({ ...s, logo: buildLogoUrl(null, null, s.symbol) }));
        }

        return merged.slice(0, 12);
    }

    /**
     * Compute a quick overall score (1–5) from key metrics
     */
    private computeQuickScore(pe: number | null, revenueGrowth: number, profitMargin: number, divYield: number, debtToEquity: number | null): number {
        // If we have no meaningful metric data at all, return 0 (unknown)
        if (pe === null && revenueGrowth === 0 && profitMargin === 0 && divYield === 0 && debtToEquity === null) return 0;
        const valueScore = pe ? Math.max(1, Math.min(5, 5 - (pe - 15) / 10)) : 3;
        const growthScore = Math.max(1, Math.min(5, 2.5 + revenueGrowth / 10));
        const strengthScore = Math.max(1, Math.min(5, 2 + profitMargin / 10));
        const dividendScore = divYield > 0
            ? Math.max(1, Math.min(5, 1 + divYield / 5))
            : revenueGrowth >= 15 ? 2.5 : revenueGrowth >= 5 ? 2.0 : 1.5;
        const riskScore = Math.max(1, Math.min(5, 4 - (debtToEquity ?? 50) / 100));
        return parseFloat(((valueScore + growthScore + strengthScore + dividendScore + riskScore) / 5).toFixed(1));
    }

    /**
     * Lightweight batch fetch: returns SimplifiedStock[] for given symbols
     * Much faster than individual getStockData calls (no history, no financials)
     */
    async getStocksBatch(symbols: string[]): Promise<SimplifiedStock[]> {
        if (!symbols.length) return [];
        const syms = symbols.map(s => s.toUpperCase()).slice(0, 30); // cap at 30

        // Response-level cache keyed by sorted symbols (2 min TTL)
        const batchKey = syms.slice().sort().join(',');
        const cached = await cacheService.get<SimplifiedStock[]>('stockdata', 'popular', `batch:${batchKey}`);
        if (cached) {
            console.log(`[StockService] Batch served from cache (${syms.length} symbols)`);
            return cached;
        }

        const [profiles, metricsArr] = await Promise.all([
            fmp.getBatchProfiles(syms),
            Promise.all(syms.map(s => fmp.getKeyMetrics(s).catch(() => null))),
        ]);

        // Build a profile map from FMP results
        const profileMap = new Map<string, (typeof profiles)[0]>();
        for (const p of profiles) profileMap.set(p.symbol, p);

        // Finnhub fallback for symbols missing FMP profiles (rate-limited)
        const missingProfileSyms = syms.filter(s => !profileMap.has(s));
        const finnhubMap = new Map<string, { name: string; logo: string; price: number; change: number; changePercent: number; marketCap: number; sector: string }>();
        if (missingProfileSyms.length > 0) {
            console.log(`[StockService] Batch: FMP missing profiles for ${missingProfileSyms.join(',')}, trying Finnhub`);
            const [fhProfiles, fhQuotes] = await Promise.all([
                Promise.all(missingProfileSyms.map(s => finnhub.getProfile(s).catch(() => null))),
                Promise.all(missingProfileSyms.map(s => finnhub.getQuote(s).catch(() => null))),
            ]);
            missingProfileSyms.forEach((sym, i) => {
                const fp = fhProfiles[i];
                const fq = fhQuotes[i];
                if (fp || fq) {
                    finnhubMap.set(sym, {
                        name: fp?.name || sym,
                        logo: buildLogoUrl(fp?.logo, fp?.weburl, sym),
                        price: fq?.c || 0,
                        change: fq?.d || 0,
                        changePercent: fq?.dp || 0,
                        marketCap: fp?.marketCapitalization ? fp.marketCapitalization * 1e6 : 0,
                        sector: fp?.finnhubIndustry || '',
                    });
                }
            });
        }

        const metricsMap = new Map<string, typeof metricsArr[0]>();
        syms.forEach((sym, i) => metricsMap.set(sym, metricsArr[i]));

        // Yahoo fallback for FMP premium stocks (metrics)
        const missingMetricsSyms = syms.filter(s => !metricsMap.get(s));
        if (missingMetricsSyms.length > 0) {
            const yahooResults = await Promise.all(
                missingMetricsSyms.map(s => yahoo.getKeyMetrics(s).catch(() => null))
            );
            missingMetricsSyms.forEach((sym, i) => {
                const ym = yahooResults[i];
                if (ym) {
                    metricsMap.set(sym, {
                        peRatioTTM: ym.pe ?? 0,
                        revenueGrowth: ym.revenueGrowth != null ? ym.revenueGrowth / 100 : 0,
                        netProfitMarginTTM: ym.profitMargin != null ? ym.profitMargin / 100 : 0,
                        dividendYieldTTM: ym.dividendYield != null ? ym.dividendYield / 100 : 0,
                        debtToEquityTTM: ym.debtToEquity ?? 0,
                        currentRatioTTM: ym.currentRatio ?? 0,
                        priceToBookRatioTTM: ym.pb ?? 0,
                        revenuePerShareTTM: 0, netIncomePerShareTTM: 0,
                        dividendPerShareTTM: ym.dividendPerShare ?? 0,
                        epsGrowth: ym.epsGrowth != null ? ym.epsGrowth / 100 : 0,
                        roeTTM: ym.roe != null ? ym.roe / 100 : 0,
                    } as any);
                }
            });
        }

        const result = syms.map(sym => {
            const p = profileMap.get(sym);
            const fhP = finnhubMap.get(sym);
            const m = metricsMap.get(sym);
            let score = 0;
            if (m) {
                const pe = m.peRatioTTM ?? null;
                const revenueGrowth = m.revenueGrowth != null ? m.revenueGrowth * 100 : 0;
                const profitMargin = m.netProfitMarginTTM != null ? m.netProfitMarginTTM * 100 : 0;
                const divYield = m.dividendYieldTTM != null ? m.dividendYieldTTM * 100 : 0;
                const debtToEquity = m.debtToEquityTTM ?? null;
                score = this.computeQuickScore(pe, revenueGrowth, profitMargin, divYield, debtToEquity);
            }
            if (p) {
                return {
                    symbol: sym,
                    name: (p as any)?.companyName ?? sym,
                    logo: buildLogoUrl((p as any)?.image, (p as any)?.website, sym),
                    sector: (p as any)?.sector ?? '',
                    price: (p as any)?.price ?? 0,
                    change: (p as any)?.change ?? 0,
                    changePercent: (p as any)?.changePercentage ?? 0,
                    marketCap: (p as any)?.marketCap ?? 0,
                    overallScore: score,
                };
            }
            if (fhP) {
                return {
                    symbol: sym, name: fhP.name,
                    logo: fhP.logo, sector: fhP.sector,
                    price: fhP.price, change: fhP.change,
                    changePercent: fhP.changePercent,
                    marketCap: fhP.marketCap, overallScore: score,
                };
            }
            return {
                symbol: sym, name: sym,
                logo: buildLogoUrl(null, null, sym),
                sector: '', price: 0, change: 0,
                changePercent: 0, marketCap: 0, overallScore: 0,
            };
        }).filter(s => s.price > 0);

        // Cache the assembled batch result
        if (result.length > 0) {
            cacheService.set('stockdata', 'popular', `batch:${batchKey}`, result).catch(() => {});
        }
        return result;
    }

    /**
     * Get popular/featured stocks — top 20 S&P 500 by market cap with live prices + scores
     */
    async getPopularStocks(): Promise<SimplifiedStock[]> {
        // Response-level cache: return assembled list if fresh (2 min TTL)
        const cached = await cacheService.get<SimplifiedStock[]>('stockdata', 'popular', 'top20');
        if (cached) {
            console.log('[StockService] Popular stocks served from response cache');
            return cached;
        }

        // Top 20 S&P 500 by market cap (hardcoded list, fetched from API)
        const TOP_SYMBOLS = [
            'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'BRK-B', 'LLY', 'V',
            'JPM', 'UNH', 'AVGO', 'XOM', 'MA', 'JNJ', 'PG', 'COST', 'HD', 'NFLX',
        ];

        try {
            // Batch fetch FMP profiles + key metrics in parallel
            const [fmpProfiles, metricsArr] = await Promise.all([
                fmp.getBatchProfiles(TOP_SYMBOLS),
                Promise.all(TOP_SYMBOLS.map(s => fmp.getKeyMetrics(s).catch(() => null))),
            ]);

            // Build FMP profile map
            const fmpMap = new Map<string, (typeof fmpProfiles)[0]>();
            for (const p of fmpProfiles) fmpMap.set(p.symbol, p);

            // Finnhub fallback for symbols missing FMP profiles (rate-limited)
            const missingProfileSyms = TOP_SYMBOLS.filter(s => !fmpMap.has(s));
            const finnhubMap = new Map<string, { name: string; logo: string; price: number; change: number; changePercent: number; marketCap: number; sector: string }>();
            if (missingProfileSyms.length > 0) {
                console.log(`[StockService] Popular: FMP missing ${missingProfileSyms.length} profiles, fetching Finnhub`);
                const [fhProfiles, fhQuotes] = await Promise.all([
                    Promise.all(missingProfileSyms.map(s => finnhub.getProfile(s).catch(() => null))),
                    Promise.all(missingProfileSyms.map(s => finnhub.getQuote(s).catch(() => null))),
                ]);
                missingProfileSyms.forEach((sym, i) => {
                    const fp = fhProfiles[i];
                    const fq = fhQuotes[i];
                    if (fp || fq) {
                        finnhubMap.set(sym, {
                            name: fp?.name || sym,
                            logo: buildLogoUrl(fp?.logo, fp?.weburl, sym),
                            price: fq?.c || 0,
                            change: fq?.d || 0,
                            changePercent: fq?.dp || 0,
                            marketCap: fp?.marketCapitalization ? fp.marketCapitalization * 1e6 : 0,
                            sector: fp?.finnhubIndustry || '',
                        });
                    }
                });
            }

            // Build metrics lookup with Yahoo fallback
            const metricsMap = new Map<string, typeof metricsArr[0]>();
            TOP_SYMBOLS.forEach((sym, i) => metricsMap.set(sym, metricsArr[i]));
            const missingMetrics = TOP_SYMBOLS.filter(s => !metricsMap.get(s));
            if (missingMetrics.length > 0) {
                const yahooResults = await Promise.all(
                    missingMetrics.map(s => yahoo.getKeyMetrics(s).catch(() => null))
                );
                missingMetrics.forEach((sym, i) => {
                    const ym = yahooResults[i];
                    if (ym) {
                        metricsMap.set(sym, {
                            peRatioTTM: ym.pe ?? 0,
                            revenueGrowth: ym.revenueGrowth != null ? ym.revenueGrowth / 100 : 0,
                            netProfitMarginTTM: ym.profitMargin != null ? ym.profitMargin / 100 : 0,
                            dividendYieldTTM: ym.dividendYield != null ? ym.dividendYield / 100 : 0,
                            debtToEquityTTM: ym.debtToEquity ?? 0,
                            currentRatioTTM: ym.currentRatio ?? 0,
                            priceToBookRatioTTM: ym.pb ?? 0,
                            revenuePerShareTTM: 0, netIncomePerShareTTM: 0,
                            dividendPerShareTTM: ym.dividendPerShare ?? 0,
                            epsGrowth: ym.epsGrowth != null ? ym.epsGrowth / 100 : 0,
                            roeTTM: ym.roe != null ? ym.roe / 100 : 0,
                        } as any);
                    }
                });
            }

            // Build result from FMP + Finnhub fallback
            const result: SimplifiedStock[] = [];
            for (const sym of TOP_SYMBOLS) {
                const fmpP = fmpMap.get(sym);
                const fhP = finnhubMap.get(sym);
                const m = metricsMap.get(sym);
                let score = 0;
                if (m) {
                    const pe = m.peRatioTTM ?? null;
                    const revenueGrowth = m.revenueGrowth != null ? m.revenueGrowth * 100 : 0;
                    const profitMargin = m.netProfitMarginTTM != null ? m.netProfitMarginTTM * 100 : 0;
                    const divYield = m.dividendYieldTTM != null ? m.dividendYieldTTM * 100 : 0;
                    const debtToEquity = m.debtToEquityTTM ?? null;
                    score = this.computeQuickScore(pe, revenueGrowth, profitMargin, divYield, debtToEquity);
                }
                if (fmpP && fmpP.price > 0) {
                    result.push({
                        symbol: fmpP.symbol, name: fmpP.companyName,
                        logo: buildLogoUrl(fmpP.image, fmpP.website, fmpP.symbol),
                        sector: fmpP.sector, price: fmpP.price,
                        change: fmpP.change, changePercent: fmpP.changePercentage,
                        marketCap: fmpP.marketCap, overallScore: score,
                    });
                } else if (fhP && fhP.price > 0) {
                    result.push({
                        symbol: sym, name: fhP.name,
                        logo: fhP.logo, sector: fhP.sector,
                        price: fhP.price, change: fhP.change,
                        changePercent: fhP.changePercent,
                        marketCap: fhP.marketCap, overallScore: score,
                    });
                }
            }

            if (result.length > 0) {
                result.sort((a, b) => b.marketCap - a.marketCap);
                cacheService.set('stockdata', 'popular', 'top20', result).catch(() => {});
                return result;
            }
        } catch (err) {
            console.warn('[StockService] Popular stocks API error:', (err as Error).message);
        }

        // Fallback to mock
        return getMockPopular().map(s => ({
            symbol: s.symbol,
            name: s.profile.name,
            logo: s.profile.logo,
            sector: s.profile.sector,
            price: s.price.current,
            change: s.price.change,
            changePercent: s.price.changePercent,
            marketCap: s.profile.marketCap,
            overallScore: s.scores?.overall ?? 0,
        }));
    }

    /**
     * Get full S&P 500 list with live price data, paginated
     */
    async getSP500List(page = 1, limit = 50, sector?: string): Promise<{ stocks: SimplifiedStock[]; total: number; sectors: string[] }> {
        // Filter by sector if provided
        let filtered = SP500_CONSTITUENTS;
        if (sector) {
            filtered = SP500_CONSTITUENTS.filter(c => c.sector.toLowerCase() === sector.toLowerCase());
        }

        const total = filtered.length;

        // Paginate
        const start = (page - 1) * limit;
        const pageItems = filtered.slice(start, start + limit);
        const pageSymbols = pageItems.map(c => c.symbol);

        // Fetch FMP profiles + key metrics in parallel
        const [fmpProfiles, metricsArr] = await Promise.all([
            fmp.getBatchProfiles(pageSymbols),
            Promise.all(pageSymbols.map(s => fmp.getKeyMetrics(s).catch(() => null))),
        ]);

        // Build FMP profile map
        const fmpProfileMap = new Map<string, (typeof fmpProfiles)[0]>();
        for (const p of fmpProfiles) fmpProfileMap.set(p.symbol, p);

        // Finnhub fallback for symbols missing FMP profiles (rate-limited)
        const missingProfileSyms = pageSymbols.filter(s => !fmpProfileMap.has(s));
        const finnhubMap = new Map<string, { name: string; logo: string; price: number; change: number; changePercent: number; marketCap: number; sector: string }>();
        if (missingProfileSyms.length > 0) {
            console.log(`[StockService] SP500: FMP missing ${missingProfileSyms.length} profiles, fetching Finnhub`);
            const [fhProfiles, fhQuotes] = await Promise.all([
                Promise.all(missingProfileSyms.map(s => finnhub.getProfile(s).catch(() => null))),
                Promise.all(missingProfileSyms.map(s => finnhub.getQuote(s).catch(() => null))),
            ]);
            missingProfileSyms.forEach((sym, i) => {
                const fp = fhProfiles[i];
                const fq = fhQuotes[i];
                if (fp || fq) {
                    finnhubMap.set(sym, {
                        name: fp?.name || sym,
                        logo: buildLogoUrl(fp?.logo, fp?.weburl, sym),
                        price: fq?.c || 0,
                        change: fq?.d || 0,
                        changePercent: fq?.dp || 0,
                        marketCap: fp?.marketCapitalization ? fp.marketCapitalization * 1e6 : 0,
                        sector: fp?.finnhubIndustry || '',
                    });
                }
            });
        }

        // Build metrics lookup
        const metricsMap = new Map<string, typeof metricsArr[0]>();
        pageSymbols.forEach((sym, i) => metricsMap.set(sym, metricsArr[i]));

        // Fallback: fetch Yahoo metrics for stocks where FMP returned null (premium/rate-limited)
        const missingMetrics = pageSymbols.filter(s => !metricsMap.get(s));
        if (missingMetrics.length > 0) {
            const yahooResults = await Promise.all(
                missingMetrics.map(s => yahoo.getKeyMetrics(s).catch(() => null))
            );
            missingMetrics.forEach((sym, i) => {
                const ym = yahooResults[i];
                if (ym) {
                    metricsMap.set(sym, {
                        peRatioTTM: ym.pe ?? 0,
                        revenueGrowth: ym.revenueGrowth != null ? ym.revenueGrowth / 100 : 0,
                        netProfitMarginTTM: ym.profitMargin != null ? ym.profitMargin / 100 : 0,
                        dividendYieldTTM: ym.dividendYield != null ? ym.dividendYield / 100 : 0,
                        debtToEquityTTM: ym.debtToEquity ?? 0,
                        currentRatioTTM: ym.currentRatio ?? 0,
                        priceToBookRatioTTM: ym.pb ?? 0,
                        revenuePerShareTTM: 0,
                        netIncomePerShareTTM: 0,
                        dividendPerShareTTM: ym.dividendPerShare ?? 0,
                        epsGrowth: ym.epsGrowth != null ? ym.epsGrowth / 100 : 0,
                        roeTTM: ym.roe != null ? ym.roe / 100 : 0,
                    } as any);
                }
            });
        }

        const stocks: SimplifiedStock[] = pageItems.map(item => {
            const fmpP = fmpProfileMap.get(item.symbol);
            const fhP = finnhubMap.get(item.symbol);
            const m = metricsMap.get(item.symbol);
            const pe = m?.peRatioTTM ?? null;
            const revenueGrowth = m?.revenueGrowth != null ? m.revenueGrowth * 100 : 0;
            const profitMargin = m?.netProfitMarginTTM != null ? m.netProfitMarginTTM * 100 : 0;
            const divYield = m?.dividendYieldTTM != null ? m.dividendYieldTTM * 100 : 0;
            const debtToEquity = m?.debtToEquityTTM ?? null;
            const score = m ? this.computeQuickScore(pe, revenueGrowth, profitMargin, divYield, debtToEquity) : 0;

            if (fmpP) {
                return {
                    symbol: fmpP.symbol,
                    name: fmpP.companyName,
                    logo: buildLogoUrl(fmpP.image, fmpP.website, fmpP.symbol),
                    sector: fmpP.sector || item.sector,
                    price: fmpP.price,
                    change: fmpP.change,
                    changePercent: fmpP.changePercentage,
                    marketCap: fmpP.marketCap,
                    overallScore: score,
                };
            }
            if (fhP) {
                return {
                    symbol: item.symbol,
                    name: fhP.name || item.name,
                    logo: fhP.logo,
                    sector: fhP.sector || item.sector,
                    price: fhP.price,
                    change: fhP.change,
                    changePercent: fhP.changePercent,
                    marketCap: fhP.marketCap,
                    overallScore: score,
                };
            }
            // Last resort: basic info with Clearbit logo guess
            return {
                symbol: item.symbol,
                name: item.name,
                logo: buildLogoUrl(null, null, item.symbol),
                sector: item.sector,
                price: 0,
                change: 0,
                changePercent: 0,
                marketCap: 0,
                overallScore: 0,
            };
        });

        return { stocks, total, sectors: SP500_SECTORS };
    }
}

// Simplified stock data for listing pages
export interface SimplifiedStock {
    symbol: string;
    name: string;
    logo: string;
    sector: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number;
    overallScore: number;
}

export const stockService = new StockService();
