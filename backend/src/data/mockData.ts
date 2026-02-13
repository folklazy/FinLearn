import { StockData, SearchResult } from '../types/stock';

// ===== Helper: Generate price history =====
function generatePriceHistory(basePrice: number, days: number, volatility: number): { date: string; open: number; high: number; low: number; close: number; volume: number }[] {
    const history = [];
    let price = basePrice * 0.7;
    const now = new Date();

    for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.48) * volatility;
        const open = price;
        price = Math.max(price * (1 + change), 1);
        const high = Math.max(open, price) * (1 + Math.random() * 0.02);
        const low = Math.min(open, price) * (1 - Math.random() * 0.02);
        history.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(price.toFixed(2)),
            volume: Math.floor(50000000 + Math.random() * 100000000),
        });
    }
    return history;
}

// ===== AAPL Mock Data =====
const AAPL: StockData = {
    symbol: 'AAPL',
    profile: {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        logo: 'https://logo.clearbit.com/apple.com',
        description: 'Apple เป็นบริษัทเทคโนโลยีที่ใหญ่ที่สุดในโลก ผลิต iPhone, iPad, Mac และบริการดิจิทัลต่างๆ เช่น App Store, Apple Music, iCloud ถ้าคุณเคยใช้ iPhone ก็คือลูกค้าของบริษัทนี้! Apple มีรายได้หลักจากการขาย iPhone และบริการ (Services) ซึ่งกำลังเติบโตอย่างรวดเร็ว',
        descriptionEn: 'Apple designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
        sector: 'เทคโนโลยี',
        industry: 'Consumer Electronics',
        marketCap: 3450000000000,
        marketCapLabel: '🏢 บริษัทขนาดใหญ่มาก (Mega Cap)',
        employees: 164000,
        founded: '1976',
        headquarters: 'Cupertino, California, USA',
        website: 'https://apple.com',
        ceo: 'Tim Cook',
    },
    price: {
        current: 231.34,
        previousClose: 228.87,
        change: 2.47,
        changePercent: 1.08,
        high: 232.15,
        low: 228.50,
        open: 229.10,
        volume: 62345000,
        avgVolume: 54000000,
        week52High: 260.10,
        week52Low: 164.08,
        history: generatePriceHistory(231.34, 365, 0.025),
    },
    keyMetrics: {
        pe: 31.2,
        peIndustryAvg: 28.5,
        pb: 48.7,
        dividendYield: 0.52,
        dividendPerShare: 0.96,
        revenue: 383285000000,
        revenueGrowth: 2.1,
        netIncome: 96995000000,
        profitMargin: 25.31,
        debtToEquity: 176.3,
        currentRatio: 0.99,
        roe: 160.6,
        eps: 6.42,
        epsGrowth: 10.3,
        revenueHistory: [
            { year: '2020', value: 274515000000 },
            { year: '2021', value: 365817000000 },
            { year: '2022', value: 394328000000 },
            { year: '2023', value: 383285000000 },
            { year: '2024', value: 391035000000 },
        ],
        epsHistory: [
            { year: '2020', value: 3.28 },
            { year: '2021', value: 5.61 },
            { year: '2022', value: 6.11 },
            { year: '2023', value: 6.42 },
            { year: '2024', value: 7.08 },
        ],
    },
    financials: {
        incomeStatement: {
            revenue: 383285000000,
            costOfRevenue: 214137000000,
            grossProfit: 169148000000,
            operatingExpenses: 54847000000,
            operatingIncome: 114301000000,
            netIncome: 96995000000,
        },
        balanceSheet: {
            totalAssets: 352583000000,
            currentAssets: 143566000000,
            nonCurrentAssets: 209017000000,
            totalLiabilities: 290437000000,
            currentLiabilities: 145308000000,
            nonCurrentLiabilities: 145129000000,
            totalEquity: 62146000000,
        },
        cashFlow: {
            operating: 110543000000,
            investing: -7077000000,
            financing: -108488000000,
            netCashFlow: -5022000000,
        },
    },
    news: [
        {
            id: '1',
            title: 'Apple เปิดตัว Vision Pro 2 ราคาถูกลง 40%',
            summary: 'Apple ประกาศเปิดตัว Vision Pro รุ่นใหม่ในราคาที่เข้าถึงง่ายขึ้น คาดว่าจะกระตุ้นยอดขายได้มากขึ้น',
            source: 'Bloomberg',
            date: '2026-02-12',
            url: '#',
            sentiment: 'positive',
        },
        {
            id: '2',
            title: 'รายได้จาก Services ของ Apple ทำสถิติสูงสุดใหม่',
            summary: 'รายได้จากบริการของ Apple ทะลุ 25 พันล้านดอลลาร์ต่อไตรมาส สูงสุดเป็นประวัติการณ์',
            source: 'CNBC',
            date: '2026-02-10',
            url: '#',
            sentiment: 'positive',
        },
        {
            id: '3',
            title: 'Apple AI ยังตามหลังคู่แข่งด้าน Generative AI',
            summary: 'นักวิเคราะห์มองว่า Apple Intelligence ยังตามหลัง Google และ Microsoft ในด้าน AI',
            source: 'Reuters',
            date: '2026-02-08',
            url: '#',
            sentiment: 'negative',
        },
        {
            id: '4',
            title: 'iPhone 17 จะมีหน้าจอพับได้',
            summary: 'ลือหนาหูว่า Apple กำลังพัฒนา iPhone จอพับสำหรับปี 2027',
            source: 'MacRumors',
            date: '2026-02-05',
            url: '#',
            sentiment: 'neutral',
        },
    ],
    events: [
        {
            id: '1',
            title: 'ประกาศผลกำไร Q1 2026',
            date: '2026-04-24',
            type: 'earnings',
            description: 'Apple จะประกาศผลกำไรไตรมาส 1 ปี 2026',
        },
        {
            id: '2',
            title: 'จ่ายเงินปันผล',
            date: '2026-05-15',
            type: 'dividend',
            description: 'จ่ายเงินปันผล $0.24 ต่อหุ้น',
        },
    ],
    signals: {
        technical: {
            ma50: 'above',
            ma200: 'above',
            rsi: 58,
            rsiSignal: 'neutral',
            macd: 'bullish',
            overallScore: 72,
        },
        fundamental: {
            earningsGrowth: 'positive',
            peVsAvg: 'overvalued',
            cashPosition: 'strong',
            debtLevel: 'moderate',
            overallScore: 68,
        },
        summary: {
            longTermInvest: 65,
            waitForTiming: 25,
            notRecommended: 10,
        },
    },
    competitors: [
        { symbol: 'MSFT', name: 'Microsoft', marketCap: 3100000000000, pe: 36.8, profitMargin: 36.4, revenueGrowth: 15.7, dividendYield: 0.73 },
        { symbol: 'GOOGL', name: 'Alphabet (Google)', marketCap: 2100000000000, pe: 27.3, profitMargin: 24.0, revenueGrowth: 12.4, dividendYield: null },
        { symbol: 'AMZN', name: 'Amazon', marketCap: 1900000000000, pe: 62.5, profitMargin: 7.1, revenueGrowth: 11.8, dividendYield: null },
        { symbol: 'META', name: 'Meta Platforms', marketCap: 1400000000000, pe: 25.8, profitMargin: 28.6, revenueGrowth: 22.1, dividendYield: 0.36 },
    ],
    scores: {
        overall: 4.2,
        dimensions: {
            value: 3.5,
            growth: 4.0,
            strength: 4.8,
            dividend: 2.5,
            risk: 4.2,
        },
    },
    beginnerTips: {
        goodFor: [
            '💎 คุณต้องการลงทุนในบริษัทที่มั่นคงระยะยาว',
            '📱 คุณเชื่อว่า iPhone และ Services จะยังคงเติบโต',
            '💰 คุณต้องการหุ้นที่จ่ายเงินปันผลสม่ำเสมอ',
            '🛡️ คุณต้องการหุ้นที่มีความเสี่ยงต่ำ-ปานกลาง',
        ],
        cautionFor: [
            '📈 P/E สูงกว่าค่าเฉลี่ยอุตสาหกรรม — อาจแพงเกินไป',
            '🤖 Apple ยังตามหลังคู่แข่งด้าน AI',
            '📉 การเติบโตของรายได้ชะลอตัว (เพียง 2.1%)',
            '💳 หนี้ต่อทุนสูง (176%) แม้จะจัดการได้ดี',
        ],
        relatedLessons: [
            { title: 'P/E Ratio คืออะไร? ทำไมสำคัญ', url: '/learn/pe-ratio' },
            { title: 'เงินปันผลคืออะไร? วิธีประเมินหุ้นปันผล', url: '/learn/dividends' },
            { title: 'วิธีอ่านงบการเงินเบื้องต้น', url: '/learn/financial-statements' },
        ],
    },
};

