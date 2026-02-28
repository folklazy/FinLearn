'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    TrendingUp, TrendingDown, RefreshCw, ArrowUpRight,
    ArrowDownLeft, Clock, BarChart2, Wallet, ExternalLink,
    CheckCircle, AlertCircle, PieChart as PieIcon, Activity, Info,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Lot {
    qty: number;
    unitCost: number;
    purchaseDateStr: string;
    holdingDays: number;
    gainType: 'SHORT' | 'LONG';
}

interface Position {
    ticker: string;
    name: string;
    quantity: number;
    avgCost: number;
    totalCost: number;
    realizedPnl?: number;
    lots?: Lot[];
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
    totalRealizedPnl: number;
    totalReturnPct: number;
}

interface MarketStatus {
    isOpen: boolean;
    isWeekend: boolean;
    isHoliday: boolean;
    message: string;
    etTime: string;
    dateStr: string;
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
    const [tab, setTab] = useState<'holdings' | 'history'>('holdings');
    const [toast, setToast] = useState({ type: '', text: '' });
    const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
    const [pdtWarning, setPdtWarning] = useState(false);
    const [dayTradeCount, setDayTradeCount] = useState(0);
    const [expandedTicker, setExpandedTicker] = useState<string | null>(null);

    // New stock modal (buy stock not in portfolio)
    const [showNewModal, setShowNewModal] = useState(false);
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
                    const currentPrice: number = data?.price?.current ?? data?.price ?? data?.regularMarketPrice ?? 0;
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
            // Preserve lots from API before fetchPrices strips unknown fields
            const rawPositions: Position[] = data.positions || [];
            const withPrices = await fetchPrices(rawPositions);
            // Re-attach lots after fetchPrices (spread preserves them)
            setPositions(withPrices.map((p, i) => ({ ...rawPositions[i], ...p })));
            
