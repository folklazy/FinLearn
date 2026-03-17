'use client';

import { useState } from 'react';

interface StockLogoProps {
    src: string;
    symbol: string;
    size?: number;
}

export default function StockLogo({ src, symbol, size }: StockLogoProps) {
    // 0 = primary src, 1 = Google favicon fallback, 2 = text fallback
    const [stage, setStage] = useState(0);

    const googleFallback = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(symbol.toLowerCase())}.com&sz=128`;

    const handleError = () => {
        if (stage === 0) {
            setStage(1); // try Google favicon
        } else {
            setStage(2); // give up, show text
        }
    };

    const imgSrc = stage === 0 ? src : googleFallback;

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
