'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { Search, Filter, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, formatLargeNumber, getPriceColor } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

interface StockItem {
    symbol: string;
    name: string;
    logo: string;
    sector: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number;
    overallScore: number;
}

function StocksContent() {
    const searchParams = useSearchParams();
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockItem[]>([]);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [selectedSector, setSelectedSector] = useState('ทั้งหมด');
    const [loading, setLoading] = useState(true);

    const sectors = ['ทั้งหมด', 'เทคโนโลยี', 'ยานยนต์', 'การเงิน', 'สุขภาพ', 'ค้าปลีก'];

    useEffect(() => {
        api.getPopularStocks()
            .then(data => { setStocks(data); setFilteredStocks(data); })
            .catch(() => {
                const fallback: StockItem[] = [
                    { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', sector: 'เทคโนโลยี', price: 231.34, change: 2.47, changePercent: 1.08, marketCap: 3450000000000, overallScore: 4.2 },
                    { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', sector: 'เทคโนโลยี', price: 176.45, change: 1.56, changePercent: 0.89, marketCap: 2100000000000, overallScore: 4.5 },
                    { symbol: 'MSFT', name: 'Microsoft Corp.', logo: 'https://logo.clearbit.com/microsoft.com', sector: 'เทคโนโลยี', price: 417.88, change: 2.68, changePercent: 0.65, marketCap: 3100000000000, overallScore: 4.6 },
                    { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', sector: 'ยานยนต์', price: 248.42, change: -4.68, changePercent: -1.85, marketCap: 800000000000, overallScore: 3.2 },
                    { symbol: 'AMZN', name: 'Amazon.com', logo: 'https://logo.clearbit.com/amazon.com', sector: 'เทคโนโลยี', price: 186.21, change: 1.66, changePercent: 0.90, marketCap: 1900000000000, overallScore: 4.0 },
                ];
                setStocks(fallback);
                setFilteredStocks(fallback);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let result = stocks;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                s.name.toLowerCase().includes(q)
            );
        }
        if (selectedSector !== 'ทั้งหมด') {
            result = result.filter(s => s.sector === selectedSector);
        }
        setFilteredStocks(result);
    }, [search, selectedSector, stocks]);

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={28} className="gradient-text" /> หุ้นทั้งหมด
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>ค้นหาและเรียนรู้เกี่ยวกับหุ้นที่คุณสนใจ</p>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="ค้นหาหุ้น... (เช่น AAPL, Apple)"
                        style={{
                            width: '100%', padding: '12px 16px 12px 42px',
                            borderRadius: '12px', border: '1px solid var(--border)',
                            background: 'var(--bg-card)', color: 'var(--text-primary)',
                            fontSize: '0.9rem', outline: 'none',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {sectors.map(s => (
                        <button
                            key={s}
                            onClick={() => setSelectedSector(s)}
                            className={selectedSector === s ? 'btn btn-primary' : 'btn btn-outline'}
                            style={{ padding: '10px 16px', fontSize: '0.8rem' }}
                        >
                            <Filter size={14} /> {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stock Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>กำลังโหลด...</div>
            ) : filteredStocks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>ไม่พบหุ้นที่ค้นหา 🔍</p>
                    <p>ลองค้นหาด้วยคำอื่น</p>
                </div>
            ) : (
                <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {filteredStocks.map((stock) => (
                        <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none' }}>
                            <div className="glass-card animate-fade-in-up" style={{ padding: '24px', cursor: 'pointer' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={stock.logo} alt={stock.name}
                                            style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'white', padding: '4px' }}
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{stock.symbol}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stock.name}</div>
                                        </div>
                                    </div>
                                    <span className="badge badge-primary">{stock.sector}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{formatCurrency(stock.price)}</div>
                                        <div className={getPriceColor(stock.change)} style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                            {stock.change >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(stock.change))} ({formatPercent(stock.changePercent)})
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Market Cap</div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatLargeNumber(stock.marketCap)}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary-light)' }}>⭐ {stock.overallScore}/5</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function StocksPage() {
    return (
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>กำลังโหลด...</div>}>
            <StocksContent />
        </Suspense>
    );
}
