'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    User, GraduationCap, Target, Shield, ChevronRight, ChevronLeft,
    BookOpen, TrendingUp, Coins, BarChart3, Zap, Check, BarChart2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const expData = [
    { value: 'BEGINNER',     labelKey: 'onboard.exp.beginner',     descKey: 'onboard.exp.beginnerDesc',     icon: BookOpen },
    { value: 'INTERMEDIATE', labelKey: 'onboard.exp.intermediate', descKey: 'onboard.exp.intermediateDesc', icon: TrendingUp },
    { value: 'ADVANCED',     labelKey: 'onboard.exp.advanced',     descKey: 'onboard.exp.advancedDesc',     icon: Zap },
];

const goalData = [
    { value: 'LEARN_BASICS', labelKey: 'onboard.goal.basics',   descKey: 'onboard.goal.basicsDesc',   icon: BookOpen },
    { value: 'VALUE',        labelKey: 'onboard.goal.value',    descKey: 'onboard.goal.valueDesc',    icon: Target },
    { value: 'GROWTH',       labelKey: 'onboard.goal.growth',   descKey: 'onboard.goal.growthDesc',   icon: TrendingUp },
    { value: 'DIVIDEND',     labelKey: 'onboard.goal.dividend', descKey: 'onboard.goal.dividendDesc', icon: Coins },
    { value: 'TRADING_EDU', labelKey: 'onboard.goal.trading',  descKey: 'onboard.goal.tradingDesc',  icon: BarChart3 },
];

const riskData = [
    { value: 'LOW',    labelKey: 'onboard.risk.low',    descKey: 'onboard.risk.lowDesc',    color: '#22c55e' },
    { value: 'MEDIUM', labelKey: 'onboard.risk.medium', descKey: 'onboard.risk.mediumDesc', color: '#f59e0b' },
    { value: 'HIGH',   labelKey: 'onboard.risk.high',   descKey: 'onboard.risk.highDesc',   color: '#ef4444' },
];

const cashPresets = ['10000', '50000', '100000'];

