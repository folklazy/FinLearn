'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    User, GraduationCap, Target, Shield, ChevronRight, ChevronLeft,
    BookOpen, TrendingUp, Coins, BarChart3, Zap, Check,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const experienceLevelsData = [
    { value: 'BEGINNER', labelKey: 'onboard.exp.beginner', descKey: 'onboard.exp.beginnerDesc', icon: BookOpen },
    { value: 'INTERMEDIATE', labelKey: 'onboard.exp.intermediate', descKey: 'onboard.exp.intermediateDesc', icon: TrendingUp },
    { value: 'ADVANCED', labelKey: 'onboard.exp.advanced', descKey: 'onboard.exp.advancedDesc', icon: Zap },
];

const primaryGoalsData = [
    { value: 'LEARN_BASICS', labelKey: 'onboard.goal.basics', descKey: 'onboard.goal.basicsDesc', icon: BookOpen },
    { value: 'VALUE', labelKey: 'onboard.goal.value', descKey: 'onboard.goal.valueDesc', icon: Target },
    { value: 'GROWTH', labelKey: 'onboard.goal.growth', descKey: 'onboard.goal.growthDesc', icon: TrendingUp },
    { value: 'DIVIDEND', labelKey: 'onboard.goal.dividend', descKey: 'onboard.goal.dividendDesc', icon: Coins },
    { value: 'TRADING_EDU', labelKey: 'onboard.goal.trading', descKey: 'onboard.goal.tradingDesc', icon: BarChart3 },
];

