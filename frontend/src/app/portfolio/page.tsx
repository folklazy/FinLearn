'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    TrendingUp, TrendingDown, RefreshCw, ArrowUpRight, ArrowRight,
    ArrowDownLeft, Clock, BarChart2, ExternalLink,
    CheckCircle, AlertCircle, PieChart as PieIcon, Activity, Info, Tag,
    Search, X, ChevronDown, Layers,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '@/lib/i18n';

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
    const { t } = useI18n();

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
    const [inlinePanel, setInlinePanel] = useState<{ ticker: string; side: 'BUY' | 'SELL'; qty: string; heldQty: number } | null>(null);
    const [inlineSubmitting, setInlineSubmitting] = useState(false);

    // New stock modal (buy stock not in portfolio)
    const [showNewModal, setShowNewModal] = useState(false);
    const [tradeSym, setTradeSym] = useState('');
    const [tradeQty, setTradeQty] = useState('');
    const [tradePrice, setTradePrice] = useState('');
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [trading, setTrading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);

    // Stock search for modal
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; sector: string; exchange: string; logo: string }[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string; logo: string; sector: string } | null>(null);
    const searchTimerRef = useState<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (type: string, text: string) => {
        setToast({ type, text });
        setTimeout(() => setToast({ type: '', text: '' }), 4000);
    };

    const fetchPrices = async (posList: Position[]): Promise<Position[]> => {
        if (posList.length === 0) return posList;
        try {
            // Use lightweight batch endpoint instead of individual full stock detail calls
            const tickers = posList.map(p => p.ticker);
            const res = await fetch(`${API_BASE}/api/stocks/batch?symbols=${tickers.join(',')}`);
            if (!res.ok) return posList;
            const batchData: { symbol: string; price: number; change: number; changePercent: number }[] = await res.json();
            const priceMap = new Map(batchData.map(d => [d.symbol, d.price]));
            return posList.map(pos => {
                const currentPrice = priceMap.get(pos.ticker) ?? 0;
                if (!currentPrice) return pos;
                const currentValue = pos.quantity * currentPrice;
                const unrealizedPnl = currentValue - pos.totalCost;
                const unrealizedPnlPct = pos.totalCost > 0 ? (unrealizedPnl / pos.totalCost) * 100 : 0;
                return { ...pos, currentPrice, currentValue, unrealizedPnl, unrealizedPnlPct };
            });
        } catch {
            return posList;
        }
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
        if (status === 'loading') return;
        if (!session?.user) { setLoading(false); return; }
        loadPortfolio(); loadHistory();
    }, [session, status, loadPortfolio, loadHistory]);

    // Debounced stock search for modal
    const handleSearchStock = (query: string) => {
        setSearchQuery(query);
        setTradeSym(query.toUpperCase());
        if (searchTimerRef[0]) clearTimeout(searchTimerRef[0]);
        if (!query.trim() || query.trim().length < 1) {
            setSearchResults([]);
            setShowSearchDropdown(false);
            return;
        }
        setShowSearchDropdown(true);
        searchTimerRef[0] = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
                if (res.ok) {
                    const data = await res.json();
                    setSearchResults(data.slice(0, 8));
                } else {
                    setSearchResults([]);
                }
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 300);
    };

    const handleSelectStock = async (stock: { symbol: string; name: string; logo: string; sector: string }) => {
        setSelectedStock(stock);
        setTradeSym(stock.symbol);
        setSearchQuery(stock.symbol);
        setShowSearchDropdown(false);
        setSearchResults([]);
        // Auto-fetch price
        setPriceLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/stocks/batch?symbols=${stock.symbol}`);
            if (res.ok) {
                const data: { symbol: string; price: number }[] = await res.json();
                const price = data?.[0]?.price ?? 0;
                if (price) setTradePrice(price.toFixed(2));
            }
        } catch { /* ignore */ }
        finally { setPriceLoading(false); }
    };

    const resetModal = () => {
        setShowNewModal(false);
        setTradeSym(''); setTradeQty(''); setTradePrice('');
        setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false);
        setSelectedStock(null);
    };

    const handleTrade = async () => {
        if (!tradeSym.trim() || !tradeQty || !tradePrice) {
            showToast('error', t('port.fillAll'));
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
            if (!res.ok) { showToast('error', data.error || t('port.error')); return; }
            showToast('success', `${tradeSide === 'BUY' ? t('port.buy') : t('port.sell')} ${data.symbol} ${data.quantity} ${t('port.shares')} ${t('port.at')} $${fmt(data.price)} ${t('port.success')}`);
            resetModal();
            await loadPortfolio(); await loadHistory();
        } catch {
            showToast('error', t('port.error'));
        } finally {
            setTrading(false);
        }
    };

    const handleInlineTrade = async () => {
        if (!inlinePanel) return;
        const qty = parseFloat(inlinePanel.qty);
        if (!qty || qty <= 0) return;
        const pos = positions.find(p => p.ticker === inlinePanel.ticker);
        const price = pos?.currentPrice;
        if (!price) { showToast('error', t('port.noPriceFound')); return; }
        setInlineSubmitting(true);
        try {
            const res = await fetch('/api/portfolio/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: inlinePanel.ticker, side: inlinePanel.side, quantity: qty, price }),
            });
            const d = await res.json();
            if (!res.ok) { showToast('error', d.error || t('port.error')); return; }
            showToast('success', `${inlinePanel.side === 'BUY' ? t('port.buy') : t('port.sell')} ${inlinePanel.ticker} ${qty} ${t('port.shares')} ${t('port.at')} $${fmt(price)} ${t('port.success')}`);
            if (d.marketWarning) showToast('error', `⚠️ ${d.marketWarning}`);
            setInlinePanel(null);
            await loadPortfolio(); await loadHistory();
        } catch {
            showToast('error', t('port.error'));
        } finally {
            setInlineSubmitting(false);
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
        ...(portfolio?.cashBalance ?? 0) > 0 ? [{ name: t('port.cash'), value: portfolio!.cashBalance, color: '#64748b' }] : [],
    ];
    const totalAllocValue = allocData.reduce((s, d) => s + d.value, 0);

    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1060px', margin: '0 auto', padding: '48px 24px 80px' }}>

            {/* Toast */}
            {toast.text && (
                <div role="status" aria-live="polite" className="toast-enter" style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 'var(--z-toast)' as unknown as number, padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 500, background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: toast.type === 'success' ? '#22c55e' : '#ef4444', maxWidth: '360px', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-lg)' }}>
                    {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                    {toast.text}
                </div>
            )}

            {/* ═══ Header ═══ */}
            <div className="animate-fade-up" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '28px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {t('port.title')}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '14px' }}>
                    {t('port.subtitle')}
                </p>
            </div>

            {/* ═══ Login prompt for guests ═══ */}
            {!session?.user && (
                <div className="animate-fade-up delay-1">
                    {/* ── Mock Portfolio Dashboard with Animations ── */}
                    <div className="animate-fade-up delay-2" style={{ position: 'relative', marginBottom: '36px', borderRadius: '16px', overflow: 'hidden' }}>
                        {/* Floating ambient orbs */}
                        <div className="gp-orb" style={{ width: '200px', height: '200px', background: 'rgba(52,211,153,0.1)', top: '-50px', right: '-40px', animationDelay: '0s' }} />
                        <div className="gp-orb" style={{ width: '140px', height: '140px', background: 'rgba(124,108,240,0.08)', bottom: '40px', left: '-30px', animationDelay: '4s' }} />

                        <div className="gp-border-shimmer" style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                            borderRadius: '16px', overflow: 'hidden', position: 'relative',
                        }}>
                            {/* Mock portfolio summary with animated chart */}
                            <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <div className="gp-live-dot" />
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                {t('port.totalValue')}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                                            <span style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', animation: 'countFade 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
                                                $104,832.50
                                            </span>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '0.82rem', fontWeight: 700, color: 'var(--success)',
                                                padding: '4px 12px', borderRadius: '100px', background: 'var(--success-bg)',
                                            }}>
                                                <TrendingUp size={13} /> +$4,832.50 (+4.83%)
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Mini portfolio area chart (SVG) */}
                                <div style={{ margin: '16px -24px 0', overflow: 'hidden' }}>
                                    <svg width="100%" height="80" viewBox="0 0 500 80" preserveAspectRatio="none" style={{ display: 'block' }}>
                                        <defs>
                                            <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
                                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                                            </linearGradient>
                                        </defs>
                                        <path d="M0,70 C30,68 60,65 90,60 C120,55 150,52 180,48 C210,44 240,46 270,40 C300,34 330,30 360,26 C390,22 420,18 450,15 C470,12 490,10 500,8 L500,80 L0,80 Z"
                                            fill="url(#portGrad)" style={{ animation: 'chartGrow 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s both', transformOrigin: 'bottom' }} />
                                        <path d="M0,70 C30,68 60,65 90,60 C120,55 150,52 180,48 C210,44 240,46 270,40 C300,34 330,30 360,26 C390,22 420,18 450,15 C470,12 490,10 500,8"
                                            className="gp-sparkline gp-sparkline-0" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                                borderBottom: '1px solid var(--border)',
                            }}>
                                {[
                                    { label: t('port.startingCash'), value: '$100,000' },
                                    { label: t('port.cash'), value: '$41,206' },
                                    { label: t('port.stocks'), value: '3 Positions' },
                                ].map((stat, i) => (
                                    <div key={i} style={{
                                        padding: '14px 24px',
                                        borderRight: i < 2 ? '1px solid var(--border)' : 'none',
                                        animation: `countFade 0.5s cubic-bezier(0.16,1,0.3,1) ${0.5 + i * 0.1}s both`,
                                    }}>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{stat.label}</div>
                                        <div style={{ fontSize: '0.92rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Mock positions table header */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr',
                                padding: '10px 24px', borderBottom: '1px solid var(--border)',
                                fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                <span>{t('port.stocks')}</span>
                                <span style={{ textAlign: 'right' }}>Shares</span>
                                <span style={{ textAlign: 'right' }}>Avg Cost</span>
                                <span style={{ textAlign: 'right' }}>P&L</span>
                            </div>

                            {/* Mock position rows with staggered animation */}
                            {[
                                { sym: 'AAPL', name: 'Apple Inc.', qty: 50, avg: '$218.40', pl: '+$645.00', plPct: '+5.91%', up: true },
                                { sym: 'NVDA', name: 'NVIDIA Corp.', qty: 15, avg: '$810.20', pl: '+$978.00', plPct: '+8.05%', up: true },
                                { sym: 'TSLA', name: 'Tesla, Inc.', qty: 30, avg: '$255.80', pl: '-$221.40', plPct: '-2.89%', up: false },
                            ].map((row, i) => (
                                <div key={i} className={`gp-row-${i}`} style={{
                                    display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr 1fr',
                                    padding: '14px 24px', alignItems: 'center',
                                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                                    transition: 'background 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '34px', height: '34px', borderRadius: '10px',
                                            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)',
                                        }}>
                                            {row.sym.slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{row.sym}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{row.name}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem' }}>{row.qty}</div>
                                    <div style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>{row.avg}</div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: row.up ? 'var(--success)' : 'var(--danger)' }}>{row.pl}</div>
                                        <div style={{ fontSize: '0.68rem', color: row.up ? 'var(--success)' : 'var(--danger)', opacity: 0.7 }}>{row.plPct}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Glassmorphism gradient overlay with CTA */}
                        <div className="gp-glass" style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to bottom, rgba(14,14,14,0) 5%, rgba(14,14,14,0.55) 40%, rgba(14,14,14,0.95) 100%)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                            alignItems: 'center', padding: '0 24px 36px',
                        }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '16px',
                                background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '18px', animation: 'float 4s ease-in-out infinite',
                            }}>
                                <Activity size={24} style={{ color: '#34d399' }} />
                            </div>
                            <h2 className="gp-gradient-text" style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center', letterSpacing: '-0.03em' }}>
                                {t('port.loginPrompt')}
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', maxWidth: '420px', marginBottom: '22px', lineHeight: 1.6 }}>
                                {t('port.loginDesc')}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                <Link href="/register" className="gp-cta-btn" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '12px 28px', borderRadius: '100px',
                                    background: '#22c55e', color: '#0e0e0e',
                                    fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                                }}>
                                    {t('port.register')} <ArrowRight size={15} />
                                </Link>
                                <Link href="/login" style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                                    padding: '12px 28px', borderRadius: '100px',
                                    background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)',
                                    color: 'var(--text-primary)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                                    transition: 'all 0.2s ease',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                >
                                    {t('port.login')}
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ── Feature benefit cards with hover interactions ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                        {[
                            { icon: <Layers size={18} />, title: t('port.feat1Title'), desc: t('port.feat1Desc'), accent: '#34d399' },
                            { icon: <Activity size={18} />, title: t('port.feat2Title'), desc: t('port.feat2Desc'), accent: '#7c6cf0' },
                            { icon: <TrendingUp size={18} />, title: t('port.feat3Title'), desc: t('port.feat3Desc'), accent: '#fbbf24' },
                        ].map((feat, i) => (
                            <div key={i} className={`gp-feat-card animate-fade-up delay-${i + 3}`} style={{
                                padding: '24px', borderRadius: '14px',
                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                cursor: 'default',
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '12px',
                                    background: `${feat.accent}10`, border: `1px solid ${feat.accent}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: feat.accent, marginBottom: '16px',
                                    transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1)',
                                }}>
                                    {feat.icon}
                                </div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.01em' }}>{feat.title}</h3>
                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ Authenticated content ═══ */}
            {session?.user && <>
            {/* Status bar */}
            <div className="animate-fade-up delay-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {marketStatus && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600, background: marketStatus.isOpen ? 'var(--success-bg)' : 'var(--bg-secondary)', border: `1px solid ${marketStatus.isOpen ? 'rgba(52,211,153,0.2)' : 'var(--border)'}`, color: marketStatus.isOpen ? 'var(--success)' : 'var(--text-muted)' }}>
                        <Activity size={12} />
                        {marketStatus.isOpen ? t('port.marketOpen') : t('port.marketClosed')}
                        <span style={{ opacity: 0.6 }}>{marketStatus.etTime}</span>
                    </div>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => { loadPortfolio(); loadHistory(); }} aria-label={t('port.refresh')} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '100px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <RefreshCw size={13} /> {t('port.refresh')}
                </button>
            </div>

            {/* Market status info bar */}
            {marketStatus && !marketStatus.isOpen && (
                <div style={{ marginBottom: '16px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(100,116,139,0.08)', border: '1px solid rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <Info size={14} style={{ flexShrink: 0 }} />
                    <span>{marketStatus.message} — {t('port.marketNote')}</span>
                </div>
            )}

            {/* PDT Warning */}
            {pdtWarning && (
                <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.82rem' }}>
                    <AlertCircle size={16} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontWeight: 700, color: '#f59e0b', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} /> Pattern Day Trader (PDT) Warning</p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{t('port.pdtWarning')} <strong>{dayTradeCount} day trade</strong> {t('port.pdtDays')}</p>
                    </div>
                </div>
            )}

            {/* ═══ Performance Overview ═══ */}
            <div className="animate-fade-up delay-1 detail-section" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
                    {/* Left — Total Value + allocation bar */}
                    <div>
                        <p className="sub-label" style={{ marginBottom: '10px' }}><BarChart2 size={12} /> {t('port.totalValue')}</p>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>${fmt(totalValue)}</span>
                            <span style={{
                                fontSize: '0.82rem', fontWeight: 700,
                                color: (portfolio?.totalReturnPct ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
                                display: 'inline-flex', alignItems: 'center', gap: '3px',
                                padding: '3px 10px', borderRadius: '100px',
                                background: (portfolio?.totalReturnPct ?? 0) >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                            }}>
                                {(portfolio?.totalReturnPct ?? 0) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                {pct(portfolio?.totalReturnPct ?? 0)}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                            {t('port.startingCash')} ${fmt(portfolio?.startingCash ?? 0)} · {positions.length} {t('port.stocks')}
                        </p>

                        {/* Stacked allocation bar */}
                        <div style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', height: '10px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
                                {allocData.map((d, i) => {
                                    const w = totalAllocValue > 0 ? (d.value / totalAllocValue) * 100 : 0;
                                    return <div key={i} style={{ width: `${w}%`, background: d.color, transition: 'width 0.6s var(--ease)' }} />;
                                })}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
                                {allocData.map((d, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: d.color }} />
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right — Metric grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{t('port.cash')}</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>${fmt(portfolio?.cashBalance ?? 0)}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{totalValue > 0 ? ((portfolio?.cashBalance ?? 0) / totalValue * 100).toFixed(1) : '0'}% {t('port.ofPort')}</p>
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{t('port.stockValue')}</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>${fmt(totalPositionsValue)}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{totalValue > 0 ? (totalPositionsValue / totalValue * 100).toFixed(1) : '0'}% {t('port.ofPort')}</p>
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Unrealized P&amp;L</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: totalUnrealizedPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {totalUnrealizedPnl >= 0 ? '+' : ''}${fmt(totalUnrealizedPnl)}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{t('port.unrealized')}</p>
                        </div>
                        <div style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Realized P&amp;L</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: (portfolio?.totalRealizedPnl ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                {(portfolio?.totalRealizedPnl ?? 0) >= 0 ? '+' : ''}${fmt(portfolio?.totalRealizedPnl ?? 0)}
                            </p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>{t('port.fifo')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Tabs + เพิ่มหุ้นใหม่ ═══ */}
            <div className="animate-fade-up delay-2" style={{ display: 'flex', gap: '6px', marginBottom: '24px', alignItems: 'center' }}>
                {([['holdings', t('port.holdings'), BarChart2], ['history', t('port.history'), Clock]] as [string, string, typeof BarChart2][]).map(([id, label, Icon]) => {
                    const active = tab === id;
                    return (
                        <button key={id} onClick={() => setTab(id as 'holdings' | 'history')} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                            background: active ? 'var(--primary)' : 'var(--bg-secondary)',
                            color: active ? 'white' : 'var(--text-secondary)',
                            border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                            transition: 'all 0.15s',
                        }}>
                            <Icon size={14} /> {label}
                        </button>
                    );
                })}
                <div style={{ flex: 1 }} />
                <button onClick={() => { setShowNewModal(true); setTradeSide('BUY'); setTradeSym(''); setTradeQty(''); setTradePrice(''); setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); setSelectedStock(null); }} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '100px', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: 600,
                    background: 'var(--success-bg)', border: '1px solid rgba(52,211,153,0.2)',
                    color: 'var(--success)', transition: 'all 0.15s',
                }}>
                    <ArrowUpRight size={14} /> {t('port.addNew')}
                </button>
            </div>

            {/* ── Holdings Tab ── */}
            {tab === 'holdings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Allocation Chart Card */}
                    {positions.length > 0 && (
                        <div className="detail-section">
                            <h2 className="section-heading">
                                <span className="accent-bar" />
                                <PieIcon size={16} className="heading-icon" /> {t('port.allocation')}
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '32px', alignItems: 'start' }}>
                                {/* Donut with center label */}
                                <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={allocData}
                                                cx="50%" cy="50%"
                                                innerRadius={68} outerRadius={100}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                                cornerRadius={4}
                                            >
                                                {allocData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                content={({ active, payload }) => {
                                                    if (!active || !payload?.length) return null;
                                                    const d = payload[0].payload as { name: string; value: number; color: string };
                                                    const p = totalAllocValue > 0 ? (d.value / totalAllocValue * 100) : 0;
                                                    return (
                                                        <div style={{
                                                            background: '#1c1d24', border: '1px solid rgba(255,255,255,0.12)',
                                                            borderRadius: '10px', padding: '10px 14px',
                                                            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                                            minWidth: '140px',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e8e9ed' }}>{d.name}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                                                                <span style={{ color: '#9a9caa', fontSize: '0.78rem' }}>{t('port.value')}</span>
                                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e8e9ed' }}>${fmt(d.value)}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '2px' }}>
                                                                <span style={{ color: '#9a9caa', fontSize: '0.78rem' }}>{t('port.proportion')}</span>
                                                                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: d.color }}>{p.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center label */}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', justifyContent: 'center',
                                        pointerEvents: 'none',
                                    }}>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t('port.total')}</span>
                                        <span style={{ fontSize: '1.15rem', fontWeight: 900, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                                            ${totalAllocValue >= 1000 ? `${(totalAllocValue / 1000).toFixed(1)}k` : fmt(totalAllocValue)}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{allocData.length} {t('port.items')}</span>
                                    </div>
                                </div>

                                {/* Legend with allocation bars */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {allocData.map((d, i) => {
                                        const allocPct = totalAllocValue > 0 ? (d.value / totalAllocValue) * 100 : 0;
                                        const isCash = d.name === t('port.cash');
                                        return (
                                            <div key={i}
                                                style={{
                                                    display: 'grid', gridTemplateColumns: '26px 1fr auto auto',
                                                    alignItems: 'center', gap: '10px',
                                                    padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                    transition: 'all 0.15s var(--ease)', cursor: isCash ? 'default' : 'pointer',
                                                }}
                                                onMouseEnter={e => { if (!isCash) { e.currentTarget.style.borderColor = d.color; e.currentTarget.style.background = 'var(--bg-elevated)'; } }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                                                onClick={() => { if (!isCash) router.push(`/stocks/${d.name}`); }}
                                            >
                                                {/* Color dot */}
                                                <div style={{
                                                    width: '26px', height: '26px', borderRadius: '8px',
                                                    background: `${d.color}18`, display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }} />
                                                </div>

                                                {/* Name + bar */}
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{d.name}</span>
                                                        {!isCash && <ExternalLink size={11} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
                                                    </div>
                                                    {/* Progress bar */}
                                                    <div style={{ width: '100%', height: '4px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${Math.max(1, Math.min(100, allocPct))}%`,
                                                            height: '100%', borderRadius: '4px',
                                                            background: d.color,
                                                            transition: 'width 0.6s var(--ease)',
                                                        }} />
                                                    </div>
                                                </div>

                                                {/* Value */}
                                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                    ${fmt(d.value)}
                                                </span>

                                                {/* Percentage */}
                                                <span style={{
                                                    fontSize: '0.82rem', fontWeight: 800,
                                                    color: isCash ? 'var(--text-muted)' : d.color,
                                                    fontVariantNumeric: 'tabular-nums',
                                                    minWidth: '48px', textAlign: 'right',
                                                }}>
                                                    {allocPct.toFixed(1)}%
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {/* Total row */}
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: '26px 1fr auto auto',
                                        alignItems: 'center', gap: '10px',
                                        padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                        borderTop: '1px solid var(--border)', marginTop: '2px',
                                    }}>
                                        <div />
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('port.grandTotal')}</span>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                            ${fmt(totalAllocValue)}
                                        </span>
                                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--primary-light)', minWidth: '48px', textAlign: 'right' }}>
                                            100%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Holdings — Card Rows ═══ */}
                    <div className="detail-section">
                        <h2 className="section-heading" style={{ marginBottom: '16px' }}>
                            <span className="accent-bar" />
                            <BarChart2 size={16} className="heading-icon" /> Holdings
                            {positions.length > 0 && <span style={{ marginLeft: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '100px' }}>{positions.length}</span>}
                        </h2>

                        {positions.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                <BarChart2 size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{t('port.noHoldings')}</p>
                                <button onClick={() => { setShowNewModal(true); setTradeSide('BUY'); setTradeSym(''); setTradeQty(''); setTradePrice(''); setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); setSelectedStock(null); }} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                    <ArrowUpRight size={14} /> {t('port.startBuying')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {positions.map((pos, i) => {
                                    const posValue = pos.currentValue ?? pos.totalCost;
                                    const allocPct = totalAllocValue > 0 ? (posValue / totalAllocValue) * 100 : 0;
                                    const color = ALLOC_COLORS[i % ALLOC_COLORS.length];
                                    const isExpanded = expandedTicker === pos.ticker;
                                    const pnlUp = (pos.unrealizedPnl ?? 0) >= 0;
                                    const hasPanel = inlinePanel?.ticker === pos.ticker;
                                    return (
                                        <Fragment key={pos.ticker}>
                                            <div style={{
                                                background: 'var(--bg-card-solid)',
                                                border: `1px solid ${hasPanel ? (inlinePanel.side === 'SELL' ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)') : 'var(--border)'}`,
                                                borderRadius: '14px', overflow: 'hidden',
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                            }}
                                                onMouseEnter={e => { if (!hasPanel) { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; } }}
                                                onMouseLeave={e => { if (!hasPanel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; } }}
                                            >
                                                {/* ── Main content ── */}
                                                <div style={{ padding: '18px 22px 16px' }}>
                                                    {/* Top: Symbol + Actions */}
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                                                            onClick={() => setExpandedTicker(isExpanded ? null : pos.ticker)}
                                                            role="button" tabIndex={0} aria-expanded={isExpanded}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedTicker(isExpanded ? null : pos.ticker); } }}
                                                        >
                                                            {/* Color accent badge */}
                                                            <div style={{
                                                                width: '42px', height: '42px', borderRadius: '12px',
                                                                background: `linear-gradient(135deg, ${color}18, ${color}08)`,
                                                                border: `1px solid ${color}25`,
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontSize: '0.72rem', fontWeight: 800, color,
                                                                flexShrink: 0, letterSpacing: '0.01em',
                                                            }}>
                                                                {pos.ticker.slice(0, 2)}
                                                            </div>
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                    <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>{pos.ticker}</span>
                                                                    <ChevronDown size={14} style={{
                                                                        color: 'var(--text-muted)', opacity: 0.5,
                                                                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                                        transition: 'transform 0.25s var(--ease)',
                                                                    }} />
                                                                </div>
                                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pos.name}</p>
                                                            </div>
                                                        </div>

                                                        {/* Actions */}
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, marginLeft: '16px' }}>
                                                            <button
                                                                onClick={() => setInlinePanel(p => p?.ticker === pos.ticker && p.side === 'BUY' ? null : { ticker: pos.ticker, side: 'BUY', qty: '1', heldQty: pos.quantity })}
                                                                style={{
                                                                    padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                                                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                                                                    background: hasPanel && inlinePanel.side === 'BUY' ? 'var(--success)' : 'rgba(34,197,94,0.1)',
                                                                    color: hasPanel && inlinePanel.side === 'BUY' ? '#fff' : 'var(--success)',
                                                                    transition: 'all 0.15s',
                                                                }}
                                                            >{t('port.buy')}</button>
                                                            <button
                                                                onClick={() => setInlinePanel(p => p?.ticker === pos.ticker && p.side === 'SELL' ? null : { ticker: pos.ticker, side: 'SELL', qty: '1', heldQty: pos.quantity })}
                                                                style={{
                                                                    padding: '7px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600,
                                                                    cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                                                                    background: hasPanel && inlinePanel.side === 'SELL' ? 'var(--danger)' : 'rgba(239,68,68,0.1)',
                                                                    color: hasPanel && inlinePanel.side === 'SELL' ? '#fff' : 'var(--danger)',
                                                                    transition: 'all 0.15s',
                                                                }}
                                                            >{t('port.sell')}</button>
                                                            <Link href={`/stocks/${pos.ticker}`} style={{
                                                                color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center',
                                                                padding: '7px', borderRadius: '8px', opacity: 0.6,
                                                                transition: 'opacity 0.15s',
                                                            }}
                                                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                                                                onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
                                                            ><ExternalLink size={14} /></Link>
                                                        </div>
                                                    </div>

                                                    {/* Metrics row — evenly distributed */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                                        {[
                                                            { label: t('port.qtyXCost'), value: `${pos.quantity.toFixed(pos.quantity % 1 === 0 ? 0 : 4)} × $${fmt(pos.avgCost)}` },
                                                            { label: t('port.marketPrice'), value: pos.currentPrice ? `$${fmt(pos.currentPrice)}` : 'N/A', muted: !pos.currentPrice },
                                                            { label: t('port.valueLabel'), value: `$${fmt(posValue)}`, extra: `${allocPct.toFixed(1)}%`, extraColor: color },
                                                            { label: t('port.pnl'), value: pos.unrealizedPnl !== undefined ? `${pos.unrealizedPnl >= 0 ? '+' : ''}$${fmt(pos.unrealizedPnl)}` : '—', extra: pos.unrealizedPnlPct !== undefined ? pct(pos.unrealizedPnlPct) : undefined, colored: pos.unrealizedPnl !== undefined },
                                                        ].map((m, mi) => (
                                                            <div key={mi} style={{
                                                                padding: '10px 12px', borderRadius: '10px',
                                                                background: 'var(--bg-secondary)',
                                                            }}>
                                                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 500 }}>{m.label}</p>
                                                                <p style={{
                                                                    fontSize: '0.88rem', fontWeight: 700, margin: 0,
                                                                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                                                                    color: m.colored ? (pnlUp ? 'var(--success)' : 'var(--danger)') : m.muted ? 'var(--text-muted)' : 'var(--text-primary)',
                                                                }}>
                                                                    {m.value}
                                                                    {m.extra && <span style={{ fontSize: '0.72rem', marginLeft: '5px', fontWeight: 600, color: m.extraColor || (m.colored ? (pnlUp ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)'), opacity: m.extraColor ? 1 : 0.8 }}>{m.extra}</span>}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* ── Inline trade panel ── */}
                                                {hasPanel && (() => {
                                                    const isSell = inlinePanel.side === 'SELL';
                                                    const qty = parseFloat(inlinePanel.qty) || 0;
                                                    const price = pos.currentPrice ?? 0;
                                                    const value = qty * price;
                                                    const cash = portfolio?.cashBalance ?? 0;
                                                    const afterCash = isSell ? cash + value : cash - value;
                                                    const estPnl = isSell ? qty * (price - pos.avgCost) : null;
                                                    const notEnough = isSell ? qty > pos.quantity : afterCash < 0;
                                                    const disabled = inlineSubmitting || qty <= 0 || notEnough;
                                                    const accent = isSell ? 'var(--danger)' : 'var(--success)';
                                                    return (
                                                        <div style={{
                                                            padding: '16px 22px',
                                                            borderTop: '1px solid var(--border)',
                                                            background: isSell ? 'rgba(239,68,68,0.03)' : 'rgba(34,197,94,0.03)',
                                                        }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: accent }}>{isSell ? t('port.sell') : t('port.buy')} {pos.ticker}</span>
                                                                {price > 0 && <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '6px' }}>${fmt(price)}{t('port.perShare')}</span>}

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <button onClick={() => setInlinePanel(p => p ? { ...p, qty: String(Math.max(1, parseFloat(p.qty || '1') - 1)) } : p)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                                                                    <input type="text" inputMode="decimal" value={inlinePanel.qty} onChange={e => setInlinePanel(p => p ? { ...p, qty: e.target.value } : p)} style={{ width: '54px', padding: '6px', borderRadius: '8px', background: 'var(--bg-elevated)', border: `1.5px solid ${notEnough ? 'var(--danger)' : 'var(--border)'}`, color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }} />
                                                                    <button onClick={() => setInlinePanel(p => p ? { ...p, qty: String(parseFloat(p.qty || '1') + 1) } : p)} style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                                                                    {isSell && <button onClick={() => setInlinePanel(p => p ? { ...p, qty: String(pos.quantity) } : p)} style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '0.72rem', border: `1px solid ${accent}`, background: 'transparent', color: accent, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{t('port.all')}</button>}
                                                                </div>

                                                                <div style={{ flex: 1 }} />

                                                                <button onClick={() => setInlinePanel(null)} style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>{t('port.cancel')}</button>
                                                                <button onClick={handleInlineTrade} disabled={disabled} style={{
                                                                    padding: '8px 22px', borderRadius: '8px', border: 'none',
                                                                    background: accent, color: 'white',
                                                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                                                    fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700,
                                                                    opacity: disabled ? 0.4 : 1, transition: 'opacity 0.15s',
                                                                }}>
                                                                    {inlineSubmitting ? '...' : t('port.confirm')}
                                                                </button>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '24px', fontSize: '0.78rem', marginTop: '12px', color: 'var(--text-muted)' }}>
                                                                <span>{isSell ? t('port.revenue') : t('port.valueLabel')} <strong style={{ color: 'var(--text-primary)' }}>${fmt(value)}</strong></span>
                                                                {estPnl != null && <span>P/L <strong style={{ color: estPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>{estPnl >= 0 ? '+' : ''}${fmt(estPnl)}</strong></span>}
                                                                <span>{t('port.cashLabel')} <strong style={{ color: notEnough ? 'var(--danger)' : 'var(--text-primary)' }}>${fmt(afterCash)}</strong></span>
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                {/* ── Lot details ── */}
                                                {isExpanded && pos.lots && pos.lots.length > 0 && (
                                                    <div style={{ padding: '16px 22px', borderTop: '1px solid var(--border)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                                            <Layers size={13} style={{ color: 'var(--primary-light)', opacity: 0.6 }} />
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lot Details · FIFO</span>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                            {pos.lots.map((lot, li) => {
                                                                const lotPnl = pos.currentPrice ? lot.qty * (pos.currentPrice - lot.unitCost) : null;
                                                                return (
                                                                    <div key={li} style={{
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                        padding: '10px 14px', borderRadius: '10px',
                                                                        background: 'var(--bg-secondary)',
                                                                    }}>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem' }}>
                                                                            <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', fontSize: '0.76rem' }}>{lot.purchaseDateStr}</span>
                                                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{lot.holdingDays}{t('port.days')}</span>
                                                                            <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{lot.qty.toFixed(lot.qty % 1 === 0 ? 0 : 4)} × ${fmt(lot.unitCost)}</span>
                                                                            <span style={{
                                                                                padding: '2px 8px', borderRadius: '100px', fontWeight: 700, fontSize: '0.65rem',
                                                                                background: lot.gainType === 'LONG' ? 'rgba(34,197,94,0.08)' : 'rgba(250,204,21,0.08)',
                                                                                color: lot.gainType === 'LONG' ? 'var(--success)' : 'var(--warning)',
                                                                                letterSpacing: '0.03em',
                                                                            }}>
                                                                                {lot.gainType === 'LONG' ? 'LONG' : 'SHORT'}
                                                                            </span>
                                                                        </div>
                                                                        <span style={{
                                                                            fontWeight: 700, fontSize: '0.84rem',
                                                                            fontVariantNumeric: 'tabular-nums',
                                                                            color: lotPnl == null ? 'var(--text-muted)' : lotPnl >= 0 ? 'var(--success)' : 'var(--danger)',
                                                                        }}>
                                                                            {lotPnl != null ? `${lotPnl >= 0 ? '+' : ''}$${fmt(lotPnl)}` : '—'}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Fragment>
                                    );
                                })}
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
                            <div className="detail-section">
                                <h2 className="section-heading">
                                    <span className="accent-bar" style={{ background: 'var(--warning)' }} />
                                    <Tag size={16} className="heading-icon" /> {t('port.taxSummary')}
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                    <div className="metric-card" style={{ background: 'rgba(251,191,36,0.04)', borderColor: 'rgba(251,191,36,0.15)' }}>
                                        <p className="sub-label" style={{ color: 'var(--warning)' }}>Short-term Unrealized</p>
                                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: shortUnrealized >= 0 ? 'var(--success)' : 'var(--danger)' }}>{shortUnrealized >= 0 ? '+' : ''}${fmt(shortUnrealized)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('port.shortTaxNote')}</p>
                                    </div>
                                    <div className="metric-card" style={{ background: 'var(--success-bg)', borderColor: 'rgba(52,211,153,0.15)' }}>
                                        <p className="sub-label" style={{ color: 'var(--success)' }}>Long-term Unrealized</p>
                                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: longUnrealized >= 0 ? 'var(--success)' : 'var(--danger)' }}>{longUnrealized >= 0 ? '+' : ''}${fmt(longUnrealized)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('port.longTaxNote')}</p>
                                    </div>
                                    <div className="metric-card" style={{ background: 'rgba(124,108,240,0.04)', borderColor: 'rgba(124,108,240,0.15)' }}>
                                        <p className="sub-label" style={{ color: 'var(--primary-light)' }}>Realized P/L (FIFO)</p>
                                        <p style={{ fontSize: '1.15rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: totalRealized >= 0 ? 'var(--success)' : 'var(--danger)' }}>{totalRealized >= 0 ? '+' : ''}${fmt(totalRealized)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{t('port.realizedTaxNote')}</p>
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '14px', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                    {t('port.taxDisclaimer')}
                                </p>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── New Stock Modal ── */}
            {showNewModal && (
                <div role="dialog" aria-modal="true" aria-label={t('port.addNew')}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 'var(--z-modal-backdrop)' as unknown as number, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                    onClick={e => { if (e.target === e.currentTarget) resetModal(); }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)', position: 'relative' }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {selectedStock ? (
                                    <Image src={selectedStock.logo} alt="" width={36} height={36} unoptimized
                                        style={{ borderRadius: '10px', background: 'white', padding: '3px' }}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                ) : (
                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Search size={16} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                )}
                                <div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', margin: 0 }}>
                                        {selectedStock ? selectedStock.symbol : t('port.addNew')}
                                    </h3>
                                    {selectedStock && (
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '1px 0 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {selectedStock.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button onClick={resetModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Side toggle */}
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                            {(['BUY', 'SELL'] as const).map(s => (
                                <button key={s} onClick={() => setTradeSide(s)} style={{
                                    flex: 1, padding: '10px', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', transition: 'all 0.15s',
                                    border: '2px solid',
                                    borderColor: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--border)',
                                    background: tradeSide === s ? (s === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)') : 'transparent',
                                    color: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--text-muted)',
                                }}>
                                    {s === 'BUY' ? `▲ ${t('port.buy')}` : `▼ ${t('port.sell')}`}
                                </button>
                            ))}
                        </div>

                        {/* Stock search */}
                        <div style={{ marginBottom: '14px', position: 'relative' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{t('port.searchStock')}</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                <input
                                    value={searchQuery}
                                    onChange={e => handleSearchStock(e.target.value)}
                                    onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                                    placeholder={t('port.searchPlaceholder')}
                                    autoComplete="off"
                                    style={{ ...inputStyle, paddingLeft: '36px', paddingRight: searchQuery ? '36px' : '14px' }}
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); setTradeSym(''); setSearchResults([]); setShowSearchDropdown(false); setSelectedStock(null); setTradePrice(''); }}
                                        style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* Search dropdown */}
                            {showSearchDropdown && (
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, top: '100%', marginTop: '4px', zIndex: 10,
                                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px',
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.4)', maxHeight: '280px', overflowY: 'auto',
                                    padding: '6px',
                                }}>
                                    {searchLoading && searchResults.length === 0 && (
                                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {t('port.searching')}
                                        </div>
                                    )}
                                    {!searchLoading && searchResults.length === 0 && searchQuery.length >= 1 && (
                                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                            {t('port.noResults')}
                                        </div>
                                    )}
                                    {searchResults.map((stock, idx) => (
                                        <button key={stock.symbol + idx}
                                            onClick={() => handleSelectStock(stock)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '10px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                                background: 'transparent', textAlign: 'left', fontFamily: 'inherit',
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                                        >
                                            <Image
                                                src={stock.logo}
                                                alt={stock.symbol}
                                                width={32} height={32} unoptimized
                                                style={{ borderRadius: '8px', background: 'white', padding: '2px', flexShrink: 0 }}
                                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                    const el = e.target as HTMLImageElement;
                                                    el.style.display = 'none';
                                                    const fallback = el.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                                                    if (fallback) fallback.style.display = 'flex';
                                                }}
                                            />
                                            <div className="logo-fallback" style={{
                                                display: 'none', width: 32, height: 32, borderRadius: '8px',
                                                background: 'var(--bg-secondary)', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', flexShrink: 0,
                                            }}>
                                                {stock.symbol.slice(0, 2)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{stock.symbol}</span>
                                                    {stock.exchange && (
                                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)', padding: '1px 5px', borderRadius: '4px' }}>
                                                            {stock.exchange}
                                                        </span>
                                                    )}
                                                </div>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {stock.name}
                                                </p>
                                            </div>
                                            {stock.sector && (
                                                <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '6px', flexShrink: 0, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {stock.sector}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected stock price strip */}
                        {selectedStock && tradePrice && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '14px', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>{t('port.marketPrice')}</span>
                                <span style={{ fontWeight: 800, fontSize: '1rem' }}>${tradePrice}</span>
                            </div>
                        )}
                        {priceLoading && (
                            <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '14px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                {t('port.loadingPrice')}
                            </div>
                        )}

                        {/* Quantity */}
                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>{t('port.qtyLabel')}</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => setTradeQty(q => Math.max(1, parseInt(q || '1') - 1).toString())} style={{ width: '36px', height: '42px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>−</button>
                                <input type="text" inputMode="decimal" value={tradeQty} onChange={e => setTradeQty(e.target.value)} placeholder="1"
                                    style={{ ...inputStyle, flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }} />
                                <button onClick={() => setTradeQty(q => (parseInt(q || '0') + 1).toString())} style={{ width: '36px', height: '42px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                            </div>
                        </div>

                        {/* Order summary */}
                        {tradeSym && tradeQty && tradePrice && (
                            <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('port.pricePerShare')}</span>
                                    <span style={{ fontWeight: 600 }}>${tradePrice}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('port.quantity')}</span>
                                    <span style={{ fontWeight: 600 }}>{tradeQty || '0'} {t('port.shares')}</span>
                                </div>
                                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 700 }}>{t('port.totalValueLabel')}</span>
                                    <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>${fmt(parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0'))}</span>
                                </div>
                            </div>
                        )}

                        {/* Submit */}
                        <button onClick={handleTrade} disabled={trading || !tradeSym || !tradeQty || !tradePrice}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                background: tradeSide === 'BUY' ? '#22c55e' : '#ef4444', color: 'white',
                                fontSize: '0.95rem', fontWeight: 800, cursor: (trading || !tradeSym || !tradeQty || !tradePrice) ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                opacity: (trading || !tradeSym || !tradeQty || !tradePrice) ? 0.5 : 1, transition: 'opacity 0.15s',
                            }}>
                            {tradeSide === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {trading ? t('port.processing') : `${tradeSide === 'BUY' ? t('port.buy') : t('port.sell')} ${tradeSym || '—'} ${tradeQty ? `· $${fmt(parseFloat(tradeQty || '0') * parseFloat(tradePrice || '0'))}` : ''}`}
                        </button>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>{t('port.simMoney')}</p>
                    </div>
                </div>
            )}

            {/* ── History Tab ── */}
            {tab === 'history' && (
                <div className="detail-section">
                    <h2 className="section-heading">
                        <span className="accent-bar" />
                        <Clock size={16} className="heading-icon" /> {t('port.tradeHistory')}
                    </h2>
                    {trades.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {t('port.noTrades')}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {trades.map(tr => (
                                <div key={tr.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: tr.side === 'BUY' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {tr.side === 'BUY' ? <ArrowUpRight size={16} style={{ color: '#22c55e' }} /> : <ArrowDownLeft size={16} style={{ color: '#ef4444' }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>
                                            <span style={{ color: tr.side === 'BUY' ? '#22c55e' : '#ef4444', marginRight: '6px' }}>{tr.side}</span>
                                            {tr.ticker}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                            {tr.quantity} {t('port.shares')} @ ${fmt(tr.price)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>${fmt(tr.total)}</p>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                            {new Date(tr.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                                        </p>
                                    </div>
                                    <Link href={`/stocks/${tr.ticker}`} style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                                        <ExternalLink size={14} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            </>}
        </div>
    );
}
