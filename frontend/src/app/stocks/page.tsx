'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useCallback, Suspense } from 'react';
import { Search, LayoutGrid, List, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

interface StockItem {
    symbol: string; name: string; logo: string; sector: string;
    price: number; change: number; changePercent: number; marketCap: number;
}

type Tab = 'popular' | 'sp500' | 'search';

function StockCard({ stock, i }: { stock: StockItem; i: number }) {
    return (
        <Link href={`/stocks/${stock.symbol}`}>
            <div className={`card-solid animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{ padding: '20px', cursor: 'pointer', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {stock.logo && (
                            <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: '#fff', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img src={stock.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            </div>
                        )}
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: '100px',
                        background: stock.change >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: stock.change >= 0 ? 'var(--success)' : 'var(--danger)',
                    }}>
                        {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(stock.price)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{stock.sector}</div>
                    </div>
                    {stock.marketCap > 0 && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            MCap {formatLargeNumber(stock.marketCap)}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

function StockRow({ stock, i }: { stock: StockItem; i: number }) {
    const router = useRouter();
    return (
        <tr style={{ cursor: 'pointer' }} onClick={() => router.push(`/stocks/${stock.symbol}`)}>
            <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', width: '36px' }}>{i + 1}</td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {stock.logo && (
                        <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: '#fff', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={stock.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    )}
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                    </div>
                </div>
            </td>
            <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.88rem' }}>{formatCurrency(stock.price)}</td>
            <td style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: stock.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                </span>
            </td>
            <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{formatLargeNumber(stock.marketCap)}</td>
            <td style={{ textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stock.sector}</td>
        </tr>
    );
}

function StocksContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>(searchParams.get('q') ? 'search' : 'popular');
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [loading, setLoading] = useState(true);

    // Popular stocks
    const [popular, setPopular] = useState<StockItem[]>([]);

    // S&P 500
    const [sp500, setSp500] = useState<StockItem[]>([]);
    const [sp500Total, setSp500Total] = useState(0);
    const [sp500Sectors, setSp500Sectors] = useState<string[]>([]);
    const [sp500Sector, setSp500Sector] = useState('');
    const [sp500Page, setSp500Page] = useState(1);
    const SP500_LIMIT = 20;

    // Search
    const [searchResults, setSearchResults] = useState<StockItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Load popular on mount
    useEffect(() => {
        api.getPopularStocks()
            .then(data => setPopular(data))
            .catch(() => {})
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
        if (tab === 'sp500') loadSP500();
    }, [tab, loadSP500]);

    // Search
    useEffect(() => {
        if (tab !== 'search' || !search.trim()) return;
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await api.searchStocks(search);
                setSearchResults(results.map((r: { symbol: string; name: string; exchange?: string }) => ({
                    symbol: r.symbol, name: r.name, logo: '', sector: r.exchange || '',
                    price: 0, change: 0, changePercent: 0, marketCap: 0,
                })));
            } catch { setSearchResults([]); }
            setSearchLoading(false);
        }, 400);
        return () => clearTimeout(t);
    }, [search, tab]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (search.trim()) setTab('search');
    };

    const stocks = tab === 'popular' ? popular : tab === 'sp500' ? sp500 : searchResults;
    const totalPages = tab === 'sp500' ? Math.ceil(sp500Total / SP500_LIMIT) : 1;
    const isLoading = loading || (tab === 'search' && searchLoading);

    return (
        <div className="container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: '8px' }}>Browse Stocks</p>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '6px' }}>สำรวจหุ้น</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>ค้นหาหุ้นจากทั่วโลก ดูข้อมูล S&P 500 หรือค้นหาหุ้นที่สนใจ</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-secondary)', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
                {[
                    { key: 'popular' as Tab, label: 'ยอดนิยม', icon: '🔥' },
                    { key: 'sp500' as Tab, label: 'S&P 500', icon: '📊' },
                    { key: 'search' as Tab, label: 'ค้นหา', icon: '🔍' },
                ].map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: tab === t.key ? 600 : 450,
                        background: tab === t.key ? 'var(--bg-tertiary)' : 'transparent',
                        color: tab === t.key ? 'white' : 'var(--text-muted)',
                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Search bar (shown on search tab or always visible) */}
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={search}
                        onChange={e => { setSearch(e.target.value); if (e.target.value.trim()) setTab('search'); }}
                        placeholder="ค้นหาหุ้น... (เช่น NVDA, Tesla, JPMorgan)" className="input" style={{ paddingLeft: '38px' }} />
                </div>
                <div className="view-toggle">
                    <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><LayoutGrid size={14} /></button>
                    <button type="button" className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><List size={14} /></button>
                </div>
            </form>

            {/* S&P 500 sector filter */}
            {tab === 'sp500' && sp500Sectors.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <button onClick={() => { setSp500Sector(''); setSp500Page(1); }}
                        className={`chip${!sp500Sector ? ' active' : ''}`}>All ({sp500Total})</button>
                    {sp500Sectors.map(s => (
                        <button key={s} onClick={() => { setSp500Sector(s); setSp500Page(1); }}
                            className={`chip${sp500Sector === s ? ' active' : ''}`}>{s}</button>
                    ))}
                </div>
            )}

            {/* Content */}
            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />)}
                </div>
            ) : stocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}>
                        {tab === 'search' ? '🔍' : '📊'}
                    </p>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {tab === 'search' ? 'ไม่พบหุ้นที่ค้นหา' : 'ไม่มีข้อมูล'}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {tab === 'search' ? 'ลองค้นหาด้วยชื่อบริษัทหรือ symbol เช่น AAPL, Microsoft' : 'กรุณาลองใหม่อีกครั้ง'}
                    </p>
                </div>
            ) : tab === 'search' && stocks[0]?.price === 0 ? (
                /* Search results — show as simple list linking to detail */
                <div className="card-solid" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead><tr><th>Symbol</th><th>ชื่อบริษัท</th><th>ตลาด</th><th></th></tr></thead>
                        <tbody>
                            {stocks.map(s => (
                                <tr key={s.symbol} style={{ cursor: 'pointer' }} onClick={() => router.push(`/stocks/${s.symbol}`)}>
                                    <td style={{ fontWeight: 700 }}>{s.symbol}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{s.name}</td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.sector}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <TrendingUp size={14} style={{ color: 'var(--primary-light)' }} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {stocks.map((stock, i) => <StockCard key={stock.symbol} stock={stock} i={i} />)}
                </div>
            ) : (
                <div className="card-solid" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th><th>หุ้น</th>
                                <th style={{ textAlign: 'right' }}>ราคา</th>
                                <th style={{ textAlign: 'right' }}>เปลี่ยนแปลง</th>
                                <th style={{ textAlign: 'right' }}>Market Cap</th>
                                <th style={{ textAlign: 'right' }}>Sector</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.map((stock, i) => <StockRow key={stock.symbol} stock={stock} i={(tab === 'sp500' ? (sp500Page - 1) * SP500_LIMIT : 0) + i} />)}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination for S&P 500 */}
            {tab === 'sp500' && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '28px' }}>
                    <button onClick={() => setSp500Page(p => Math.max(1, p - 1))} disabled={sp500Page <= 1}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: sp500Page <= 1 ? 'var(--text-muted)' : 'white', cursor: sp500Page <= 1 ? 'default' : 'pointer', opacity: sp500Page <= 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                        <ChevronLeft size={14} /> ก่อนหน้า
                    </button>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        หน้า {sp500Page} / {totalPages}
                    </span>
                    <button onClick={() => setSp500Page(p => Math.min(totalPages, p + 1))} disabled={sp500Page >= totalPages}
                        style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: sp500Page >= totalPages ? 'var(--text-muted)' : 'white', cursor: sp500Page >= totalPages ? 'default' : 'pointer', opacity: sp500Page >= totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem' }}>
                        ถัดไป <ChevronRight size={14} />
                    </button>
                </div>
            )}

            {/* Count */}
            {!isLoading && stocks.length > 0 && (
                <p style={{ marginTop: '20px', fontSize: '0.76rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    {tab === 'popular' && `แสดง ${stocks.length} หุ้นยอดนิยม`}
                    {tab === 'sp500' && `แสดง ${stocks.length} จาก ${sp500Total} หุ้น S&P 500${sp500Sector ? ` (${sp500Sector})` : ''}`}
                    {tab === 'search' && `พบ ${stocks.length} ผลลัพธ์สำหรับ "${search}"`}
                </p>
            )}
        </div>
    );
}

export default function StocksPage() {
    return (
        <Suspense fallback={
            <div className="container" style={{ paddingTop: '48px' }}>
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '32px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '12px' }} />)}
                </div>
            </div>
        }>
            <StocksContent />
        </Suspense>
    );
}
