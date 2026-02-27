'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    TrendingUp, TrendingDown, RefreshCw, ArrowUpRight,
    ArrowDownLeft, Clock, BarChart2, Wallet, ExternalLink,
    CheckCircle, AlertCircle
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Position {
    ticker: string;
    name: string;
    quantity: number;
    avgCost: number;
    totalCost: number;
    currentPrice?: number;
    currentValue?: number;
    unrealizedPnl?: number;
    unrealizedPnlPct?: number;
}

interface Portfolio {
    id: string;
    name: string;
    startingCash: number;
    cashBalance: number;
}

interface Trade {
    id: string;
    side: 'BUY' | 'SELL';
    ticker: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
    createdAt: string;
}

function fmt(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number) {
    return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export default function PortfolioPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
    const [positions, setPositions] = useState<Position[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'holdings' | 'trade' | 'history'>('holdings');
    const [toast, setToast] = useState({ type: '', text: '' });

    // Trade form
    const [tradeSym, setTradeSym] = useState('');
    const [tradeQty, setTradeQty] = useState('');
    const [tradePrice, setTradePrice] = useState('');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [trading, setTrading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);

    const showToast = (type: string, text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast({ type: '', text: '' }), 4000);
    };

    const fetchPrices = async (posList: Position[]): Promise<Position[]> => {
        if (posList.length === 0) return posList;
        const updated = await Promise.all(
            posList.map(async (pos) => {
                try {
                    const res = await fetch(`${API_BASE}/api/stocks/${pos.ticker}`);
                    if (!res.ok) return pos;
                    const data = await res.json();
                    const currentPrice: number = data?.price ?? data?.regularMarketPrice ?? data?.close ?? 0;
                    if (!currentPrice) return pos;
                    const currentValue = pos.quantity * currentPrice;
                    const unrealizedPnl = currentValue - pos.totalCost;
                    const unrealizedPnlPct = pos.totalCost > 0 ? (unrealizedPnl / pos.totalCost) * 100 : 0;
                    return { ...pos, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPct };
                } catch {
                    return pos;
                }
            })
        );
        return updated;
    };

    const loadPortfolio = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/portfolio');
            if (!res.ok) return;
            const data = await res.json();
            setPortfolio(data.portfolio);
            const withPrices = await fetchPrices(data.positions);
            setPositions(withPrices);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const res = await fetch('/api/portfolio/history');
            if (res.ok) {
                const data = await res.json();
                setTrades(data.trades || []);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/login'); return; }
        if (session?.user) { loadPortfolio(); loadHistory(); }
    }, [session, status, loadPortfolio, loadHistory, router]);

    const handleFetchPrice = async () => {
        if (!tradeSym.trim()) return;
        setPriceLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/stocks/${tradeSym.trim().toUpperCase()}`);
            if (!res.ok) { showToast('error', `ไม่พบหุ้น ${tradeSym}`); return; }
            const data = await res.json();
            const price = data?.price ?? data?.regularMarketPrice ?? data?.close ?? 0;
            if (price) setTradePrice(price.toFixed(2));
            else showToast('error', 'ไม่พบราคา');
        } catch {
            showToast('error', 'โหลดราคาไม่สำเร็จ');
        } finally {
            setPriceLoading(false);
        }
    };

    const handleTrade = async () => {
        if (!tradeSym.trim() || !tradeQty || !tradePrice) {
            showToast('error', 'กรอกข้อมูลให้ครบ');
            return;
        }
        setTrading(true);
        try {
            const res = await fetch('/api/portfolio/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    symbol: tradeSym.trim().toUpperCase(),
                    side: tradeSide,
                    quantity: parseFloat(tradeQty),
                    price: parseFloat(tradePrice),
                }),
            });
            const data = await res.json();
            if (!res.ok) { showToast('error', data.error || 'เกิดข้อผิดพลาด'); return; }
            showToast('success', `${tradeSide === 'BUY' ? 'ซื้อ' : 'ขาย'} ${data.symbol} ${data.quantity} หุ้น @ $${fmt(data.price)} สำเร็จ`);
            setTradeSym(''); setTradeQty(''); setTradePrice('');
            await loadPortfolio(); await loadHistory();
        } catch {
            showToast('error', 'เกิดข้อผิดพลาด');
        } finally {
            setTrading(false);
        }
    };

    // Computed totals
    const totalPositionsValue = positions.reduce((s, p) => s + (p.currentValue ?? p.totalCost), 0);
    const totalValue = (portfolio?.cashBalance ?? 0) + totalPositionsValue;
    const totalPnl = portfolio ? totalValue - portfolio.startingCash : 0;
    const totalPnlPct = portfolio && portfolio.startingCash > 0 ? (totalPnl / portfolio.startingCash) * 100 : 0;
    const totalUnrealizedPnl = positions.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0);

    const cardStyle = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px 24px' };
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>

            {/* Toast */}
            {toast.text && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#22c55e' : '#ef4444', maxWidth: '360px' }}>
                    {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.text}
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart2 size={28} style={{ color: 'var(--primary-light)' }} /> Portfolio Simulator
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
                        จำลองการลงทุนด้วยเงินสมมติ ไม่มีความเสี่ยงจริง
                    </p>
                </div>
                <button onClick={() => { loadPortfolio(); loadHistory(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <RefreshCw size={14} /> รีเฟรช
                </button>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Wallet size={13} /> มูลค่าพอร์ตรวม</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>${fmt(totalValue)}</p>
                    <p style={{ fontSize: '0.78rem', marginTop: '4px', color: totalPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {totalPnl >= 0 ? <TrendingUp size={12} style={{ display: 'inline', marginRight: '3px' }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: '3px' }} />}
                        {totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)} ({pct(totalPnlPct)})
                    </p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>💵 เงินสด</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>${fmt(portfolio?.cashBalance ?? 0)}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>ทุนตั้งต้น ${fmt(portfolio?.startingCash ?? 0)}</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📈 มูลค่าหุ้น</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800 }}>${fmt(totalPositionsValue)}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{positions.length} ตัว</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>💹 Unrealized P&L</p>
                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: totalUnrealizedPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        {totalUnrealizedPnl >= 0 ? '+' : ''}${fmt(totalUnrealizedPnl)}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>ยังไม่รับรู้กำไร/ขาดทุน</p>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                {([['holdings', 'ถือครอง', BarChart2], ['trade', 'ซื้อ/ขาย', ArrowUpRight], ['history', 'ประวัติ', Clock]] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setTab(id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: tab === id ? 600 : 400, background: tab === id ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)', border: `1px solid ${tab === id ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, color: tab === id ? 'var(--primary-light)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
            </div>

            {/* ── Holdings Tab ── */}
            {tab === 'holdings' && (
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 size={18} /> หุ้นที่ถือครอง
                    </h2>
                    {positions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                            <BarChart2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>ยังไม่มีหุ้นในพอร์ต</p>
                            <button onClick={() => setTab('trade')} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                <ArrowUpRight size={14} /> เริ่มซื้อหุ้น
                            </button>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        {['หุ้น', 'จำนวน', 'ต้นทุนเฉลี่ย', 'ราคาปัจจุบัน', 'มูลค่า', 'P&L', ''].map(h => (
                                            <th key={h} style={{ padding: '8px 12px', textAlign: h === '' ? 'center' : 'right', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {positions.map(pos => (
                                        <tr key={pos.ticker} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <td style={{ padding: '12px' }}>
                                                <p style={{ fontWeight: 700, margin: 0 }}>{pos.ticker}</p>
                                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pos.name}</p>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>{pos.quantity.toFixed(pos.quantity % 1 === 0 ? 0 : 4)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>${fmt(pos.avgCost)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {pos.currentPrice ? `$${fmt(pos.currentPrice)}` : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</span>}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>${fmt(pos.currentValue ?? pos.totalCost)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                {pos.unrealizedPnl !== undefined ? (
                                                    <span style={{ color: pos.unrealizedPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                                        {pos.unrealizedPnl >= 0 ? '+' : ''}${fmt(pos.unrealizedPnl)}
                                                        <br />
                                                        <span style={{ fontSize: '0.72rem' }}>{pct(pos.unrealizedPnlPct ?? 0)}</span>
                                                    </span>
                                                ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <Link href={`/stocks/${pos.ticker}`} style={{ color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center' }}>
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── Trade Tab ── */}
            {tab === 'trade' && (
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowUpRight size={18} /> ซื้อ / ขาย หุ้น
                    </h2>

                    {/* Side toggle */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <button onClick={() => setTradeSide('BUY')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', background: tradeSide === 'BUY' ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)', border: `2px solid ${tradeSide === 'BUY' ? '#22c55e' : 'var(--border)'}`, color: tradeSide === 'BUY' ? '#22c55e' : 'var(--text-muted)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <ArrowUpRight size={16} /> ซื้อ (BUY)
                        </button>
                        <button onClick={() => setTradeSide('SELL')} style={{ flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', background: tradeSide === 'SELL' ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)', border: `2px solid ${tradeSide === 'SELL' ? '#ef4444' : 'var(--border)'}`, color: tradeSide === 'SELL' ? '#ef4444' : 'var(--text-muted)', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <ArrowDownLeft size={16} /> ขาย (SELL)
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {/* Symbol */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>สัญลักษณ์หุ้น (Ticker)</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input value={tradeSym} onChange={e => setTradeSym(e.target.value.toUpperCase())} placeholder="เช่น AAPL, MSFT" style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleFetchPrice()} />
                                <button onClick={handleFetchPrice} disabled={priceLoading || !tradeSym.trim()} style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary-light)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: (!tradeSym.trim() || priceLoading) ? 0.6 : 1 }}>
                                    {priceLoading ? '...' : 'ดึงราคา'}
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>ราคา (USD)</label>
                            <input type="number" value={tradePrice} onChange={e => setTradePrice(e.target.value)} placeholder="0.00" min="0" step="0.01" style={inputStyle} />
                        </div>

                        {/* Quantity */}
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>จำนวนหุ้น</label>
                            <input type="number" value={tradeQty} onChange={e => setTradeQty(e.target.value)} placeholder="1" min="0" step="1" style={inputStyle} />
                        </div>

                        {/* Order summary */}
                        {tradeSym && tradeQty && tradePrice && (
                            <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>มูลค่ารวม</span>
                                    <span style={{ fontWeight: 700 }}>${fmt(parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0'))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>เงินสดคงเหลือหลังซื้อ</span>
                                    <span style={{ fontWeight: 600, color: tradeSide === 'BUY' ? ((portfolio?.cashBalance ?? 0) - parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0') < 0 ? '#ef4444' : '#22c55e') : '#22c55e' }}>
                                        ${fmt(tradeSide === 'BUY'
                                            ? (portfolio?.cashBalance ?? 0) - parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0')
                                            : (portfolio?.cashBalance ?? 0) + parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0')
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button onClick={handleTrade} disabled={trading || !tradeSym || !tradeQty || !tradePrice} className="btn btn-primary" style={{ padding: '12px', fontSize: '0.95rem', fontWeight: 700, background: tradeSide === 'BUY' ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)', border: 'none', opacity: (trading || !tradeSym || !tradeQty || !tradePrice) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {tradeSide === 'BUY' ? <ArrowUpRight size={17} /> : <ArrowDownLeft size={17} />}
                            {trading ? 'กำลังดำเนินการ...' : tradeSide === 'BUY' ? `ซื้อ ${tradeSym || '—'}` : `ขาย ${tradeSym || '—'}`}
                        </button>

                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
                            นี่คือการลงทุนสมมติ ไม่ใช่เงินจริง • ข้อมูลราคาจากตลาดจริง
                        </p>
                    </div>
                </div>
            )}

            {/* ── History Tab ── */}
            {tab === 'history' && (
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} /> ประวัติการซื้อขาย
                    </h2>
                    {trades.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            ยังไม่มีรายการซื้อขาย
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {trades.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: t.side === 'BUY' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {t.side === 'BUY' ? <ArrowUpRight size={16} style={{ color: '#22c55e' }} /> : <ArrowDownLeft size={16} style={{ color: '#ef4444' }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                                            <span style={{ color: t.side === 'BUY' ? '#22c55e' : '#ef4444', marginRight: '6px' }}>{t.side}</span>
                                            {t.ticker}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                            {t.quantity} หุ้น @ ${fmt(t.price)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>${fmt(t.total)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                            {new Date(t.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </p>
                                    </div>
                                    <Link href={`/stocks/${t.ticker}`} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