// ===== Other stocks (simplified) =====
const GOOGL: StockData = {
    ...AAPL,
    symbol: 'GOOGL',
    profile: {
        ...AAPL.profile,
        name: 'Alphabet Inc. (Google)',
        symbol: 'GOOGL',
        logo: 'https://logo.clearbit.com/google.com',
        description: 'Google เป็นบริษัทที่ทำ Search Engine ที่ใหญ่ที่สุดในโลก รวมถึง YouTube, Android, Google Cloud, Gmail และอีกมากมาย รายได้หลักมาจากการโฆษณาออนไลน์ และกำลังลงทุนหนักในด้าน AI (Gemini)',
        sector: 'เทคโนโลยี',
        industry: 'Internet Content & Information',
        marketCap: 2100000000000,
        marketCapLabel: '🏢 บริษัทขนาดใหญ่มาก (Mega Cap)',
        employees: 182502,
        founded: '1998',
        headquarters: 'Mountain View, California, USA',
        website: 'https://abc.xyz',
        ceo: 'Sundar Pichai',
    },
    price: {
        ...AAPL.price,
        current: 176.45,
        previousClose: 174.89,
        change: 1.56,
        changePercent: 0.89,
        week52High: 193.31,
        week52Low: 130.67,
        history: generatePriceHistory(176.45, 365, 0.028),
    },
    keyMetrics: {
        ...AAPL.keyMetrics,
        pe: 27.3,
        peIndustryAvg: 25.0,
        pb: 7.1,
        dividendYield: null,
        dividendPerShare: null,
        revenue: 307394000000,
        revenueGrowth: 12.4,
        netIncome: 73795000000,
        profitMargin: 24.0,
        eps: 5.80,
        epsGrowth: 35.2,
    },
    scores: { overall: 4.5, dimensions: { value: 4.0, growth: 5.0, strength: 4.5, dividend: 1.0, risk: 3.8 } },
    beginnerTips: {
        goodFor: [
            '🤖 คุณเชื่อในอนาคตของ AI และเทคโนโลยี',
            '📈 คุณต้องการหุ้นที่มีการเติบโตสูง',
            '💡 คุณชอบบริษัทที่มีนวัตกรรมตลอดเวลา',
        ],
        cautionFor: [
            '💰 ไม่จ่ายเงินปันผล — ไม่เหมาะกับคนต้องการรายได้ประจำ',
            '⚖️ กำลังเผชิญคดีต่อต้านการผูกขาด',
            '📊 รายได้พึ่งพาโฆษณาเป็นหลัก',
        ],
        relatedLessons: AAPL.beginnerTips.relatedLessons,
    },
};

