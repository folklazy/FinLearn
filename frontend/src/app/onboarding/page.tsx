'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    GraduationCap, Target, ChevronRight, ChevronLeft,
    BookOpen, TrendingUp, Coins, BarChart3, Zap, Check, BarChart2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

/* ── Data ── */
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
const cashPresets = ['10000', '50000', '100000'];

/* ── Shared inline-style helpers (match globals.css tokens) ── */
const S = {
    tile: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' } as React.CSSProperties,
    tileSel: { background: 'rgba(124,108,240,0.10)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' } as React.CSSProperties,
    label: { color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 10 },
};

export default function OnboardingPage() {
    const { t, locale } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [experienceLevel, setExperienceLevel] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [riskLevel, setRiskLevel] = useState('');
    const [startingCash, setStartingCash] = useState('100000');

    if (status === 'loading') return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 18, height: 18, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
        </div>
    );
    if (!session?.user) { router.push('/login'); return null; }

    const handleStep1 = async () => {
        if (!experienceLevel || !primaryGoal) return;
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experienceLevel, primaryGoal, onboardingStep: 2 }),
            });
            if (res.ok) setStep(2);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleStep2 = async () => {
        setLoading(true);
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(riskLevel && { riskLevel }),
                    ...(startingCash && { simulatorStartingCash: parseFloat(startingCash) }),
                    onboardingStep: 3,
                }),
            });
            router.push('/');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleSkip = async () => {
        setLoading(true);
        try {
            await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ onboardingStep: 3 }),
            });
            router.push('/');
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const step1Ok = experienceLevel && primaryGoal;

    const features = {
        1: locale === 'th'
            ? ['บทเรียนที่เหมาะกับระดับของคุณ', 'เนื้อหาตรงกับเป้าหมายการลงทุน', 'ประสบการณ์ที่ปรับแต่งได้']
            : ['Lessons tailored to your level', 'Content aligned with your goals', 'Personalized recommendations'],
        2: locale === 'th'
            ? ['เงินจำลอง — ไม่มีความเสี่ยงจริง', 'ซื้อขายหุ้นด้วยราคาตลาดจริง', 'ติดตามพอร์ตและ P&L แบบ Real-time']
            : ['Virtual cash — zero real risk', 'Trade with real market prices', 'Track portfolio & P&L in real time'],
    } as Record<number, string[]>;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>

            {/* ── LEFT PANEL ── */}
            <aside
                className="hidden lg:flex"
                style={{
                    width: 280, flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between',
                    padding: '32px 28px', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
                }}
            >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    FinLearn
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(124,108,240,0.10)', border: '1px solid rgba(124,108,240,0.2)',
                    }}>
                        {step === 1
                            ? <GraduationCap size={16} style={{ color: 'var(--primary-light)' }} />
                            : <BarChart2 size={16} style={{ color: 'var(--primary-light)' }} />}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                            {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                        </h2>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            {step === 1 ? t('onboard.desc1') : t('onboard.desc2')}
                        </p>
                    </div>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0 }}>
                        {features[step].map((f, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                <Check size={12} style={{ color: 'var(--primary-light)', marginTop: 3, flexShrink: 0 }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {[1, 2].map((s) => (
                        <div key={s} style={{
                            height: 3, borderRadius: 100, transition: 'all .3s var(--ease)',
                            width: step === s ? 22 : 8,
                            background: step >= s ? 'var(--primary)' : 'var(--border)',
                        }} />
                    ))}
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: 2 }}>{step}/2</span>
                </div>
            </aside>

            {/* ── RIGHT PANEL ── */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: 440 }}>

                    {/* Mobile bar */}
                    <div className="lg:hidden" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>FinLearn</span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{step}/2</span>
                    </div>

                    {/* Step badge */}
                    <span className="badge badge-primary" style={{ marginBottom: 12, fontSize: '0.72rem' }}>
                        {t('onboard.step')} {step} {t('onboard.of')} 2
                    </span>

                    <h1 style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: 0 }}>
                        {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                    </h1>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 6, marginBottom: 28 }}>
                        {step === 1 ? t('onboard.desc1') : t('onboard.desc2')}
                    </p>

                    {step === 1 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Experience — 3 col tiles */}
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

                            {/* Goal — rows */}
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

                            {/* CTA */}
                            <button onClick={handleStep1} disabled={!step1Ok || loading}
                                className="btn"
                                style={step1Ok && !loading
                                    ? { width: '100%', background: 'var(--gradient-primary)', color: '#fff', boxShadow: '0 2px 12px rgba(124,108,240,0.25)' }
                                    : { width: '100%', background: 'var(--bg-elevated)', color: 'var(--text-muted)', cursor: 'not-allowed', border: '1px solid var(--border)' }}
                            >
                                {loading
                                    ? <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                                    : <>{t('onboard.next')}<ChevronRight size={16} /></>}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                            {/* Risk — 3 col tiles */}
                            <div>
                                <div style={S.label}>{t('onboard.riskLevel')}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                    {riskData.map(({ value, lk, dk, color, bg, border }) => {
                                        const sel = riskLevel === value;
                                        return (
                                            <button key={value} onClick={() => setRiskLevel(value)}
                                                style={{
                                                    ...(sel
                                                        ? { background: bg, border: `1px solid ${border}`, borderRadius: 'var(--radius-md)', transition: 'all .15s var(--ease)' }
                                                        : S.tile),
                                                    padding: '18px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer', position: 'relative',
                                                }}
                                            >
                                                {sel && <Check size={11} style={{ position: 'absolute', top: 8, right: 8, color }} />}
                                                <div style={{
                                                    width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    background: sel ? `${bg}` : 'rgba(255,255,255,0.04)',
                                                }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sel ? color : 'var(--text-muted)' }} />
                                                </div>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: sel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t(lk)}</span>
                                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{t(dk)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cash presets */}
                            <div>
                                <div style={S.label}>{t('onboard.startCash')}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 8 }}>
                                    {cashPresets.map((amt) => {
                                        const sel = startingCash === amt;
                                        return (
                                            <button key={amt} onClick={() => setStartingCash(amt)}
                                                style={{
                                                    ...(sel ? S.tileSel : S.tile),
                                                    padding: '10px 0', textAlign: 'center', fontSize: '0.82rem', fontWeight: 550, cursor: 'pointer',
                                                    color: sel ? 'var(--primary-light)' : 'var(--text-secondary)',
                                                }}
                                            >
                                                ${Number(amt).toLocaleString()}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="number" value={startingCash}
                                    onChange={(e) => setStartingCash(e.target.value)}
                                    placeholder={t('onboard.orEnter')}
                                    className="input"
                                    style={{ fontSize: '0.82rem' }}
                                />
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ gap: 4 }}>
                                    <ChevronLeft size={16} />{t('onboard.goBack')}
                                </button>
                                <button onClick={handleStep2} disabled={loading}
                                    className="btn btn-primary" style={{ flex: 1 }}
                                >
                                    {loading
                                        ? <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                                        : t('onboard.start')}
                                </button>
                            </div>

                            <button onClick={handleSkip}
                                style={{ width: '100%', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', transition: 'color .15s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                                {t('onboard.skip')}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
