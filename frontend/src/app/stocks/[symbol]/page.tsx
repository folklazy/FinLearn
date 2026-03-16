'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { StockData } from '@/types/stock';
import { useI18n } from '@/lib/i18n';
import { formatPercent, formatVolume, formatDate, getPriceColor, getSignalColor } from '@/lib/utils';
import { useCurrency } from '@/lib/currency';
import {
    Building2, DollarSign,
    BarChart3, Newspaper, Activity, Users, Star, Lightbulb, AlertTriangle,
    ExternalLink, Calendar, ArrowUpRight, ArrowDownRight, Info,
    ChevronRight, BookOpen, TrendingUp, TrendingDown, X, CheckCircle, AlertCircle as AlertIcon,
    FileText, Wallet, Globe, MapPin, Briefcase, UserCircle2,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = use(params);
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const { t, locale } = useI18n();
    const { formatPrice: formatCurrency, formatLarge: formatLargeNumber } = useCurrency();
    const router = useRouter();
    const { data: session } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);
    const [favLoading, setFavLoading] = useState(false);
    const [priceRange, setPriceRange] = useState('1Y');
    const PRICE_RANGES = ['1M', '3M', '6M', 'YTD', '1Y', '5Y', 'All'];
    const [activeSection, setActiveSection] = useState('overview');

    // Trade modal
    const [showTradeModal, setShowTradeModal] = useState<boolean>(false);
    const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
    const [tradeQty, setTradeQty] = useState('1');
    const [tradeSubmitting, setTradeSubmitting] = useState<boolean>(false);
    const [tradeResult, setTradeResult] = useState<{ ok: boolean; msg: string; realizedPnl?: number } | null>(null);
    const [tradeWarnings, setTradeWarnings] = useState<string[]>([]);
    const [currentPosition, setCurrentPosition] = useState<{ quantity: number; avgCost: number } | null>(null);
    const [portfolioCash, setPortfolioCash] = useState<number | null>(null);

    useEffect(() => {
        api.getStock(symbol)
            .then(d => setData(d))
            .catch(err => console.error('Failed to load stock:', err))
            .finally(() => setLoading(false));
    }, [symbol]);

    useEffect(() => {
        if (!session?.user) return;
        fetch(`/api/watchlist/${symbol}`)
            .then(r => r.json())
            .then(d => setIsFavorite(d.isFavorite ?? false))
            .catch(() => {});
    }, [symbol, session]);

    useEffect(() => {
        if (!session?.user) return;
        fetch('/api/portfolio')
            .then(r => r.json())
            .then(d => {
                const pos = (d.positions || []).find((p: { ticker: string }) => p.ticker === symbol.toUpperCase());
                setCurrentPosition(pos ? { quantity: pos.quantity, avgCost: pos.avgCost } : null);
                if (d.portfolio?.cashBalance != null) setPortfolioCash(Number(d.portfolio.cashBalance));
            })
            .catch(() => {});
    }, [symbol, session]);

    const toggleFavorite = async () => {
        if (!session?.user) { router.push('/login'); return; }
        setFavLoading(true);
        try {
            if (isFavorite) {
                await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
                setIsFavorite(false);
            } else {
                await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol }) });
                setIsFavorite(true);
            }
        } finally {
            setFavLoading(false);
        }
    };

    // Scroll spy — highlight TOC section when in viewport
    useEffect(() => {
        if (!data) return;
        const ids = ['overview', 'price-chart', 'key-metrics', 'financials', 'news-events', 'signals', 'competitors', 'scores', 'tips'];
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); });
            },
            { threshold: 0, rootMargin: '-80px 0px -65% 0px' }
        );
        ids.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [data]);

    if (loading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ animation: 'pulse-glow 2s infinite', width: '100px', height: '100px', borderRadius: '50%', margin: '80px auto', background: 'var(--bg-card)' }} />
                <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>{t('sd.loading')} {symbol.toUpperCase()}...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</p>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{t('sd.notFound')} {symbol.toUpperCase()}</h2>
                <p style={{ color: 'var(--text-muted)' }}>{t('sd.checkSymbol')}</p>
            </div>
        );
    }

    const { profile, price, keyMetrics, financials, news, events, signals, competitors, scores, beginnerTips } = data;

    const handleQuickTrade = async () => {
        if (!session?.user) { router.push('/login'); return; }
        const qty = parseFloat(tradeQty);
        if (!qty || qty <= 0) return;
        if (tradeSide === 'SELL' && currentPosition && qty > currentPosition.quantity) return;
        setTradeSubmitting(true);
        setTradeResult(null);
        setTradeWarnings([]);
        try {
            const res = await fetch('/api/portfolio/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbol: symbol.toUpperCase(), side: tradeSide, quantity: qty, price: price.current }),
            });
            const d = await res.json();
            if (res.ok) {
                const sideLabel = tradeSide === 'BUY' ? t('sd.buy') : t('sd.sell');
                setTradeResult({ ok: true, msg: `${sideLabel} ${symbol.toUpperCase()} ${qty} ${t('sd.shares')} @ ${formatCurrency(price.current)} ${t('sd.success')}`, realizedPnl: d.realizedPnl ?? undefined });
                const warns: string[] = [];
                if (d.marketWarning) warns.push(d.marketWarning);
                if (d.pdtWarning) warns.push(d.pdtWarning);
                setTradeWarnings(warns);
                const value = qty * price.current;
                if (tradeSide === 'BUY') {
                    setPortfolioCash(prev => prev != null ? prev - value : prev);
                    setCurrentPosition(prev => {
                        if (!prev) return { quantity: qty, avgCost: price.current };
                        const newQty = prev.quantity + qty;
                        return { quantity: newQty, avgCost: (prev.quantity * prev.avgCost + qty * price.current) / newQty };
                    });
                } else {
                    setPortfolioCash(prev => prev != null ? prev + value : prev);
                    setCurrentPosition(prev => {
                        if (!prev) return null;
                        const newQty = prev.quantity - qty;
                        return newQty <= 0.0001 ? null : { quantity: newQty, avgCost: prev.avgCost };
                    });
                }
            } else {
                setTradeResult({ ok: false, msg: d.error || t('sd.error') });
            }
        } catch {
            setTradeResult({ ok: false, msg: t('sd.error') });
        } finally {
            setTradeSubmitting(false);
        }
    };

    // ── Data availability flags ──
    const hasHistory = price.history && price.history.length > 0;
    const hasRevenueHistory = keyMetrics.revenueHistory && keyMetrics.revenueHistory.length > 0;
    const hasEpsHistory = keyMetrics.epsHistory && keyMetrics.epsHistory.length > 0 && keyMetrics.epsHistory.some(e => e.value !== 0);
    const hasIncomeData = financials.incomeStatement.revenue > 0;
    const hasBalanceData = financials.balanceSheet.totalAssets > 0;
    const hasCashFlow = financials.cashFlow.operating !== 0 || financials.cashFlow.investing !== 0;
    const hasFinancials = hasIncomeData || hasBalanceData || hasCashFlow;
    const hasNews = news && news.length > 0;
    const hasSignals = signals && signals.technical;
    const hasCompetitors = competitors && competitors.length > 0;

    // ── TOC sections ──
    const tocSections = [
        { id: 'overview', label: t('sd.toc.overview'), always: true },
        { id: 'price-chart', label: t('sd.toc.chart'), always: hasHistory },
        { id: 'key-metrics', label: t('sd.toc.metrics'), always: true },
        { id: 'financials', label: t('sd.toc.financials'), always: hasFinancials },
        { id: 'news-events', label: t('sd.toc.news'), always: hasNews },
        { id: 'signals', label: t('sd.toc.signals'), always: hasSignals },
        { id: 'competitors', label: t('sd.toc.competitors'), always: hasCompetitors },
        { id: 'scores', label: t('sd.toc.scores'), always: true },
        { id: 'tips', label: t('sd.toc.tips'), always: true },
    ].filter(s => s.always);

    // Chart Colors
    const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

    // Shared tooltip style
    const tooltipStyle: React.CSSProperties = { background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', fontSize: '0.8rem', color: '#e0e0e0', boxShadow: '0 8px 32px rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', padding: '10px 14px' };
    const tooltipLabelStyle: React.CSSProperties = { color: '#888', fontSize: '0.72rem', fontWeight: 500, marginBottom: '4px' };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const BillionTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={tooltipStyle}>
                {label && <p style={tooltipLabelStyle}>{label}</p>}
                {payload.map((p: any, i: number) => (
                    <p key={i} style={{ margin: '2px 0', fontWeight: 600, color: p.payload?.fill || p.color || '#e0e0e0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.payload?.fill || p.color, display: 'inline-block', flexShrink: 0 }} />
                        {p.name === 'value' ? (p.payload?.name ?? '') : p.name}: {Number(p.value).toFixed(2)} {t('sd.billion')}
                    </p>
                ))}
            </div>
        );
    };
    const PieTooltip = ({ active, payload }: any) => {
        if (!active || !payload?.length) return null;
        const d = payload[0];
        return (
            <div style={tooltipStyle}>
                <p style={{ margin: '0 0 4px', fontWeight: 600, color: d.payload?.fill || d.color || '#e0e0e0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.payload?.fill || d.color, display: 'inline-block', flexShrink: 0 }} />
                    {d.name}
                </p>
                <p style={{ margin: 0, color: '#e0e0e0', fontWeight: 700 }}>{Number(d.value).toFixed(2)} {t('sd.billion')}</p>
            </div>
        );
    };
    /* eslint-enable @typescript-eslint/no-explicit-any */

    // Revenue history chart data
    const revenueChartData = hasRevenueHistory ? keyMetrics.revenueHistory.map(r => ({
        year: r.year,
        revenue: r.value / 1e9,
    })) : [];

    // EPS chart data
    const epsChartData = hasEpsHistory ? keyMetrics.epsHistory.map(e => ({
        year: e.year,
        eps: e.value,
    })) : [];

    // Income Statement waterfall — only include items with real data
    const incomeData = hasIncomeData ? [
        { name: t('sd.income.revenue'), value: financials.incomeStatement.revenue / 1e9, fill: '#6366f1' },
        financials.incomeStatement.grossProfit > 0 ? { name: t('sd.income.gross'), value: financials.incomeStatement.grossProfit / 1e9, fill: '#8b5cf6' } : null,
        financials.incomeStatement.costOfRevenue > 0 ? { name: t('sd.income.cost'), value: -financials.incomeStatement.costOfRevenue / 1e9, fill: '#ef4444' } : null,
        financials.incomeStatement.operatingExpenses > 0 ? { name: t('sd.income.opex'), value: -financials.incomeStatement.operatingExpenses / 1e9, fill: '#f59e0b' } : null,
        financials.incomeStatement.netIncome !== 0 ? { name: t('sd.income.net'), value: financials.incomeStatement.netIncome / 1e9, fill: financials.incomeStatement.netIncome > 0 ? '#22c55e' : '#ef4444' } : null,
    ].filter(Boolean) as { name: string; value: number; fill: string }[] : [];

    // Balance sheet pie
    const balanceData = hasBalanceData ? [
        { name: t('sd.balance.current'), value: financials.balanceSheet.currentAssets / 1e9 },
        { name: t('sd.balance.nonCurrent'), value: financials.balanceSheet.nonCurrentAssets / 1e9 },
    ] : [];

    // Cash flow
    const cashFlowData = hasCashFlow ? [
        { name: t('sd.cash.operating'), value: financials.cashFlow.operating / 1e9, fill: '#22c55e' },
        { name: t('sd.cash.investing'), value: financials.cashFlow.investing / 1e9, fill: '#f59e0b' },
        { name: t('sd.cash.financing'), value: financials.cashFlow.financing / 1e9, fill: '#ef4444' },
    ] : [];

    // Radar chart for scores
    const radarData = [
        { dimension: t('sd.radar.value'), score: scores.dimensions.value },
        { dimension: t('sd.radar.growth'), score: scores.dimensions.growth },
        { dimension: t('sd.radar.strength'), score: scores.dimensions.strength },
        { dimension: t('sd.radar.dividend'), score: scores.dimensions.dividend },
        { dimension: t('sd.radar.risk'), score: scores.dimensions.risk },
    ];

    // Price history filtered
    const getPriceHistory = () => {
        const h = price.history;
        const now = h.length;
        const today = new Date();
        switch (priceRange) {
            case '1M':  return h.slice(Math.max(0, now - 30));
            case '3M':  return h.slice(Math.max(0, now - 90));
            case '6M':  return h.slice(Math.max(0, now - 180));
            case 'YTD': {
                const jan1 = `${today.getFullYear()}-01-01`;
                return h.filter(p => p.date >= jan1);
            }
            case '1Y':  return h.slice(Math.max(0, now - 365));
            case '5Y':  return h;
            case 'All': return h;
            default:    return h;
        }
    };

    const week52Percent = ((price.current - price.week52Low) / (price.week52High - price.week52Low)) * 100;

    // Chart color — green if period is up, red if down
    const chartData = hasHistory ? getPriceHistory() : [];
    const chartIsUp = chartData.length >= 2 ? (chartData[chartData.length - 1]?.close ?? 0) >= (chartData[0]?.close ?? 0) : true;
    const chartColor = chartIsUp ? '#22c55e' : '#ef4444';
    const chartGradId = chartIsUp ? 'gradUp' : 'gradDown';
    const xTickFmt = (v: string) => {
        if (!v) return '';
        if (priceRange === '5Y' || priceRange === 'All') return v.slice(0, 4);
        if (priceRange === '6M' || priceRange === 'YTD' || priceRange === '1Y') {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return months[parseInt(v.slice(5, 7)) - 1] ?? v.slice(5);
        }
        return v.slice(5); // MM-DD for short ranges
    };

    return (
        <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '24px 24px 64px', display: 'flex', gap: '0', alignItems: 'flex-start' }}>

            {/* ── STICKY TOC SIDEBAR ── */}
            <aside className="hidden-mobile" style={{
                width: '200px', flexShrink: 0, position: 'sticky', top: '72px',
                maxHeight: 'calc(100vh - 92px)', overflowY: 'auto', paddingRight: '0',
                marginRight: '28px',
            }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {tocSections.map((s) => (
                        <a key={s.id} href={`#${s.id}`}
                            onClick={(e) => { e.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                            style={{
                                display: 'block', padding: '8px 14px',
                                borderLeft: `2px solid ${activeSection === s.id ? 'var(--primary-light)' : 'transparent'}`,
                                background: activeSection === s.id ? 'rgba(124,108,240,0.06)' : 'transparent',
                                color: activeSection === s.id ? 'var(--primary-light)' : 'var(--text-muted)',
                                fontSize: '0.78rem', fontWeight: activeSection === s.id ? 600 : 400,
                                cursor: 'pointer', textDecoration: 'none', transition: 'all 0.18s',
                                borderRadius: '0 6px 6px 0',
                            }}
                            onMouseOver={e => { if (activeSection !== s.id) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
                            onMouseOut={e => { if (activeSection !== s.id) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
                        >
                            {s.label}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ===== HEADER ===== */}
            <section className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.95)', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                        <Image src={profile.logo} alt={profile.name} width={42} height={42} unoptimized style={{ objectFit: 'contain', borderRadius: '8px' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{profile.symbol}</h1>
                            {profile.exchange && (
                                <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 600, background: 'rgba(124,108,240,0.1)', color: 'var(--primary-light)', border: '1px solid rgba(124,108,240,0.2)' }}>{profile.exchange}</span>
                            )}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {profile.name}
                            {profile.sector && <span style={{ color: 'var(--text-muted)' }}> · {profile.sector}</span>}
                            {profile.industry && profile.industry.toLowerCase() !== profile.sector.toLowerCase() && (
                                <span style={{ color: 'var(--text-muted)' }}> · {profile.industry}</span>
                            )}
                        </p>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="price-hero">{formatCurrency(price.current)}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px', color: price.change >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {price.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {formatCurrency(Math.abs(price.change))} ({formatPercent(price.changePercent)})
                    </div>
                </div>
            </section>

            {/* ===== QUICK ACTIONS ===== */}
            <section className="animate-fade-up delay-1" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={() => { if (!session?.user) { router.push('/login'); return; } setShowTradeModal(true); setTradeResult(null); setTradeQty('1'); }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px',
                        borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        background: currentPosition ? 'rgba(124,108,240,0.1)' : 'rgba(34,197,94,0.08)',
                        border: currentPosition ? '1px solid rgba(124,108,240,0.25)' : '1px solid rgba(34,197,94,0.25)',
                        color: currentPosition ? 'var(--primary-light)' : 'var(--success)',
                    }}
                >
                    <TrendingUp size={15} />
                    {currentPosition ? `${t('sd.holding')} ${currentPosition.quantity % 1 === 0 ? currentPosition.quantity : currentPosition.quantity.toFixed(2)} ${t('sd.shares')} · ${t('sd.buyMore')}` : t('sd.addToPort')}
                </button>
                <button onClick={toggleFavorite} disabled={favLoading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 20px',
                        borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                        background: isFavorite ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.03)',
                        border: isFavorite ? '1px solid rgba(250,204,21,0.25)' : '1px solid var(--border)',
                        color: isFavorite ? '#facc15' : 'var(--text-muted)',
                    }}
                >
                    <Star size={15} fill={isFavorite ? '#facc15' : 'none'} style={{ color: isFavorite ? '#facc15' : 'var(--text-muted)' }} />
                    {isFavorite ? t('sd.following') : t('sd.follow')}
                </button>
            </section>

            {/* ===== COMPANY OVERVIEW ===== */}
            <section id="overview" className="detail-section animate-fade-up delay-2" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Building2 size={18} className="heading-icon" /> {t('sd.toc.overview')}</h2>

                {(profile.description || profile.descriptionEn) && (
                    <div style={{ marginBottom: '24px', borderLeft: '3px solid var(--primary)', paddingLeft: '14px' }}>
                        {locale === 'en' ? (
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.88rem', margin: 0 }}>
                                {profile.descriptionEn || profile.description}
                            </p>
                        ) : (
                            <>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.88rem', margin: 0 }}>
                                    {profile.description}
                                </p>
                                {profile.descriptionEn && profile.descriptionEn !== profile.description && (
                                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.82rem', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                                        {profile.descriptionEn}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {/* Trading stats */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                        <p className="sub-label"><Activity size={13} /> {t('sd.trade.today')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: t('sd.trade.open'), value: formatCurrency(price.open) },
                                { label: t('sd.trade.prevClose'), value: formatCurrency(price.previousClose) },
                                { label: t('sd.trade.high'), value: formatCurrency(price.high), color: 'var(--success)' },
                                { label: t('sd.trade.low'), value: formatCurrency(price.low), color: 'var(--danger)' },
                                { label: t('sd.trade.volume'), value: formatVolume(price.volume) },
                                { label: t('sd.trade.avgVolume'), value: formatVolume(price.avgVolume) },
                            ].map((item, i) => (
                                <div key={i} className="stat-item">
                                    <span className="stat-label">{item.label}</span>
                                    <span className="stat-value" style={{ color: item.color }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Company facts */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
                        <p className="sub-label"><Building2 size={13} /> {t('sd.company')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                profile.ceo && profile.ceo !== 'N/A' ? { icon: <UserCircle2 size={14} />, label: 'CEO', value: profile.ceo } : null,
                                profile.founded && profile.founded !== 'N/A' ? { icon: <Calendar size={14} />, label: t('sd.founded'), value: profile.founded.slice(0, 4) } : null,
                                profile.employees > 0 ? { icon: <Users size={14} />, label: t('sd.employees'), value: `${profile.employees.toLocaleString()} ${t('sd.employeeUnit')}` } : null,
                                profile.headquarters ? { icon: <MapPin size={14} />, label: t('sd.hq'), value: profile.headquarters } : null,
                                profile.exchange ? { icon: <Briefcase size={14} />, label: t('sd.exchange'), value: profile.exchange } : null,
                            ].filter(Boolean).map((item, i) => (
                                <div key={i} className="stat-item">
                                    <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{item!.icon} {item!.label}</span>
                                    <span className="stat-value">{item!.value}</span>
                                </div>
                            ))}
                            {profile.website && profile.website !== 'N/A' && (
                                <div className="stat-item">
                                    <span className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={14} /> {t('sd.website')}</span>
                                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer"
                                        style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')} <ExternalLink size={11} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Financial snapshot */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.marketCap')}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{formatLargeNumber(profile.marketCap)}</div>
                        {profile.marketCapLabel && <div style={{ fontSize: '0.68rem', color: 'var(--primary-light)', marginTop: '3px' }}>{profile.marketCapLabel}</div>}
                    </div>
                    {keyMetrics.revenue != null && keyMetrics.revenue > 0 && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.totalRevenue')}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{formatLargeNumber(keyMetrics.revenue)}</div>
                            {keyMetrics.revenueGrowth !== 0 && <div style={{ fontSize: '0.68rem', color: keyMetrics.revenueGrowth >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '2px' }}>{keyMetrics.revenueGrowth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{keyMetrics.revenueGrowth >= 0 ? '+' : ''}{keyMetrics.revenueGrowth.toFixed(1)}% YoY</div>}
                        </div>
                    )}
                    {keyMetrics.netIncome != null && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.netIncome')}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: keyMetrics.netIncome >= 0 ? 'var(--success)' : 'var(--danger)' }}>{formatLargeNumber(keyMetrics.netIncome)}</div>
                        </div>
                    )}
                    {keyMetrics.profitMargin !== 0 && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.profitMargin')}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: keyMetrics.profitMargin >= 0 ? 'var(--success)' : 'var(--danger)' }}>{keyMetrics.profitMargin.toFixed(1)}%</div>
                        </div>
                    )}
                    {keyMetrics.pe != null && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {t('sd.peRatio')}
                                <span className="info-tip"><Info size={11} /><span className="tip-text">{t('sd.peHint')}</span></span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{keyMetrics.pe.toFixed(1)}</div>
                            {keyMetrics.peIndustryAvg != null && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>{t('sd.industryAvg')} {keyMetrics.peIndustryAvg.toFixed(1)}</div>}
                        </div>
                    )}
                    {keyMetrics.eps !== 0 && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.epsLabel')}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>${keyMetrics.eps.toFixed(2)}</div>
                            {keyMetrics.epsGrowth !== 0 && <div style={{ fontSize: '0.68rem', color: keyMetrics.epsGrowth >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '3px' }}>{keyMetrics.epsGrowth >= 0 ? '+' : ''}{keyMetrics.epsGrowth.toFixed(1)}%</div>}
                        </div>
                    )}
                    {keyMetrics.dividendYield != null && keyMetrics.dividendYield > 0 && (
                        <div className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.divYield')}</div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--accent)' }}>{keyMetrics.dividendYield.toFixed(2)}%</div>
                            {keyMetrics.dividendPerShare != null && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>${keyMetrics.dividendPerShare.toFixed(2)}{t('sd.perShare')}</div>}
                        </div>
                    )}
                </div>
            </section>

            {/* ===== PRICE CHART ===== */}
            <section id="price-chart" className="detail-section animate-fade-up delay-3" style={{ scrollMarginTop: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 className="section-heading" style={{ marginBottom: 0 }}><span className="accent-bar" /><BarChart3 size={18} className="heading-icon" /> {t('sd.toc.chart')}</h2>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '3px' }}>
                        {PRICE_RANGES.map(r => (
                            <button key={r}
                                onClick={() => setPriceRange(r)}
                                style={{
                                    padding: '5px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.72rem', fontWeight: 600, fontFamily: 'inherit',
                                    background: priceRange === r ? 'var(--primary)' : 'transparent',
                                    color: priceRange === r ? 'white' : 'var(--text-muted)',
                                    transition: 'all 0.15s',
                                }}
                            >{r}</button>
                        ))}
                    </div>
                </div>
                {hasHistory ? (
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={chartGradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={xTickFmt} tickLine={false} axisLine={false} interval="preserveStartEnd" tickCount={6} />
                            <YAxis hide domain={['auto', 'auto']} />
                            <RTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={{ color: '#e0e0e0', fontWeight: 600 }} formatter={(val: unknown) => [`$${Number(val).toFixed(2)}`, t('sd.price')]} labelFormatter={(label) => `${label}`} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2} fill={`url(#${chartGradId})`} dot={false} activeDot={{ r: 4, fill: chartColor, strokeWidth: 0 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('sd.chartNoData')}</p>
                    </div>
                )}

                {/* 52-week Range */}
                <div style={{ marginTop: '24px', padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-secondary)' }}>{t('sd.week52')}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(price.week52Low)}</span>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div className="progress-bar" style={{ height: '6px' }}>
                                <div className="progress-fill" style={{ width: `${week52Percent}%` }} />
                            </div>
                            <div style={{
                                position: 'absolute', top: '-5px',
                                left: `${Math.min(Math.max(week52Percent, 3), 97)}%`,
                                transform: 'translateX(-50%)',
                                width: '16px', height: '16px', borderRadius: '50%',
                                background: 'var(--primary-light)', border: '3px solid var(--bg-card-solid)',
                                boxShadow: '0 0 0 2px var(--primary), 0 2px 8px rgba(0,0,0,0.3)',
                            }} />
                        </div>
                        <span style={{ fontSize: '0.82rem', color: 'var(--success)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(price.week52High)}</span>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                        {t('sd.currentAt')} {formatCurrency(price.current)} — {week52Percent.toFixed(0)}% {t('sd.fromLow')}
                    </p>
                </div>
            </section>

            {/* ===== KEY METRICS ===== */}
            <section id="key-metrics" className="detail-section animate-fade-up delay-4" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><DollarSign size={18} className="heading-icon" /> {t('sd.toc.metrics')}</h2>

                <p className="sub-label"><DollarSign size={13} /> {t('sd.valueMetrics')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {t('sd.peRatio')} <span className="info-tip"><Info size={10} /><span className="tip-text">{t('sd.peHint')}</span></span>
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{keyMetrics.pe != null ? keyMetrics.pe.toFixed(1) : 'N/A'}</div>
                        {keyMetrics.peIndustryAvg != null && (
                            <div style={{ fontSize: '0.68rem', color: keyMetrics.pe != null && keyMetrics.pe > keyMetrics.peIndustryAvg ? 'var(--warning)' : 'var(--success)', marginTop: '3px' }}>
                                {t('sd.industryAvgLabel')}: {keyMetrics.peIndustryAvg.toFixed(1)}
                            </div>
                        )}
                    </div>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.pbRatio')}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{keyMetrics.pb != null ? keyMetrics.pb.toFixed(1) : 'N/A'}</div>
                    </div>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t('sd.divYieldLabel')}</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{keyMetrics.dividendYield ? `${keyMetrics.dividendYield.toFixed(2)}%` : t('sd.noPay')}</div>
                        {keyMetrics.dividendPerShare != null && keyMetrics.dividendPerShare > 0 && (
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>${keyMetrics.dividendPerShare.toFixed(2)}{t('sd.perShareYear')}</div>
                        )}
                    </div>
                </div>

                {/* Strength Metrics */}
                <p className="sub-label"><Activity size={13} /> {t('sd.strengthMetrics')}</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', marginBottom: '24px' }}>
                    {[
                        { label: t('sd.annualRevenue'), value: keyMetrics.revenue != null ? formatLargeNumber(keyMetrics.revenue) : 'N/A' },
                        { label: t('sd.netIncome'), value: keyMetrics.netIncome != null ? formatLargeNumber(keyMetrics.netIncome) : 'N/A' },
                        { label: t('sd.profitMargin'), value: keyMetrics.profitMargin ? `${keyMetrics.profitMargin}%` : 'N/A', color: keyMetrics.profitMargin > 20 ? 'var(--success)' : keyMetrics.profitMargin > 0 ? 'var(--warning)' : keyMetrics.profitMargin < 0 ? 'var(--danger)' : undefined },
                        { label: t('sd.debtToEquity'), value: keyMetrics.debtToEquity != null && keyMetrics.debtToEquity > 0 ? `${keyMetrics.debtToEquity}%` : 'N/A', color: (keyMetrics.debtToEquity ?? 0) > 150 ? 'var(--danger)' : (keyMetrics.debtToEquity ?? 0) > 80 ? 'var(--warning)' : (keyMetrics.debtToEquity ?? 0) > 0 ? 'var(--success)' : undefined },
                        { label: t('sd.currentRatio'), value: keyMetrics.currentRatio != null && keyMetrics.currentRatio > 0 ? `${keyMetrics.currentRatio}x` : 'N/A', color: (keyMetrics.currentRatio ?? 0) >= 1.5 ? 'var(--success)' : (keyMetrics.currentRatio ?? 0) >= 1 ? 'var(--warning)' : (keyMetrics.currentRatio ?? 0) > 0 ? 'var(--danger)' : undefined },
                        { label: t('sd.roe'), value: keyMetrics.roe ? `${keyMetrics.roe}%` : 'N/A' },
                    ].map((item, i) => (
                        <div key={i} className="metric-card">
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{item.label}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Growth */}
                <p className="sub-label"><TrendingUp size={13} /> {t('sd.growthLabel')}</p>
                {(hasRevenueHistory || hasEpsHistory) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('sd.revenue5y')}</span>
                                {keyMetrics.revenueGrowth ? (
                                    <span className={`badge ${keyMetrics.revenueGrowth > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>{formatPercent(keyMetrics.revenueGrowth)} YoY</span>
                                ) : null}
                            </div>
                            {revenueChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <RTooltip content={BillionTooltip} />
                                        <Bar dataKey="revenue" name={t('sd.revenueLabel')} fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('sd.noRevData')}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('sd.eps5y')}</span>
                                {keyMetrics.epsGrowth ? (
                                    <span className={`badge ${keyMetrics.epsGrowth > 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.68rem' }}>EPS {formatPercent(keyMetrics.epsGrowth)} YoY</span>
                                ) : null}
                            </div>
                            {epsChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart data={epsChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                        <RTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={{ color: '#22c55e', fontWeight: 600 }} formatter={(val: unknown) => [`$${Number(val).toFixed(2)}`, 'EPS']} />
                                        <Line type="monotone" dataKey="eps" stroke="var(--success)" strokeWidth={2} dot={{ fill: 'var(--success)', r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t('sd.noEpsData')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('sd.growthNoData')}</p>
                    </div>
                )}
            </section>

            {/* ===== FINANCIALS ===== */}
            {hasFinancials && (
            <section id="financials" className="detail-section animate-fade-up delay-5" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><BarChart3 size={18} className="heading-icon" /> {t('sd.simpleFin')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {incomeData.length > 0 && (
                    <div>
                        <p className="sub-label"><BarChart3 size={13} /> {t('sd.incomeStmt')}</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={incomeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} axisLine={false} tickLine={false} />
                                <RTooltip content={BillionTooltip} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {incomeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    )}
                    {balanceData.length > 0 && (
                    <div>
                        <p className="sub-label">{t('sd.assets')}</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={balanceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {balanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <RTooltip content={PieTooltip} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    )}
                    {cashFlowData.length > 0 && (
                    <div>
                        <p className="sub-label"><Wallet size={13} /> {t('sd.cashFlow')}</p>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <RTooltip content={BillionTooltip} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {cashFlowData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    )}
                </div>
            </section>
            )}

            {/* ===== NEWS & EVENTS ===== */}
            {hasNews && (
            <section id="news-events" className="detail-section animate-fade-up delay-6" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Newspaper size={18} className="heading-icon" /> {t('sd.newsEvents')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    <div>
                        <p className="sub-label"><Newspaper size={13} /> {t('sd.latestNews')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {news.map(n => (
                                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${n.sentiment === 'positive' ? 'var(--success)' : n.sentiment === 'negative' ? 'var(--danger)' : 'var(--border-light)'}`, cursor: 'pointer', transition: 'all 0.2s var(--ease)' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', lineHeight: 1.4 }}>{n.title}</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '8px' }}>{n.summary}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {n.source} · {formatDate(n.date)} <ExternalLink size={10} />
                                            </span>
                                            <span className={`badge ${n.sentiment === 'positive' ? 'badge-success' : n.sentiment === 'negative' ? 'badge-danger' : ''}`} style={{ fontSize: '0.62rem', padding: '3px 8px' }}>
                                                {n.sentiment === 'positive' ? t('sd.positive') : n.sentiment === 'negative' ? t('sd.negative') : t('sd.neutral')}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="sub-label"><Calendar size={13} /> {t('sd.keyEvents')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {events.map(ev => (
                                <div key={ev.id} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                        background: ev.type === 'earnings' ? 'rgba(124,108,240,0.1)' : ev.type === 'dividend' ? 'rgba(34,197,94,0.1)' : 'rgba(196,181,253,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        {ev.type === 'earnings' ? <BarChart3 size={16} style={{ color: 'var(--primary-light)' }} /> : ev.type === 'dividend' ? <DollarSign size={16} style={{ color: 'var(--success)' }} /> : <FileText size={16} style={{ color: 'var(--accent)' }} />}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>{ev.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ev.description}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={11} /> {formatDate(ev.date)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* ===== SIGNALS ===== */}
            <section id="signals" className="detail-section animate-fade-up" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Activity size={18} className="heading-icon" /> {t('sd.signalsTitle')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* Technical */}
                    <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <p className="sub-label"><Activity size={13} /> {t('sd.technical')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { label: t('sd.priceVsMa50'), badge: signals.technical.ma50 === 'above' ? 'badge-success' : 'badge-danger', text: signals.technical.ma50 === 'above' ? t('sd.above') : t('sd.below') },
                                { label: t('sd.priceVsMa200'), badge: signals.technical.ma200 === 'above' ? 'badge-success' : 'badge-danger', text: signals.technical.ma200 === 'above' ? t('sd.above') : t('sd.below') },
                                { label: 'MACD', badge: signals.technical.macd === 'bullish' ? 'badge-success' : 'badge-danger', text: signals.technical.macd === 'bullish' ? t('sd.bullish') : t('sd.bearish') },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span className={`badge ${s.badge}`} style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{s.text}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RSI</span>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: signals.technical.rsi > 70 ? 'var(--danger)' : signals.technical.rsi < 30 ? 'var(--success)' : 'var(--text-primary)' }}>{signals.technical.rsi}</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('sd.score')}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: getSignalColor(signals.technical.overallScore) }}>{signals.technical.overallScore}/100</span>
                            </div>
                            <div className="signal-meter"><div className="signal-indicator" style={{ left: `${signals.technical.overallScore}%` }} /></div>
                        </div>
                    </div>

                    {/* Fundamental */}
                    <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                        <p className="sub-label"><FileText size={13} /> {t('sd.fundamental')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { label: t('sd.earningsGrowth'), badge: signals.fundamental.earningsGrowth === 'positive' ? 'badge-success' : 'badge-danger', text: signals.fundamental.earningsGrowth === 'positive' ? t('sd.increase') : t('sd.decrease') },
                                { label: t('sd.peVsAvg'), badge: signals.fundamental.peVsAvg === 'undervalued' ? 'badge-success' : signals.fundamental.peVsAvg === 'overvalued' ? 'badge-danger' : 'badge-warning', text: signals.fundamental.peVsAvg === 'undervalued' ? t('sd.cheap') : signals.fundamental.peVsAvg === 'overvalued' ? t('sd.expensive') : t('sd.fair') },
                                { label: t('sd.cashPosition'), badge: signals.fundamental.cashPosition === 'strong' ? 'badge-success' : 'badge-warning', text: signals.fundamental.cashPosition === 'strong' ? t('sd.strong') : t('sd.moderate') },
                                { label: t('sd.debtLevel'), badge: signals.fundamental.debtLevel === 'low' ? 'badge-success' : signals.fundamental.debtLevel === 'moderate' ? 'badge-warning' : 'badge-danger', text: signals.fundamental.debtLevel === 'low' ? t('sd.low') : signals.fundamental.debtLevel === 'moderate' ? t('sd.moderate') : t('sd.high') },
                            ].map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</span>
                                    <span className={`badge ${s.badge}`} style={{ fontSize: '0.68rem', padding: '3px 10px' }}>{s.text}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t('sd.score')}</span>
                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: getSignalColor(signals.fundamental.overallScore) }}>{signals.fundamental.overallScore}/100</span>
                            </div>
                            <div className="signal-meter"><div className="signal-indicator" style={{ left: `${signals.fundamental.overallScore}%` }} /></div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ padding: '18px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p className="sub-label"><BarChart3 size={13} /> {t('sd.summaryLabel')}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: t('sd.longTermInvest'), value: signals.summary.longTermInvest, color: 'var(--success)' },
                                { label: t('sd.waitTiming'), value: signals.summary.waitForTiming, color: 'var(--warning)' },
                                { label: t('sd.notRecommended'), value: signals.summary.notRecommended, color: 'var(--danger)' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: s.color }}>{s.value}%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== COMPETITORS ===== */}
            {hasCompetitors && (
            <section id="competitors" className="detail-section animate-fade-up" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Users size={18} className="heading-icon" /> {t('sd.compareComp')}</h2>
                <div style={{ overflowX: 'auto' }} className="carousel-scroll">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {[t('sd.companyCol'), t('sd.marketCap'), t('sd.peRatio'), t('sd.profitMargin'), t('sd.revGrowthCol'), t('sd.dividendCol')].map(h => (
                                    <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ background: 'rgba(124,108,240,0.06)' }}>
                                <td style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>{profile.symbol} <Star size={11} style={{ color: '#f59e0b', fill: '#f59e0b' }} /></td>
                                <td>{formatLargeNumber(profile.marketCap)}</td>
                                <td>{keyMetrics.pe != null ? keyMetrics.pe.toFixed(1) : 'N/A'}</td>
                                <td>{keyMetrics.profitMargin ? `${keyMetrics.profitMargin}%` : 'N/A'}</td>
                                <td className={keyMetrics.revenueGrowth ? getPriceColor(keyMetrics.revenueGrowth) : ''}>{keyMetrics.revenueGrowth ? formatPercent(keyMetrics.revenueGrowth) : 'N/A'}</td>
                                <td>{keyMetrics.dividendYield ? `${keyMetrics.dividendYield}%` : '—'}</td>
                            </tr>
                            {competitors.map(c => (
                                <tr key={c.symbol} style={{ cursor: 'pointer' }}
                                    onClick={() => router.push(`/stocks/${c.symbol}`)}
                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ fontWeight: 600, color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {c.symbol} <ChevronRight size={12} style={{ opacity: 0.5 }} />
                                    </td>
                                    <td>{formatLargeNumber(c.marketCap)}</td>
                                    <td>{c.pe?.toFixed(1) ?? 'N/A'}</td>
                                    <td>{c.profitMargin ? `${c.profitMargin}%` : 'N/A'}</td>
                                    <td className={c.revenueGrowth ? getPriceColor(c.revenueGrowth) : ''}>{c.revenueGrowth ? formatPercent(c.revenueGrowth) : 'N/A'}</td>
                                    <td>{c.dividendYield ? `${c.dividendYield}%` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            )}

            {/* ===== SCORES ===== */}
            <section id="scores" className="detail-section animate-fade-up" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Star size={18} className="heading-icon" /> {t('sd.scoringSystem')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary-light)', lineHeight: 1 }}>{scores.overall}</div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '8px' }}>/ 5.0</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '10px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={22} fill={s <= Math.round(scores.overall) ? '#f59e0b' : 'transparent'} stroke={s <= Math.round(scores.overall) ? '#f59e0b' : 'var(--border-light)'} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            {t('sd.scoreFrom5')}
                            <span className="info-tip"><Info size={11} /><span className="tip-text">{t('sd.scoreTooltip')}</span></span>
                        </p>
                    </div>
                    <div>
                        <ResponsiveContainer width="100%" height={240}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <RTooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={{ color: '#e0e0e0', fontWeight: 600 }} formatter={(val: unknown) => [`${Number(val).toFixed(1)} / 5`, '']} />
                                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.25} strokeWidth={2} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ===== BEGINNER TIPS ===== */}
            <section id="tips" className="detail-section animate-fade-up" style={{ scrollMarginTop: '80px' }}>
                <h2 className="section-heading"><span className="accent-bar" /><Lightbulb size={18} className="heading-icon" /> {t('sd.tipsTitle')}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ padding: '20px', background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={16} /> {t('sd.goodFor')}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(locale === 'en' ? (beginnerTips.goodForEn || beginnerTips.goodFor) : beginnerTips.goodFor).map((tip, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '8px', borderLeft: '2px solid rgba(34,197,94,0.2)' }}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ padding: '20px', background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.15)', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={16} /> {t('sd.cautionFor')}
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(locale === 'en' ? (beginnerTips.cautionForEn || beginnerTips.cautionFor) : beginnerTips.cautionFor).map((tip, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '8px', borderLeft: '2px solid rgba(251,113,133,0.2)' }}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <p className="sub-label"><BookOpen size={13} /> {t('sd.relatedLessons')}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {beginnerTips.relatedLessons.map((lesson, i) => (
                            <a key={i} href={lesson.url} style={{
                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 16px',
                                borderRadius: '100px', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                                textDecoration: 'none', transition: 'all 0.2s var(--ease)',
                            }}
                                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                            >
                                <BookOpen size={13} /> {locale === 'en' ? (lesson.titleEn || lesson.title) : lesson.title} <ChevronRight size={13} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DISCLAIMER ===== */}
            <section style={{
                padding: '14px 20px', borderRadius: 'var(--radius-md)',
                background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.12)',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {t('sd.disclaimer')}
                </p>
            </section>
            </div>

        {/* ===== TRADE MODAL ===== */}
        {showTradeModal && (
            <div
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                onClick={e => { if (e.target === e.currentTarget) { setShowTradeModal(false); setTradeResult(null); } }}
            >
                <div style={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
                    {/* Modal header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Image src={profile.logo} alt="" width={40} height={40} unoptimized style={{ borderRadius: '10px', background: 'white', padding: '4px' }} />
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>{profile.symbol}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.name}</p>
                            </div>
                        </div>
                        <button onClick={() => { setShowTradeModal(false); setTradeResult(null); setTradeWarnings([]); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                            <X size={20} />
                        </button>
                    </div>

                    {/* BUY / SELL toggle */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                        {(['BUY', 'SELL'] as const).map(s => (
                            <button key={s} onClick={() => { setTradeSide(s); setTradeResult(null); setTradeWarnings([]); setTradeQty('1'); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.15s', border: '2px solid', borderColor: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--border)', background: tradeSide === s ? (s === 'BUY' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)') : 'transparent', color: tradeSide === s ? (s === 'BUY' ? '#22c55e' : '#ef4444') : 'var(--text-muted)' }}>
                                {s === 'BUY' ? `▲ ${t('sd.buy')}` : `▼ ${t('sd.sell')}`}
                            </button>
                        ))}
                    </div>

                    {/* Price strip */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '20px' }}>
                        <div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{t('sd.marketPrice')}</p>
                            <p style={{ fontSize: '1.4rem', fontWeight: 900, margin: '2px 0 0' }}>{formatCurrency(price.current)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>{t('sd.change')}</p>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, margin: '2px 0 0', color: price.change >= 0 ? '#22c55e' : '#ef4444' }}>
                                {price.change >= 0 ? '+' : ''}{formatCurrency(price.change)} ({formatPercent(price.changePercent)})
                            </p>
                        </div>
                    </div>

                    {/* Current position badge */}
                    {currentPosition ? (
                        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)', fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: 'var(--primary-light)' }}>{t('sd.holdingLabel')} </span>
                                <strong>{currentPosition!.quantity % 1 === 0 ? currentPosition!.quantity : currentPosition!.quantity.toFixed(4)} {t('sd.shares')}</strong>
                                <span style={{ color: 'var(--text-muted)' }}> · {t('sd.costBasis')} {formatCurrency(currentPosition!.avgCost)}</span>
                            </div>
                            {tradeSide === 'SELL' && (
                                <button onClick={() => setTradeQty(currentPosition!.quantity.toString())} style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>{t('sd.sellAll')}</button>
                            )}
                        </div>
                    ) : tradeSide === 'SELL' ? (
                        <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.82rem', color: '#ef4444' }}>
                            {t('sd.noShares')} {symbol.toUpperCase()} {t('sd.inPort')}
                        </div>
                    ) : null}

                    {/* Quantity input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{t('sd.qtyLabel')} {tradeSide === 'SELL' && currentPosition ? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({t('sd.holdQty')} {currentPosition.quantity.toFixed(currentPosition.quantity % 1 === 0 ? 0 : 4)} {t('sd.shares')})</span> : ''}</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button onClick={() => setTradeQty(q => Math.max(1, parseInt(q || '1') - 1).toString())} style={{ width: '36px', height: '42px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>-</button>
                            <input
                                type="text" inputMode="decimal"
                                value={tradeQty}
                                onChange={e => setTradeQty(e.target.value)}
                                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700, textAlign: 'center', outline: 'none', fontFamily: 'inherit' }}
                            />
                            <button onClick={() => setTradeQty(q => (parseInt(q || '1') + 1).toString())} style={{ width: '36px', height: '42px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>+</button>
                        </div>
                    </div>

                    {/* Order preview */}
                    {(() => {
                        const qty = parseFloat(tradeQty) || 0;
                        const orderValue = qty * price.current;
                        const isSell = tradeSide === 'SELL';
                        const held = currentPosition?.quantity ?? 0;
                        const notEnoughShares = isSell && qty > held;
                        const remaining = portfolioCash != null
                            ? isSell ? portfolioCash + orderValue : portfolioCash - orderValue
                            : null;
                        const notEnoughCash = !isSell && remaining != null && remaining < 0;
                        const estPnl = isSell && currentPosition
                            ? qty * (price.current - currentPosition.avgCost)
                            : null;
                        return (
                            <div style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('sd.pricePerShare')}</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(price.current)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{t('sd.quantity')}</span>
                                    <span style={{ fontWeight: 600, color: notEnoughShares ? '#ef4444' : undefined }}>{tradeQty || '0'} {t('sd.shares')} {notEnoughShares ? `(${t('sd.onlyHave')} ${held})` : ''}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{isSell ? t('sd.sellRevenue') : t('sd.totalValue')}</span>
                                    <span style={{ fontWeight: 700, color: isSell ? '#22c55e' : undefined }}>{formatCurrency(orderValue)}</span>
                                </div>
                                {isSell && estPnl != null && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>{t('sd.estPnl')}</span>
                                        <span style={{ fontWeight: 700, color: estPnl >= 0 ? '#22c55e' : '#ef4444' }}>{estPnl >= 0 ? '+' : ''}{formatCurrency(estPnl)}</span>
                                    </div>
                                )}
                                {portfolioCash != null && (
                                    <>
                                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>{t('sd.currentCash')}</span>
                                            <span style={{ fontWeight: 600 }}>{formatCurrency(portfolioCash)}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 700 }}>{isSell ? t('sd.cashAfterSell') : t('sd.cashAfterBuy')}</span>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: notEnoughCash ? '#ef4444' : '#22c55e' }}>{formatCurrency(remaining!)}</span>
                                        </div>
                                        {notEnoughCash && <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>⚠️ {t('sd.notEnoughCash')}</p>}
                                    </>
                                )}
                            </div>
                        );
                    })()}

                    {/* Result message */}
                    {tradeResult && (
                        <div style={{ marginBottom: (tradeResult.realizedPnl !== undefined || tradeWarnings.length > 0) ? '8px' : '16px', padding: '12px 14px', borderRadius: '10px', fontSize: '0.85rem', background: tradeResult!.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${tradeResult!.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: tradeResult!.ok ? '#22c55e' : '#ef4444' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {tradeResult!.ok ? <CheckCircle size={16} /> : <AlertIcon size={16} />}
                                {tradeResult!.msg}
                            </div>
                            {tradeResult.realizedPnl !== undefined && (
                                <div style={{ marginTop: '6px', fontSize: '0.78rem', paddingLeft: '24px', opacity: 0.9 }}>
                                    Realized P/L (FIFO): <strong style={{ color: tradeResult.realizedPnl >= 0 ? '#22c55e' : '#ef4444' }}>{tradeResult.realizedPnl >= 0 ? '+' : ''}{formatCurrency(tradeResult.realizedPnl)}</strong>
                                </div>
                            )}
                        </div>
                    )}
                    {/* Market / PDT warnings */}
                    {tradeWarnings.map((w, i) => (
                        <div key={i} style={{ marginBottom: i === tradeWarnings.length - 1 ? '16px' : '6px', padding: '10px 14px', borderRadius: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.78rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                            <AlertIcon size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                            {w}
                        </div>
                    ))}

                    {/* Submit button */}
                    {(() => {
                        const qty = parseFloat(tradeQty) || 0;
                        const isSell = tradeSide === 'SELL';
                        const held = currentPosition?.quantity ?? 0;
                        const disabled = tradeSubmitting || qty <= 0
                            || (isSell && qty > held)
                            || (isSell && held === 0)
                            || (!isSell && portfolioCash != null && qty * price.current > portfolioCash);
                        return (
                            <button onClick={handleQuickTrade} disabled={disabled}
                                style={{ width: '100%', padding: '14px', borderRadius: '12px', background: isSell ? '#ef4444' : '#22c55e', border: 'none', color: 'white', fontSize: '1rem', fontWeight: 800, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: disabled ? 0.5 : 1, transition: 'opacity 0.15s' }}
                            >
                                {isSell ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                {tradeSubmitting ? t('sd.processing') : `${isSell ? t('sd.sell') : t('sd.buy')} ${tradeQty || '0'} ${t('sd.shares')} · ${formatCurrency(qty * price.current)}`}
                            </button>
                        );
                    })()}
                    <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '10px' }}>{t('sd.simMoney')}</p>
                </div>
            </div>
        )}
        </div>
    );
}
