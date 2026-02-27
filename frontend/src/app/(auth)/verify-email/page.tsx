'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Mail, RefreshCw, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email') ?? '';
    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);
    const [error, setError] = useState('');

    const handleResend = async () => {
        if (!email) return;
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
            setResent(true);
        } catch {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
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
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'color-mix(in srgb, var(--primary) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--primary) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary-light)' }}>
                        <Mail size={28} />
                    </div>

                    <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>ตรวจสอบอีเมลของคุณ</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '8px' }}>
                        เราส่งลิงก์ยืนยันไปยัง
                    </p>
                    {email && (
                        <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '24px' }}>
                            {email}
                        </p>
                    )}
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.7, marginBottom: '28px' }}>
                        คลิกลิงก์ในอีเมลเพื่อยืนยันบัญชีและเริ่มใช้งาน ลิงก์มีอายุ <strong style={{ color: 'var(--text-secondary)' }}>24 ชั่วโมง</strong>
                    </p>

                    {error && (
                        <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    {resent ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--success-bg)', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 500, marginBottom: '20px' }}>
                            <CheckCircle size={16} /> ส่งอีเมลใหม่เรียบร้อยแล้ว!
                        </div>
                    ) : email ? (
                        <button onClick={handleResend} disabled={resending}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '11px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, cursor: resending ? 'not-allowed' : 'pointer', opacity: resending ? 0.6 : 1, fontFamily: 'inherit', marginBottom: '20px' }}>
                            <RefreshCw size={15} style={{ animation: resending ? 'spin 1s linear infinite' : 'none' }} />
                            {resending ? 'กำลังส่ง...' : 'ส่งอีเมลใหม่อีกครั้ง'}
                        </button>
                    ) : null}

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 500 }}>กลับไปหน้าเข้าสู่ระบบ</Link>
                    </p>
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
