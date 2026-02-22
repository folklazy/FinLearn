'use client';

import { useEffect, useState, use } from 'react';
import { api } from '@/lib/api';
import { StockData } from '@/types/stock';
import { formatCurrency, formatPercent, formatLargeNumber, formatVolume, formatDate, getPriceColor, getSignalColor } from '@/lib/utils';
import {
    Heart, ShoppingCart, Building2, DollarSign,
    BarChart3, Newspaper, Activity, Users, Star, Lightbulb, AlertTriangle,
    ExternalLink, Calendar, ArrowUpRight, ArrowDownRight, Info,
    ChevronRight, BookOpen, ListOrdered,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = use(params);
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState('1Y');

    useEffect(() => {
        api.getStock(symbol)
            .then(d => setData(d))
            .catch(err => console.error('Failed to load stock:', err))
            .finally(() => setLoading(false));
    }, [symbol]);

    if (loading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ animation: 'pulse-glow 2s infinite', width: '100px', height: '100px', borderRadius: '50%', margin: '80px auto', background: 'var(--bg-card)' }} />
                <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>กำลังโหลดข้อมูล {symbol.toUpperCase()}...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</p>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>ไม่พบข้อมูลหุ้น {symbol.toUpperCase()}</h2>
                <p style={{ color: 'var(--text-muted)' }}>กรุณาตรวจสอบ Symbol แล้วลองใหม่อีกครั้ง</p>
            </div>
        );
    }

    const { profile, price, keyMetrics, financials, news, events, signals, competitors, scores, beginnerTips } = data;

    // ── Data availability flags ──
    const hasHistory = price.history && price.history.length > 0;
    const hasRevenueHistory = keyMetrics.revenueHistory && keyMetrics.revenueHistory.length > 0;
    const hasEpsHistory = keyMetrics.epsHistory && keyMetrics.epsHistory.length > 0;
    const hasIncomeData = financials.incomeStatement.revenue > 0;
    const hasBalanceData = financials.balanceSheet.totalAssets > 0;
    const hasCashFlow = financials.cashFlow.operating !== 0 || financials.cashFlow.investing !== 0;
    const hasFinancials = hasIncomeData || hasBalanceData || hasCashFlow;
    const hasNews = news && news.length > 0;
    const hasSignals = signals && signals.technical;
    const hasCompetitors = competitors && competitors.length > 0;

    // ── TOC sections ──
    const tocSections = [
        { id: 'overview', label: 'ภาพรวมบริษัท', icon: '🏢', always: true },
        { id: 'price-chart', label: 'กราฟราคา', icon: '📈', always: hasHistory },
        { id: 'key-metrics', label: 'ตัวเลขสำคัญ', icon: '💰', always: true },
        { id: 'financials', label: 'งบการเงิน', icon: '📊', always: hasFinancials },
        { id: 'news-events', label: 'ข่าวสาร', icon: '📰', always: hasNews },
        { id: 'signals', label: 'สัญญาณซื้อ-ขาย', icon: '⚡', always: hasSignals },
        { id: 'competitors', label: 'คู่แข่ง', icon: '👥', always: hasCompetitors },
        { id: 'scores', label: 'คะแนน', icon: '⭐', always: true },
        { id: 'tips', label: 'คำแนะนำ', icon: '💡', always: true },
    ].filter(s => s.always);

    // Chart Colors
    const COLORS = ['#6366f1', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

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

    // Income Statement waterfall
    const incomeData = hasIncomeData ? [
        { name: 'รายได้', value: financials.incomeStatement.revenue / 1e9, fill: '#6366f1' },
        { name: 'ต้นทุน', value: -financials.incomeStatement.costOfRevenue / 1e9, fill: '#ef4444' },
        { name: 'ค่าใช้จ่าย', value: -financials.incomeStatement.operatingExpenses / 1e9, fill: '#f59e0b' },
        { name: 'กำไรสุทธิ', value: financials.incomeStatement.netIncome / 1e9, fill: '#22c55e' },
    ] : [];

    // Balance sheet pie
    const balanceData = hasBalanceData ? [
        { name: 'สินทรัพย์หมุนเวียน', value: financials.balanceSheet.currentAssets / 1e9 },
        { name: 'สินทรัพย์ไม่หมุนเวียน', value: financials.balanceSheet.nonCurrentAssets / 1e9 },
    ] : [];

    // Cash flow
    const cashFlowData = hasCashFlow ? [
        { name: 'ดำเนินงาน', value: financials.cashFlow.operating / 1e9, fill: '#22c55e' },
        { name: 'ลงทุน', value: financials.cashFlow.investing / 1e9, fill: '#f59e0b' },
        { name: 'จัดหาเงิน', value: financials.cashFlow.financing / 1e9, fill: '#ef4444' },
    ] : [];

    // Radar chart for scores
    const radarData = [
        { dimension: 'มูลค่า', score: scores.dimensions.value },
        { dimension: 'เติบโต', score: scores.dimensions.growth },
        { dimension: 'แข็งแกร่ง', score: scores.dimensions.strength },
        { dimension: 'ปันผล', score: scores.dimensions.dividend },
        { dimension: 'ความเสี่ยง', score: scores.dimensions.risk },
    ];

    // Price history filtered
    const getPriceHistory = () => {
        const h = price.history;
        const now = h.length;
        switch (priceRange) {
            case '1W': return h.slice(Math.max(0, now - 7));
            case '1M': return h.slice(Math.max(0, now - 30));
            case '3M': return h.slice(Math.max(0, now - 90));
            case '6M': return h.slice(Math.max(0, now - 180));
            case '1Y': return h;
            default: return h;
        }
    };

    const week52Percent = ((price.current - price.week52Low) / (price.week52High - price.week52Low)) * 100;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ===== 1. HEADER ===== */}
            <section className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <img src={profile.logo} alt={profile.name}
                        style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'white', padding: '6px' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{profile.name}</h1>
                            <span className="badge badge-primary">{profile.symbol}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge badge-primary">{profile.sector}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{profile.industry}</span>
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1 }}>{formatCurrency(price.current)}</div>
                    <div className={getPriceColor(price.change)} style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                        {price.change >= 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        {formatCurrency(Math.abs(price.change))} ({formatPercent(price.changePercent)})
                    </div>
                </div>
            </section>

            {/* ===== 2. QUICK ACTIONS ===== */}
            <section className="animate-fade-in-up" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', animationDelay: '0.05s' }}>
                <button className="btn btn-outline"><Heart size={16} /> เพิ่มเข้า Watchlist</button>
                <button className="btn btn-success"><ShoppingCart size={16} /> ทดลองซื้อในพอร์ตจำลอง</button>
            </section>

            {/* ===== TABLE OF CONTENTS ===== */}
            <nav className="glass-card animate-fade-in-up" style={{ padding: '16px 20px', animationDelay: '0.08s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ListOrdered size={16} style={{ color: 'var(--primary-light)' }} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>สารบัญ</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {tocSections.map(s => (
                        <a key={s.id} href={`#${s.id}`}
                            style={{
                                padding: '6px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 500,
                                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
                                transition: 'all 0.2s', border: '1px solid transparent',
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = 'var(--primary-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                            <span>{s.icon}</span> {s.label}
                        </a>
                    ))}
                </div>
            </nav>

            {/* ===== 3. COMPANY OVERVIEW ===== */}
            <section id="overview" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.1s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Building2 size={20} /> ภาพรวมบริษัท</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '20px' }}>
                    {profile.description}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    {[
                        { label: 'มูลค่าตลาด', value: formatLargeNumber(profile.marketCap), note: profile.marketCapLabel },
                        { label: 'CEO', value: profile.ceo },
                        { label: 'พนักงาน', value: profile.employees.toLocaleString() + ' คน' },
                        { label: 'ก่อตั้ง', value: profile.founded },
                        { label: 'สำนักงานใหญ่', value: profile.headquarters },
                    ].map((item, i) => (
                        <div key={i} className="metric-card">
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontWeight: 700 }}>{item.value}</div>
                            {item.note && <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', marginTop: '2px' }}>{item.note}</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 4. PRICE CHART + 52 WEEK RANGE ===== */}
            <section id="price-chart" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.15s', scrollMarginTop: '80px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                    <h2 className="section-title" style={{ marginBottom: 0 }}><BarChart3 size={20} /> กราฟราคา</h2>
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {['1W', '1M', '3M', '6M', '1Y'].map(r => (
                            <button key={r}
                                onClick={() => setPriceRange(r)}
                                style={{
                                    padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    fontSize: '0.75rem', fontWeight: 600,
                                    background: priceRange === r ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: priceRange === r ? 'white' : 'var(--text-muted)',
                                    transition: 'all 0.2s',
                                }}
                            >{r}</button>
                        ))}
                    </div>
                </div>
                {hasHistory ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={getPriceHistory()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={(v) => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} domain={['auto', 'auto']} />
                            <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            <Line type="monotone" dataKey="close" stroke="var(--primary)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📊 ข้อมูลกราฟราคาไม่พร้อมใช้งาน (ต้องการ FMP Premium)</p>
                    </div>
                )}

                {/* 52-week Range */}
                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>📊 ช่วงราคา 52 สัปดาห์</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 600 }}>{formatCurrency(price.week52Low)}</span>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <div className="progress-bar" style={{ height: '10px' }}>
                                <div className="progress-fill" style={{ width: `${week52Percent}%`, background: 'var(--gradient-primary)' }} />
                            </div>
                            <div style={{
                                position: 'absolute', top: '-6px',
                                left: `${Math.min(Math.max(week52Percent, 5), 95)}%`,
                                transform: 'translateX(-50%)',
                                width: '20px', height: '20px', borderRadius: '50%',
                                background: 'white', border: '3px solid var(--primary)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(price.week52High)}</span>
                    </div>
                    <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        ราคาปัจจุบัน {formatCurrency(price.current)} ({week52Percent.toFixed(0)}% จากจุดต่ำสุด)
                    </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginTop: '16px' }}>
                    {[
                        { label: 'เปิด', value: formatCurrency(price.open) },
                        { label: 'สูงสุดวันนี้', value: formatCurrency(price.high) },
                        { label: 'ต่ำสุดวันนี้', value: formatCurrency(price.low) },
                        { label: 'ปิดก่อนหน้า', value: formatCurrency(price.previousClose) },
                        { label: 'ปริมาณ', value: formatVolume(price.volume) },
                        { label: 'ปริมาณเฉลี่ย', value: formatVolume(price.avgVolume) },
                    ].map((item, i) => (
                        <div key={i} style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.label}</div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== 5. KEY METRICS ===== */}
            <section id="key-metrics" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.2s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><DollarSign size={20} /> ตัวเลขสำคัญ</h2>

                {/* Value Metrics */}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '12px' }}>💰 ความคุ้มค่า</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    <div className="metric-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>P/E Ratio</span>
                            <span className="tooltip-trigger" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                <Info size={12} />
                                <span className="tooltip-content">ราคาหุ้น ÷ กำไรต่อหุ้น ยิ่งต่ำยิ่งถูก</span>
                            </span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{keyMetrics.pe?.toFixed(1) ?? 'N/A'}</div>
                        {keyMetrics.peIndustryAvg && (
                            <div style={{ fontSize: '0.7rem', color: keyMetrics.pe && keyMetrics.pe > keyMetrics.peIndustryAvg ? 'var(--warning)' : 'var(--success)' }}>
                                เฉลี่ยอุตสาหกรรม: {keyMetrics.peIndustryAvg}
                            </div>
                        )}
                    </div>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>P/B Ratio</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{keyMetrics.pb?.toFixed(1) ?? 'N/A'}</div>
                    </div>
                    <div className="metric-card">
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>เงินปันผล (Yield)</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{keyMetrics.dividendYield ? `${keyMetrics.dividendYield}%` : 'ไม่จ่าย'}</div>
                        {keyMetrics.dividendPerShare && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>${keyMetrics.dividendPerShare}/หุ้น/ปี</div>
                        )}
                    </div>
                </div>

                {/* Strength Metrics */}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--success)', marginBottom: '12px' }}>💪 ความแข็งแกร่ง</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {[
                        { label: 'รายได้ต่อปี', value: formatLargeNumber(keyMetrics.revenue) },
                        { label: 'กำไรสุทธิ', value: formatLargeNumber(keyMetrics.netIncome) },
                        { label: 'อัตรากำไรสุทธิ', value: `${keyMetrics.profitMargin}%`, color: keyMetrics.profitMargin > 20 ? 'var(--success)' : 'var(--warning)' },
                        { label: 'หนี้ต่อทุน (D/E)', value: `${keyMetrics.debtToEquity}%`, color: keyMetrics.debtToEquity > 150 ? 'var(--danger)' : 'var(--success)' },
                        { label: 'ROE', value: `${keyMetrics.roe}%` },
                    ].map((item, i) => (
                        <div key={i} className="metric-card">
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: item.color }}>{item.value}</div>
                        </div>
                    ))}
                </div>

                {/* Growth */}
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '12px' }}>📈 การเติบโต</h3>
                {(hasRevenueHistory || hasEpsHistory) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>รายได้ 5 ปี (พันล้าน $)</div>
                            {revenueChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={revenueChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
                                        <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ไม่มีข้อมูลรายได้</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>กำไรต่อหุ้น (EPS) 5 ปี</div>
                            {epsChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={180}>
                                    <LineChart data={epsChartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                        <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
                                        <Line type="monotone" dataKey="eps" stroke="var(--success)" strokeWidth={2} dot={{ fill: 'var(--success)' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>ไม่มีข้อมูล EPS</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: '12px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>📊 ข้อมูลการเติบโตไม่พร้อมใช้งาน (ต้องการ FMP Premium)</p>
                    </div>
                )}
            </section>

            {/* ===== 6. FINANCIAL CHARTS ===== */}
            {hasFinancials && (
            <section id="financials" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.25s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><BarChart3 size={20} /> งบการเงินแบบง่าย</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                    {/* Income Statement */}
                    {incomeData.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            📊 งบกำไรขาดทุน (พันล้าน $)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={incomeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} width={80} />
                                <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {incomeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    )}

                    {/* Balance Sheet */}
                    {balanceData.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            🥧 สินทรัพย์ (พันล้าน $)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={balanceData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                                    {balanceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    )}

                    {/* Cash Flow */}
                    {cashFlowData.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                            💵 กระแสเงินสด (พันล้าน $)
                        </h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={cashFlowData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <RTooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} />
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

            {/* ===== 7. NEWS & EVENTS ===== */}
            {hasNews && (
            <section id="news-events" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.3s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Newspaper size={20} /> ข่าวสารและเหตุการณ์</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* News */}
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>📰 ข่าวล่าสุด</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {news.map(n => (
                                <a key={n.id} href={n.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', borderLeft: `3px solid ${n.sentiment === 'positive' ? 'var(--success)' : n.sentiment === 'negative' ? 'var(--danger)' : 'var(--text-muted)'}`, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{n.title}</div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '6px' }}>{n.summary}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {n.source} · {formatDate(n.date)}
                                                <ExternalLink size={10} />
                                            </span>
                                            <span className={`badge ${n.sentiment === 'positive' ? 'badge-success' : n.sentiment === 'negative' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                                                {n.sentiment === 'positive' ? '📈 เชิงบวก' : n.sentiment === 'negative' ? '📉 เชิงลบ' : '➡️ กลาง'}
                                            </span>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    {/* Events */}
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>📅 เหตุการณ์สำคัญ</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {events.map(ev => (
                                <div key={ev.id} style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', display: 'flex', gap: '12px' }}>
                                    <div style={{
                                        width: '44px', height: '44px', borderRadius: '10px',
                                        background: ev.type === 'earnings' ? 'rgba(99,102,241,0.15)' : 'rgba(34,197,94,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                                    }}>
                                        {ev.type === 'earnings' ? '📊' : ev.type === 'dividend' ? '💰' : '📋'}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '2px' }}>{ev.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ev.description}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600, marginTop: '4px' }}>
                                            <Calendar size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                                            {formatDate(ev.date)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            )}

            {/* ===== 8. TRADING SIGNALS ===== */}
            <section id="signals" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.35s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Activity size={20} /> สัญญาณซื้อ-ขาย</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                    {/* Technical */}
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>📊 Technical Signals</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ราคา vs MA50</span>
                                <span className={`badge ${signals.technical.ma50 === 'above' ? 'badge-success' : 'badge-danger'}`}>
                                    {signals.technical.ma50 === 'above' ? '✅ เหนือ' : '❌ ใต้'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ราคา vs MA200</span>
                                <span className={`badge ${signals.technical.ma200 === 'above' ? 'badge-success' : 'badge-danger'}`}>
                                    {signals.technical.ma200 === 'above' ? '✅ เหนือ' : '❌ ใต้'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>RSI</span>
                                <span style={{ fontWeight: 700, color: signals.technical.rsi > 70 ? 'var(--danger)' : signals.technical.rsi < 30 ? 'var(--success)' : 'var(--text-primary)' }}>
                                    {signals.technical.rsi}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>MACD</span>
                                <span className={`badge ${signals.technical.macd === 'bullish' ? 'badge-success' : 'badge-danger'}`}>
                                    {signals.technical.macd === 'bullish' ? '📈 Bullish' : '📉 Bearish'}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>คะแนน Technical</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getSignalColor(signals.technical.overallScore) }}>{signals.technical.overallScore}/100</span>
                            </div>
                            <div className="signal-meter">
                                <div className="signal-indicator" style={{ left: `${signals.technical.overallScore}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Fundamental */}
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>📋 Fundamental Signals</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>กำไรเติบโต</span>
                                <span className={`badge ${signals.fundamental.earningsGrowth === 'positive' ? 'badge-success' : 'badge-danger'}`}>
                                    {signals.fundamental.earningsGrowth === 'positive' ? '📈 เพิ่ม' : '📉 ลด'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>P/E vs ค่าเฉลี่ย</span>
                                <span className={`badge ${signals.fundamental.peVsAvg === 'undervalued' ? 'badge-success' : signals.fundamental.peVsAvg === 'overvalued' ? 'badge-danger' : 'badge-warning'}`}>
                                    {signals.fundamental.peVsAvg === 'undervalued' ? '💎 ถูก' : signals.fundamental.peVsAvg === 'overvalued' ? '💸 แพง' : '⚖️ พอดี'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>เงินสดในมือ</span>
                                <span className={`badge ${signals.fundamental.cashPosition === 'strong' ? 'badge-success' : 'badge-warning'}`}>
                                    {signals.fundamental.cashPosition === 'strong' ? '💪 แข็งแกร่ง' : '⚠️ ปานกลาง'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ระดับหนี้</span>
                                <span className={`badge ${signals.fundamental.debtLevel === 'low' ? 'badge-success' : signals.fundamental.debtLevel === 'moderate' ? 'badge-warning' : 'badge-danger'}`}>
                                    {signals.fundamental.debtLevel === 'low' ? '✅ ต่ำ' : signals.fundamental.debtLevel === 'moderate' ? '⚠️ ปานกลาง' : '❌ สูง'}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>คะแนน Fundamental</span>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: getSignalColor(signals.fundamental.overallScore) }}>{signals.fundamental.overallScore}/100</span>
                            </div>
                            <div className="signal-meter">
                                <div className="signal-indicator" style={{ left: `${signals.fundamental.overallScore}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>📊 สรุปรวม</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: '✅ เหมาะลงทุนระยะยาว', value: signals.summary.longTermInvest, color: 'var(--success)' },
                                { label: '⏳ รอจังหวะ', value: signals.summary.waitForTiming, color: 'var(--warning)' },
                                { label: '❌ ไม่แนะนำ', value: signals.summary.notRecommended, color: 'var(--danger)' },
                            ].map((s, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s.label}</span>
                                        <span style={{ fontWeight: 700, color: s.color }}>{s.value}%</span>
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

            {/* ===== 9. COMPETITOR COMPARISON ===== */}
            {hasCompetitors && (
            <section id="competitors" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.4s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Users size={20} /> เปรียบเทียบคู่แข่ง</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                {['บริษัท', 'Market Cap', 'P/E', 'Profit Margin', 'เติบโต (รายได้)', 'เงินปันผล'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {/* Current stock */}
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,0.08)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{profile.symbol} ⭐</td>
                                <td style={{ padding: '12px 16px' }}>{formatLargeNumber(profile.marketCap)}</td>
                                <td style={{ padding: '12px 16px' }}>{keyMetrics.pe?.toFixed(1) ?? 'N/A'}</td>
                                <td style={{ padding: '12px 16px' }}>{keyMetrics.profitMargin}%</td>
                                <td style={{ padding: '12px 16px' }} className={getPriceColor(keyMetrics.revenueGrowth)}>{formatPercent(keyMetrics.revenueGrowth)}</td>
                                <td style={{ padding: '12px 16px' }}>{keyMetrics.dividendYield ? `${keyMetrics.dividendYield}%` : '—'}</td>
                            </tr>
                            {/* Competitors */}
                            {competitors.map(c => (
                                <tr key={c.symbol} style={{ borderBottom: '1px solid var(--border)' }}
                                    onMouseOver={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.symbol}</td>
                                    <td style={{ padding: '12px 16px' }}>{formatLargeNumber(c.marketCap)}</td>
                                    <td style={{ padding: '12px 16px' }}>{c.pe?.toFixed(1) ?? 'N/A'}</td>
                                    <td style={{ padding: '12px 16px' }}>{c.profitMargin}%</td>
                                    <td style={{ padding: '12px 16px' }} className={getPriceColor(c.revenueGrowth)}>{formatPercent(c.revenueGrowth)}</td>
                                    <td style={{ padding: '12px 16px' }}>{c.dividendYield ? `${c.dividendYield}%` : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            )}

            {/* ===== 10. SCORE RATING ===== */}
            <section id="scores" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.45s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Star size={20} /> ระบบให้คะแนน</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary-light)', lineHeight: 1 }}>{scores.overall}</div>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ 5.0</div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '8px' }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Star key={s} size={24} fill={s <= Math.round(scores.overall) ? '#f59e0b' : 'transparent'} stroke={s <= Math.round(scores.overall) ? '#f59e0b' : 'var(--border)'} />
                            ))}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>คะแนนรวมจาก 5 มิติ</p>
                    </div>
                    <div>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Radar name="Score" dataKey="score" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.3} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* ===== 11. BEGINNER TIPS ===== */}
            <section id="tips" className="glass-card animate-fade-in-up" style={{ padding: '24px', animationDelay: '0.5s', scrollMarginTop: '80px' }}>
                <h2 className="section-title"><Lightbulb size={20} /> คำแนะนำสำหรับมือใหม่</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Good For */}
                    <div style={{ padding: '20px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px' }}>
                        <h3 style={{ color: 'var(--success)', fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                            ✅ ดีสำหรับคุณถ้า...
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {beginnerTips.goodFor.map((tip, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                    {/* Caution */}
                    <div style={{ padding: '20px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px' }}>
                        <h3 style={{ color: 'var(--danger)', fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>
                            ⚠️ ระวังถ้า...
                        </h3>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {beginnerTips.cautionFor.map((tip, i) => (
                                <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Related Lessons */}
                <div style={{ marginTop: '20px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>📚 บทเรียนที่เกี่ยวข้อง</h3>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {beginnerTips.relatedLessons.map((lesson, i) => (
                            <a key={i} href={lesson.url} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                                <BookOpen size={14} /> {lesson.title} <ChevronRight size={14} />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== 12. DISCLAIMER FOOTER ===== */}
            <section style={{
                padding: '16px 20px',
                background: 'rgba(245,158,11,0.06)',
                border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: '12px',
                display: 'flex', alignItems: 'center', gap: '10px',
            }}>
                <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    ข้อมูลนี้เป็นไปเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำในการลงทุน ราคาหุ้นอาจมีความล่าช้า กรุณาปรึกษาผู้เชี่ยวชาญก่อนการลงทุนจริง
                </p>
            </section>
        </div>
    );
}
