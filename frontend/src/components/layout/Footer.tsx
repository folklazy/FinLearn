import { AlertTriangle } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{
            background: 'var(--bg-secondary)',
            borderTop: '1px solid var(--border)',
            padding: '40px 24px',
            marginTop: '60px',
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* Disclaimer */}
                <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                }}>
                    <AlertTriangle size={20} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                        <p style={{ color: 'var(--warning)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '4px' }}>
                            ⚠️ ข้อสงวนสิทธิ์ (Disclaimer)
                        </p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                            FinLearn เป็นแพลตฟอร์มเพื่อการศึกษาเท่านั้น ไม่ใช่คำแนะนำทางการเงินหรือการลงทุน
                            ข้อมูลที่แสดงอาจมีความล่าช้าและไม่ควรใช้เป็นพื้นฐานในการตัดสินใจลงทุน
                            กรุณาปรึกษาผู้เชี่ยวชาญทางการเงินก่อนการลงทุนจริง
                        </p>
                    </div>
                </div>

                {/* Links */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '32px',
                    marginBottom: '32px',
                }}>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px', fontSize: '0.875rem' }}>FinLearn</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.6 }}>
                            เรียนรู้การลงทุนอย่างมั่นใจ สำหรับนักลงทุนมือใหม่ชาวไทย
                        </p>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px', fontSize: '0.875rem' }}>เมนูหลัก</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>หน้าหลัก</a></li>
                            <li><a href="/stocks" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>หุ้นทั้งหมด</a></li>
                            <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>บทเรียน</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 style={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '12px', fontSize: '0.875rem' }}>แหล่งข้อมูล</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>Glossary</a></li>
                            <li><a href="#" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>คำถามที่พบบ่อย</a></li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                }}>
                    © {new Date().getFullYear()} FinLearn — เพื่อการศึกษาเท่านั้น | Not Financial Advice
                </div>
            </div>
        </footer>
    );
}
