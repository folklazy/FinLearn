'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    User, GraduationCap, Target, Shield, ChevronRight, ChevronLeft,
    BookOpen, TrendingUp, Coins, BarChart3, Zap, Check, Sparkles
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
    { value: 'LOW', labelKey: 'onboard.risk.low', descKey: 'onboard.risk.lowDesc', color: '#22c55e' },
    { value: 'MEDIUM', labelKey: 'onboard.risk.medium', descKey: 'onboard.risk.mediumDesc', color: '#f59e0b' },
    { value: 'HIGH', labelKey: 'onboard.risk.high', descKey: 'onboard.risk.highDesc', color: '#ef4444' },
];

export default function OnboardingPage() {
    const { t } = useI18n();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1
    const [displayName, setDisplayName] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');

    // Step 2
    const [riskLevel, setRiskLevel] = useState('');
    const [startingCash, setStartingCash] = useState('100000');

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!session?.user) {
        router.push('/login');
        return null;
    }

    const handleStep1 = async () => {
        if (!displayName || !experienceLevel || !primaryGoal) return;
        setLoading(true);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: displayName,
                    displayName,
                    experienceLevel,
                    primaryGoal,
                    onboardingStep: 2,
                }),
            });

            if (res.ok) {
                setStep(2);
            }
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        {t('onboard.step')} {step} {t('onboard.of')} 2
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {step === 1 ? t('onboard.title1') : t('onboard.title2')}
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {step === 1
                            ? t('onboard.desc1')
                            : t('onboard.desc2')}
                    </p>
                </div>

                {/* Progress bar */}
                <div className="flex gap-2 mb-8">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-gradient-to-r from-indigo-500 to-emerald-500' : 'bg-white/10'}`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-gradient-to-r from-indigo-500 to-emerald-500' : 'bg-white/10'}`} />
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Display Name */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <User className="w-4 h-4" /> {t('onboard.displayName')}
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={session.user.name || t('onboard.yourName')}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
                                />
                            </div>

                            {/* Experience Level */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" /> {t('onboard.expLevel')}
                                </label>
                                <div className="space-y-2 mt-2">
                                    {experienceLevelsData.map((level) => {
                                        const Icon = level.icon;
                                        const selected = experienceLevel === level.value;
                                        return (
                                            <button
                                                key={level.value}
                                                onClick={() => setExperienceLevel(level.value)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${selected
                                                    ? 'bg-indigo-500/15 border-indigo-500/40 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${selected ? 'bg-indigo-500/20' : 'bg-white/5'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{t(level.labelKey)}</p>
                                                    <p className="text-xs text-gray-500">{t(level.descKey)}</p>
                                                </div>
                                                {selected && <Check className="w-5 h-5 text-indigo-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Primary Goal */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4" /> {t('onboard.goal')}
                                </label>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {primaryGoalsData.map((goal) => {
                                        const Icon = goal.icon;
                                        const selected = primaryGoal === goal.value;
                                        return (
                                            <button
                                                key={goal.value}
                                                onClick={() => setPrimaryGoal(goal.value)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${selected
                                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${selected ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{t(goal.labelKey)}</p>
                                                    <p className="text-xs text-gray-500">{t(goal.descKey)}</p>
                                                </div>
                                                {selected && <Check className="w-5 h-5 text-emerald-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleStep1}
                                disabled={!displayName || !experienceLevel || !primaryGoal || loading}
                                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        {t('onboard.saving')}
                                    </span>
                                ) : (
                                    <>
                                        {t('onboard.next')} <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Risk Level */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> {t('onboard.riskLevel')}
                                </label>
                                <div className="space-y-2 mt-2">
                                    {riskLevelsData.map((risk) => {
                                        const selected = riskLevel === risk.value;
                                        return (
                                            <button
                                                key={risk.value}
                                                onClick={() => setRiskLevel(risk.value)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left ${selected
                                                    ? 'border-opacity-40 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                                                    }`}
                                                style={selected ? {
                                                    background: `${risk.color}15`,
                                                    borderColor: `${risk.color}66`,
                                                } : {}}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ background: risk.color }}
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm">{t(risk.labelKey)}</p>
                                                    <p className="text-xs text-gray-500">{t(risk.descKey)}</p>
                                                </div>
                                                {selected && <Check className="w-5 h-5" style={{ color: risk.color }} />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Starting Cash */}
                            <div>
                                <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                                    <Coins className="w-4 h-4" /> {t('onboard.startCash')}
                                </label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {['10000', '50000', '100000'].map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setStartingCash(amount)}
                                            className={`py-2 rounded-lg border text-sm font-medium transition-all ${startingCash === amount
                                                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            ${Number(amount).toLocaleString()}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={startingCash}
                                    onChange={(e) => setStartingCash(e.target.value)}
                                    className="w-full mt-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
                                    placeholder={t('onboard.orEnter')}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 rounded-xl font-semibold text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft className="w-5 h-5" /> {t('onboard.goBack')}
                                </button>
                                <button
                                    onClick={handleStep2}
                                    disabled={loading}
                                    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <>
                                            {t('onboard.start')} <Sparkles className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Skip */}
                            <button
                                onClick={handleSkip}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {t('onboard.skip')}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
