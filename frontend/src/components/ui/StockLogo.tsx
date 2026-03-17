'use client';

import { useState } from 'react';

/** Map symbols whose domain ≠ symbol.com to the correct company domain */
const LOGO_DOMAINS: Record<string, string> = {
    'META': 'meta.com', 'GOOGL': 'google.com', 'GOOG': 'google.com',
    'AMZN': 'amazon.com', 'TSLA': 'tesla.com', 'NVDA': 'nvidia.com',
    'BRK-B': 'berkshirehathaway.com', 'BRK-A': 'berkshirehathaway.com',
    'NFLX': 'netflix.com', 'AVGO': 'broadcom.com', 'ORCL': 'oracle.com',
    'CRM': 'salesforce.com', 'CSCO': 'cisco.com', 'ACN': 'accenture.com',
    'ADBE': 'adobe.com', 'INTC': 'intel.com', 'QCOM': 'qualcomm.com',
    'INTU': 'intuit.com', 'AMAT': 'appliedmaterials.com', 'TXN': 'ti.com',
    'NOW': 'servicenow.com', 'PYPL': 'paypal.com', 'SHOP': 'shopify.com',
    'SPOT': 'spotify.com', 'UBER': 'uber.com', 'ABNB': 'airbnb.com',
    'SNAP': 'snap.com', 'PINS': 'pinterest.com', 'PLTR': 'palantir.com',
    'JPM': 'jpmorganchase.com', 'BAC': 'bankofamerica.com', 'GS': 'goldmansachs.com',
    'MS': 'morganstanley.com', 'WFC': 'wellsfargo.com', 'BLK': 'blackrock.com',
    'UNH': 'unitedhealthgroup.com', 'JNJ': 'jnj.com', 'PFE': 'pfizer.com',
    'ABBV': 'abbvie.com', 'MRK': 'merck.com', 'LLY': 'lilly.com',
    'ABT': 'abbott.com', 'TMO': 'thermofisher.com', 'ISRG': 'intuitive.com',
    'MA': 'mastercard.com', 'V': 'visa.com', 'AXP': 'americanexpress.com',
    'HD': 'homedepot.com', 'LOW': 'lowes.com', 'COST': 'costco.com',
    'WMT': 'walmart.com', 'TGT': 'target.com', 'MCD': 'mcdonalds.com',
    'SBUX': 'starbucks.com', 'NKE': 'nike.com', 'DIS': 'thewaltdisneycompany.com',
    'CMCSA': 'comcast.com', 'VZ': 'verizon.com', 'TMUS': 't-mobile.com',
    'T': 'att.com', 'XOM': 'exxonmobil.com', 'CVX': 'chevron.com',
    'NEE': 'nexteraenergy.com', 'BA': 'boeing.com', 'LMT': 'lockheedmartin.com',
    'RTX': 'rtx.com', 'GE': 'ge.com', 'HON': 'honeywell.com', 'CAT': 'cat.com',
    'DE': 'deere.com', 'UPS': 'ups.com', 'FDX': 'fedex.com',
    'PG': 'pg.com', 'KO': 'coca-cola.com', 'PEP': 'pepsico.com',
    'IBM': 'ibm.com', 'MSTR': 'microstrategy.com', 'COIN': 'coinbase.com',
    'HOOD': 'robinhood.com', 'DASH': 'doordash.com', 'RBLX': 'roblox.com',
    'BABA': 'alibaba.com', 'NIO': 'nio.com', 'TSM': 'tsmc.com',
    'ASML': 'asml.com', 'ARM': 'arm.com', 'SONY': 'sony.com',
    'NVO': 'novonordisk.com', 'MELI': 'mercadolibre.com', 'SE': 'sea.com',
    'CRWD': 'crowdstrike.com', 'DDOG': 'datadoghq.com', 'NET': 'cloudflare.com',
    'SNOW': 'snowflake.com', 'ZS': 'zscaler.com', 'MDB': 'mongodb.com',
    'OKTA': 'okta.com', 'TWLO': 'twilio.com', 'MRNA': 'modernatx.com',
    'SMCI': 'supermicro.com', 'MRVL': 'marvell.com', 'AMD': 'amd.com',
    'MU': 'micron.com', 'LULU': 'lululemon.com', 'GME': 'gamestop.com',
    'AMC': 'amctheatres.com', 'F': 'ford.com', 'GM': 'gm.com',
    'SPY': 'ssga.com', 'QQQ': 'invesco.com', 'VOO': 'vanguard.com',
};

interface StockLogoProps {
    src: string;
    symbol: string;
    size?: number;
}

export default function StockLogo({ src, symbol, size }: StockLogoProps) {
    // 0 = primary src (Finnhub), 1 = Google Favicon fallback, 2 = text
    const [stage, setStage] = useState(0);

    const domain = LOGO_DOMAINS[symbol.toUpperCase()] || `${symbol.toLowerCase().replace(/[^a-z]/g, '')}.com`;
    const googleFavicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;

    const handleError = () => {
        if (stage === 0) {
            setStage(1); // try Google Favicon
        } else {
            setStage(2); // give up, show text
        }
    };

    const imgSrc = stage === 0 ? src : googleFavicon;

    if (!src || stage === 2) {
        return (
            <span style={{
                fontSize: size ? `${size * 0.3}px` : '0.7rem',
                fontWeight: 800,
                color: 'var(--text-secondary)',
                lineHeight: 1,
                userSelect: 'none',
            }}>
                {symbol.slice(0, 2)}
            </span>
        );
    }

    return (
        <img
            src={imgSrc}
            alt={symbol}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
            }}
            onError={handleError}
        />
    );
}
