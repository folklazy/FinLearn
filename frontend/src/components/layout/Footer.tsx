'use client';

import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

const LINKS = {
    main: [
        { href: '/', label: 'หน้าหลัก' },
        { href: '/stocks', label: 'หุ้น' },
        { href: '#', label: 'บทเรียน' },
    ],
    resources: [
        { href: '#', label: 'Glossary' },
        { href: '#', label: 'คำถามที่พบบ่อย' },
        { href: '#', label: 'เกี่ยวกับเรา' },
    ],
};

export default function Footer() {
    return (
        <footer style={{ borderTop: '1px solid var(--border)', padding: '56px 0 32px' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                    {/* Brand */}
                    <div>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'white' }}>F</div>
                            <span style={{ fontSize: '1rem', fontWeight: 750, letterSpacing: '-0.02em' }}>Fin<span className="gradient-text">Learn</span></span>
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.65, maxWidth: '200px' }}>
                            เรียนรู้การลงทุนอย่างมั่นใจ สำหรับนักลงทุนมือใหม่
                        </p>
                    </div>

                    {/* Nav columns */}
                    {[
                        { title: 'เมนู', links: LINKS.main },
                        { title: 'แหล่งข้อมูล', links: LINKS.resources },
                    ].map(col => (
                        <div key={col.title}>
                            <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.title}</h4>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {col.links.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', transition: 'color 0.15s' }}
                                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                        >{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Disclaimer */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.1)', marginBottom: '28px' }}>
                    <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                        <strong style={{ color: 'var(--warning)' }}>Disclaimer</strong> — FinLearn เป็นแพลตฟอร์มเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำทางการเงิน กรุณาปรึกษาผู้เชี่ยวชาญก่อนการลงทุนจริง
                    </p>
                </div>

                {/* Bottom */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>© {new Date().getFullYear()} FinLearn</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>Not Financial Advice</span>
                </div>
            </div>
        </footer>
    );
}