const MSFT: StockData = {
    ...AAPL,
    symbol: 'MSFT',
    profile: {
        ...AAPL.profile,
        name: 'Microsoft Corporation',
        symbol: 'MSFT',
        logo: 'https://logo.clearbit.com/microsoft.com',
        description: 'Microsoft คือบริษัทซอฟต์แวร์ยักษ์ใหญ่ ผู้สร้าง Windows, Office, Azure (Cloud), Xbox และ LinkedIn รายได้หลักมาจาก Cloud (Azure) ที่กำลังเติบโตอย่างรวดเร็ว และเป็นผู้นำด้าน AI ผ่านการร่วมมือกับ OpenAI',
        sector: 'เทคโนโลยี',
        industry: 'Software - Infrastructure',
        marketCap: 3100000000000,
        marketCapLabel: '🏢 บริษัทขนาดใหญ่มาก (Mega Cap)',
        employees: 228000,
        founded: '1975',
        headquarters: 'Redmond, Washington, USA',
        website: 'https://microsoft.com',
        ceo: 'Satya Nadella',
    },
    price: {
        ...AAPL.price,
        current: 417.88,
        previousClose: 415.20,
        change: 2.68,
        changePercent: 0.65,
        week52High: 468.35,
        week52Low: 362.90,
        history: generatePriceHistory(417.88, 365, 0.022),
    },
    keyMetrics: {
        ...AAPL.keyMetrics,
        pe: 36.8,
        peIndustryAvg: 32.0,
        pb: 13.2,
        dividendYield: 0.73,
        dividendPerShare: 3.00,
        revenue: 236584000000,
        revenueGrowth: 15.7,
        netIncome: 86143000000,
        profitMargin: 36.4,
        eps: 11.54,
        epsGrowth: 22.8,
    },
    scores: { overall: 4.6, dimensions: { value: 3.8, growth: 4.8, strength: 5.0, dividend: 3.0, risk: 4.5 } },
    beginnerTips: {
        goodFor: [
            '☁️ คุณเชื่อในอนาคตของ Cloud Computing',
            '🤖 คุณต้องการลงทุนในบริษัทที่เป็นผู้นำ AI',
            '💰 ต้องการหุ้นที่จ่ายปันผลและยังเติบโตได้',
            '🛡️ ต้องการหุ้นที่มั่นคง แข็งแกร่ง',
        ],
        cautionFor: [
            '📈 P/E สูงกว่าค่าเฉลี่ย — ราคาอาจแพง',
            '🏢 ขนาดใหญ่มาก — การเติบโตก้าวกระโดดยาก',
        ],
        relatedLessons: AAPL.beginnerTips.relatedLessons,
    },
};

