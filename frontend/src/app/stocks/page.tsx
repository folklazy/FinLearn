'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, Flame, BarChart3, Star, X, ArrowRight, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';
import { useSearchParams, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

/* ─────────── Types ─────────── */
interface StockItem {
    symbol: string; name: string; logo: string; sector: string;
    price: number; change: number; changePercent: number; marketCap: number;
    overallScore?: number;
}
interface SearchResultItem {
    symbol: string; name: string; logo?: string; sector?: string; exchange?: string;
}
type Tab = 'popular' | 'sp500' | 'search';

/* ─────────── Stock Card (Grid) ─────────── */
function StockCard({ stock, i, inWatchlist, onToggle }: { stock: StockItem; i: number; inWatchlist?: boolean; onToggle?: () => void }) {
    const { formatPrice, formatLarge } = useCurrency();
    const { t } = useI18n();
    const isUp = stock.change >= 0;
    return (
        <Link href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none' }}>
            <div className={`animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{
                padding: '22px', cursor: 'pointer', height: '100%',
                background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.3s var(--ease)',
                position: 'relative', overflow: 'hidden',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
                {/* Top: Logo + Symbol + Star */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.95)',
                            padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}>
                            {stock.logo ? (
                                <Image src={stock.logo} alt={stock.symbol} width={30} height={30} unoptimized style={{ objectFit: 'contain', borderRadius: '4px' }} />
                            ) : (
                                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#333' }}>{stock.symbol.slice(0, 2)}</span>
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em', lineHeight: 1.2 }}>{stock.symbol}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{stock.name}</div>
                        </div>
                    </div>
                    {onToggle && (
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
                            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', color: inWatchlist ? '#facc15' : 'var(--text-muted)', transition: 'all 0.2s', borderRadius: '8px' }}
                            onMouseEnter={e => { if (!inWatchlist) e.currentTarget.style.color = '#facc15'; }}
                            onMouseLeave={e => { if (!inWatchlist) e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            <Star size={15} fill={inWatchlist ? '#facc15' : 'none'} />
                        </button>
                    )}
                </div>

                {/* Middle: Price */}
                <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{formatPrice(stock.price)}</div>
                </div>

                {/* Bottom: Change + Sector + Score/MCap */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '100px',
                            background: isUp ? 'rgba(52,211,153,0.1)' : 'rgba(251,113,133,0.1)',
                            color: isUp ? 'var(--success)' : 'var(--danger)',
                            letterSpacing: '-0.01em',
                        }}>
                            {formatPercent(stock.changePercent)}
                        </span>
                        {stock.sector && (
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                                {stock.sector}
                            </span>
                        )}
                    </div>
                    {(stock.overallScore ?? 0) > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} title={t('stocks.scoreTooltip')}>
                            <Sparkles size={12} style={{ color: 'var(--primary-light)' }} />
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore}/5</span>
                        </div>
                    ) : stock.marketCap > 0 ? (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatLarge(stock.marketCap)}</span>
                    ) : null}
                </div>

                {/* Score bar */}
                {(stock.overallScore ?? 0) > 0 && (
                    <div style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('stocks.scoreLabel')}</span>
                            <span style={{ fontSize: '0.62rem', color: 'var(--primary-light)', fontWeight: 600 }}>{stock.overallScore}/5</span>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '100px', background: 'var(--gradient-primary)', width: `${((stock.overallScore ?? 0) / 5) * 100}%`, transition: 'width 1s var(--ease)' }} />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}

/* ─────────── Stock Row (Table) ─────────── */
function StockRow({ stock, i, inWatchlist, onToggle }: { stock: StockItem; i: number; inWatchlist?: boolean; onToggle?: () => void }) {
    const { formatPrice, formatLarge } = useCurrency();
    const router = useRouter();
    const isUp = stock.change >= 0;
    return (
        <tr style={{ cursor: 'pointer', transition: 'background 0.15s' }}
            onClick={() => router.push(`/stocks/${stock.symbol}`)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
            <td style={{ color: 'var(--text-muted)', fontSize: '0.76rem', width: '40px', fontWeight: 500 }}>{i + 1}</td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.92)',
                        padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                    }}>
                        {stock.logo ? (
                            <Image src={stock.logo} alt="" width={24} height={24} unoptimized style={{ objectFit: 'contain', borderRadius: '3px' }} />
                        ) : (
                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#444' }}>{stock.symbol.slice(0, 2)}</span>
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                    </div>
                </div>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>{formatPrice(stock.price)}</td>
            <td style={{ textAlign: 'right' }}>
                <span style={{
                    fontWeight: 600, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '100px',
                    background: isUp ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)',
                    color: isUp ? 'var(--success)' : 'var(--danger)',
                }}>
                    {formatPercent(stock.changePercent)}
                </span>
            </td>
            <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>{formatLarge(stock.marketCap)}</td>
            <td>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                    {stock.sector}
                </span>
            </td>
            <td style={{ textAlign: 'right' }}>
                {(stock.overallScore ?? 0) > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Sparkles size={11} style={{ color: 'var(--primary-light)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore}/5</span>
                    </div>
                ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>—</span>}
            </td>
            {onToggle && (
                <td style={{ textAlign: 'right', width: '44px' }}>
                    <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
                        aria-label="Toggle watchlist"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', color: inWatchlist ? '#facc15' : 'var(--text-muted)', transition: 'color 0.15s' }}>
                        <Star size={14} fill={inWatchlist ? '#facc15' : 'none'} />
                    </button>
                </td>
            )}
        </tr>
    );
}

/* ─────────── Search Result Card ─────────── */
function SearchResultCard({ result, i }: { result: SearchResultItem; i: number }) {
    return (
        <Link href={`/stocks/${result.symbol}`} style={{ textDecoration: 'none' }}>
            <div className={`animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px', cursor: 'pointer',
                background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', transition: 'all 0.25s var(--ease)',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card-solid)'; }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,255,255,0.92)',
                        padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                    }}>
                        {result.logo ? (
                            <Image src={result.logo} alt={result.symbol} width={28} height={28} unoptimized style={{ objectFit: 'contain', borderRadius: '4px' }} />
                        ) : (
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#333' }}>{result.symbol.slice(0, 2)}</span>
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>{result.symbol}</span>
                            {result.sector && (
                                <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '100px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
                                    {result.sector}
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{result.name}</div>
                    </div>
                </div>
                <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
        </Link>
    );
}

/* ─────────── Main Content ─────────── */
function StocksContent() {
    const { t } = useI18n();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [tab, setTab] = useState<Tab>(searchParams.get('q') ? 'search' : 'popular');
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [loading, setLoading] = useState(true);
    const [watchlistSet, setWatchlistSet] = useState<Set<string>>(new Set());
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!session?.user) return;
        fetch('/api/watchlist').then(r => r.ok ? r.json() : { symbols: [] })
            .then(d => { if (d.symbols?.length) setWatchlistSet(new Set(d.symbols.map((s: string) => s.toUpperCase()))); })
            .catch(() => {});
    }, [session]);

    const toggleWatchlist = async (symbol: string) => {
        if (!session?.user) return;
        const sym = symbol.toUpperCase();
        const removing = watchlistSet.has(sym);
        setWatchlistSet(prev => { const next = new Set(prev); if (removing) next.delete(sym); else next.add(sym); return next; });
        try {
            if (removing) await fetch(`/api/watchlist/${sym}`, { method: 'DELETE' });
            else await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: sym }) });
        } catch {
            setWatchlistSet(prev => { const next = new Set(prev); if (removing) next.add(sym); else next.delete(sym); return next; });
        }
    };

    // Popular stocks
    const [popular, setPopular] = useState<StockItem[]>([]);
    const [popularSector, setPopularSector] = useState('');

    // S&P 500
    const [sp500, setSp500] = useState<StockItem[]>([]);
    const [sp500Total, setSp500Total] = useState(0);
    const [sp500Sectors, setSp500Sectors] = useState<string[]>([]);
    const [sp500Sector, setSp500Sector] = useState('');
    const [sp500Page, setSp500Page] = useState(1);
    const SP500_LIMIT = 20;

    // Search
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Load popular on mount
    useEffect(() => {
        api.getPopularStocks()
            .then(data => setPopular(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Load S&P 500 when tab or page/sector changes
    const loadSP500 = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getSP500(sp500Page, SP500_LIMIT, sp500Sector || undefined);
            setSp500(data.stocks);
            setSp500Total(data.total);
            if (data.sectors.length > 0) setSp500Sectors(data.sectors);
        } catch { setSp500([]); }
        setLoading(false);
    }, [sp500Page, sp500Sector]);

    useEffect(() => {
        if (tab !== 'sp500') return;
        let cancelled = false;
        (async () => {
            if (!cancelled) await loadSP500();
        })();
        return () => { cancelled = true; };
    }, [tab, loadSP500]);

    // Search — returns SearchResultItem with logo & sector
    useEffect(() => {
        if (tab !== 'search' || !search.trim()) return;
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await api.searchStocks(search);
                setSearchResults(results.map((r: SearchResultItem) => ({
                    symbol: r.symbol,
                    name: r.name,
                    logo: r.logo || `https://financialmodelingprep.com/image-stock/${r.symbol}.png`,
                    sector: r.sector || r.exchange || '',
                    exchange: r.exchange || '',
                })));
            } catch { setSearchResults([]); }
            setSearchLoading(false);
        }, 350);
        return () => clearTimeout(t);
    }, [search, tab]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) setTab('search');
    };

    const clearSearch = () => {
        setSearch('');
        setSearchResults([]);
        setTab('popular');
        searchRef.current?.focus();
    };

    const filteredPopular = popularSector ? popular.filter(s => s.sector === popularSector) : popular;
    const popularSectors = [...new Set(popular.map(s => s.sector).filter(Boolean))].sort();
    const stocks = tab === 'popular' ? filteredPopular : tab === 'sp500' ? sp500 : [];
    const totalPages = tab === 'sp500' ? Math.ceil(sp500Total / SP500_LIMIT) : 1;
    const isLoading = loading || (tab === 'search' && searchLoading);

    /* ── Tab config ── */
    const tabs: { key: Tab; label: string; Icon: typeof Flame; count?: number }[] = [
        { key: 'popular', label: 'Popular', Icon: Flame, count: popular.length || undefined },
        { key: 'sp500', label: 'S&P 500', Icon: BarChart3, count: sp500Total || undefined },
        { key: 'search', label: 'Search', Icon: Search },
    ];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>

            {/* ═══ Header ═══ */}
            <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '28px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {t('stocks.title')}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '14px' }}>
                    {t('stocks.subtitle')}
                </p>
            </div>

            {/* ═══ Search Bar ═══ */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '24px' }}>
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
                        ref={searchRef}
                        type="text"
                        value={search}
                        onChange={e => { setSearch(e.target.value); if (e.target.value.trim()) setTab('search'); }}
                        placeholder={t('stocks.searchPlaceholder')}
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
                            padding: '10px 0',
                        }}
                    />
                    {search && (
                        <button type="button" onClick={clearSearch}
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
                    {/* View toggle integrated into search bar */}
                    <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
                        {[
                            { mode: 'grid' as const, Icon: LayoutGrid },
                            { mode: 'table' as const, Icon: List },
                        ].map(v => (
                            <button key={v.mode} type="button" onClick={() => setView(v.mode)}
                                aria-label={v.mode === 'grid' ? 'Grid view' : 'Table view'}
                                style={{
                                    padding: '8px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                    background: view === v.mode ? 'var(--primary)' : 'transparent',
                                    color: view === v.mode ? 'white' : 'var(--text-muted)',
                                    display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                                }}
                            >
                                <v.Icon size={14} />
                            </button>
                        ))}
                    </div>
                </div>
            </form>

            {/* ═══ Tabs ═══ */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', overflowX: 'auto' }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '100px',
                        background: tab === t.key ? 'rgba(124,108,240,0.12)' : 'transparent',
                        border: tab === t.key ? '1px solid var(--border-accent)' : '1px solid transparent',
                        color: tab === t.key ? 'var(--primary-light)' : 'var(--text-muted)',
                        fontWeight: tab === t.key ? 600 : 400, fontSize: '0.82rem',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s var(--ease)',
                        whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                        onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        <t.Icon size={14} />
                        {t.label}
                        {t.count ? <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{t.count}</span> : null}
                    </button>
                ))}
            </div>

            {/* ═══ Sector Filter ═══ */}
            {tab === 'popular' && popularSectors.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <button onClick={() => setPopularSector('')}
                        className={`chip${!popularSector ? ' active' : ''}`} style={{ fontSize: '0.76rem' }}>
                        All
                    </button>
                    {popularSectors.map(s => (
                        <button key={s} onClick={() => setPopularSector(s)}
                            className={`chip${popularSector === s ? ' active' : ''}`} style={{ fontSize: '0.76rem' }}>{s}</button>
                    ))}
                </div>
            )}
            {tab === 'sp500' && sp500Sectors.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <button onClick={() => { setSp500Sector(''); setSp500Page(1); }}
                        className={`chip${!sp500Sector ? ' active' : ''}`} style={{ fontSize: '0.76rem' }}>All</button>
                    {sp500Sectors.map(s => (
                        <button key={s} onClick={() => { setSp500Sector(s); setSp500Page(1); }}
                            className={`chip${sp500Sector === s ? ' active' : ''}`} style={{ fontSize: '0.76rem' }}>{s}</button>
                    ))}
                </div>
            )}

            {/* ═══ Content ═══ */}
            {isLoading ? (
                /* Skeleton Grid */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{
                            height: '160px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                            overflow: 'hidden', position: 'relative',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                                animation: 'shimmer 1.5s infinite',
                            }} />
                        </div>
                    ))}
                </div>
            ) : tab === 'search' ? (
                /* ─── Search Results ─── */
                searchResults.length === 0 ? (
                    search.trim() ? (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <Search size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                {t('stocks.noResults')} &quot;{search}&quot;
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                                {t('stocks.noResultsHint')}
                            </p>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                            <Search size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                                {t('stocks.typeToSearch')}
                            </p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '360px', margin: '0 auto' }}>
                                {t('stocks.typeToSearchHint')}
                            </p>
                        </div>
                    )
                ) : (
                    <div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                            {t('stocks.found')} {searchResults.length} {t('stocks.resultsFor')} &quot;{search}&quot;
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {searchResults.map((r, i) => <SearchResultCard key={r.symbol} result={r} i={i} />)}
                        </div>
                    </div>
                )
            ) : stocks.length === 0 ? (
                /* Empty State */
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <BarChart3 size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>{t('stocks.noData')}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('stocks.tryAgain')}</p>
                </div>
            ) : view === 'grid' ? (
                /* ─── Grid View ─── */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {stocks.map((stock, i) => (
                        <StockCard key={stock.symbol} stock={stock} i={i}
                            inWatchlist={watchlistSet.has(stock.symbol.toUpperCase())}
                            onToggle={session?.user ? () => toggleWatchlist(stock.symbol) : undefined} />
                    ))}
                </div>
            ) : (
                /* ─── Table View ─── */
                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Stock</th>
                                    <th style={{ textAlign: 'right' }}>Price</th>
                                    <th style={{ textAlign: 'right' }}>Change</th>
                                    <th style={{ textAlign: 'right' }}>MCap</th>
                                    <th>Sector</th>
                                    <th style={{ textAlign: 'right' }}>Score</th>
                                    {session?.user && <th style={{ width: '44px' }}></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map((stock, i) => (
                                    <StockRow key={stock.symbol} stock={stock}
                                        i={(tab === 'sp500' ? (sp500Page - 1) * SP500_LIMIT : 0) + i}
                                        inWatchlist={watchlistSet.has(stock.symbol.toUpperCase())}
                                        onToggle={session?.user ? () => toggleWatchlist(stock.symbol) : undefined} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ Pagination ═══ */}
            {tab === 'sp500' && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px' }}>
                    <button onClick={() => setSp500Page(p => Math.max(1, p - 1))} disabled={sp500Page <= 1}
                        style={{
                            padding: '8px 16px', borderRadius: '100px',
                            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                            color: sp500Page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: sp500Page <= 1 ? 'default' : 'pointer',
                            opacity: sp500Page <= 1 ? 0.4 : 1,
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem',
                            fontFamily: 'inherit', transition: 'all 0.2s',
                        }}>
                        <ChevronLeft size={14} /> Prev
                    </button>

                    {/* Page numbers */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const start = Math.max(1, Math.min(sp500Page - 2, totalPages - 4));
                            const page = start + i;
                            if (page > totalPages) return null;
                            return (
                                <button key={page} onClick={() => setSp500Page(page)}
                                    style={{
                                        width: '36px', height: '36px', borderRadius: '100px', border: 'none',
                                        background: sp500Page === page ? 'var(--primary)' : 'transparent',
                                        color: sp500Page === page ? 'white' : 'var(--text-muted)',
                                        fontWeight: sp500Page === page ? 600 : 400,
                                        fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={() => setSp500Page(p => Math.min(totalPages, p + 1))} disabled={sp500Page >= totalPages}
                        style={{
                            padding: '8px 16px', borderRadius: '100px',
                            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                            color: sp500Page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                            cursor: sp500Page >= totalPages ? 'default' : 'pointer',
                            opacity: sp500Page >= totalPages ? 0.4 : 1,
                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem',
                            fontFamily: 'inherit', transition: 'all 0.2s',
                        }}>
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* ═══ Count Footer ═══ */}
            {!isLoading && (tab !== 'search') && stocks.length > 0 && (
                <p style={{ marginTop: '24px', fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '0.01em' }}>
                    {tab === 'popular' && `Showing ${stocks.length} popular stocks`}
                    {tab === 'sp500' && `Showing ${stocks.length} of ${sp500Total} S&P 500 stocks${sp500Sector ? ` — ${sp500Sector}` : ''}`}
                </p>
            )}

            {/* Shimmer keyframe */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
}

/* ─────────── Page Wrapper ─────────── */
export default function StocksPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
                <div style={{ height: '32px', width: '240px', background: 'var(--bg-elevated)', borderRadius: '8px', marginBottom: '36px' }} />
                <div style={{ height: '48px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', marginBottom: '24px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ height: '160px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card-solid)', border: '1px solid var(--border)' }} />
                    ))}
                </div>
            </div>
        }>
            <StocksContent />
        </Suspense>
    );
}
