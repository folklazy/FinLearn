'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Star, TrendingUp, TrendingDown, ExternalLink, Trash2,
    Search, X, ArrowRight, BarChart2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

/* ─── Types ─── */
interface WatchlistStock {
    symbol: string;
    name: string;
    logo?: string;
    sector?: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap?: number;
}

/* ─── Helpers ─── */
const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtLarge = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
    return `$${fmt(n)}`;
};

export default function WatchlistPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const [stocks, setStocks] = useState<WatchlistStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [removing, setRemoving] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadWatchlist = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/watchlist');
            if (!res.ok) throw new Error();
            const { symbols } = await res.json();
            if (symbols?.length) {
                const data = await api.getStocksBatch(symbols);
                setStocks(data || []);
            } else {
                setStocks([]);
            }
        } catch {
            setStocks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user) { setLoading(false); return; }
        loadWatchlist();
    }, [session, status, loadWatchlist]);

    const handleRemove = async (symbol: string) => {
        setRemoving(symbol);
        try {
            await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
            setStocks(prev => prev.filter(s => s.symbol !== symbol));
        } catch { /* ignore */ }
        finally { setRemoving(null); }
    };

    // Filter
    const filtered = searchQuery
        ? stocks.filter(s =>
            s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : stocks;

    // Stats
    const gainers = stocks.filter(s => s.change > 0).length;
    const losers = stocks.filter(s => s.change < 0).length;

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '48px 24px 80px' }}>

            {/* ═══ Header ═══ */}
            <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '28px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {t('wl.title')}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '14px' }}>
                    {t('wl.subtitle')} · {stocks.length} {t('wl.items')}
                    {stocks.length > 0 && <span> · <span style={{ color: 'var(--success)' }}>▲ {gainers}</span> · <span style={{ color: 'var(--danger)' }}>▼ {losers}</span></span>}
                </p>
            </div>

            {/* ═══ Search bar ═══ */}
            {stocks.length > 0 && (
                <div className="animate-fade-up delay-1" style={{ marginBottom: '24px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '4px 4px 4px 18px',
                        transition: 'border-color 0.25s var(--ease), box-shadow 0.25s var(--ease)',
                    }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,108,240,0.08)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('wl.searchPlaceholder')}
                            style={{
                                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                                color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
                                padding: '10px 0',
                            }}
                        />
                        {searchQuery && (
                            <button type="button" onClick={() => setSearchQuery('')}
                                style={{
                                    background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
                                    padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                aria-label="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ Empty state / Login prompt ═══ */}
            {stocks.length === 0 && !loading && (
                <div className="animate-fade-up delay-1 detail-section" style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <Star size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                    {!session?.user ? (
                        <>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{t('wl.loginTitle')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px', maxWidth: '380px', margin: '0 auto 20px' }}>
                                {t('wl.loginDesc')}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Link href="/login" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '10px 22px', borderRadius: '100px',
                                    background: 'var(--primary)', color: 'white',
                                    fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    {t('login.submit')} <ArrowRight size={15} />
                                </Link>
                                <Link href="/register" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '10px 22px', borderRadius: '100px',
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                    fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                                }}>
                                    {t('login.register')}
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{t('wl.emptyTitle')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px', maxWidth: '360px', margin: '0 auto 20px' }}>
                                {t('wl.emptyDesc')}
                            </p>
                            <Link href="/stocks" style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '10px 22px', borderRadius: '100px',
                                background: 'var(--primary)', color: 'white',
                                fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                            }}>
                                {t('wl.findStocks')} <ArrowRight size={15} />
                            </Link>
                        </>
                    )}
                </div>
            )}

            {/* ═══ Stock Grid ═══ */}
            {filtered.length > 0 && (
                <div className="animate-fade-up delay-2" style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px',
                }}>
                    {filtered.map((stock, i) => {
                        const isUp = stock.change >= 0;
                        const isRemoving = removing === stock.symbol;
                        return (
                            <div key={stock.symbol}
                                className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                                style={{
                                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                                    transition: 'border-color 0.15s var(--ease)',
                                    opacity: isRemoving ? 0.4 : 1,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                            >
                                {/* Card content */}
                                <Link href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none', display: 'block', padding: '18px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                        {/* Logo */}
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            overflow: 'hidden', flexShrink: 0,
                                        }}>
                                            {stock.logo ? (
                                                <Image src={stock.logo} alt={stock.symbol} width={24} height={24} style={{ borderRadius: '4px' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>{stock.symbol.slice(0, 2)}</span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: '0.92rem', margin: 0, color: 'var(--text-primary)' }}>{stock.symbol}</p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</p>
                                        </div>
                                        {/* Star */}
                                        <Star size={15} fill="#facc15" style={{ color: '#facc15', flexShrink: 0 }} />
                                    </div>

                                    {/* Price row */}
                                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '1.3rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
                                            ${fmt(stock.price)}
                                        </span>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '3px',
                                            fontSize: '0.78rem', fontWeight: 700,
                                            color: isUp ? 'var(--success)' : 'var(--danger)',
                                            padding: '3px 10px', borderRadius: '100px',
                                            background: isUp ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        }}>
                                            {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                                        </span>
                                    </div>

                                    {/* Extra info */}
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        <span>{t('wl.change')} <strong style={{ color: isUp ? 'var(--success)' : 'var(--danger)' }}>{isUp ? '+' : ''}${fmt(stock.change)}</strong></span>
                                        {stock.marketCap != null && stock.marketCap > 0 && <span>MCap <strong style={{ color: 'var(--text-secondary)' }}>{fmtLarge(stock.marketCap)}</strong></span>}
                                    </div>
                                </Link>

                                {/* Footer actions */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 20px', borderTop: '1px solid var(--border)',
                                    background: 'var(--bg-elevated)',
                                }}>
                                    {stock.sector && (
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{stock.sector}</span>
                                    )}
                                    {!stock.sector && <span />}
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <Link href={`/stocks/${stock.symbol}`} style={{
                                            fontSize: '0.72rem', color: 'var(--primary-light)', fontWeight: 600,
                                            display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none',
                                        }}>
                                            {t('wl.viewDetail')} <ExternalLink size={11} />
                                        </Link>
                                        <button
                                            onClick={() => handleRemove(stock.symbol)}
                                            disabled={isRemoving}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                                color: 'var(--text-muted)', transition: 'color 0.15s', display: 'flex',
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}
                                            aria-label={`${t('wl.remove')} ${stock.symbol}`}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* No results for search */}
            {stocks.length > 0 && filtered.length === 0 && searchQuery && (
                <div className="detail-section" style={{ textAlign: 'center', padding: '40px 24px' }}>
                    <Search size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                        {t('wl.notFound')} &quot;{searchQuery}&quot; {t('wl.inWatchlist')}
                    </p>
                </div>
            )}

            {/* Link to portfolio */}
            {stocks.length > 0 && (
                <div className="animate-fade-up" style={{ marginTop: '28px', textAlign: 'center' }}>
                    <Link href="/portfolio" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 22px', borderRadius: '100px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
                        textDecoration: 'none', transition: 'all 0.15s',
                    }}>
                        <BarChart2 size={15} /> {t('wl.goPortfolio')}
                    </Link>
                </div>
            )}
        </div>
    );
}
