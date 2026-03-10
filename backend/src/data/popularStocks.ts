// ===== Popular & Well-Known Stocks (non-S&P 500) =====
// Curated list of widely-traded, well-known stocks that users commonly search for
// These supplement the S&P 500 list to ensure popular stocks always appear in search

export interface PopularStock {
    symbol: string;
    name: string;
    sector: string;
}

export const POPULAR_STOCKS: PopularStock[] = [
    // ── Big Tech / Growth (not in S&P 500 or recently added) ──
    { symbol: 'PLTR', name: 'Palantir Technologies Inc.', sector: 'Information Technology' },
    { symbol: 'COIN', name: 'Coinbase Global Inc.', sector: 'Financials' },
    { symbol: 'SNOW', name: 'Snowflake Inc.', sector: 'Information Technology' },
    { symbol: 'NET', name: 'Cloudflare Inc.', sector: 'Information Technology' },
    { symbol: 'DDOG', name: 'Datadog Inc.', sector: 'Information Technology' },
    { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc.', sector: 'Information Technology' },
    { symbol: 'ZS', name: 'Zscaler Inc.', sector: 'Information Technology' },
    { symbol: 'MDB', name: 'MongoDB Inc.', sector: 'Information Technology' },
    { symbol: 'U', name: 'Unity Software Inc.', sector: 'Information Technology' },
    { symbol: 'RBLX', name: 'Roblox Corporation', sector: 'Communication Services' },
    { symbol: 'PATH', name: 'UiPath Inc.', sector: 'Information Technology' },
    { symbol: 'CFLT', name: 'Confluent Inc.', sector: 'Information Technology' },
    { symbol: 'S', name: 'SentinelOne Inc.', sector: 'Information Technology' },
    { symbol: 'BILL', name: 'BILL Holdings Inc.', sector: 'Information Technology' },
    { symbol: 'TTD', name: 'The Trade Desk Inc.', sector: 'Information Technology' },
    { symbol: 'TWLO', name: 'Twilio Inc.', sector: 'Communication Services' },
    { symbol: 'OKTA', name: 'Okta Inc.', sector: 'Information Technology' },
    { symbol: 'SHOP', name: 'Shopify Inc.', sector: 'Information Technology' },
    { symbol: 'SQ', name: 'Block Inc.', sector: 'Financials' },
    { symbol: 'SNAP', name: 'Snap Inc.', sector: 'Communication Services' },
    { symbol: 'PINS', name: 'Pinterest Inc.', sector: 'Communication Services' },
    { symbol: 'ROKU', name: 'Roku Inc.', sector: 'Communication Services' },
    { symbol: 'SPOT', name: 'Spotify Technology S.A.', sector: 'Communication Services' },
    { symbol: 'UBER', name: 'Uber Technologies Inc.', sector: 'Industrials' },
    { symbol: 'LYFT', name: 'Lyft Inc.', sector: 'Industrials' },
    { symbol: 'DASH', name: 'DoorDash Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'ABNB', name: 'Airbnb Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'HOOD', name: 'Robinhood Markets Inc.', sector: 'Financials' },
    { symbol: 'SOFI', name: 'SoFi Technologies Inc.', sector: 'Financials' },
    { symbol: 'AFRM', name: 'Affirm Holdings Inc.', sector: 'Financials' },
    { symbol: 'UPST', name: 'Upstart Holdings Inc.', sector: 'Financials' },
    { symbol: 'DUOL', name: 'Duolingo Inc.', sector: 'Consumer Discretionary' },

    // ── Chinese ADRs (popular with retail traders) ──
    { symbol: 'BABA', name: 'Alibaba Group Holding Ltd.', sector: 'Consumer Discretionary' },
    { symbol: 'NIO', name: 'NIO Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'JD', name: 'JD.com Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'PDD', name: 'PDD Holdings Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'BIDU', name: 'Baidu Inc.', sector: 'Communication Services' },
    { symbol: 'LI', name: 'Li Auto Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'XPEV', name: 'XPeng Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'TME', name: 'Tencent Music Entertainment Group', sector: 'Communication Services' },
    { symbol: 'BILI', name: 'Bilibili Inc.', sector: 'Communication Services' },
    { symbol: 'FUTU', name: 'Futu Holdings Ltd.', sector: 'Financials' },

    // ── EV & Clean Energy ──
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'RIVN', name: 'Rivian Automotive Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'LCID', name: 'Lucid Group Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'FSR', name: 'Fisker Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'ENPH', name: 'Enphase Energy Inc.', sector: 'Information Technology' },
    { symbol: 'SEDG', name: 'SolarEdge Technologies Inc.', sector: 'Information Technology' },
    { symbol: 'FSLR', name: 'First Solar Inc.', sector: 'Information Technology' },
    { symbol: 'PLUG', name: 'Plug Power Inc.', sector: 'Industrials' },
    { symbol: 'CHPT', name: 'ChargePoint Holdings Inc.', sector: 'Industrials' },

    // ── Semiconductor ──
    { symbol: 'TSM', name: 'Taiwan Semiconductor Manufacturing Co.', sector: 'Information Technology' },
    { symbol: 'ARM', name: 'Arm Holdings plc', sector: 'Information Technology' },
    { symbol: 'SMCI', name: 'Super Micro Computer Inc.', sector: 'Information Technology' },
    { symbol: 'MRVL', name: 'Marvell Technology Inc.', sector: 'Information Technology' },
    { symbol: 'ON', name: 'ON Semiconductor Corp.', sector: 'Information Technology' },
    { symbol: 'ASML', name: 'ASML Holding N.V.', sector: 'Information Technology' },

    // ── AI & Trending ──
    { symbol: 'AI', name: 'C3.ai Inc.', sector: 'Information Technology' },
    { symbol: 'BBAI', name: 'BigBear.ai Holdings Inc.', sector: 'Information Technology' },
    { symbol: 'SOUN', name: 'SoundHound AI Inc.', sector: 'Information Technology' },
    { symbol: 'IONQ', name: 'IonQ Inc.', sector: 'Information Technology' },
    { symbol: 'RGTI', name: 'Rigetti Computing Inc.', sector: 'Information Technology' },

    // ── Healthcare / Biotech (popular) ──
    { symbol: 'MRNA', name: 'Moderna Inc.', sector: 'Health Care' },
    { symbol: 'BNTX', name: 'BioNTech SE', sector: 'Health Care' },
    { symbol: 'CRSP', name: 'CRISPR Therapeutics AG', sector: 'Health Care' },
    { symbol: 'ILMN', name: 'Illumina Inc.', sector: 'Health Care' },

    // ── Consumer / Retail ──
    { symbol: 'GME', name: 'GameStop Corp.', sector: 'Consumer Discretionary' },
    { symbol: 'AMC', name: 'AMC Entertainment Holdings Inc.', sector: 'Communication Services' },
    { symbol: 'BBBY', name: 'Bed Bath & Beyond Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'DKS', name: 'Dick\'s Sporting Goods Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'LULU', name: 'Lululemon Athletica Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'ETSY', name: 'Etsy Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'W', name: 'Wayfair Inc.', sector: 'Consumer Discretionary' },
    { symbol: 'CHWY', name: 'Chewy Inc.', sector: 'Consumer Discretionary' },

    // ── Major ETFs (popular search targets) ──
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', sector: 'ETF' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF' },
    { symbol: 'IWM', name: 'iShares Russell 2000 ETF', sector: 'ETF' },
    { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', sector: 'ETF' },
    { symbol: 'ARKK', name: 'ARK Innovation ETF', sector: 'ETF' },
    { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', sector: 'ETF' },
    { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', sector: 'ETF' },
    { symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', sector: 'ETF' },
    { symbol: 'SOXX', name: 'iShares Semiconductor ETF', sector: 'ETF' },
    { symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', sector: 'ETF' },
    { symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', sector: 'ETF' },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', sector: 'ETF' },
    { symbol: 'GLD', name: 'SPDR Gold Shares', sector: 'ETF' },
    { symbol: 'GOLD', name: 'Barrick Gold Corporation', sector: 'Materials' },
    { symbol: 'SLV', name: 'iShares Silver Trust', sector: 'ETF' },
    { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', sector: 'ETF' },

    // ── Crypto-related ──
    { symbol: 'MSTR', name: 'MicroStrategy Inc.', sector: 'Information Technology' },
    { symbol: 'MARA', name: 'Marathon Digital Holdings Inc.', sector: 'Information Technology' },
    { symbol: 'RIOT', name: 'Riot Platforms Inc.', sector: 'Information Technology' },
    { symbol: 'BITF', name: 'Bitfarms Ltd.', sector: 'Information Technology' },
    { symbol: 'HUT', name: 'Hut 8 Corp.', sector: 'Information Technology' },
    { symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', sector: 'ETF' },

    // ── Defense / Aerospace (popular) ──
    { symbol: 'RKLB', name: 'Rocket Lab USA Inc.', sector: 'Industrials' },
    { symbol: 'ASTS', name: 'AST SpaceMobile Inc.', sector: 'Communication Services' },
    { symbol: 'LUNR', name: 'Intuitive Machines Inc.', sector: 'Industrials' },

    // ── Big-cap international ADRs ──
    { symbol: 'SONY', name: 'Sony Group Corporation', sector: 'Consumer Discretionary' },
    { symbol: 'TM', name: 'Toyota Motor Corporation', sector: 'Consumer Discretionary' },
    { symbol: 'NVO', name: 'Novo Nordisk A/S', sector: 'Health Care' },
    { symbol: 'SAP', name: 'SAP SE', sector: 'Information Technology' },
    { symbol: 'SE', name: 'Sea Limited', sector: 'Communication Services' },
    { symbol: 'GRAB', name: 'Grab Holdings Ltd.', sector: 'Communication Services' },
    { symbol: 'NU', name: 'Nu Holdings Ltd.', sector: 'Financials' },
    { symbol: 'MELI', name: 'MercadoLibre Inc.', sector: 'Consumer Discretionary' },
];

// Major US exchanges whitelist — only allow stocks from these exchanges
export const MAJOR_EXCHANGES = new Set([
    'NASDAQ', 'NYSE', 'AMEX', 'NYSEArca', 'BATS', 'CBOE',
    'New York Stock Exchange', 'NASDAQ Global Select Market',
    'NASDAQ Global Market', 'NASDAQ Capital Market',
    'NYSE American', 'NYSE Arca', 'Nasdaq',
    'NMS', 'NGM', 'NCM', 'ASE', 'NYQ', 'NAS',
]);
