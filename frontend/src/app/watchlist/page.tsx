'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ExternalLink, Trash2, TrendingUp, RefreshCw, Settings } from 'lucide-react';

export default function WatchlistPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/watchlist');
            if (res.ok) {
                const data = await res.json();
                setWatchlist(data.symbols || []);
            }
        } catch {
            setError('โหลด Watchlist ไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') { router.push('/login'); return; }
        if (session?.user) load();
    }, [session, status, load, router]);

    const handleRemove = async (symbol: string) => {
        setRemovingSymbol(symbol);
        try {
            await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
            setWatchlist(prev => prev.filter(s => s !== symbol));
        } catch {
            setError('ลบไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setRemovingSymbol(null);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Star size={28} style={{ color: 'var(--primary-light)' }} /> Watchlist
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
                        หุ้นที่คุณติดตาม {watchlist.length > 0 && <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{watchlist.length} รายการ</span>}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <RefreshCw size={14} /> รีเฟรช
                    </button>
                    <Link href="/settings?section=watchlist" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', textDecoration: 'none' }}>
                        <Settings size={14} /> จัดการ
                    </Link>
                </div>
            </div>

            {error && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'var(--danger-bg)', border: '1px solid rgba(251,113,133,0.2)', color: 'var(--danger)', fontSize: '0.82rem', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {watchlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                    <Star size={52} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>ยังไม่มีหุ้นใน Watchlist</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.7 }}>
                        เพิ่มหุ้นที่คุณสนใจโดยกดไอคอน ⭐ ในหน้ารายละเอียดหุ้น
                    </p>
                    <Link href="/stocks" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={15} /> ดูรายการหุ้น
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {watchlist.map(symbol => (
                        <div key={symbol} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', transition: 'border-color 0.15s' }}>
                            {/* Icon */}
                            <div style={{ width: '44px', height: '44px', flexShrink: 0, borderRadius: '12px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-light)' }}>{symbol.slice(0, 2)}</span>
                            </div>

                            {/* Symbol info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{symbol}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>ติดตามอยู่</p>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                <Link href={`/stocks/${symbol}`} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--primary-light)', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                                    <ExternalLink size={13} /> ดูหุ้น
                                </Link>
                                <button onClick={() => handleRemove(symbol)} disabled={removingSymbol === symbol} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '34px', height: '34px', borderRadius: '8px', background: 'none', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)', cursor: removingSymbol === symbol ? 'not-allowed' : 'pointer', opacity: removingSymbol === symbol ? 0.4 : 1, transition: 'all 0.15s' }}>
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Footer hint */}
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '8px' }}>
                        เพิ่มหุ้นได้จากหน้า{' '}
                        <Link href="/stocks" style={{ color: 'var(--primary-light)', fontWeight: 500 }}>รายการหุ้น</Link>
                    </p>
                </div>
            )}
        </div>
    );
}
