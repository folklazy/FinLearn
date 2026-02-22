import Link from 'next/link';
import { TrendingUp, AlertTriangle } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: '48px 24px 32px', marginTop: '40px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

                {/* Top grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
                    {/* Brand */}
                    <div style={{ gridColumn: 'span 1' }}>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '14px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={16} color="white" />
                            </div>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                Fin<span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Learn</span>
                            </span>
                        </Link>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: 1.65, maxWidth: '220px' }}>
                            เรียนรู้การลงทุนอย่างมั่นใจ สำหรับนักลงทุนมือใหม่ชาวไทย
                        </p>
                    </div>

                    {/* Nav */}
                    <div>
                        <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>เมนูหลัก</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[{ href: '/', label: 'หน้าหลัก' }, { href: '/stocks', label: 'หุ้นทั้งหมด' }, { href: '#', label: 'บทเรียน' }].map(({ href, label }) => (
                                <li key={label}>
                                    <Link href={href} style={{ color: 'var(--text-muted)', fontSize: '0.825rem', textDecoration: 'none', transition: 'color 0.15s' }}
                                        onMouseOver={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '14px', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>แหล่งข้อมูล</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[{ href: '#', label: 'Glossary' }, { href: '#', label: 'คำถามที่พบบ่อย' }, { href: '#', label: 'เกี่ยวกับเรา' }].map(({ href, label }) => (
                                <li key={label}>
                                    <Link href={href} style={{ color: 'var(--text-muted)', fontSize: '0.825rem', textDecoration: 'none', transition: 'color 0.15s' }}
                                        onMouseOver={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                        onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                                    >{label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '12px', padding: '14px 18px', marginBottom: '28px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                        <span style={{ color: 'var(--warning)', fontWeight: 600 }}>Disclaimer: </span>
                        FinLearn เป็นแพลตฟอร์มเพื่อการศึกษาเท่านั้น ข้อมูลที่แสดงอาจมีความล่าช้า
                        ไม่ใช่คำแนะนำทางการเงินหรือการลงทุน กรุณาปรึกษาผู้เชี่ยวชาญก่อนการลงทุนจริง
                    </p>
                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        © {new Date().getFullYear()} FinLearn — เพื่อการศึกษาเท่านั้น
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                        Not Financial Advice
                    </span>
                </div>
            </div>
        </footer>
    );
}
