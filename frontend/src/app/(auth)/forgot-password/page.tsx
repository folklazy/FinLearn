'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
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
                </div>

                <div className="card-solid" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
                        <>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>ลืมรหัสผ่าน?</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '24px' }}>
                                กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งรหัส OTP ไปให้
                            </p>

                            {error && (
                                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px' }}>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                    <input type="email" placeholder="อีเมล" value={email} onChange={e => setEmail(e.target.value)} required
                                        className="input" style={{ paddingLeft: '40px' }} />
                                </div>
                                <button type="submit" disabled={loading} className="btn btn-primary"
                                    style={{ width: '100%', padding: '12px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                                    {loading ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
                                </button>
                            </form>

                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '20px' }}>
                                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary-light)', fontWeight: 500 }}>
                                    <ArrowLeft size={13} /> กลับไปเข้าสู่ระบบ
                                </Link>
                            </p>
                        </>
                </div>
            </div>
        </div>
    );
}
