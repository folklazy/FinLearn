'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

type Currency = 'USD' | 'THB';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    rate: number; // THB per 1 USD
    convert: (usd: number) => number;
    symbol: string;
    formatPrice: (usd: number) => string;
    formatLarge: (usd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
    currency: 'USD',
    setCurrency: () => {},
    rate: 34,
    convert: (v) => v,
    symbol: '$',
    formatPrice: (v) => `$${v.toFixed(2)}`,
    formatLarge: (v) => `$${v.toFixed(2)}`,
});

const DEFAULT_RATE = 34; // fallback THB/USD

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [currency, setCurrencyState] = useState<Currency>('USD');
    const [rate, setRate] = useState(DEFAULT_RATE);

    // Load user preference from profile
    useEffect(() => {
        if (!session?.user) return;
        fetch('/api/user/profile')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user?.profile?.displayCurrency) {
                    setCurrencyState(data.user.profile.displayCurrency as Currency);
                }
            })
            .catch(() => {});
    }, [session]);

    // Fetch exchange rate
    useEffect(() => {
        if (currency === 'USD') return;
        fetch('https://open.er-api.com/v6/latest/USD')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.rates?.THB) setRate(data.rates.THB);
            })
            .catch(() => setRate(DEFAULT_RATE));
    }, [currency]);

    const setCurrency = useCallback((c: Currency) => {
        setCurrencyState(c);
    }, []);

    const convert = useCallback((usd: number) => {
        return currency === 'USD' ? usd : usd * rate;
    }, [currency, rate]);

    const symbol = currency === 'USD' ? '$' : '฿';

    const formatPrice = useCallback((usd: number) => {
        const val = convert(usd);
        return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'th-TH', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    }, [convert, currency]);

    const formatLarge = useCallback((usd: number) => {
        const val = convert(usd);
        const abs = Math.abs(val);
        const sign = val < 0 ? '-' : '';
        if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(2)}T`;
        if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
        if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
        if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(2)}K`;
        return `${sign}${symbol}${abs.toFixed(2)}`;
    }, [convert, symbol]);

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, rate, convert, symbol, formatPrice, formatLarge }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    return useContext(CurrencyContext);
}
