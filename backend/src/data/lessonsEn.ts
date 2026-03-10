// English content for lessons — keyed by lesson ID
export interface LessonEnContent {
    descriptionEn: string;
    sections: { headingEn: string; contentEn: string }[];
    keyTakeawaysEn: string[];
    quiz?: { questionEn: string; optionsEn: string[] }[];
}

export const LESSONS_EN: Record<string, LessonEnContent> = {
    'what-is-stock': {
        descriptionEn: 'Learn the basics of stocks — why companies issue them and what you gain as a shareholder.',
        sections: [
            { headingEn: 'What is a Stock?', contentEn: 'A stock is a share of ownership in a company. When you buy stock, you become a "shareholder."\n\nExample: If Apple has 15 billion shares and you own 100, you own a tiny fraction of Apple.' },
            { headingEn: 'Why Do Companies Issue Stocks?', contentEn: 'Companies issue stocks to raise capital without borrowing. This is called an IPO (Initial Public Offering).\n\nThe money goes to R&D, expansion, hiring, or acquisitions.' },
            { headingEn: 'What Do You Get from Owning Stocks?', contentEn: '1. **Capital Gain** — buy at $100, sell at $150 = $50 profit per share\n\n2. **Dividends** — some companies pay regular cash to shareholders\n\n3. **Voting Rights** — shareholders can vote at annual meetings' },
            { headingEn: 'What is a Stock Exchange?', contentEn: 'A marketplace for buying/selling stocks:\n\n- **NYSE** — world\'s largest\n- **NASDAQ** — tech-focused (Apple, Microsoft, Google)\n- **SET** — Stock Exchange of Thailand\n\nToday most trading is done electronically via apps.' },
        ],
        keyTakeawaysEn: ['A stock is a share of ownership in a company', 'Companies issue stocks to raise capital through an IPO', 'Investors benefit from Capital Gains and Dividends', 'Stock exchanges are where stocks are bought and sold'],
        quiz: [
            { questionEn: 'What is a stock?', optionsEn: ['A loan agreement', 'A share of ownership in a company', 'A bank deposit', 'A mutual fund'] },
            { questionEn: 'What is an IPO?', optionsEn: ['Stock buyback', 'Dividend payment', 'Initial Public Offering', 'Merger & acquisition'] },
            { questionEn: 'How do investors profit from stocks?', optionsEn: ['Capital Gain only', 'Dividend only', 'Both Capital Gain and Dividend', 'Interest from the company'] },
        ],
    },
    'how-to-read-stock-price': {
        descriptionEn: 'Understand the numbers on screen: Open, Close, High, Low, Volume and more.',
        sections: [
            { headingEn: 'Stock Prices on Your Screen', contentEn: 'Key numbers:\n\n- **Current Price** — latest traded price\n- **Change** — how much it changed from yesterday\n- **Change %** — percentage change\n\n🟢 Green = up, 🔴 Red = down' },
            { headingEn: 'What is OHLCV?', contentEn: '**OHLCV** = daily price data:\n\n- **O (Open)** — first price of the day\n- **H (High)** — highest price\n- **L (Low)** — lowest price\n- **C (Close)** — last price of the day\n- **V (Volume)** — shares traded\n\nHigh Volume = lots of interest' },
            { headingEn: 'What is Market Cap?', contentEn: '**Market Cap** = Stock Price × Total Shares\n\nExample: Apple $200 × 15B shares = $3 trillion\n\n- 🏢 **Mega Cap** >$200B\n- 🏢 **Large Cap** $10B–$200B\n- 🏢 **Mid Cap** $2B–$10B\n- 🏢 **Small Cap** <$2B' },
            { headingEn: '52-Week High/Low', contentEn: 'Highest and lowest prices over the past year.\n\n- Near **52-Week High** = stock is hot, may be expensive\n- Near **52-Week Low** = stock is weak, could be an opportunity\n\n⚠️ Don\'t judge from one number alone.' },
        ],
        keyTakeawaysEn: ['Stock prices include: Current, Open, High, Low, Close, Volume', 'Market Cap = Stock Price × Total Shares', 'High Volume = good liquidity', '52-Week High/Low helps compare current price'],
        quiz: [
            { questionEn: 'What does V in OHLCV stand for?', optionsEn: ['Value', 'Volatility', 'Volume', 'Velocity'] },
            { questionEn: 'How is Market Cap calculated?', optionsEn: ['Earnings × PE', 'Stock Price × Total Shares', 'Revenue × 10', 'Assets − Liabilities'] },
        ],
    },
    'types-of-stocks': {
        descriptionEn: 'Learn about Growth, Value, Dividend, and Blue-chip stocks — choose what suits you.',
        sections: [
            { headingEn: 'Growth Stocks', contentEn: 'Companies growing faster than average.\n\n**Examples:** NVDA, TSLA, AMZN\n**Pros:** High profit potential\n**Cons:** Volatile, no dividends, high PE\n**Best for:** High-risk, long-term investors' },
            { headingEn: 'Value Stocks', contentEn: 'Stocks priced below their true value.\n\n**Examples:** BRK-B, JPM\n**How to find:** Low PE, PB < 1\n**Pros:** Buy cheap\n**Cons:** May be cheap for a reason ("Value Trap")\n**Best for:** Patient, analytical investors' },
            { headingEn: 'Dividend Stocks', contentEn: 'Pay regular dividends for steady income.\n\n**Examples:** KO, JNJ, PG\n**Look for:** Dividend Yield 2–6%, Payout Ratio < 60%, Growing dividends\n**Best for:** Income seekers, near retirement' },
            { headingEn: 'Blue-Chip Stocks', contentEn: 'Large, stable, well-known companies.\n\n**Examples:** AAPL, MSFT, GOOGL, JNJ, V\n- Mega/Large Cap, in S&P 500 or Dow Jones\n- Long profit history, less volatile\n**Best for:** Beginners wanting safe investments' },
        ],
        keyTakeawaysEn: ['Growth — fast growing, high risk, no dividends', 'Value — priced below true value, needs good analysis', 'Dividend — pays regular income', 'Blue-Chip — stable, safe, great for beginners'],
    },
    'how-to-start-investing': {
        descriptionEn: 'Step-by-step guide from opening an account to placing your first trade.',
        sections: [
            { headingEn: 'Step 1: Build an Emergency Fund', contentEn: 'Have 3–6 months of expenses saved first.\n\n**Key rule:** Only invest money you won\'t need for at least 3–5 years.' },
            { headingEn: 'Step 2: Open a Brokerage Account', contentEn: '**US stocks:** Interactive Brokers, Charles Schwab ($0 commission)\n**Thai stocks:** Bualuang, Settrade, Jitta\n\nAccount opening takes 1–3 business days.' },
            { headingEn: 'Step 3: Start Small', contentEn: 'Start with 1–2 stocks you understand (Apple, Google).\nUse Dollar-Cost Averaging (DCA).\nDon\'t use Margin.\nSet clear goals.\n\n💡 **DCA** = invest the same amount monthly regardless of price.' },
            { headingEn: 'Step 4: Monitor and Learn', contentEn: 'Read news about your investments.\nReview financials quarterly.\nDon\'t panic when prices drop.\nLearn from mistakes.\n\n⏰ Long-term investing > short-term speculation.' },
        ],
        keyTakeawaysEn: ['Have 3–6 months emergency fund first', 'Open an account with a reputable broker', 'Start small with DCA', 'Invest long-term, follow news and financials'],
    },
    'how-stock-market-works': {
        descriptionEn: 'How the stock market works: trading hours, Bid/Ask, order matching, and market participants.',
        sections: [
            { headingEn: 'Market Hours', contentEn: '**US (NYSE/NASDAQ):** 9:30 AM–4:00 PM ET, Mon–Fri\nPre-Market: 4:00–9:30 AM, After-Hours: 4:00–8:00 PM\n⚠️ Extended hours have low liquidity.\n\n**Thai (SET):** Morning 10:00–12:30, Afternoon 2:30–4:30' },
            { headingEn: 'Who Trades in the Market?', contentEn: '1. **Retail Investors** — everyday people using apps\n2. **Institutional Investors** — funds, banks trading millions\n3. **Market Makers** — provide liquidity by always quoting prices\n4. **Brokers** — intermediaries sending your orders to the exchange' },
            { headingEn: 'What is Bid / Ask?', contentEn: '**Bid** = highest buy price\n**Ask** = lowest sell price\n**Spread** = Ask − Bid\n\nNarrow Spread = good liquidity (large stocks)\nWide Spread = low liquidity (small stocks)\n\n💡 Market Order buys at Ask, sells at Bid.' },
            { headingEn: 'What Happens When You Click "Buy"?', contentEn: '1. You click "Buy"\n2. Order goes to your broker\n3. Broker sends to the exchange\n4. System matches buy with sell\n5. Trade executed\n6. Stock in your account (T+1 settlement)\n\nEverything happens in fractions of a second.' },
        ],
        keyTakeawaysEn: ['US market: 9:30 AM–4:00 PM ET', 'Bid = buy price, Ask = sell price, Spread = difference', 'Narrow Spread = good liquidity', 'Trades settle T+1'],
        quiz: [
            { questionEn: 'What is the Bid?', optionsEn: ['Seller\'s price', 'Highest price a buyer will pay', 'Opening price', 'Average price'] },
            { questionEn: 'What does T+1 mean?', optionsEn: ['Buy only 1 share', 'Settles 1 business day after trade', 'Market opens 1 hour', '1% commission'] },
        ],
    },
    'order-types': {
        descriptionEn: 'Market Order, Limit Order, Stop Order — and when to use each.',
        sections: [
            { headingEn: 'Market Order', contentEn: 'Buy/sell immediately at best available price.\n✅ Guaranteed execution, simple\n❌ Can\'t control price, possible slippage\n**Use for:** Urgent trades on liquid stocks' },
            { headingEn: 'Limit Order', contentEn: 'Set your desired price — only executes when reached.\n**Buy Limit:** below current price\n**Sell Limit:** above current price\n✅ Control your price\n❌ May never execute\n💡 Recommended for beginners' },
            { headingEn: 'Stop Order', contentEn: 'Auto-sell when price drops to a level.\n**Stop Loss:** protects against losses\n**Trailing Stop:** moves up with rising price\n💡 Set Stop Loss every time you buy.' },
            { headingEn: 'Day Order vs GTC', contentEn: '**Day Order:** valid one day only\n**GTC (Good Till Cancelled):** stays active until executed or cancelled (max 60–90 days)' },
        ],
        keyTakeawaysEn: ['Market Order = instant at market price', 'Limit Order = only at your specified price', 'Stop Loss = auto-sell to limit losses', 'Beginners: use Limit Order + Stop Loss'],
        quiz: [
            { questionEn: 'What is a Limit Order?', optionsEn: ['Buy instantly', 'Buy/sell at a specified price', 'Auto-cancel', 'Buy limited quantity'] },
            { questionEn: 'What does GTC stand for?', optionsEn: ['Get The Cash', 'Good Till Cancelled', 'Go To Close', 'Gain Through Compound'] },
        ],
    },
    'stock-indices': {
        descriptionEn: 'S&P 500, Dow Jones, NASDAQ — why indices matter for every investor.',
        sections: [
            { headingEn: 'What is a Stock Index?', contentEn: 'A number measuring performance of a group of stocks — a market health thermometer.\n\nIndex up 📈 = market doing well\nIndex down 📉 = market struggling' },
            { headingEn: 'Major US Indices', contentEn: '**S&P 500:** 500 largest US companies, ~10%/yr avg return\n**Dow Jones:** 30 Blue-Chip companies, oldest index\n**NASDAQ:** 3,000+ stocks, tech-focused' },
            { headingEn: 'Thai and Global Indices', contentEn: '🇹🇭 **SET Index**, SET50, SET100\n🌍 Nikkei 225 (Japan), FTSE 100 (UK), DAX (Germany), Hang Seng (HK)' },
            { headingEn: 'Why Watch Indices?', contentEn: '1. Measure market health\n2. Benchmark your portfolio (beat S&P 500?)\n3. Invest via Index Funds: SPY, VOO, QQQ\n\n💡 Warren Buffett recommends S&P 500 index funds for most people.' },
        ],
        keyTakeawaysEn: ['Stock index measures a group of stocks\' performance', 'S&P 500 = top 500, the standard benchmark', 'Use indices to benchmark your portfolio', 'Index funds (SPY, VOO, QQQ) are easiest way to start'],
        quiz: [
            { questionEn: 'How many companies in S&P 500?', optionsEn: ['50', '100', '500', '1,000'] },
            { questionEn: 'What is SPY?', optionsEn: ['A trading app', 'An S&P 500 index fund', 'A Thai index', 'A tech company'] },
        ],
    },
    'etf-and-funds': {
        descriptionEn: 'ETFs and Mutual Funds — how they differ and which popular ETFs beginners should know.',
        sections: [
            { headingEn: 'What is an ETF?', contentEn: '**ETF (Exchange-Traded Fund)** trades on the exchange like a stock.\n\nBuying SPY = buying a basket of 500 stocks at once!\n\n✅ Automatic diversification\n✅ Very low fees (0.03–0.20%/yr)\n✅ Best for beginners' },
            { headingEn: 'Popular ETFs', contentEn: '**Index:** SPY/VOO (S&P 500), QQQ (NASDAQ-100), VTI (Total US)\n**Dividend:** VYM, SCHD\n**Sector:** XLK (Tech), XLF (Finance), XLV (Health)\n\n💡 VOO + QQQ is plenty for beginners.' },
            { headingEn: 'What is a Mutual Fund?', contentEn: 'Similar to ETFs but:\n- Trades once/day (not real-time)\n- Higher fees (0.50–1.50%)\n- May require higher minimum investment' },
            { headingEn: 'ETF vs Individual Stocks', contentEn: '**Choose ETFs if:** just starting, want diversification, plan to DCA\n**Choose stocks if:** ready to analyze, confident in specific companies\n\n**Recommendation:** Start 70% ETFs + 30% individual stocks' },
        ],
        keyTakeawaysEn: ['ETF = fund that trades like a stock, automatic diversification', 'VOO/SPY = invest in S&P 500', 'ETFs have lower fees than mutual funds', 'Beginners: start with ETFs + a few stocks'],
        quiz: [
            { questionEn: 'What does ETF stand for?', optionsEn: ['Electronic Transfer Fund', 'Exchange-Traded Fund', 'Equity Trading Fee', 'External Tax Form'] },
            { questionEn: 'What is VOO?', optionsEn: ['A company stock', 'An S&P 500 index fund', 'A trading app', 'A cryptocurrency'] },
        ],
    },
    'reading-stock-charts': {
        descriptionEn: 'Candlestick charts, line charts, volume bars, and timeframes for beginners.',
        sections: [
            { headingEn: 'Line Chart', contentEn: 'Simplest chart — connects closing prices with a line.\nX-axis = date, Y-axis = price\nLine up 📈 = rising, Line down 📉 = falling\n\nBest for seeing long-term trends.' },
            { headingEn: 'Candlestick Chart', contentEn: 'Each candle shows: Open, Close, High, Low\n\n🟢 **Green** = Close > Open (up)\n🔴 **Red** = Close < Open (down)\n\n**Body** = Open to Close range\n**Wick** = High and Low range' },
            { headingEn: 'What is Volume?', contentEn: 'Number of shares traded.\nTall bar = lots of activity, Short bar = little activity\n\nPrice up + High volume = strong uptrend ✅\nPrice up + Low volume = weak uptrend ⚠️' },
            { headingEn: 'Timeframe', contentEn: '1 min/5 min = Day Traders\n1 hour = Swing Traders\nDaily = Regular investors\nWeekly/Monthly = Long-term view\n\n💡 Beginners: use Daily/Weekly, avoid 1-minute charts!' },
        ],
        keyTakeawaysEn: ['Line chart = simple, shows trends', 'Candlestick: green (up), red (down), shows OHLC', 'High Volume + price up = strong signal', 'Beginners: use Daily/Weekly charts'],
        quiz: [
            { questionEn: 'What does a green candlestick mean?', optionsEn: ['Price went down', 'Close higher than Open', 'High volume', 'Good buy signal'] },
            { questionEn: 'High Volume + price increase means?', optionsEn: ['Weak uptrend', 'Strong uptrend', 'Market will drop', 'Sell immediately'] },
        ],
    },
    'investment-terms': {
        descriptionEn: 'Essential terms: Bull/Bear, Long/Short, Margin, Earnings, and more.',
        sections: [
            { headingEn: 'Bull Market / Bear Market', contentEn: '🐂 **Bull** = market up 20%+, confidence high\n🐻 **Bear** = market down 20%+, fear prevails\n\n**Correction** = 10–20% drop\n**Crash** = rapid drop >20%' },
            { headingEn: 'Long / Short', contentEn: '📈 **Long** = buy expecting price to rise ("buy low, sell high")\n📉 **Short** = borrow & sell expecting price to fall\n\n⚠️ Short selling has unlimited risk — NOT for beginners' },
            { headingEn: 'Margin / Leverage', contentEn: '**Margin** = borrowing from broker to buy more stock\n**Leverage** = multiplier (2x, 3x...)\n**Margin Call** = forced to add money or sell when losses mount\n\n🚫 Beginners: NEVER use Margin!' },
            { headingEn: 'Other Important Terms', contentEn: '**Earnings terms:** EPS, Revenue, Profit Margin\n**Dividend terms:** Dividend Yield, Ex-Dividend Date\n**Market terms:** Volatility, Liquidity, Portfolio, Benchmark' },
        ],
        keyTakeawaysEn: ['Bull = uptrend, Bear = downtrend', 'Long = buy first, Short = sell first', 'Margin = borrowing — beginners should never use it', 'EPS, Dividend Yield, Volatility are must-know terms'],
        quiz: [
            { questionEn: 'What is a Bear Market?', optionsEn: ['Market up 20%+', 'Market down 20%+', 'Market closed', 'Market just opened'] },
            { questionEn: 'What is a Margin Call?', optionsEn: ['Broker inviting you to invest', 'Forced to add money when losses mount', 'Special buy order', 'Monthly fee'] },
            { questionEn: 'Why is Ex-Dividend Date important?', optionsEn: ['Stock starts trading', 'Must own before this date for dividends', 'Earnings date', 'Market close'] },
        ],
    },
    'pe-ratio': {
        descriptionEn: 'Understand PE Ratio — the most important metric for stock valuation.',
        sections: [
            { headingEn: 'What is PE Ratio?', contentEn: '**PE Ratio** = Stock Price ÷ EPS\n\nApple at $200, EPS $8 → PE = 25x\nYou\'re paying 25 times annual earnings.' },
            { headingEn: 'High PE vs Low PE', contentEn: '**High PE (>25):** Market expects high growth (e.g. NVDA ~60)\n**Low PE (<15):** Stock is cheap — value opportunity or trouble\n**Fair PE:** Compare with industry average. S&P 500 average ~20–25.' },
            { headingEn: 'Limitations', contentEn: 'Doesn\'t work for companies with losses.\nDoesn\'t show growth speed → use **PEG Ratio** (PE ÷ Growth Rate).\nPEG < 1 = cheap, PEG > 2 = expensive.' },
        ],
        keyTakeawaysEn: ['PE = Stock Price ÷ EPS', 'High PE = high growth expectations', 'Compare PE with industry peers', 'Use PEG Ratio to factor in growth'],
        quiz: [
            { questionEn: 'How is PE calculated?', optionsEn: ['Price × EPS', 'Price ÷ EPS', 'EPS ÷ Price', 'Profit ÷ Revenue'] },
            { questionEn: 'Growth stocks typically have?', optionsEn: ['Very low PE (<10)', 'Moderate PE (15–20)', 'High PE (>25)', 'Negative PE'] },
        ],
    },
    'reading-financial-statements': {
        descriptionEn: 'Understand Income Statement, Balance Sheet, and Cash Flow in simple terms.',
        sections: [
            { headingEn: 'Income Statement', contentEn: 'Shows money **made** over a period:\nRevenue → Cost → Gross Profit → Operating Expenses → **Net Income**\n\n💡 Profit Margin = Net Income ÷ Revenue → higher is better' },
            { headingEn: 'Balance Sheet', contentEn: 'Shows what company **has** at a point in time:\n**Assets = Liabilities + Equity**\n\n💡 Debt-to-Equity = Liabilities ÷ Equity → lower is better' },
            { headingEn: 'Cash Flow Statement', contentEn: 'Shows **cash movement:**\n1. Operating Cash Flow (should be positive!)\n2. Investing Cash Flow (usually negative)\n3. Financing Cash Flow\n\n💡 Free Cash Flow = Operating − CapEx' },
        ],
        keyTakeawaysEn: ['Income Statement → how much money was made', 'Balance Sheet → assets and debts', 'Cash Flow → cash movement', 'Watch Profit Margin, Debt-to-Equity, Free Cash Flow'],
    },
    'technical-analysis-basics': {
        descriptionEn: 'Stock charts, Moving Averages, RSI, and MACD for beginners.',
        sections: [
            { headingEn: 'What is Technical Analysis?', contentEn: 'Studying price charts and volume to predict future direction.\n\nCore ideas: Price reflects everything, prices trend, history repeats.\n⚠️ Not 100% accurate — use with fundamental analysis.' },
            { headingEn: 'Moving Average (MA)', contentEn: 'Average price over a period.\nMA50 = short-term, MA200 = long-term\n\nPrice above MA = uptrend ✅\n**Golden Cross** = MA50 crosses above MA200 → buy\n**Death Cross** = MA50 crosses below MA200 → sell' },
            { headingEn: 'RSI', contentEn: 'Measures if stock is overbought/oversold (0–100).\n\nRSI > 70 = Overbought 🔴\nRSI < 30 = Oversold 🟢\nRSI 30–70 = normal' },
            { headingEn: 'MACD', contentEn: 'Identifies trend momentum.\n\nMACD crosses Signal Line upward = Bullish 🟢\nMACD crosses Signal Line downward = Bearish 🔴' },
        ],
        keyTakeawaysEn: ['MA50 > MA200 = Golden Cross (buy signal)', 'RSI > 70 = Overbought, < 30 = Oversold', 'MACD helps time entries and exits', 'Use with fundamental analysis'],
    },
    'fundamental-vs-technical': {
        descriptionEn: 'Compare the two main analysis approaches and when to use each.',
        sections: [
            { headingEn: 'Fundamental Analysis', contentEn: 'Focuses on the **company**: PE, EPS, ROE, financials, news\n**Best for:** Long-term investing (months to years)' },
            { headingEn: 'Technical Analysis', contentEn: 'Focuses on **price charts**: MA, RSI, MACD, Support/Resistance\n**Best for:** Short-term trading (days to weeks)' },
            { headingEn: 'Using Both Together', contentEn: 'Best approach:\n1. Use fundamentals to pick good companies\n2. Use technicals to find the right entry point\n\n💡 FinLearn shows both on the same page.' },
        ],
        keyTakeawaysEn: ['Fundamental = company analysis, long-term', 'Technical = chart analysis, short-term', 'Using both gives best results'],
    },
    'valuation-models': {
        descriptionEn: 'DCF, Comparable Analysis, and valuation models for finding a stock\'s true value.',
        sections: [
            { headingEn: 'Intrinsic Value', contentEn: 'What a stock should be worth based on fundamentals.\n\nIntrinsic > Market Price → Undervalued (buy)\nIntrinsic < Market Price → Overvalued (expensive)\n\n**Margin of Safety:** Buy 20–30% below Intrinsic Value.' },
            { headingEn: 'DCF', contentEn: 'Calculates present value of future cash flows.\n\nSteps: Estimate FCF → Choose Discount Rate → Calculate Terminal Value → Divide by shares\n\nLimitation: Highly sensitive to assumptions.' },
            { headingEn: 'Comparable Analysis', contentEn: 'Compare ratios with industry peers: P/E, EV/EBITDA, P/S, P/B, PEG\n\nPros: Simple, uses real data\nCons: All peers might be overvalued' },
            { headingEn: 'Enterprise Value and WACC', contentEn: 'EV = Market Cap + Debt − Cash\nShows total business value including debt.\n\nWACC = average cost of capital (8–12% typical)\nLower WACC → Higher Intrinsic Value' },
        ],
        keyTakeawaysEn: ['Intrinsic Value = stock\'s true worth', 'DCF values based on future cash flows', 'Comparable Analysis compares P/E, EV/EBITDA with peers', 'Buy 20–30% below Intrinsic Value (Margin of Safety)'],
        quiz: [
            { questionEn: 'What does DCF stand for?', optionsEn: ['Direct Cash Fund', 'Discounted Cash Flow', 'Dividend Capital Formula', 'Debt Coverage Factor'] },
            { questionEn: 'How is EV calculated?', optionsEn: ['Market Cap + Cash', 'Market Cap + Debt − Cash', 'Revenue × PE', 'Earnings × Shares'] },
            { questionEn: 'What is Margin of Safety?', optionsEn: ['Minimum profit', 'Gap between Intrinsic Value and buy price', 'Stop Loss point', 'Emergency fund'] },
        ],
    },
    'macro-economics': {
        descriptionEn: 'How interest rates, inflation, GDP, and Fed policy affect stock prices.',
        sections: [
            { headingEn: 'The Fed and Interest Rates', contentEn: 'The Fed sets monetary policy.\n\n📉 Rates up → stocks usually fall (borrowing costs increase)\n📈 Rates down → stocks usually rise (cheap borrowing)\n\nFOMC meets 8x/year. Markets are volatile on FOMC days.' },
            { headingEn: 'Inflation', contentEn: 'Rising prices over time. Measured by CPI, PCE.\n\nModerate (2–3%) → good for stocks\nHigh (>5%) → bad, Fed raises rates\nDeflation → very bad, economy stagnates' },
            { headingEn: 'GDP and Recession', contentEn: 'GDP growing → stocks rise. GDP shrinking → stocks fall.\n\n**Recession** = GDP contracts 2 quarters in a row.\nStocks drop 20–40% but market moves BEFORE recession starts.\n\nThe stock market is a **Leading Indicator**.' },
            { headingEn: 'Key Indicators to Watch', contentEn: 'Non-Farm Payrolls, CPI, FOMC Statement, GDP, PMI, Consumer Confidence\n\n**Yield Curve:**\nNormal = economy fine\n**Inverted** = recession signal!\n\n💡 Use an Economic Calendar to track these.' },
        ],
        keyTakeawaysEn: ['Rates up → stocks fall; Rates down → stocks rise', 'Moderate inflation good; high inflation triggers rate hikes', 'Stock market is a Leading Indicator', 'Inverted Yield Curve = recession signal'],
        quiz: [
            { questionEn: 'When Fed raises rates, stocks usually…?', optionsEn: ['Always rise', 'Fall — borrowing costs increase', 'No effect', 'Only tech rises'] },
            { questionEn: 'What is a Recession?', optionsEn: ['Market drops 10%', 'GDP contracts 2 quarters', 'Inflation above 5%', 'Unemployment above 10%'] },
            { questionEn: 'Inverted Yield Curve signals?', optionsEn: ['Economy will boom', 'Recession ahead', 'Rates will drop', 'Inflation disappears'] },
        ],
    },
    'dca-strategy': {
        descriptionEn: 'Learn the DCA strategy — the best approach for beginners.',
        sections: [
            { headingEn: 'What is DCA?', contentEn: '**Dollar-Cost Averaging** = invest a fixed amount at regular intervals regardless of price.\n\nExample: $500/month in AAPL\nMonth 1: $200 → 2.5 shares\nMonth 2: $180 → 2.78 shares\nMonth 3: $220 → 2.27 shares\n\nAverage cost is lower than buying at the peak.' },
            { headingEn: 'Why DCA Works', contentEn: '1. Reduces risk — no market timing needed\n2. Reduces emotions — no daily worry\n3. Builds discipline — automatic monthly investing\n4. Great long-term — market averages ~10%/yr\n\n💡 Buffett recommends DCA into S&P 500 index funds.' },
            { headingEn: 'Cautions', contentEn: 'DCA doesn\'t guarantee no losses.\nNot ideal in prolonged bear markets.\nChoose stocks/funds with long-term growth.\n\n**Best for DCA:** SPY, VOO, stable Blue-Chips. Invest 5+ years.' },
        ],
        keyTakeawaysEn: ['DCA = invest same amount regularly, regardless of price', 'Reduces risk from market timing', 'Great for beginners, builds discipline', 'Choose long-term growth stocks/funds'],
    },
    'portfolio-diversification': {
        descriptionEn: 'Why you should never put all your eggs in one basket.',
        sections: [
            { headingEn: 'What is Diversification?', contentEn: 'Investing in multiple assets to reduce risk.\n\n1 stock drops 50% → portfolio drops 50%\n10 stocks, 1 drops 50% → portfolio drops only 5%' },
            { headingEn: 'How to Diversify', contentEn: 'Level 1: Across industries (Tech, Health, Finance, Consumer)\nLevel 2: Across asset types (Stocks 60–70%, Bonds 20–30%, Cash 10%)\nLevel 3: Across geographies (US, Europe, Asia)' },
            { headingEn: 'Sample Beginner Portfolio', contentEn: '40% Blue-Chip (AAPL, MSFT, GOOGL)\n20% Growth (NVDA, AMZN)\n20% Dividend (KO, JNJ, PG)\n10% Index Fund (SPY)\n10% Cash\n\n💡 Adjust based on age and risk tolerance.' },
        ],
        keyTakeawaysEn: ['Diversification reduces risk', 'Diversify across industries, assets, geographies', 'Mix Blue-Chip + Dividend + Index Fund', 'Adjust based on age and risk tolerance'],
    },
    'long-term-investing': {
        descriptionEn: 'The power of compound interest and why time is your best friend.',
        sections: [
            { headingEn: 'Compound Interest', contentEn: '"The eighth wonder of the world." — Einstein\n\n$10,000 at 10%/yr:\nYear 10: $25,937\nYear 20: $67,275\nYear 30: **$174,494**\n\nMoney grows 17x in 30 years!' },
            { headingEn: 'Time in Market > Timing Market', contentEn: 'S&P 500, 1993–2023:\n- All 30 years → ~10%/yr\n- Missed 10 best days → return halved!\n- Missed 20 best days → barely any profit\n\nStay invested — nobody knows which days will surge.' },
            { headingEn: 'Wisdom from the Greats', contentEn: 'Buffett: "Best holding period is forever."\nLynch: "Real money from holding, not trading."\nBogle: "Buy the whole haystack." (Index funds)\n\nPick good companies → buy at fair prices → hold long → be patient!' },
        ],
        keyTakeawaysEn: ['Compound interest grows money exponentially', 'Staying invested beats timing the market', 'Start early = more compounding time', 'Be patient, ignore short-term volatility'],
    },
    'options-trading': {
        descriptionEn: 'Call/Put Options, Greeks, strategies, and risks for experienced investors.',
        sections: [
            { headingEn: 'What are Options?', contentEn: 'Contracts giving the **right** (not obligation) to buy/sell at a set price within a time period.\n\n📈 **Call** = right to buy\n📉 **Put** = right to sell\n\n⚠️ Very risky — premium can be lost entirely.' },
            { headingEn: 'Call and Put Options', contentEn: '**Call:** Buy when expecting price rise. Profit if price > Strike + Premium.\n**Put:** Buy when expecting price fall, or to protect your portfolio.\n\n💡 Protective Put = insurance for your stock holdings.' },
            { headingEn: 'Options Greeks', contentEn: '**Delta:** Price change per $1 stock move\n**Theta:** Time decay — options lose value daily ⚠️\n**Gamma:** Rate of Delta change\n**Vega:** Effect of volatility\n\nHigh IV = expensive options (before earnings)' },
            { headingEn: 'Basic Strategies', contentEn: '**Covered Call:** Hold stock + sell Call for income\n**Protective Put:** Hold stock + buy Put for protection\n**Long Straddle:** Buy Call + Put, profit from big moves\n\n🚫 Never: sell Naked Options, buy near expiration, risk >5% of portfolio' },
        ],
        keyTakeawaysEn: ['Call = right to buy, Put = right to sell', 'Options can expire worthless — lose entire premium', 'Theta eats value daily — time is the enemy', 'Start with Covered Calls or Protective Puts'],
        quiz: [
            { questionEn: 'What does a Call Option give?', optionsEn: ['Right to sell', 'Right to buy at a set price', 'Right to dividends', 'Right to borrow'] },
            { questionEn: 'What is Theta?', optionsEn: ['Price change per stock move', 'Time decay of value', 'Volatility effect', 'Delta change rate'] },
            { questionEn: 'What is a Covered Call?', optionsEn: ['Buy Call without stock', 'Sell Call on stock you own', 'Buy Call + Put', 'Sell Put to buy cheap'] },
        ],
    },
    'understanding-risk': {
        descriptionEn: 'Types of investment risk and why risk ≠ bad.',
        sections: [
            { headingEn: 'Risk ≠ Danger', contentEn: 'Risk means "uncertainty" — returns may be more or less than expected.\n\nHigher returns = Higher risk:\n- Bank deposit: 1–2%/yr\n- Bonds: 3–5%/yr\n- Blue-Chip: 8–12%/yr\n- Growth stocks: 15%+/yr (or losses)' },
            { headingEn: 'Types of Risk', contentEn: '1. **Market Risk** — entire market drops\n2. **Company Risk** — single company problems\n3. **Sector Risk** — whole industry affected\n4. **Currency Risk** — exchange rate fluctuations\n5. **Inflation Risk** — returns below inflation = real loss' },
            { headingEn: 'Measuring Risk', contentEn: '**Beta:** 1 = moves with market, >1 = more volatile (TSLA), <1 = less volatile (JNJ)\n**Standard Deviation:** higher = more risk\n\n💡 FinLearn shows a Risk Score calculated from multiple factors.' },
        ],
        keyTakeawaysEn: ['Higher risk = higher potential return (and loss)', 'Risk types: market, company, sector, currency, inflation', 'Beta measures volatility vs market', 'Diversification reduces company and sector risk'],
    },
    'stop-loss': {
        descriptionEn: 'Learn how to set Stop Loss orders to limit losses.',
        sections: [
            { headingEn: 'What is Stop Loss?', contentEn: 'Auto-sell when price drops to a set level.\n\nBuy AAPL at $200, Stop Loss at $180 → auto-sells at $180\nLose only 10%, not 30% or 50%.\n\n"Cut losses short, let profits run."' },
            { headingEn: 'How to Set Stop Loss', contentEn: 'Blue-Chip: 7–10% below buy price\nGrowth: 10–15%\nSpeculative: 15–20%\n\n**Trailing Stop:** moves up with rising price.\nToo tight (5%) = triggered by normal swings\nToo loose (30%) = excessive losses' },
        ],
        keyTakeawaysEn: ['Stop Loss = auto-sell at a set level', 'Limits losses from getting worse', 'Trailing Stop locks in profits', 'Always set Stop Loss when buying'],
    },
    'common-mistakes': {
        descriptionEn: 'Avoid the most common beginner investor mistakes.',
        sections: [
            { headingEn: 'Mistake #1: FOMO', contentEn: 'Fear of Missing Out — buying because everyone else is.\n\nFix: Do homework first. If stock already up 100%, may be too late.\n💡 Buffett: "Be fearful when others are greedy."' },
            { headingEn: 'Mistake #2: No Diversification', contentEn: '100% in one stock = extreme risk.\nEnron employees lost everything.\n\nFix: 5–10 stocks minimum, across industries, plus index funds.' },
            { headingEn: 'Mistake #3: Panic Selling', contentEn: 'Market drops → fear → sell everything → miss recovery.\n\nCOVID March 2020: S&P dropped 34%, recovered 100%+ within a year.\n\nFix: Have a plan, remember drops are normal, keep emergency fund separate.' },
            { headingEn: 'Mistake #4: No Stop Loss', contentEn: 'Letting losses grow hoping price will come back.\n\n"A stock down 50% needs to rise 100% just to break even."\n\nFix: Always set Stop Loss. Accept small losses over catastrophic ones.' },
        ],
        keyTakeawaysEn: ['Don\'t invest on hype — do homework first', 'Diversify — don\'t put eggs in one basket', 'Don\'t panic sell — drops are normal', 'Always set Stop Loss — cut losses, let profits run'],
    },
    'investment-psychology': {
        descriptionEn: 'Understand psychological biases that cause bad investment decisions and how to control emotions.',
        sections: [
            { headingEn: 'FOMO — Fear of Missing Out', contentEn: 'Seeing others profit → buying without analysis.\n\nGameStop 2021: $20 → $480 → $40. FOMO buyers at the top lost 90%.\n\nFix: "Would I buy if nobody was talking about it?" Have a plan, don\'t decide emotionally.' },
            { headingEn: 'FUD — Fear, Uncertainty, Doubt', contentEn: 'One bad news → sell everything.\n\nReality: US stock market has gone up over 50+ years. Every crash recovers.\n\nFix: Separate facts from opinions. Look at long-term data. Keep an emergency fund.' },
            { headingEn: 'Common Biases', contentEn: '**Confirmation Bias:** Only seeking info that supports your belief.\n**Loss Aversion:** Pain of $100 loss > joy of $100 gain → hold losers too long.\n**Anchoring:** "Was $200, now $100 = cheap!" But fundamentals may have changed.\n**Recency Bias:** Recent events dominate thinking.\n\nFix: Seek opposing views, set Stop Loss, look at multi-year data.' },
            { headingEn: 'Controlling Emotions', contentEn: '1. **Write a plan** before buying\n2. **DCA** — invest monthly, same amount\n3. **Don\'t check portfolio daily** — weekly/monthly is enough\n4. **Limit news** — read quarterlies, skip daily noise\n5. **24-hour rule** — wait a day before any buy/sell decision' },
        ],
        keyTakeawaysEn: ['FOMO makes you buy high — don\'t buy just because everyone is', 'FUD makes you sell low — drops are normal', 'Know your biases: Confirmation, Loss Aversion, Anchoring', 'Have a plan + DCA + don\'t check daily = control emotions'],
        quiz: [
            { questionEn: 'What is FOMO?', optionsEn: ['Fear of market crash', 'Fear of missing out — buying on hype', 'An investment strategy', 'A stock analysis method'] },
            { questionEn: 'What is Loss Aversion?', optionsEn: ['Fear of market crash', 'Pain of loss outweighs joy of equal gain', 'Never investing at all', 'Buying too many stocks'] },
            { questionEn: 'What is the 24-hour rule?', optionsEn: ['Trade within 24 hrs', 'Wait 24 hrs before deciding to buy/sell', 'Check price every 24 hrs', 'Sell within 24 hrs of buying'] },
        ],
    },
    'taxes-and-fees': {
        descriptionEn: 'Understand capital gains tax, dividend tax, commissions, and how to reduce investing costs.',
        sections: [
            { headingEn: 'Capital Gains Tax', contentEn: '🇺🇸 **US stocks:**\nShort-term (<1 yr) = taxed as income (10–37%)\nLong-term (>1 yr) = special rate (0%, 15%, or 20%)\n\n💡 Hold >1 year for much lower taxes!\n\n🇹🇭 **Thai stocks:** Capital gains on SET are tax-free for individuals.\nForeign stock gains must be included in income tax.' },
            { headingEn: 'Dividend Tax', contentEn: '🇺🇸 US withholding tax on dividends: **30%** by default.\nFile **W-8BEN** to reduce to **15%**.\n\n🇹🇭 Thai dividends: 10% withheld at source.' },
            { headingEn: 'Trading Fees', contentEn: '**Commission:** US brokers mostly $0. Thai brokers 0.10–0.25%.\n**Spread:** Hidden cost (Bid/Ask gap).\n**Expense Ratio:** ETFs 0.03–0.20%/yr vs Mutual Funds 0.50–1.50%/yr.\n**Currency conversion:** 0.2–1.0% for foreign stocks.' },
            { headingEn: 'Reducing Costs', contentEn: '1. Choose $0 commission brokers\n2. Buy low-fee ETFs (VOO 0.03%)\n3. Don\'t trade frequently\n4. Hold >1 year for lower taxes\n5. Tax Loss Harvesting — sell losers to offset gains\n6. File W-8BEN to reduce dividend tax' },
        ],
        keyTakeawaysEn: ['Hold >1 year for lower Capital Gains tax', 'File W-8BEN to reduce US dividend tax from 30% to 15%', 'Choose low-fee ETFs, don\'t trade often', 'Expense Ratio looks small but compounds to huge amounts'],
        quiz: [
            { questionEn: 'Long-term Capital Gains Tax applies when holding for?', optionsEn: ['1 month', '6 months', 'More than 1 year', '5 years'] },
            { questionEn: 'What does W-8BEN help with?', optionsEn: ['Reduce commissions', 'Reduce US dividend withholding tax', 'Open Margin account', 'Buy ETFs cheaper'] },
            { questionEn: 'What is a good ETF Expense Ratio?', optionsEn: ['Below 0.20%', '0.50–1.00%', '1.00–2.00%', 'Above 2.00%'] },
        ],
    },
};