const TSLA: StockData = {
    ...AAPL,
    symbol: 'TSLA',
    profile: {
        ...AAPL.profile,
        name: 'Tesla, Inc.',
        symbol: 'TSLA',
        logo: 'https://logo.clearbit.com/tesla.com',
        description: 'Tesla คือบริษัทรถยนต์ไฟฟ้าอันดับ 1 ของโลก ผลิตรถ Model S, 3, X, Y และ Cybertruck นอกจากนี้ยังทำ Solar Panels, Powerwall (แบตเตอรี่บ้าน) และกำลังพัฒนา Full Self-Driving (รถขับเอง) CEO คือ Elon Musk',
        sector: 'ยานยนต์',
        industry: 'Auto Manufacturers',
        marketCap: 800000000000,
        marketCapLabel: '🏢 บริษัทขนาดใหญ่ (Large Cap)',
        employees: 140473,
        founded: '2003',
        headquarters: 'Austin, Texas, USA',
        website: 'https://tesla.com',
        ceo: 'Elon Musk',
    },
    price: {
        ...AAPL.price,
        current: 248.42,
        previousClose: 253.10,
        change: -4.68,
        changePercent: -1.85,
        week52High: 361.93,
        week52Low: 138.80,
        history: generatePriceHistory(248.42, 365, 0.045),
    },
    keyMetrics: {
        ...AAPL.keyMetrics,
        pe: 72.5,
        peIndustryAvg: 15.0,
        pb: 16.8,
        dividendYield: null,
        dividendPerShare: null,
        revenue: 96773000000,
        revenueGrowth: 8.2,
        netIncome: 14974000000,
        profitMargin: 15.5,
        eps: 4.31,
        epsGrowth: -12.5,
    },
    scores: { overall: 3.2, dimensions: { value: 1.5, growth: 3.5, strength: 3.0, dividend: 0.5, risk: 2.0 } },
    beginnerTips: {
        goodFor: [
            '⚡ คุณเชื่อในอนาคตของรถยนต์ไฟฟ้า',
            '🚀 คุณรับความเสี่ยงสูงได้ เพื่อโอกาสผลตอบแทนสูง',
            '🤖 คุณสนใจ AI และ Full Self-Driving',
        ],
        cautionFor: [
            '📈 P/E สูงมาก (72.5 vs อุตสาหกรรม 15) — แพงมาก!',
            '📉 กำไรลดลง -12.5% ในปีล่าสุด',
            '🎢 หุ้นผันผวนสูงมาก — ราคาขึ้นลงรุนแรง',
            '👤 ขึ้นอยู่กับ Elon Musk มากเกินไป',
        ],
        relatedLessons: AAPL.beginnerTips.relatedLessons,
    },
};

