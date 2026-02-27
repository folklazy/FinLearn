'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, RefreshCw } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) { setError('กรุณากรอกรหัส OTP ให้ครบ 6 หลัก'); return; }
        if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }
        if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return; }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); setDigits(['', '', '', '', '', '']); inputRefs.current[0]?.focus(); return; }
            setSuccess(true);
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email || resending || cooldown > 0) return;
        setResending(true);
        setError('');
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'ส่งรหัสใหม่ไม่สำเร็จ'); return; }
            setDigits(['', '', '', '', '', '']);
            setCooldown(60);
            inputRefs.current[0]?.focus();
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>ไม่พบอีเมล กรุณาขอรหัส OTP ใหม่</p>
                    <Link href="/forgot-password" className="btn btn-primary">ขอรหัส OTP ใหม่</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '420px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white' }}>F</div>
                        <span style={{ fontSize: '1.2rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Fin<span className="gradient-text">Learn</span></span>
                    </Link>
                </div>

                <div className="card-solid" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                            </div>
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>เปลี่ยนรหัสผ่านสำเร็จ!</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '24px' }}>
                                สามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย
                            </p>
                            <Link href="/login" className="btn btn-primary" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>ตั้งรหัสผ่านใหม่</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '4px' }}>
                                กรอกรหัส OTP ที่ส่งไปที่
                            </p>
                            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '20px' }}>{email}</p>

                            {/* OTP digit boxes */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '8px' }} onPaste={handlePaste}>
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
                                            width: '46px', height: '52px', textAlign: 'center',
                                            fontSize: '1.4rem', fontWeight: 700,
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

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '20px' }}>
                                ไม่ได้รับรหัส?{' '}
                                <button type="button" onClick={handleResend} disabled={resending || cooldown > 0}
                                    style={{ background: 'none', border: 'none', color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)', fontWeight: 500, cursor: cooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: 0 }}>
                                    {resending ? 'กำลังส่ง...' : cooldown > 0 ? `ส่งใหม่ใน ${cooldown}s` : <>ส่งรหัสใหม่ <RefreshCw size={11} style={{ verticalAlign: 'middle' }} /></>}
                                </button>
                            </p>

                            {error && (
                                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '14px' }}>
                                    {error}
                                </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                                        value={password} onChange={e => setPassword(e.target.value)} required
                                        className="input" style={{ paddingLeft: '40px', paddingRight: '42px' }} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="ยืนยันรหัสผ่านใหม่"
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                        className="input" style={{ paddingLeft: '40px' }} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading || otp.length !== 6} className="btn btn-primary"
                                style={{ width: '100%', padding: '12px', opacity: (loading || otp.length !== 6) ? 0.6 : 1, cursor: (loading || otp.length !== 6) ? 'not-allowed' : 'pointer' }}>
                                {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordContent />
        </Suspense>
    );
}
