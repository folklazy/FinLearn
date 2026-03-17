'use client';

import { useState } from 'react';

interface StockLogoProps {
    src: string;
    symbol: string;
    size?: number;
}

export default function StockLogo({ src, symbol, size }: StockLogoProps) {
    const [err, setErr] = useState(false);

    if (!src || err) {
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
            src={src}
            alt={symbol}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
            }}
            onError={() => setErr(true)}
        />
    );
}
