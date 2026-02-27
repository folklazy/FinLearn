// ===== Stock Data Types for FinLearn =====

export interface StockData {
    symbol: string;
    profile: CompanyProfile;
    price: PriceData;
    keyMetrics: KeyMetrics;
    financials: FinancialStatements;
    news: NewsItem[];
    events: EventItem[];
    signals: TradingSignals;
    competitors: CompetitorData[];
    scores: ScoreRating;
    beginnerTips: BeginnerTips;
}

export interface CompanyProfile {
    name: string;
    symbol: string;
    logo: string;
    description: string;        // Thai, beginner-friendly
    descriptionEn: string;
    sector: string;
    industry: string;
    exchange: string;
    marketCap: number;
    marketCapLabel: string;      // e.g. "บริษัทขนาดใหญ่"
    employees: number;
    founded: string;
    headquarters: string;
    website: string;
    ceo: string;
}

export interface PriceData {
    current: number;
    previousClose: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    volume: number;
    avgVolume: number;
    week52High: number;
    week52Low: number;
    history: PricePoint[];
}

export interface PricePoint {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface KeyMetrics {
    // Value
    pe: number | null;
    peIndustryAvg: number | null;
    pb: number | null;
    dividendYield: number | null;
    dividendPerShare: number | null;

    // Strength
    revenue: number | null;
    revenueGrowth: number;
    netIncome: number | null;
    profitMargin: number;
    debtToEquity: number;
    currentRatio: number;
    roe: number;

    // Growth
    revenueHistory: { year: string; value: number }[];
    epsHistory: { year: string; value: number }[];
    eps: number;
    epsGrowth: number;
}

export interface FinancialStatements {
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

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    date: string;
    url: string;
    sentiment: 'positive' | 'negative' | 'neutral';
}

export interface EventItem {
    id: string;
    title: string;
    date: string;
    type: 'earnings' | 'dividend' | 'split' | 'other';
    description: string;
}

export interface TradingSignals {
    technical: {
        ma50: 'above' | 'below';
        ma200: 'above' | 'below';
        rsi: number;
        rsiSignal: 'overbought' | 'oversold' | 'neutral';
        macd: 'bullish' | 'bearish' | 'neutral';
        overallScore: number; // 0-100
    };
    fundamental: {
        earningsGrowth: 'positive' | 'negative' | 'flat';
        peVsAvg: 'undervalued' | 'overvalued' | 'fair';
        cashPosition: 'strong' | 'moderate' | 'weak';
        debtLevel: 'low' | 'moderate' | 'high';
        overallScore: number; // 0-100
    };
    summary: {
        longTermInvest: number;   // %
        waitForTiming: number;    // %
        notRecommended: number;   // %
    };
}

export interface CompetitorData {
    symbol: string;
    name: string;
    marketCap: number;
    pe: number | null;
    profitMargin: number;
    revenueGrowth: number;
    dividendYield: number | null;
}

export interface ScoreRating {
    overall: number; // 0-5
    dimensions: {
        value: number;      // 0-5
        growth: number;     // 0-5
        strength: number;   // 0-5
        dividend: number;   // 0-5
        risk: number;       // 0-5 (higher = lower risk)
    };
}

export interface BeginnerTips {
    goodFor: string[];     // Thai tips
    cautionFor: string[];  // Thai warnings
    relatedLessons: { title: string; url: string }[];
}

export interface SearchResult {
    symbol: string;
    name: string;
    sector: string;
    exchange: string;
    logo?: string;
}
