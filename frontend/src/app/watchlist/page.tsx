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
            <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '48px 24px 80px' }}>
                {/* Header skeleton */}
                <div style={{ marginBottom: '28px' }}>
                    <div className="skeleton" style={{ width: '200px', height: '28px', borderRadius: '8px', marginBottom: '10px' }} />
                    <div className="skeleton" style={{ width: '140px', height: '16px', borderRadius: '6px' }} />
                </div>
                {/* Card skeletons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton" style={{ height: '68px', borderRadius: '14px' }} />
                    ))}
                </div>
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
                <div className="animate-fade-up delay-1">
                    {!session?.user ? (
                        <>
                            {/* ── Kinetic Typography Hero ── */}
                            <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '16px' }}>
                                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: '14px' }}>
                                    {t('wl.loginTitle').split(' ').map((word: string, i: number) => (
                                        <span key={i} className="kinetic-word" style={{ animationDelay: `${0.1 + i * 0.08}s`, marginRight: '0.3em' }}>
                                            {word}
                                        </span>
                                    ))}
                                </h2>
                                <p className="kinetic-word" style={{ animationDelay: '0.6s', color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6 }}>
                                    {t('wl.loginDesc')}
                                </p>
                            </div>

                            {/* ── Bento Grid ── */}
                            <div className="bento-grid bento-grid-wl" style={{ marginBottom: '10px' }}>

                                {/* ─ Large cell: Mock stock table (glassmorphism) ─ */}
                                <div className="glass-card" style={{ gridRow: 'span 2', overflow: 'hidden', padding: 0 }}>
                                    {/* Table header */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="pulse-dot" />
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>Watchlist</span>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>5 {t('wl.items')}</span>
                                    </div>

                                    {/* Stock rows */}
                                    {[
                                        { sym: 'AAPL', name: 'Apple Inc.', price: '$231.34', change: '+1.08%', up: true },
                                        { sym: 'GOOGL', name: 'Alphabet', price: '$176.45', change: '+0.89%', up: true },
                                        { sym: 'TSLA', name: 'Tesla', price: '$248.42', change: '-1.85%', up: false },
                                        { sym: 'NVDA', name: 'NVIDIA', price: '$875.40', change: '+1.42%', up: true },
                                        { sym: 'MSFT', name: 'Microsoft', price: '$417.88', change: '+0.65%', up: true },
                                    ].map((row, i) => (
                                        <div key={i} className={`row-stagger-${i}`} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '12px 18px',
                                            borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                                <div style={{
                                                    width: '30px', height: '30px', borderRadius: '8px',
                                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-muted)',
                                                }}>
                                                    {row.sym.slice(0, 2)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2 }}>{row.sym}</div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{row.name}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', marginRight: '16px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>{row.price}</div>
                                            </div>
                                            <div style={{
                                                fontSize: '0.72rem', fontWeight: 600,
                                                color: row.up ? 'var(--success)' : 'var(--danger)',
                                                minWidth: '60px', textAlign: 'right',
                                            }}>
                                                {row.change}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* ─ Feature card 1 ─ */}
                                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Star size={20} style={{ color: '#facc15', marginBottom: '16px' }} />
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.01em' }}>{t('wl.feat1Title')}</h3>
                                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{t('wl.feat1Desc')}</p>
                                    </div>
                                </div>

                                {/* ─ Feature card 2 ─ */}
                                <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <TrendingUp size={20} style={{ color: '#34d399', marginBottom: '16px' }} />
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.01em' }}>{t('wl.feat2Title')}</h3>
                                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{t('wl.feat2Desc')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Bottom row: stats + feature ── */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: '10px', marginBottom: '36px' }}>
                                <div className="bento-stat animate-fade-up delay-3">
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>5+</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Exchanges</div>
                                </div>
                                <div className="bento-stat animate-fade-up delay-4">
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px' }}>24/7</div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Real-time</div>
                                </div>
                                <div className="glass-card animate-fade-up delay-5" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <BarChart2 size={20} style={{ color: '#7c6cf0', flexShrink: 0 }} />
                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '2px', letterSpacing: '-0.01em' }}>{t('wl.feat3Title')}</h3>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{t('wl.feat3Desc')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── CTA ── */}
                            <div className="animate-fade-up delay-6" style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <Link href="/register" className="cta-primary" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '12px 32px', borderRadius: '100px',
                                        background: '#22c55e', color: '#0e0e0e',
                                        fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                                    }}>
                                        {t('login.register')} <ArrowRight size={15} />
                                    </Link>
                                    <Link href="/login" className="cta-ghost" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        padding: '12px 32px', borderRadius: '100px',
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                                    }}>
                                        {t('login.submit')}
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="detail-section" style={{ textAlign: 'center', padding: '60px 24px' }}>
                            <Star size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{t('wl.emptyTitle')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '360px', margin: '0 auto 20px' }}>
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
                        </div>
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