            if (data.marketStatus) setMarketStatus(data.marketStatus);
            if (data.pdtWarning !== undefined) setPdtWarning(data.pdtWarning);
            if (data.dayTradeCount !== undefined) setDayTradeCount(data.dayTradeCount);
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
            const price = data?.price?.current ?? data?.price ?? data?.regularMarketPrice ?? 0;
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
            setShowNewModal(false);
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
    const totalUnrealizedPnl = positions.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0);

    // Allocation data
    const ALLOC_COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];
    const allocData = [
        ...positions.map((pos, i) => ({
            name: pos.ticker,
            value: pos.currentValue ?? pos.totalCost,
            color: ALLOC_COLORS[i % ALLOC_COLORS.length],
        })),
        ...(portfolio?.cashBalance ?? 0) > 0 ? [{ name: 'เงินสด', value: portfolio!.cashBalance, color: '#64748b' }] : [],
    ];
    const totalAllocValue = allocData.reduce((s, d) => s + d.value, 0);

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
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BarChart2 size={28} style={{ color: 'var(--primary-light)' }} /> Portfolio Simulator
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
                        จำลองการลงทุนด้วยเงินสมมติ ไม่มีความเสี่ยงจริง
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Market status badge */}
                    {marketStatus && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, background: marketStatus.isOpen ? 'rgba(34,197,94,0.12)' : 'rgba(100,116,139,0.12)', border: `1px solid ${marketStatus.isOpen ? 'rgba(34,197,94,0.3)' : 'rgba(100,116,139,0.25)'}`, color: marketStatus.isOpen ? '#22c55e' : 'var(--text-muted)' }}>
                            <Activity size={12} />
                            <span>{marketStatus.isOpen ? 'ตลาดเปิด' : 'ตลาดปิด'}</span>
                            <span style={{ opacity: 0.7 }}>{marketStatus.etTime}</span>
                        </div>
                    )}
                    <button onClick={() => { loadPortfolio(); loadHistory(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                </div>
            </div>

            {/* Market status info bar */}
            {marketStatus && !marketStatus.isOpen && (
                <div style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>{marketStatus.message} — การซื้อขายใน Simulator เป็น Market Order ใช้ราคา ณ เวลาที่ trade</span>
                </div>
            )}

            {/* PDT Warning */}
            {pdtWarning && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontWeight: 700, color: '#f59e0b', margin: '0 0 2px' }}>⚠️ Pattern Day Trader (PDT) Warning</p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>คุณมี <strong>{dayTradeCount} day trade</strong> ใน 5 วันทำการล่าสุด — กฎ PDT จริง: ถ้า ≥ 4 ครั้งและพอร์ต &lt; $25,000 จะถูกโบรกเกอร์จำกัด</p>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}><Wallet size={12} /> มูลค่าพอร์ตรวม</p>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800 }}>${fmt(totalValue)}</p>
                    <p style={{ fontSize: '0.75rem', marginTop: '4px', color: (portfolio?.totalReturnPct ?? 0) >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {(portfolio?.totalReturnPct ?? 0) >= 0 ? <TrendingUp size={11} style={{ display: 'inline', marginRight: '3px' }} /> : <TrendingDown size={11} style={{ display: 'inline', marginRight: '3px' }} />}
                        ผลตอบแทน {pct(portfolio?.totalReturnPct ?? 0)}
                    </p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '6px' }}>💵 เงินสด</p>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800 }}>${fmt(portfolio?.cashBalance ?? 0)}</p>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>/ ทุน ${fmt(portfolio?.startingCash ?? 0)}</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📈 Unrealized P&L</p>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800, color: totalUnrealizedPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                        {totalUnrealizedPnl >= 0 ? '+' : ''}${fmt(totalUnrealizedPnl)}
                    </p>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>ยังไม่รับรู้</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '6px' }}>🏷️ Realized P&L</p>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800, color: (portfolio?.totalRealizedPnl ?? 0) >= 0 ? '#22c55e' : '#ef4444' }}>
                        {(portfolio?.totalRealizedPnl ?? 0) >= 0 ? '+' : ''}${fmt(portfolio?.totalRealizedPnl ?? 0)}
                    </p>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>FIFO รับรู้แล้ว</p>
                </div>
                <div style={cardStyle}>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '6px' }}>📊 สัดส่วนหุ้น</p>
                    <p style={{ fontSize: '1.35rem', fontWeight: 800 }}>${fmt(totalPositionsValue)}</p>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>{positions.length} ตัว | {totalValue > 0 ? ((totalPositionsValue / totalValue) * 100).toFixed(1) : '0'}%</p>
                </div>
            </div>

            {/* Tabs + เพิ่มหุ้นใหม่ */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', alignItems: 'center' }}>
                {([['holdings', 'ถือครอง', BarChart2], ['history', 'ประวัติ', Clock]] as const).map(([id, label, Icon]) => (
                    <button key={id} onClick={() => setTab(id as 'holdings' | 'history')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: tab === id ? 600 : 400, background: tab === id ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)', border: `1px solid ${tab === id ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, color: tab === id ? 'var(--primary-light)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                        <Icon size={14} /> {label}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={() => { setShowNewModal(true); setTradeSide('BUY'); setTradeSym(''); setTradeQty(''); setTradePrice(''); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                    <ArrowUpRight size={14} /> เพิ่มหุ้นใหม่
                </button>
            </div>

            {/* ── Holdings Tab ── */}
            {tab === 'holdings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Allocation Chart Card */}
                    {positions.length > 0 && (
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PieIcon size={18} /> สัดส่วนพอร์ต
                            </h2>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Pie */}
                                <div style={{ width: '180px', height: '180px', flexShrink: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={allocData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                                                {allocData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(v: number | undefined) => [v != null ? `$${fmt(v)}` : '—', '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.8rem' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Legend */}
                                <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {allocData.map((d, i) => {
                                        const allocPct = totalAllocValue > 0 ? (d.value / totalAllocValue) * 100 : 0;
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: d.color, flexShrink: 0 }} />
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, flex: 1 }}>{d.name}</span>
                                                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>${fmt(d.value)}</span>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '44px', textAlign: 'right', color: d.name === 'เงินสด' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{allocPct.toFixed(1)}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Holdings Table Card */}
                    <div style={cardStyle}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BarChart2 size={18} /> หุ้นที่ถือครอง
                        </h2>
                        {positions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <BarChart2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>ยังไม่มีหุ้นในพอร์ต</p>
                                <button onClick={() => { setShowNewModal(true); setTradeSide('BUY'); setTradeSym(''); setTradeQty(''); setTradePrice(''); }} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <ArrowUpRight size={14} /> เริ่มซื้อหุ้น
                                </button>
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                            {['หุ้น', 'สัดส่วน', 'จำนวน', 'ต้นทุนเฉลี่ย', 'ราคา', 'มูลค่า', 'Unrealized P&L', ''].map(h => (
                                                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'หุ้น' ? 'left' : h === '' ? 'center' : 'right', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {positions.map((pos, i) => {
                                            const posValue = pos.currentValue ?? pos.totalCost;
                                            const allocPct = totalAllocValue > 0 ? (posValue / totalAllocValue) * 100 : 0;
                                            const color = ALLOC_COLORS[i % ALLOC_COLORS.length];
                                            const isExpanded = expandedTicker === pos.ticker;
                                            return (
                                                <>
                                                    <tr key={pos.ticker} style={{ borderBottom: isExpanded ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                                                        <td style={{ padding: '12px', cursor: 'pointer' }}
                                                            onClick={() => setExpandedTicker(isExpanded ? null : pos.ticker)}>
                                                            <p style={{ fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{isExpanded ? '▼' : '▶'}</span>
                                                                {pos.ticker}
                                                            </p>
                                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pos.name}</p>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                                <div style={{ width: '40px', height: '5px', borderRadius: '3px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${Math.min(100, allocPct)}%`, height: '100%', background: color }} />
                                                                </div>
                                                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color }}>{allocPct.toFixed(1)}%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>{pos.quantity.toFixed(pos.quantity % 1 === 0 ? 0 : 4)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>${fmt(pos.avgCost)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            {pos.currentPrice ? `$${fmt(pos.currentPrice)}` : <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>N/A</span>}
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>${fmt(posValue)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                                            {pos.unrealizedPnl !== undefined ? (
                                                                <span style={{ color: pos.unrealizedPnl >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                                                                    {pos.unrealizedPnl >= 0 ? '+' : ''}${fmt(pos.unrealizedPnl)}
                                                                    <br /><span style={{ fontSize: '0.72rem' }}>{pct(pos.unrealizedPnlPct ?? 0)}</span>
                                                                </span>
                                                            ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                                        </td>
                                                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                                                            <Link href={`/stocks/${pos.ticker}`} style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                                                                <ExternalLink size={14} />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                    {/* Lot detail sub-rows */}
                                                    {isExpanded && pos.lots && pos.lots.length > 0 && (
                                                        <tr key={`${pos.ticker}-lots`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                            <td colSpan={8} style={{ padding: '0 12px 14px 28px', background: 'rgba(99,102,241,0.03)' }}>
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>รายละเอียดล็อต (FIFO — เก่าสุดขายก่อน)</div>
                                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                                                    <thead>
                                                                        <tr style={{ color: 'var(--text-muted)' }}>
                                                                            {['วันซื้อ', 'ถือมา', 'จำนวน', 'ต้นทุน/หุ้น', 'ประเภทกำไร', 'Unrealized P/L'].map(h => (
                                                                                <th key={h} style={{ padding: '4px 8px', textAlign: h === 'วันซื้อ' || h === 'ถือมา' || h === 'ประเภทกำไร' ? 'left' : 'right', fontWeight: 500 }}>{h}</th>
                                                                            ))}
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {pos.lots.map((lot, li) => {
                                                                            const lotPnl = pos.currentPrice
                                                                                ? lot.qty * (pos.currentPrice - lot.unitCost)
                                                                                : null;
                                                                            return (
                                                                                <tr key={li} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                                                                    <td style={{ padding: '5px 8px' }}>{lot.purchaseDateStr}</td>
                                                                                    <td style={{ padding: '5px 8px' }}>{lot.holdingDays}d</td>
                                                                                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>{lot.qty.toFixed(lot.qty % 1 === 0 ? 0 : 4)}</td>
                                                                                    <td style={{ padding: '5px 8px', textAlign: 'right' }}>${fmt(lot.unitCost)}</td>
                                                                                    <td style={{ padding: '5px 8px' }}>
                                                                                        <span style={{ padding: '2px 7px', borderRadius: '4px', fontWeight: 700, fontSize: '0.72rem', background: lot.gainType === 'LONG' ? 'rgba(34,197,94,0.12)' : 'rgba(245,158,11,0.12)', color: lot.gainType === 'LONG' ? '#22c55e' : '#f59e0b' }}>
                                                                                            {lot.gainType === 'LONG' ? 'LONG-TERM' : 'SHORT-TERM'}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td style={{ padding: '5px 8px', textAlign: 'right', fontWeight: 600, color: lotPnl == null ? 'var(--text-muted)' : lotPnl >= 0 ? '#22c55e' : '#ef4444' }}>
                                                                                        {lotPnl != null ? `${lotPnl >= 0 ? '+' : ''}$${fmt(lotPnl)}` : '—'}
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                {/* Tax Summary Card */}
                {positions.length > 0 && (() => {
                    let shortUnrealized = 0, longUnrealized = 0;
                    for (const pos of positions) {
                        if (!pos.lots || !pos.currentPrice) continue;
                        for (const lot of pos.lots) {
                            const lotPnl = lot.qty * (pos.currentPrice - lot.unitCost);
                            if (lot.gainType === 'SHORT') shortUnrealized += lotPnl;
                            else longUnrealized += lotPnl;
                        }
                    }
                    const totalRealized = portfolio?.totalRealizedPnl ?? 0;
                    return (
                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🏷️ สรุปภาษีและกำไร/ขาดทุน
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                                    <p style={{ fontSize: '0.73rem', color: '#f59e0b', marginBottom: '6px', fontWeight: 600 }}>📅 Short-term Unrealized</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: shortUnrealized >= 0 ? '#22c55e' : '#ef4444' }}>{shortUnrealized >= 0 ? '+' : ''}${fmt(shortUnrealized)}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>ถือ &lt; 1 ปี · อัตราภาษีปกติ</p>
                                </div>
                                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                                    <p style={{ fontSize: '0.73rem', color: '#22c55e', marginBottom: '6px', fontWeight: 600 }}>📆 Long-term Unrealized</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: longUnrealized >= 0 ? '#22c55e' : '#ef4444' }}>{longUnrealized >= 0 ? '+' : ''}${fmt(longUnrealized)}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>ถือ ≥ 1 ปี · อัตราภาษีพิเศษ</p>
                                </div>
                                <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    <p style={{ fontSize: '0.73rem', color: 'var(--primary-light)', marginBottom: '6px', fontWeight: 600 }}>✅ Realized P/L (FIFO)</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: totalRealized >= 0 ? '#22c55e' : '#ef4444' }}>{totalRealized >= 0 ? '+' : ''}${fmt(totalRealized)}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>รับรู้แล้ว · ต้องรายงานภาษี</p>
                                </div>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                                ⚠️ ข้อมูลนี้เป็นการจำลองเท่านั้น — ไม่ใช่คำแนะนำภาษีจริง US short-term capital gains (&lt;1 ปี) เสียภาษีในอัตราปกติ long-term (≥1 ปี) เสียภาษี 0/15/20%
                            </p>
                        </div>
                    );
                })()}
                </div>
            )}

            {/* ── New Stock Modal ── */}
            {showNewModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                    onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false); }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>เพิ่มหุ้นใหม่</h3>
                            <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.3rem', lineHeight: 1 }}>✕</button>
                        </div>

                        {/* Side toggle */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            {(['BUY', 'SELL'] as const).map(s => (
                                <button key={s} onClick={() => setTradeSide(s)} style={{ flex: 1, padding: '9px', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', border: '2px solid', borderColor: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--border)', background: tradeSide === s ? (s === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)') : 'transparent', color: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--text-muted)' }}>
                                    {s === 'BUY' ? 'ซื้อ' : 'ขาย'}
                                </button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>Ticker</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input value={tradeSym} onChange={e => setTradeSym(e.target.value.toUpperCase())} placeholder="AAPL, MSFT, NVDA..." style={{ ...inputStyle, flex: 1 }} onKeyDown={e => e.key === 'Enter' && handleFetchPrice()} />
                                    <button onClick={handleFetchPrice} disabled={priceLoading || !tradeSym.trim()} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: 'var(--primary-light)', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', opacity: (!tradeSym.trim() || priceLoading) ? 0.5 : 1 }}>
                                        {priceLoading ? '...' : 'ดึงราคา'}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>ราคา (USD)</label>
                                <input type="number" value={tradePrice} onChange={e => setTradePrice(e.target.value)} placeholder="0.00" min="0" step="0.01" style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>จำนวนหุ้น</label>
                                <input type="number" value={tradeQty} onChange={e => setTradeQty(e.target.value)} placeholder="1" min="0.0001" step="1" style={inputStyle} />
                            </div>
                            {tradeSym && tradeQty && tradePrice && (
                                <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>มูลค่ารวม</span>
                                    <strong>${fmt(parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0'))}</strong>
                                </div>
                            )}
                            <button onClick={handleTrade} disabled={trading || !tradeSym || !tradeQty || !tradePrice}
                                style={{ padding: '13px', borderRadius: '12px', border: 'none', background: tradeSide === 'BUY' ? '#22c55e' : '#ef4444', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: (trading || !tradeSym || !tradeQty || !tradePrice) ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: (trading || !tradeSym || !tradeQty || !tradePrice) ? 0.5 : 1 }}>
                                {trading ? 'กำลังดำเนินการ...' : `${tradeSide === 'BUY' ? 'ซื้อ' : 'ขาย'} ${tradeSym || '—'}`}
                            </button>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>เงินสมมติ — ไม่ใช่เงินจริง</p>
                        </div>
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