function Spinner() {
    return (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

export default function OnboardingPage() {
    const { t, locale } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [displayName, setDisplayName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [riskLevel, setRiskLevel] = useState('');
    const [startingCash, setStartingCash] = useState('100000');

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e0e0e' }}>
                <div className="w-5 h-5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    if (!session?.user) { router.push('/login'); return null; }

    const handleStep1 = async () => {
        if (!displayName.trim() || !experienceLevel || !primaryGoal) return;
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: displayName, displayName, experienceLevel, primaryGoal, onboardingStep: 2 }),
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

    const step1Complete = displayName.trim() && experienceLevel && primaryGoal;

    const panelFeatures = {
        1: locale === 'th'
            ? ['บทเรียนที่เหมาะกับระดับของคุณ', 'เนื้อหาตรงกับเป้าหมายการลงทุน', 'ประสบการณ์ที่ปรับแต่งได้']
            : ['Lessons tailored to your level', 'Content aligned with your goals', 'Personalized recommendations'],
        2: locale === 'th'
            ? ['เงินจำลอง — ไม่มีความเสี่ยงจริง', 'ซื้อขายหุ้นด้วยราคาตลาดจริง', 'ติดตามพอร์ตและ P&L แบบ Real-time']
            : ['Virtual cash — zero real risk', 'Trade with real market prices', 'Track portfolio & P&L in real time'],
    } as Record<number, string[]>;

    return (
        <div className="min-h-screen flex" style={{ background: '#0e0e0e' }}>

            {/* ─────────────── LEFT PANEL ─────────────── */}
            <aside
                className="hidden lg:flex flex-col justify-between p-10 shrink-0"
                style={{ width: '320px', background: '#080808', borderRight: '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Brand */}
                <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#3a3a3a' }}>fin.learn</span>

                {/* Context block */}
                <div className="space-y-6">
                    <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.18)' }}
                    >
                        {step === 1
                            ? <GraduationCap className="w-5 h-5" style={{ color: '#22c55e' }} />
                            : <BarChart2 className="w-5 h-5" style={{ color: '#22c55e' }} />
                        }
                    </div>

                    <div>
                        <h2 className="text-[15px] font-semibold leading-snug" style={{ color: '#c8c8c8' }}>
                            {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                        </h2>
                        <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: '#4a4a4a' }}>
                            {step === 1 ? t('onboard.desc1') : t('onboard.desc2')}
                        </p>
                    </div>

                    <ul className="space-y-3">
                        {panelFeatures[step].map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <div
                                    className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                                    style={{ background: 'rgba(34,197,94,0.12)' }}
                                >
                                    <Check className="w-2.5 h-2.5" style={{ color: '#22c55e' }} />
                                </div>
                                <span className="text-[13px] leading-snug" style={{ color: '#555' }}>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Step pip indicator */}
                <div className="flex items-center gap-2">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className="h-[3px] rounded-full transition-all duration-400"
                            style={{
                                width: step === s ? '28px' : '10px',
                                background: step >= s ? '#22c55e' : 'rgba(255,255,255,0.08)',
                            }}
                        />
                    ))}
                    <span className="text-[11px] ml-1" style={{ color: '#3a3a3a' }}>{step} / 2</span>
                </div>
            </aside>

            {/* ─────────────── RIGHT PANEL ─────────────── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-14 overflow-y-auto">
                <div className="w-full max-w-[440px] space-y-8">

                    {/* Mobile header */}
                    <div className="lg:hidden flex items-center justify-between">
                        <span className="text-xs tracking-[0.2em] uppercase" style={{ color: '#3a3a3a' }}>fin.learn</span>
                        <span className="text-xs" style={{ color: '#444' }}>{step} / 2</span>
                    </div>

                    {/* Page heading */}
                    <div>
                        <p className="text-[11px] font-semibold tracking-widest uppercase mb-2" style={{ color: '#22c55e' }}>
                            {t('onboard.step')} {step} {t('onboard.of')} 2
                        </p>
                        <h1 className="text-[26px] font-semibold tracking-tight leading-tight" style={{ color: '#e0e0e0' }}>
                            {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                        </h1>
                    </div>

                    {step === 1 ? (
                        <div className="space-y-7">

                            {/* ── Name ── */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-2.5" style={{ color: '#555' }}>
                                    <User className="w-3 h-3" />{t('onboard.displayName')}
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={session.user.name || t('onboard.yourName')}
                                    autoFocus
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#e0e0e0',
                                        caretColor: '#22c55e',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.45)')}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                                />
                            </div>

                            {/* ── Experience — 3 column tiles ── */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#555' }}>
                                    <GraduationCap className="w-3 h-3" />{t('onboard.expLevel')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {expData.map(({ value, labelKey, descKey, icon: Icon }) => {
                                        const sel = experienceLevel === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setExperienceLevel(value)}
                                                className="relative flex flex-col items-center gap-2 py-5 px-2 rounded-2xl transition-all duration-150"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.35)' }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }
                                                }
                                            >
                                                {sel && (
                                                    <span className="absolute top-2.5 right-2.5">
                                                        <Check className="w-3 h-3" style={{ color: '#22c55e' }} />
                                                    </span>
                                                )}
                                                <Icon className="w-[18px] h-[18px]" style={{ color: sel ? '#22c55e' : '#444' }} />
                                                <span className="text-[11px] font-semibold text-center leading-tight" style={{ color: sel ? '#e0e0e0' : '#666' }}>
                                                    {t(labelKey)}
                                                </span>
                                                <span className="text-[10px] text-center leading-tight" style={{ color: '#3a3a3a' }}>
                                                    {t(descKey)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Goal ── */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#555' }}>
                                    <Target className="w-3 h-3" />{t('onboard.goal')}
                                </label>
                                <div className="space-y-1.5">
                                    {goalData.map(({ value, labelKey, descKey, icon: Icon }) => {
                                        const sel = primaryGoal === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setPrimaryGoal(value)}
                                                className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left transition-all duration-150"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.28)' }
                                                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.06)' }
                                                }
                                            >
                                                <Icon className="w-4 h-4 shrink-0" style={{ color: sel ? '#22c55e' : '#444' }} />
                                                <div className="flex-1">
                                                    <span className="text-[13px] font-medium" style={{ color: sel ? '#e0e0e0' : '#999' }}>
                                                        {t(labelKey)}
                                                    </span>
                                                    <span className="text-[11px] ml-2" style={{ color: '#444' }}>
                                                        {t(descKey)}
                                                    </span>
                                                </div>
                                                {sel && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#22c55e' }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Next ── */}
                            <button
                                onClick={handleStep1}
                                disabled={!step1Complete || loading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                                style={step1Complete && !loading
                                    ? { background: '#22c55e', color: '#080808' }
                                    : { background: 'rgba(255,255,255,0.04)', color: '#333', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.06)' }
                                }
                            >
                                {loading
                                    ? <><Spinner /><span>{t('onboard.saving')}</span></>
                                    : <><span>{t('onboard.next')}</span><ChevronRight className="w-4 h-4" /></>
                                }
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-7">

                            {/* ── Risk — 3 column tiles ── */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#555' }}>
                                    <Shield className="w-3 h-3" />{t('onboard.riskLevel')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {riskData.map(({ value, labelKey, descKey, color }) => {
                                        const sel = riskLevel === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setRiskLevel(value)}
                                                className="relative flex flex-col items-center gap-2.5 py-5 px-2 rounded-2xl transition-all duration-150"
                                                style={sel
                                                    ? { background: `${color}12`, border: `1px solid ${color}45` }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }
                                                }
                                            >
                                                {sel && (
                                                    <span className="absolute top-2.5 right-2.5">
                                                        <Check className="w-3 h-3" style={{ color }} />
                                                    </span>
                                                )}
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center"
                                                    style={{ background: sel ? `${color}20` : 'rgba(255,255,255,0.04)' }}
                                                >
                                                    <div className="w-3 h-3 rounded-full" style={{ background: sel ? color : '#2a2a2a' }} />
                                                </div>
                                                <span className="text-[11px] font-semibold" style={{ color: sel ? '#e0e0e0' : '#666' }}>
                                                    {t(labelKey)}
                                                </span>
                                                <span className="text-[10px] text-center leading-tight px-1" style={{ color: '#3a3a3a' }}>
                                                    {t(descKey)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Starting cash ── */}
                            <div>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: '#555' }}>
                                    <Coins className="w-3 h-3" />{t('onboard.startCash')}
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-2.5">
                                    {cashPresets.map((amount) => {
                                        const sel = startingCash === amount;
                                        return (
                                            <button
                                                key={amount}
                                                onClick={() => setStartingCash(amount)}
                                                className="py-3 rounded-xl text-[13px] font-medium transition-all"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', color: '#666' }
                                                }
                                            >
                                                ${Number(amount).toLocaleString()}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="number"
                                    value={startingCash}
                                    onChange={(e) => setStartingCash(e.target.value)}
                                    placeholder={t('onboard.orEnter')}
                                    className="w-full px-4 py-3.5 rounded-xl text-sm outline-none"
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#e0e0e0',
                                        caretColor: '#22c55e',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.45)')}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                                />
                            </div>

                            {/* ── Actions ── */}
                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#666' }}
                                >
                                    <ChevronLeft className="w-4 h-4" />{t('onboard.goBack')}
                                </button>
                                <button
                                    onClick={handleStep2}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all"
                                    style={{ background: '#22c55e', color: '#080808' }}
                                >
                                    {loading
                                        ? <><Spinner /><span>{t('onboard.saving')}</span></>
                                        : t('onboard.start')
                                    }
                                </button>
                            </div>

                            <button
                                onClick={handleSkip}
                                className="w-full py-1 text-[11px] text-center transition-colors"
                                style={{ color: '#333' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#666')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#333')}
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
