'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

function VerifyEmailContent() {
    const { t } = useI18n();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const otp = digits.join('');

    const handleDigitChange = (index: number, value: string) => {
        const v = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = v;
        setDigits(next);
        setError('');
        if (v && index < 5) inputRefs.current[index + 1]?.focus();
        // Auto-submit when all filled
        if (v && next.every(d => d !== '')) {
            handleVerify(next.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = [...digits];
        for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
        setDigits(next);
        if (pasted.length === 6) handleVerify(pasted);
        else inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleVerify = async (code = otp) => {
        if (code.length !== 6) { setError(t('verify.err6')); return; }
        if (!email) { setError(t('verify.errNoEmail')); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: code }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setDigits(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return; }
            setSuccess(true);
            // Auto-redirect to login with email pre-filled
            setTimeout(() => {
                window.location.href = `/login?email=${encodeURIComponent(email)}&verified=1`;
            }, 1200);
        } catch {
            setError(t('login.errGeneric'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || resending || cooldown > 0) return;
        setResending(true);
        setError('');
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            setDigits(['', '', '', '', '', '']);
            setCooldown(60);
            inputRefs.current[0]?.focus();
        } catch {
            setError(t('login.errGeneric'));
        } finally {
            setResending(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '32px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white' }}>F</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Fin<span className="gradient-text">Learn</span></span>
                </Link>

                <div className="card-solid" style={{ padding: '40px 36px', borderRadius: 'var(--radius-xl)' }}>
                    {success ? (
                        <>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                            </div>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>{t('verify.successTitle')}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '28px' }}>
                                {t('verify.successDesc')}
                            </p>
                            <Link href={`/login?email=${encodeURIComponent(email)}&verified=1`} className="btn btn-primary" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                {t('login.submit')}
                            </Link>
                        </>
                    ) : (
                        <>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary-light)' }}>
                                <Mail size={28} />
                            </div>

                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>{t('verify.title')}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '4px' }}>
                                {t('verify.sentTo')}
                            </p>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '28px' }}>
                                {email || '—'}
                            </p>

                            {/* OTP digit boxes */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }} onPaste={handlePaste}>
                                {digits.map((d, i) => (
                                    <input
                                        key={i}
                                        ref={el => { inputRefs.current[i] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={d}
                                        onChange={e => handleDigitChange(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        disabled={loading}
                                        style={{
                                            width: '48px', height: '56px', textAlign: 'center',
                                            fontSize: '1.5rem', fontWeight: 700,
                                            background: 'var(--bg-elevated)',
                                            border: `2px solid ${d ? 'var(--primary)' : error ? 'var(--danger)' : 'var(--border)'}`,
                                            borderRadius: 'var(--radius-md)',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            transition: 'border-color 0.15s',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                ))}
                            </div>

                            {error && (
                                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => handleVerify()}
                                disabled={loading || otp.length !== 6}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--gradient-primary)', border: 'none', color: 'white', fontSize: '0.9rem', fontWeight: 600, cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer', opacity: (loading || otp.length !== 6) ? 0.6 : 1, fontFamily: 'inherit', marginBottom: '16px' }}
                            >
                                {loading ? t('verify.verifying') : <><ArrowRight size={16} /> {t('verify.submit')}</>}
                            </button>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '4px' }}>
                                {t('reset.noCode')}{' '}
                                <button onClick={handleResend} disabled={resending || cooldown > 0}
                                    style={{ background: 'none', border: 'none', color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)', fontWeight: 500, cursor: cooldown > 0 ? 'default' : 'pointer', fontSize: '0.82rem', fontFamily: 'inherit', padding: 0 }}>
                                    {resending ? t('reset.resending') : cooldown > 0 ? `${t('reset.resendIn')} ${cooldown}s` : t('reset.resend')}
                                    {!resending && cooldown <= 0 && <RefreshCw size={12} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />}
                                </button>
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                <Link href="/login" style={{ color: 'var(--text-muted)' }}>{t('verify.backLogin')}</Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense>
            <VerifyEmailContent />
        </Suspense>
    );
}
