'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StockLogo from '@/components/ui/StockLogo';
import {
    ChevronRight, ChevronLeft, BookOpen, TrendingUp, Coins, BarChart3, Zap,
    Check, Star, Sparkles, GraduationCap, LineChart, Shield, ArrowRight,
    Target, Clock, Search, X,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const TOTAL_STEPS = 4;

const expData = [
    { value: 'BEGINNER', lk: 'onboard.exp.beginner', dk: 'onboard.exp.beginnerDesc', icon: BookOpen },
    { value: 'INTERMEDIATE', lk: 'onboard.exp.intermediate', dk: 'onboard.exp.intermediateDesc', icon: TrendingUp },
    { value: 'ADVANCED', lk: 'onboard.exp.advanced', dk: 'onboard.exp.advancedDesc', icon: Zap },
];
const goalData = [
    { value: 'LEARN_BASICS', lk: 'onboard.goal.basics', dk: 'onboard.goal.basicsDesc', icon: BookOpen },
    { value: 'VALUE', lk: 'onboard.goal.value', dk: 'onboard.goal.valueDesc', icon: Target },
    { value: 'GROWTH', lk: 'onboard.goal.growth', dk: 'onboard.goal.growthDesc', icon: TrendingUp },
    { value: 'DIVIDEND', lk: 'onboard.goal.dividend', dk: 'onboard.goal.dividendDesc', icon: Coins },
    { value: 'TRADING_EDU', lk: 'onboard.goal.trading', dk: 'onboard.goal.tradingDesc', icon: BarChart3 },
];
const riskData = [
    { value: 'LOW', lk: 'onboard.risk.low', dk: 'onboard.risk.lowDesc', color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)' },
    { value: 'MEDIUM', lk: 'onboard.risk.medium', dk: 'onboard.risk.mediumDesc', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)' },
    { value: 'HIGH', lk: 'onboard.risk.high', dk: 'onboard.risk.highDesc', color: '#fb7185', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.25)' },
];

/* Curated stocks for onboarding — recognizable names beginners know */
const ONBOARD_STOCKS = [
    { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', sector: 'Technology' },
    { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
    { symbol: 'AMZN', name: 'Amazon', sector: 'Consumer' },
    { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
    { symbol: 'TSLA', name: 'Tesla', sector: 'Automotive' },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
    { symbol: 'NFLX', name: 'Netflix', sector: 'Entertainment' },
    { symbol: 'DIS', name: 'Walt Disney', sector: 'Entertainment' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance' },
    { symbol: 'V', name: 'Visa', sector: 'Finance' },
    { symbol: 'KO', name: 'Coca-Cola', sector: 'Consumer' },
];

/* ── Style helpers ── */
const S = {
    tile: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' } as React.CSSProperties,
    tileSel: { background: 'rgba(124,108,240,0.10)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' } as React.CSSProperties,
    label: { color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 } as React.CSSProperties,
};

/* ── Spinner ── */
const Spinner = () => (
    <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
);

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function OnboardingPage() {
    const { t, locale } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [fadeKey, setFadeKey] = useState(0);

    // Step 2: Profile
    const [experienceLevel, setExperienceLevel] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [riskLevel, setRiskLevel] = useState('');

    // Step 3: Stock picks + search
    const [selectedStocks, setSelectedStocks] = useState<string[]>([]);
    const [stockLogos, setStockLogos] = useState<Record<string, string>>({});
    const [stockSearch, setStockSearch] = useState('');
    const [searchResults, setSearchResults] = useState<{ symbol: string; name: string; logo?: string }[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Step 4: Lesson
    const [firstLesson, setFirstLesson] = useState<{ id: string; title: string; titleEn: string; duration: number; difficulty: string } | null>(null);

    /* ── Toggle stock selection (must be before early returns) ── */
    const toggleStock = useCallback((symbol: string) => {
        setSelectedStocks(prev =>
            prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]
        );
    }, []);

    /* ── Debounced stock search ── */
    useEffect(() => {
        if (searchDebounce.current) clearTimeout(searchDebounce.current);
        if (!stockSearch.trim()) { setSearchResults([]); return; }
        searchDebounce.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const results = await api.searchStocks(stockSearch);
                setSearchResults((results as any[]).slice(0, 8).map((r: any) => ({
                    symbol: r.symbol,
                    name: r.name,
                    logo: r.logo || '',
                })));
                /* eslint-enable @typescript-eslint/no-explicit-any */
            } catch { setSearchResults([]); }
            setSearchLoading(false);
        }, 300);
        return () => { if (searchDebounce.current) clearTimeout(searchDebounce.current); };
    }, [stockSearch]);

    /* ── Load stock logos on mount ── */
    useEffect(() => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        api.getPopularStocks().then((stocks: any[]) => {
            const map: Record<string, string> = {};
            stocks.forEach((s: any) => { if (s.logo) map[s.symbol] = s.logo; });
            setStockLogos(map);
        }).catch(() => {});

        api.getLessons().then(data => {
            const lessons = data.lessons || [];
            const beginner = lessons.find((l: any) => l.difficulty === 'beginner') || lessons[0];
            if (beginner) setFirstLesson(beginner);
        }).catch(() => {});
        /* eslint-enable @typescript-eslint/no-explicit-any */
    }, []);

    /* ── Auth guard ── */
    if (status === 'loading') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Spinner />
        </div>
    );
    if (!session?.user) { router.push('/login'); return null; }

    const userName = session.user.name || session.user.email?.split('@')[0] || '';

    /* ── Step transition ── */
    const goStep = (n: number) => {
        setFadeKey(k => k + 1);
        setStep(n);
        if (n === 4) {
            localStorage.setItem('finlearn_tour_ready', 'true');
        }
    };

    /* ── Step 2 handler: save profile ── */
    const handleSaveProfile = async () => {
        if (!experienceLevel || !primaryGoal) return;
        setLoading(true);
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    experienceLevel,
                    primaryGoal,
                    ...(riskLevel && { riskLevel }),
                    onboardingStep: 2,
                }),
            });
            goStep(3);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    /* ── Step 3 handler: add to watchlist ── */
    const handleAddWatchlist = async () => {
        setLoading(true);
        try {
            await Promise.all(
                selectedStocks.map(symbol =>
                    fetch('/api/watchlist', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ symbol }),
                    })
                )
            );
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onboardingStep: 3 }),
            });
            goStep(4);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    /* ── Step 3 skip ── */
    const handleSkipWatchlist = async () => {
        setLoading(true);
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onboardingStep: 3 }),
            });
            goStep(4);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const profileOk = experienceLevel && primaryGoal;

    /* ═══════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════ */
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* ── LEFT SIDEBAR (desktop) ── */}
            <aside
                className="hidden lg:flex"
                style={{
                    width: 300, flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between',
                    padding: '36px 32px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: 9, background: 'var(--gradient-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, color: 'white',
                    }}>F</div>
                    <span style={{ fontSize: '1rem', fontWeight: 750, letterSpacing: '-0.02em' }}>
                        Fin<span className="gradient-text">Learn</span>
                    </span>
                </div>

                {/* Step indicators */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {[
                        { n: 1, icon: Sparkles, label: locale === 'th' ? 'ยินดีต้อนรับ' : 'Welcome' },
                        { n: 2, icon: GraduationCap, label: locale === 'th' ? 'โปรไฟล์' : 'Profile' },
                        { n: 3, icon: Star, label: locale === 'th' ? 'เลือกหุ้น' : 'Pick Stocks' },
                        { n: 4, icon: LineChart, label: locale === 'th' ? 'เริ่มเรียน' : 'Start Learning' },
                    ].map(({ n, icon: Icon, label }) => {
                        const done = step > n;
                        const active = step === n;
                        return (
                            <div key={n} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                background: active ? 'rgba(124,108,240,0.08)' : 'transparent',
                                transition: 'all .2s var(--ease)',
                            }}>
                                <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: done ? 'var(--primary)' : active ? 'rgba(124,108,240,0.15)' : 'var(--tint-bg)',
                                    border: `1px solid ${done ? 'var(--primary)' : active ? 'var(--border-accent)' : 'var(--border)'}`,
                                    transition: 'all .2s var(--ease)',
                                }}>
                                    {done
                                        ? <Check size={13} style={{ color: 'white' }} />
                                        : <Icon size={13} style={{ color: active ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                                    }
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '0.62rem', fontWeight: 600, textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        color: done ? 'var(--success)' : active ? 'var(--primary-light)' : 'var(--text-muted)',
                                    }}>
                                        {t('onboard.step')} {n}
                                    </div>
                                    <div style={{
                                        fontSize: '0.82rem', fontWeight: active ? 600 : 400,
                                        color: active ? 'var(--text-primary)' : done ? 'var(--text-secondary)' : 'var(--text-muted)',
                                    }}>
                                        {label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {Math.round(((step - 1) / TOTAL_STEPS) * 100)}%
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{step}/{TOTAL_STEPS}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 100, background: 'var(--tint-bg-hover)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', borderRadius: 100, background: 'var(--gradient-primary)',
                            width: `${((step - 1) / TOTAL_STEPS) * 100}%`,
                            transition: 'width .5s var(--ease)',
                        }} />
                    </div>
                </div>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
                <div key={fadeKey} className="animate-fade-up" style={{ width: '100%', maxWidth: step === 3 ? 580 : 480 }}>

                    {/* Mobile top bar */}
                    <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>F</div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>FinLearn</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{step}/{TOTAL_STEPS}</span>
                    </div>

                    {/* ═══════ STEP 1: WELCOME ═══════ */}
                    {step === 1 && (
                        <div style={{ textAlign: 'center' }}>
                            {/* Animated gradient orb */}
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 28px',
                                background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 40px rgba(124,108,240,0.25)',
                                animation: 'float 3s ease-in-out infinite',
                            }}>
                                <Sparkles size={32} style={{ color: 'white' }} />
                            </div>

                            {/* Greeting */}
                            {userName && (
                                <p style={{ fontSize: '0.88rem', color: 'var(--primary-light)', fontWeight: 600, marginBottom: 6 }}>
                                    {t('onboard.welcome.hi')}, {userName}!
                                </p>
                            )}
                            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 12 }}>
                                {t('onboard.welcome.title')}
                            </h1>
                            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 36px' }}>
                                {t('onboard.welcome.subtitle')}
                            </p>

                            {/* Feature cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, textAlign: 'left', marginBottom: 36 }}>
                                {[
                                    { icon: BookOpen, text: t('onboard.welcome.feat1'), color: '#7c6cf0' },
                                    { icon: LineChart, text: t('onboard.welcome.feat2'), color: '#22c55e' },
                                    { icon: Shield, text: t('onboard.welcome.feat3'), color: '#fbbf24' },
                                    { icon: Star, text: t('onboard.welcome.feat4'), color: '#06b6d4' },
                                ].map(({ icon: Icon, text, color }, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '16px', borderRadius: 'var(--radius-md)',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                        transition: 'border-color .2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                                            background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Icon size={16} style={{ color }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA */}
                            <button onClick={() => goStep(2)}
                                className="btn"
                                style={{
                                    width: '100%', background: 'var(--gradient-primary)', color: '#fff',
                                    boxShadow: '0 4px 20px rgba(124,108,240,0.3)',
                                    padding: '14px 24px', fontSize: '0.95rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                {t('onboard.welcome.cta')} <ArrowRight size={18} />
                            </button>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 12 }}>
                                <Clock size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 4 }} />
                                {t('onboard.welcome.time')}
                            </p>
                        </div>
                    )}

                    {/* ═══════ STEP 2: PROFILE ═══════ */}
                    {step === 2 && (
                        <div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(124,108,240,0.08)', border: '1px solid rgba(124,108,240,0.2)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 14 }}>
                                <GraduationCap size={13} /> {t('onboard.step')} 2 {t('onboard.of')} {TOTAL_STEPS}
                            </span>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 4 }}>
                                {t('onboard.title1')}
                            </h1>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 28 }}>
                                {t('onboard.desc1')}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {/* Experience */}
                                <div>
                                    <div style={S.label}>{t('onboard.expLevel')}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        {expData.map(({ value, lk, dk, icon: Icon }) => {
                                            const sel = experienceLevel === value;
                                            return (
                                                <button key={value} onClick={() => setExperienceLevel(value)}
                                                    style={{ ...(sel ? S.tileSel : S.tile), padding: '18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', position: 'relative' }}
                                                >
                                                    {sel && <Check size={11} style={{ position: 'absolute', top: 8, right: 8, color: 'var(--primary-light)' }} />}
                                                    <Icon size={18} style={{ color: sel ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t(lk)}</span>
                                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{t(dk)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Goal */}
                                <div>
                                    <div style={S.label}>{t('onboard.goal')}</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {goalData.map(({ value, lk, dk, icon: Icon }) => {
                                            const sel = primaryGoal === value;
                                            return (
                                                <button key={value} onClick={() => setPrimaryGoal(value)}
                                                    style={{
                                                        ...(sel ? S.tileSel : { ...S.tile, background: 'transparent' }),
                                                        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left',
                                                    }}
                                                >
                                                    <Icon size={15} style={{ color: sel ? 'var(--primary-light)' : 'var(--text-muted)', flexShrink: 0 }} />
                                                    <div style={{ flex: 1 }}>
                                                        <span style={{ fontSize: '0.82rem', fontWeight: 550, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t(lk)}</span>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{t(dk)}</span>
                                                    </div>
                                                    {sel && <Check size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Risk */}
                                <div>
                                    <div style={S.label}>{t('onboard.riskLevel')} <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>({locale === 'th' ? 'ไม่บังคับ' : 'optional'})</span></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                        {riskData.map(({ value, lk, dk, color, bg, border }) => {
                                            const sel = riskLevel === value;
                                            return (
                                                <button key={value} onClick={() => setRiskLevel(sel ? '' : value)}
                                                    style={{
                                                        ...(sel ? { background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' } : S.tile),
                                                        padding: '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer', position: 'relative',
                                                    }}
                                                >
                                                    {sel && <Check size={11} style={{ position: 'absolute', top: 6, right: 6, color }} />}
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? bg : 'var(--tint-bg)' }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? color : 'var(--text-muted)' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t(lk)}</span>
                                                    <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{t(dk)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => goStep(1)} className="btn btn-secondary" style={{ gap: 4 }}>
                                        <ChevronLeft size={16} />{t('onboard.goBack')}
                                    </button>
                                    <button onClick={handleSaveProfile} disabled={!profileOk || loading}
                                        className="btn"
                                        style={profileOk && !loading
                                            ? { flex: 1, background: 'var(--gradient-primary)', color: '#fff', boxShadow: '0 2px 12px rgba(124,108,240,0.25)' }
                                            : { flex: 1, background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--border)' }}
                                    >
                                        {loading ? <Spinner /> : <>{t('onboard.next')} <ChevronRight size={16} /></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 3: PICK STOCKS ═══════ */}
                    {step === 3 && (
                        <div>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: 'rgba(124,108,240,0.08)', border: '1px solid rgba(124,108,240,0.2)', fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary-light)', marginBottom: 14 }}>
                                <Star size={13} /> {t('onboard.step')} 3 {t('onboard.of')} {TOTAL_STEPS}
                            </span>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: 4 }}>
                                {t('onboard.stocks.title')}
                            </h1>
                            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                                {t('onboard.stocks.desc')}
                            </p>

                            {/* Search bar */}
                            <div style={{ position: 'relative', marginBottom: 16 }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    transition: 'border-color .2s',
                                }}>
                                    <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                    <input
                                        type="text"
                                        value={stockSearch}
                                        onChange={e => setStockSearch(e.target.value)}
                                        placeholder={locale === 'th' ? 'ค้นหาหุ้น เช่น AAPL, Tesla...' : 'Search stocks e.g. AAPL, Tesla...'}
                                        style={{
                                            flex: 1, background: 'none', border: 'none', outline: 'none',
                                            color: 'var(--text-primary)', fontSize: '0.88rem', fontFamily: 'inherit',
                                        }}
                                    />
                                    {searchLoading && <Spinner />}
                                    {stockSearch && !searchLoading && (
                                        <button onClick={() => { setStockSearch(''); setSearchResults([]); }}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, display: 'flex' }}>
                                            <X size={15} />
                                        </button>
                                    )}
                                </div>

                                {/* Search results dropdown */}
                                {searchResults.length > 0 && (
                                    <div style={{
                                        position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                                        marginTop: 4, borderRadius: 'var(--radius-md)', overflow: 'hidden',
                                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                        boxShadow: 'var(--shadow-lg)',
                                    }}>
                                        {searchResults.map(r => {
                                            const sel = selectedStocks.includes(r.symbol);
                                            return (
                                                <button key={r.symbol}
                                                    onClick={() => { toggleStock(r.symbol); setStockSearch(''); setSearchResults([]); }}
                                                    style={{
                                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                                        padding: '10px 14px', border: 'none', cursor: 'pointer',
                                                        background: sel ? 'rgba(124,108,240,0.08)' : 'transparent',
                                                        color: 'inherit', fontFamily: 'inherit', textAlign: 'left',
                                                        transition: 'background .1s',
                                                    }}
                                                    onMouseEnter={e => { if (!sel) e.currentTarget.style.background = 'var(--tint-bg)'; }}
                                                    onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
                                                >
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: 8, flexShrink: 0, padding: 3,
                                                        background: 'var(--logo-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <StockLogo src={r.logo || ''} symbol={r.symbol} size={30} />
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{r.symbol}</span>
                                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>{r.name}</span>
                                                    </div>
                                                    {sel && <Check size={14} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Selection count */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <span style={{
                                    fontSize: '0.72rem', fontWeight: 600,
                                    color: selectedStocks.length > 0 ? 'var(--primary-light)' : 'var(--text-muted)',
                                }}>
                                    {selectedStocks.length > 0
                                        ? `${t('onboard.stocks.selected')} ${selectedStocks.length} ${t('onboard.stocks.items')}`
                                        : t('onboard.stocks.hint')}
                                </span>
                            </div>

                            {/* Stock grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10, marginBottom: 28 }}>
                                {ONBOARD_STOCKS.map(stock => {
                                    const sel = selectedStocks.includes(stock.symbol);
                                    const logo = stockLogos[stock.symbol];
                                    return (
                                        <button key={stock.symbol} onClick={() => toggleStock(stock.symbol)}
                                            style={{
                                                ...(sel ? S.tileSel : S.tile),
                                                padding: '16px 14px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                position: 'relative', textAlign: 'left',
                                            }}
                                        >
                                            {/* Checkmark */}
                                            {sel && (
                                                <div style={{
                                                    position: 'absolute', top: 6, right: 6,
                                                    width: 18, height: 18, borderRadius: '50%',
                                                    background: 'var(--primary)', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    <Check size={10} style={{ color: 'white' }} />
                                                </div>
                                            )}

                                            {/* Logo */}
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                                                background: 'var(--logo-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: 'var(--shadow-sm)', padding: 4,
                                            }}>
                                                <StockLogo src={logo || ''} symbol={stock.symbol} size={36} />
                                            </div>

                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                                                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => goStep(2)} className="btn btn-secondary" style={{ gap: 4 }}>
                                    <ChevronLeft size={16} />{t('onboard.goBack')}
                                </button>
                                <button onClick={selectedStocks.length > 0 ? handleAddWatchlist : handleSkipWatchlist}
                                    disabled={loading}
                                    className="btn"
                                    style={{
                                        flex: 1, background: selectedStocks.length > 0 ? 'var(--gradient-primary)' : 'var(--bg-elevated)',
                                        color: selectedStocks.length > 0 ? '#fff' : 'var(--text-secondary)',
                                        border: selectedStocks.length > 0 ? 'none' : '1px solid var(--border)',
                                        boxShadow: selectedStocks.length > 0 ? '0 2px 12px rgba(124,108,240,0.25)' : 'none',
                                    }}
                                >
                                    {loading ? <Spinner /> : selectedStocks.length > 0
                                        ? <>{t('onboard.stocks.addToWatchlist')} <ChevronRight size={16} /></>
                                        : <>{t('onboard.stocks.skipWatchlist')} <ChevronRight size={16} /></>
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 4: READY ═══════ */}
                    {step === 4 && (
                        <div style={{ textAlign: 'center' }}>
                            {/* Celebration icon */}
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                                background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                animation: 'float 3s ease-in-out infinite',
                            }}>
                                <Check size={36} style={{ color: '#22c55e' }} />
                            </div>

                            <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 1.8rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8 }}>
                                {t('onboard.ready.title')}
                            </h1>
                            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 32px' }}>
                                {t('onboard.ready.subtitle')}
                            </p>

                            {/* Summary cards */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, textAlign: 'left' }}>
                                {/* Profile */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(124,108,240,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <GraduationCap size={16} style={{ color: 'var(--primary-light)' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('onboard.ready.summary.profile')}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                            {t(`onboard.exp.${experienceLevel.toLowerCase()}`)} · {t(`onboard.goal.${primaryGoal === 'LEARN_BASICS' ? 'basics' : primaryGoal === 'VALUE' ? 'value' : primaryGoal === 'GROWTH' ? 'growth' : primaryGoal === 'DIVIDEND' ? 'dividend' : 'trading'}`)}
                                        </div>
                                    </div>
                                    <Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                </div>

                                {/* Watchlist */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(250,204,21,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Star size={16} style={{ color: '#facc15' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {selectedStocks.length > 0 ? t('onboard.ready.summary.watchlist') : t('onboard.ready.summary.watchlistEmpty')}
                                        </div>
                                        {selectedStocks.length > 0 && (
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {selectedStocks.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                    {selectedStocks.length > 0 && <Check size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                                </div>
                            </div>

                            {/* Recommended lesson */}
                            {firstLesson && (
                                <div style={{ marginBottom: 28, textAlign: 'left' }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                        {t('onboard.ready.lesson')}
                                    </div>
                                    <Link href={`/learn/${firstLesson.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '16px', borderRadius: 'var(--radius-md)',
                                            background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                                            cursor: 'pointer', transition: 'all .2s var(--ease)',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.background = 'rgba(124,108,240,0.04)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-card-solid)'; }}
                                        >
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 12,
                                                background: 'var(--gradient-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <BookOpen size={20} style={{ color: 'white' }} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>
                                                    {locale === 'en' ? firstLesson.titleEn : firstLesson.title}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} /> {firstLesson.duration} {locale === 'th' ? 'นาที' : 'min'}</span>
                                                    <span style={{ padding: '1px 6px', borderRadius: 4, background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '0.62rem', fontWeight: 600 }}>
                                                        {locale === 'th' ? 'มือใหม่' : 'Beginner'}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                        </div>
                                    </Link>
                                </div>
                            )}

                            {/* CTAs */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {firstLesson && (
                                    <Link href={`/learn/${firstLesson.id}`} style={{ textDecoration: 'none' }}>
                                        <button className="btn" style={{
                                            width: '100%', background: 'var(--gradient-primary)', color: '#fff',
                                            boxShadow: '0 4px 20px rgba(124,108,240,0.3)', padding: '14px 24px',
                                            fontSize: '0.92rem', fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        }}>
                                            <BookOpen size={18} /> {t('onboard.ready.startLesson')}
                                        </button>
                                    </Link>
                                )}
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <Link href="/stocks" style={{ flex: 1, textDecoration: 'none' }}>
                                        <button className="btn btn-secondary" style={{ width: '100%', gap: 6 }}>
                                            <LineChart size={15} /> {t('onboard.ready.explore')}
                                        </button>
                                    </Link>
                                    <Link href="/" style={{ flex: 1, textDecoration: 'none' }}>
                                        <button className="btn btn-secondary" style={{ width: '100%', gap: 6 }}>
                                            {t('onboard.ready.goHome')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