const riskLevelsData = [
    { value: 'LOW', labelKey: 'onboard.risk.low', descKey: 'onboard.risk.lowDesc', color: '#22c55e', dot: 'bg-[#22c55e]' },
    { value: 'MEDIUM', labelKey: 'onboard.risk.medium', descKey: 'onboard.risk.mediumDesc', color: '#f59e0b', dot: 'bg-[#f59e0b]' },
    { value: 'HIGH', labelKey: 'onboard.risk.high', descKey: 'onboard.risk.highDesc', color: '#ef4444', dot: 'bg-[#ef4444]' },
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
    const { t } = useI18n();
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

    if (!session?.user) {
        router.push('/login');
        return null;
    }

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
        } catch (err) {
            console.error('Error saving step 1:', err);
        } finally {
            setLoading(false);
        }
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
        } catch (err) {
            console.error('Error saving step 2:', err);
        } finally {
            setLoading(false);
        }
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
        } catch (err) {
            console.error('Error skipping:', err);
        } finally {
            setLoading(false);
        }
    };

    const step1Complete = displayName.trim() && experienceLevel && primaryGoal;

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 py-16"
            style={{ background: '#0e0e0e' }}
        >
            <div className="w-full max-w-[480px]">

                {/* ── Brand ── */}
                <div className="mb-10 text-center">
                    <span className="text-[13px] font-medium tracking-widest uppercase" style={{ color: '#555' }}>
                        fin.learn
                    </span>
                </div>

                {/* ── Step indicator ── */}
                <div className="flex items-center gap-3 mb-8">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3 flex-1">
                            <div
                                className="flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-semibold shrink-0 transition-all duration-300"
                                style={
                                    step === s
                                        ? { background: '#22c55e', color: '#0e0e0e' }
                                        : step > s
                                        ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                                        : { background: 'rgba(255,255,255,0.04)', color: '#555', border: '1px solid rgba(255,255,255,0.08)' }
                                }
                            >
                                {step > s ? <Check className="w-3 h-3" /> : s}
                            </div>
                            {s < 2 && (
                                <div
                                    className="flex-1 h-px transition-all duration-500"
                                    style={{ background: step > 1 ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)' }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Heading ── */}
                <div className="mb-8">
                    <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: '#e0e0e0' }}>
                        {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: '#666' }}>
                        {step === 1 ? t('onboard.desc1') : t('onboard.desc2')}
                    </p>
                </div>

                {/* ── Card ── */}
                <div
                    className="rounded-2xl p-6 space-y-6"
                    style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                    {step === 1 ? (
                        <>
                            {/* Name */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: '#666' }}>
                                    <User className="w-3.5 h-3.5" />
                                    {t('onboard.displayName')}
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={session.user.name || t('onboard.yourName')}
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: displayName ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.08)',
                                        color: '#e0e0e0',
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(34,197,94,0.35)')}
                                    onBlur={(e) => (e.currentTarget.style.border = displayName ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(255,255,255,0.08)')}
                                />
                            </div>

                            {/* Experience */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: '#666' }}>
                                    <GraduationCap className="w-3.5 h-3.5" />
                                    {t('onboard.expLevel')}
                                </label>
                                <div className="space-y-2">
                                    {experienceLevelsData.map((level) => {
                                        const Icon = level.icon;
                                        const sel = experienceLevel === level.value;
                                        return (
                                            <button
                                                key={level.value}
                                                onClick={() => setExperienceLevel(level.value)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                                                style={{
                                                    background: sel ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                                    border: sel ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                <div
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                                                    style={{ background: sel ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)' }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" style={{ color: sel ? '#22c55e' : '#555' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: sel ? '#e0e0e0' : '#aaa' }}>
                                                        {t(level.labelKey)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: '#555' }}>
                                                        {t(level.descKey)}
                                                    </p>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all"
                                                    style={sel
                                                        ? { background: '#22c55e', borderColor: '#22c55e' }
                                                        : { borderColor: 'rgba(255,255,255,0.15)' }
                                                    }
                                                >
                                                    {sel && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Goal */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: '#666' }}>
                                    <Target className="w-3.5 h-3.5" />
                                    {t('onboard.goal')}
                                </label>
                                <div className="space-y-2">
                                    {primaryGoalsData.map((goal) => {
                                        const Icon = goal.icon;
                                        const sel = primaryGoal === goal.value;
                                        return (
                                            <button
                                                key={goal.value}
                                                onClick={() => setPrimaryGoal(goal.value)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                                                style={{
                                                    background: sel ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.03)',
                                                    border: sel ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.06)',
                                                }}
                                            >
                                                <div
                                                    className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                                                    style={{ background: sel ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)' }}
                                                >
                                                    <Icon className="w-3.5 h-3.5" style={{ color: sel ? '#22c55e' : '#555' }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: sel ? '#e0e0e0' : '#aaa' }}>
                                                        {t(goal.labelKey)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: '#555' }}>
                                                        {t(goal.descKey)}
                                                    </p>
                                                </div>
                                                <div
                                                    className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all"
                                                    style={sel
                                                        ? { background: '#22c55e', borderColor: '#22c55e' }
                                                        : { borderColor: 'rgba(255,255,255,0.15)' }
                                                    }
                                                >
                                                    {sel && <Check className="w-2.5 h-2.5 text-black" strokeWidth={3} />}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={handleStep1}
                                disabled={!step1Complete || loading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                                style={
                                    step1Complete && !loading
                                        ? { background: '#22c55e', color: '#0e0e0e' }
                                        : { background: 'rgba(255,255,255,0.05)', color: '#444', cursor: 'not-allowed' }
                                }
                            >
                                {loading ? <><Spinner />{t('onboard.saving')}</> : <>{t('onboard.next')}<ChevronRight className="w-4 h-4" /></>}
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Risk */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: '#666' }}>
                                    <Shield className="w-3.5 h-3.5" />
                                    {t('onboard.riskLevel')}
                                </label>
                                <div className="space-y-2">
                                    {riskLevelsData.map((risk) => {
                                        const sel = riskLevel === risk.value;
                                        return (
                                            <button
                                                key={risk.value}
                                                onClick={() => setRiskLevel(risk.value)}
                                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150"
                                                style={sel
                                                    ? { background: `${risk.color}10`, border: `1px solid ${risk.color}40` }
                                                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                                                }
                                            >
                                                <div
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ background: sel ? risk.color : '#3a3a3a' }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: sel ? '#e0e0e0' : '#aaa' }}>
                                                        {t(risk.labelKey)}
                                                    </p>
                                                    <p className="text-xs truncate" style={{ color: '#555' }}>
                                                        {t(risk.descKey)}
                                                    </p>
                                                </div>
                                                {sel && <Check className="w-4 h-4 shrink-0" style={{ color: risk.color }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Starting cash */}
                            <div>
                                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: '#666' }}>
                                    <Coins className="w-3.5 h-3.5" />
                                    {t('onboard.startCash')}
                                </label>
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                    {cashPresets.map((amount) => {
                                        const sel = startingCash === amount;
                                        return (
                                            <button
                                                key={amount}
                                                onClick={() => setStartingCash(amount)}
                                                className="py-2.5 rounded-xl text-sm font-medium transition-all"
                                                style={sel
                                                    ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.35)', color: '#22c55e' }
                                                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }
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
                                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: '#e0e0e0',
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.border = '1px solid rgba(34,197,94,0.35)')}
                                    onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2.5">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#888' }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    {t('onboard.goBack')}
                                </button>
                                <button
                                    onClick={handleStep2}
                                    disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                                    style={{ background: '#22c55e', color: '#0e0e0e' }}
                                >
                                    {loading ? <><Spinner />{t('onboard.saving')}</> : t('onboard.start')}
                                </button>
                            </div>

                            <button
                                onClick={handleSkip}
                                className="w-full text-center text-xs transition-colors"
                                style={{ color: '#444' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                            >
                                {t('onboard.skip')}
                            </button>
                        </>
                    )}
                </div>

                {/* ── Footer note ── */}
                <p className="mt-6 text-center text-[11px]" style={{ color: '#3a3a3a' }}>
                    {step === 1 ? `${t('onboard.step')} 1 ${t('onboard.of')} 2` : `${t('onboard.step')} 2 ${t('onboard.of')} 2`}
                    {' · '}fin.learn
                </p>
            </div>
        </div>
    );
}
