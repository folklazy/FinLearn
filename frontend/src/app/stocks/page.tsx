'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, formatLargeNumber } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface StockItem {
    symbol: string; name: string; logo: string; sector: string;
    price: number; change: number; changePercent: number; marketCap: number; overallScore: number;
}

const FALLBACK: StockItem[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', sector: 'Tech', price: 231.34, change: 2.47, changePercent: 1.08, marketCap: 3450000000000, overallScore: 4.2 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', sector: 'Tech', price: 176.45, change: 1.56, changePercent: 0.89, marketCap: 2100000000000, overallScore: 4.5 },
    { symbol: 'MSFT', name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', sector: 'Tech', price: 417.88, change: 2.68, changePercent: 0.65, marketCap: 3100000000000, overallScore: 4.6 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', sector: 'Auto', price: 248.42, change: -4.68, changePercent: -1.85, marketCap: 800000000000, overallScore: 3.2 },
    { symbol: 'AMZN', name: 'Amazon.com', logo: 'https://logo.clearbit.com/amazon.com', sector: 'Tech', price: 186.21, change: 1.66, changePercent: 0.90, marketCap: 1900000000000, overallScore: 4.0 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'https://logo.clearbit.com/nvidia.com', sector: 'Tech', price: 875.40, change: 12.30, changePercent: 1.42, marketCap: 2150000000000, overallScore: 4.7 },
];

const SECTORS = ['ทั้งหมด', 'Tech', 'Auto', 'การเงิน', 'สุขภาพ', 'ค้าปลีก'];

function StocksContent() {
    const searchParams = useSearchParams();
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [selectedSector, setSelectedSector] = useState('ทั้งหมด');
    const [view, setView] = useState<'grid' | 'table'>('grid');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getPopularStocks()
            .then(data => setStocks(data))
            .catch(() => setStocks(FALLBACK))
            .finally(() => setLoading(false));
    }, []);

    const filteredStocks = useMemo(() => {
        let result = stocks;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
        }
        if (selectedSector !== 'ทั้งหมด') result = result.filter(s => s.sector === selectedSector);
        return result;
    }, [search, selectedSector, stocks]);

    return (
        <div className="container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
            {/* Header */}
            <div style={{ marginBottom: '36px' }}>
                <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: '8px' }}>Browse Stocks</p>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '6px' }}>หุ้นทั้งหมด</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>ค้นหาและเรียนรู้เกี่ยวกับหุ้นที่คุณสนใจ</p>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
                    <Search size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหา... (เช่น AAPL, Apple)" className="input" style={{ paddingLeft: '38px' }} />
                </div>
                <div className="view-toggle">
                    <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><LayoutGrid size={14} /> Grid</button>
                    <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')}><List size={14} /> Table</button>
                </div>
            </div>

            {/* Sector chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
                {SECTORS.map(s => (
                    <button key={s} onClick={() => setSelectedSector(s)} className={`chip${selectedSector === s ? ' active' : ''}`}>{s}</button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '160px' }} />)}
                </div>
            ) : filteredStocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}>🔍</p>
                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>ไม่พบหุ้นที่ค้นหา</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ลองค้นหาด้วยคำอื่น หรือเปลี่ยน filter</p>
                </div>
            ) : view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {filteredStocks.map((stock, i) => (
                        <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                            <div className={`card-solid animate-fade-up delay-${Math.min(i + 1, 6)}`} style={{ padding: '22px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <img src={stock.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stock.name}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '100px',
                                        background: stock.change >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                                        color: stock.change >= 0 ? 'var(--success)' : 'var(--danger)',
                                    }}>
                                        {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{formatCurrency(stock.price)}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Mkt Cap: {formatLargeNumber(stock.marketCap)}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Score</div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore}/5</div>
                                    </div>
                                </div>
                                <div className="progress-bar" style={{ marginTop: '14px' }}>
                                    <div className="progress-fill" style={{ width: `${(stock.overallScore / 5) * 100}%` }} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="card-solid" style={{ overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>หุ้น</th>
                                <th style={{ textAlign: 'right' }}>ราคา</th>
                                <th style={{ textAlign: 'right' }}>เปลี่ยนแปลง</th>
                                <th style={{ textAlign: 'right' }}>Market Cap</th>
                                <th style={{ textAlign: 'right' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStocks.map((stock, i) => (
                                <tr key={stock.symbol} style={{ cursor: 'pointer' }}
                                    onClick={() => window.location.href = `/stocks/${stock.symbol}`}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', width: '36px' }}>{i + 1}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <img src={stock.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{stock.symbol}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{stock.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.9rem' }}>{formatCurrency(stock.price)}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: stock.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{formatLargeNumber(stock.marketCap)}</td>
                                    <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-light)' }}>{stock.overallScore}/5</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && (
                <p style={{ marginTop: '24px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    แสดง {filteredStocks.length} จาก {stocks.length} หุ้น
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '160px' }} />)}
                </div>
            </div>
        }>
            <StocksContent />
        </Suspense>
    );
}