const AMZN: StockData = {
    ...AAPL,
    symbol: 'AMZN',
    profile: {
        ...AAPL.profile,
        name: 'Amazon.com, Inc.',
        symbol: 'AMZN',
        logo: 'https://logo.clearbit.com/amazon.com',
        description: 'Amazon คือบริษัท E-commerce ที่ใหญ่ที่สุดในโลก คุณสั่งของออนไลน์ผ่าน Amazon ได้เกือบทุกอย่าง นอกจากนี้ Amazon Web Services (AWS) คือบริการ Cloud อันดับ 1 ของโลก และยังมี Prime Video, Alexa อีกด้วย',
        sector: 'เทคโนโลยี',
        industry: 'Internet Retail',
        marketCap: 1900000000000,
        marketCapLabel: '🏢 บริษัทขนาดใหญ่มาก (Mega Cap)',
        employees: 1525000,
        founded: '1994',
        headquarters: 'Seattle, Washington, USA',
        website: 'https://amazon.com',
        ceo: 'Andy Jassy',
    },
    price: {
        ...AAPL.price,
        current: 186.21,
        previousClose: 184.55,
        change: 1.66,
        changePercent: 0.90,
        week52High: 201.20,
        week52Low: 151.61,
        history: generatePriceHistory(186.21, 365, 0.030),
    },
    keyMetrics: {
        ...AAPL.keyMetrics,
        pe: 62.5,
        peIndustryAvg: 30.0,
        pb: 8.4,
        dividendYield: null,
        dividendPerShare: null,
        revenue: 574785000000,
        revenueGrowth: 11.8,
        netIncome: 40828000000,
        profitMargin: 7.1,
        eps: 3.98,
        epsGrowth: 93.2,
    },
    scores: { overall: 4.0, dimensions: { value: 2.5, growth: 4.5, strength: 4.0, dividend: 0.5, risk: 3.5 } },
    beginnerTips: {
        goodFor: [
            '☁️ คุณเชื่อในอนาคตของ Cloud (AWS)',
            '🛒 คุณเชื่อว่า E-commerce จะเติบโตต่อ',
            '📈 กำไรเพิ่มขึ้น 93% — กำลังฟื้นตัว',
        ],
        cautionFor: [
            '📈 P/E สูงมาก (62.5) — ราคาแพง',
            '💰 ไม่จ่ายเงินปันผล',
            '📊 Profit Margin ต่ำ (7.1%) เมื่อเทียบกับคู่แข่ง',
        ],
        relatedLessons: AAPL.beginnerTips.relatedLessons,
    },
};

// ===== Exports =====
export const mockStocks: Record<string, StockData> = {
    AAPL,
    GOOGL,
    MSFT,
    TSLA,
    AMZN,
};

export const mockSearchResults: SearchResult[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'ยานยนต์', exchange: 'NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms', sector: 'เทคโนโลยี', exchange: 'NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'การเงิน', exchange: 'NYSE' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'สุขภาพ', exchange: 'NYSE' },
    { symbol: 'WMT', name: 'Walmart Inc.', sector: 'ค้าปลีก', exchange: 'NYSE' },
];

export function getPopularStocks(): StockData[] {
    return Object.values(mockStocks);
}
