'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function VerifyEmailConfirmContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token') ?? '';
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function verify() {
            if (!token) {
                setStatus('error');
                setMessage('ลิงก์ยืนยันไม่ถูกต้อง');
                return;
            }
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();
                if (data.error) {
                    setStatus('error');
                    setMessage(data.error);
                } else {
                    setStatus('success');
                    setMessage(data.message);
                }
            } catch {
                setStatus('error');
                setMessage('เกิดข้อผิดพลาดในการยืนยัน กรุณาลองใหม่');
            }
        }
        verify();
    }, [token]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={{ width: '100%', maxWidth: '420px', textAlign: 'center' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '32px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'white' }}>F</div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Fin<span className="gradient-text">Learn</span></span>
                </Link>

                <div className="card-solid" style={{ padding: '40px 36px', borderRadius: 'var(--radius-xl)' }}>
                    {status === 'loading' && (
                        <>
                            <Loader2 size={48} style={{ color: 'var(--primary-light)', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
                            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>กำลังยืนยันอีเมล...</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>กรุณารอสักครู่</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <CheckCircle size={32} style={{ color: 'var(--success)' }} />
                            </div>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>ยืนยันอีเมลสำเร็จ!</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '28px' }}>
                                บัญชีของคุณพร้อมใช้งานแล้ว เข้าสู่ระบบเพื่อเริ่มเรียนรู้การลงทุน
                            </p>
                            <Link href="/login" className="btn btn-primary" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                เข้าสู่ระบบ
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <XCircle size={32} style={{ color: 'var(--danger)' }} />
                            </div>
                            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>การยืนยันล้มเหลว</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: '28px' }}>
                                {message}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <Link href="/verify-email" className="btn btn-primary" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                    ขอลิงก์ยืนยันใหม่
                                </Link>
                                <Link href="/login" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'block', textAlign: 'center' }}>
                                    กลับไปหน้าเข้าสู่ระบบ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailConfirmPage() {
    return (
        <Suspense>
            <VerifyEmailConfirmContent />
        </Suspense>
    );
}
