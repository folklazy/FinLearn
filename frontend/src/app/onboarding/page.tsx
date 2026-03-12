'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    GraduationCap, Target, ChevronRight, ChevronLeft,
    BookOpen, TrendingUp, Coins, BarChart3, Zap, Check, BarChart2,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

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
    { value: 'LOW', lk: 'onboard.risk.low', dk: 'onboard.risk.lowDesc', color: '#22c55e' },
    { value: 'MEDIUM', lk: 'onboard.risk.medium', dk: 'onboard.risk.mediumDesc', color: '#f59e0b' },
    { value: 'HIGH', lk: 'onboard.risk.high', dk: 'onboard.risk.highDesc', color: '#ef4444' },
];

const cashPresets = ['10000', '50000', '100000'];

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
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#0e0e0e' }}>
            <div className="w-4 h-4 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
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
        <div className="min-h-screen flex" style={{ background: '#0e0e0e' }}>

            {/* ── LEFT ── */}
            <aside
                className="hidden lg:flex flex-col justify-between shrink-0 px-8 py-8"
                style={{ width: '280px', background: '#080808', borderRight: '1px solid rgba(255,255,255,0.04)' }}
            >
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color: '#2a2a2a' }}>
                    fin.learn
                </span>

                <div className="space-y-5">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(34,197,94,0.08)' }}
                    >
                        {step === 1
                            ? <GraduationCap className="w-4 h-4" style={{ color: '#22c55e' }} />
                            : <BarChart2 className="w-4 h-4" style={{ color: '#22c55e' }} />}
                    </div>
                    <div>
                        <h2 className="text-[13px] font-medium" style={{ color: '#999' }}>
                            {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                        </h2>
                        <p className="mt-1 text-[12px] leading-relaxed" style={{ color: '#3a3a3a' }}>
                            {step === 1 ? t('onboard.desc1') : t('onboard.desc2')}
                        </p>
                    </div>
                    <ul className="space-y-2.5">
                        {features[step].map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: '#22c55e' }} />
                                <span className="text-[11px] leading-snug" style={{ color: '#444' }}>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex items-center gap-1.5">
                    {[1, 2].map((s) => (
                        <div
                            key={s}
                            className="h-[2px] rounded-full transition-all duration-300"
                            style={{ width: step === s ? '20px' : '8px', background: step >= s ? '#22c55e' : 'rgba(255,255,255,0.06)' }}
                        />
                    ))}
                    <span className="text-[10px] ml-1" style={{ color: '#2a2a2a' }}>{step}/2</span>
                </div>
            </aside>

            {/* ── RIGHT ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 overflow-y-auto">
                <div className="w-full max-w-[420px]">

                    {/* Mobile bar */}
                    <div className="lg:hidden flex items-center justify-between mb-6">
                        <span className="text-[10px] tracking-[0.25em] uppercase" style={{ color: '#2a2a2a' }}>fin.learn</span>
                        <span className="text-[10px]" style={{ color: '#333' }}>{step}/2</span>
                    </div>

                    {/* Heading */}
                    <p className="text-[10px] font-semibold tracking-[0.2em] uppercase" style={{ color: '#22c55e' }}>
                        {t('onboard.step')} {step} {t('onboard.of')} 2
                    </p>
                    <h1 className="mt-1 text-xl font-semibold tracking-tight" style={{ color: '#e0e0e0' }}>
                        {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                    </h1>

                    {step === 1 ? (
                        <div className="mt-6 space-y-6">

                            {/* Experience — 3 col */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 block" style={{ color: '#444' }}>
                                    {t('onboard.expLevel')}
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {expData.map(({ value, lk, dk, icon: Icon }) => {
                                        const sel = experienceLevel === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setExperienceLevel(value)}
                                                className="relative flex flex-col items-center gap-1.5 py-4 rounded-xl transition-all duration-100"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.3)' }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                {sel && <Check className="absolute top-2 right-2 w-2.5 h-2.5" style={{ color: '#22c55e' }} />}
                                                <Icon className="w-4 h-4" style={{ color: sel ? '#22c55e' : '#333' }} />
                                                <span className="text-[11px] font-medium" style={{ color: sel ? '#ddd' : '#555' }}>{t(lk)}</span>
                                                <span className="text-[9px] px-1 text-center leading-tight" style={{ color: '#333' }}>{t(dk)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Goal */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 block" style={{ color: '#444' }}>
                                    {t('onboard.goal')}
                                </label>
                                <div className="space-y-1">
                                    {goalData.map(({ value, lk, dk, icon: Icon }) => {
                                        const sel = primaryGoal === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setPrimaryGoal(value)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-100"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }
                                                    : { background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}
                                            >
                                                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: sel ? '#22c55e' : '#333' }} />
                                                <span className="flex-1 text-[12px]" style={{ color: sel ? '#ddd' : '#777' }}>
                                                    {t(lk)}
                                                    <span className="ml-1.5 text-[10px]" style={{ color: '#333' }}>{t(dk)}</span>
                                                </span>
                                                {sel && <Check className="w-3 h-3 shrink-0" style={{ color: '#22c55e' }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Next */}
                            <button
                                onClick={handleStep1}
                                disabled={!step1Ok || loading}
                                className="w-full flex items-center justify-center gap-1.5 py-3 rounded-lg text-[13px] font-semibold transition-all"
                                style={step1Ok && !loading
                                    ? { background: '#22c55e', color: '#080808' }
                                    : { background: 'rgba(255,255,255,0.03)', color: '#2a2a2a', cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.05)' }}
                            >
                                {loading
                                    ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    : <>{t('onboard.next')}<ChevronRight className="w-3.5 h-3.5" /></>}
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 space-y-6">

                            {/* Risk — 3 col */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 block" style={{ color: '#444' }}>
                                    {t('onboard.riskLevel')}
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {riskData.map(({ value, lk, dk, color }) => {
                                        const sel = riskLevel === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => setRiskLevel(value)}
                                                className="relative flex flex-col items-center gap-2 py-4 rounded-xl transition-all duration-100"
                                                style={sel
                                                    ? { background: `${color}0d`, border: `1px solid ${color}40` }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                {sel && <Check className="absolute top-2 right-2 w-2.5 h-2.5" style={{ color }} />}
                                                <div
                                                    className="w-6 h-6 rounded-full flex items-center justify-center"
                                                    style={{ background: sel ? `${color}1a` : 'rgba(255,255,255,0.03)' }}
                                                >
                                                    <div className="w-2 h-2 rounded-full" style={{ background: sel ? color : '#222' }} />
                                                </div>
                                                <span className="text-[11px] font-medium" style={{ color: sel ? '#ddd' : '#555' }}>{t(lk)}</span>
                                                <span className="text-[9px] px-1 text-center leading-tight" style={{ color: '#333' }}>{t(dk)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cash */}
                            <div>
                                <label className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2 block" style={{ color: '#444' }}>
                                    {t('onboard.startCash')}
                                </label>
                                <div className="grid grid-cols-3 gap-1.5 mb-2">
                                    {cashPresets.map((amt) => {
                                        const sel = startingCash === amt;
                                        return (
                                            <button
                                                key={amt}
                                                onClick={() => setStartingCash(amt)}
                                                className="py-2.5 rounded-lg text-[12px] font-medium transition-all"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }
                                                    : { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#555' }}
                                            >
                                                ${Number(amt).toLocaleString()}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    type="number"
                                    value={startingCash}
                                    onChange={(e) => setStartingCash(e.target.value)}
                                    placeholder={t('onboard.orEnter')}
                                    className="w-full px-3 py-2.5 rounded-lg text-[12px] outline-none"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#ccc', caretColor: '#22c55e', transition: 'border-color .15s' }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.4)')}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1 px-3 py-3 rounded-lg text-[12px] font-medium transition-all"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#555' }}
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" />{t('onboard.goBack')}
                                </button>
                                <button
                                    onClick={handleStep2}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg text-[13px] font-semibold transition-all"
                                    style={{ background: '#22c55e', color: '#080808' }}
                                >
                                    {loading
                                        ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        : t('onboard.start')}
                                </button>
                            </div>

                            <button
                                onClick={handleSkip}
                                className="w-full text-[10px] text-center transition-colors py-0.5"
                                style={{ color: '#2a2a2a' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#555')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#2a2a2a')}
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
