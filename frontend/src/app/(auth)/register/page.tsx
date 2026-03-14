'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function RegisterPage() {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError(t('reg.errMismatch'));
            return;
        }

        if (password.length < 8 || password.length > 64) {
            setError(t('reg.errLength'));
            return;
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            setError(t('reg.errMix'));
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || t('login.errGeneric'));
                return;
            }

            window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
        } catch {
            setError(t('login.errGeneric'));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/onboarding' });
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white' }}>F</div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Fin<span className="gradient-text">Learn</span></span>
                    </Link>
                    <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '28px', marginBottom: '6px' }}>{t('reg.title')}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('reg.subtitle')}</p>
                </div>

                <div className="card-solid" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                    <button onClick={handleGoogleLogin} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '11px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', transition: 'border-color 0.2s var(--ease)', fontFamily: 'inherit' }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                        onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        {t('reg.google')}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('login.or')}</span>
                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                    </div>

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {error && (
                            <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        <div style={{ position: 'relative' }}>
                            <User size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input type="text" placeholder={t('reg.name')} value={name} onChange={e => setName(e.target.value)} required
                                className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input type="email" placeholder={t('login.email')} value={email} onChange={e => setEmail(e.target.value)} required
                                className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input type={showPassword ? 'text' : 'password'} placeholder={t('login.password')} value={password} onChange={e => setPassword(e.target.value)} required
                                className="input" style={{ paddingLeft: '40px', paddingRight: '42px' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                            <input type={showPassword ? 'text' : 'password'} placeholder={t('reg.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', fontSize: '0.78rem', lineHeight: 1.7 }}>
                            <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>{t('reg.pwdRequire')}</p>
                            <p style={{ color: password.length >= 8 && password.length <= 64 ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>• {t('reg.pwdLength')}</p>
                            <p style={{ color: /[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>• {t('reg.pwdMix')}</p>
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '2px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? t('reg.loading') : t('reg.submit')}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '22px' }}>
                        {t('reg.hasAccount')}{' '}
                        <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{t('login.submit')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
