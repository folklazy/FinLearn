'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, BookOpen, BarChart3, ArrowRight, Sparkles, Shield, ChevronRight, GraduationCap, Trophy } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, formatLargeNumber, getPriceColor } from '@/lib/utils';

interface PopularStock {
  symbol: string; name: string; logo: string; sector: string;
  price: number; change: number; changePercent: number; marketCap: number; overallScore: number;
}

const FALLBACK: PopularStock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', sector: 'เทคโนโลยี', price: 231.34, change: 2.47, changePercent: 1.08, marketCap: 3450000000000, overallScore: 4.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', sector: 'เทคโนโลยี', price: 176.45, change: 1.56, changePercent: 0.89, marketCap: 2100000000000, overallScore: 4.5 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', logo: 'https://logo.clearbit.com/microsoft.com', sector: 'เทคโนโลยี', price: 417.88, change: 2.68, changePercent: 0.65, marketCap: 3100000000000, overallScore: 4.6 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', sector: 'ยานยนต์', price: 248.42, change: -4.68, changePercent: -1.85, marketCap: 800000000000, overallScore: 3.2 },
  { symbol: 'AMZN', name: 'Amazon.com', logo: 'https://logo.clearbit.com/amazon.com', sector: 'เทคโนโลยี', price: 186.21, change: 1.66, changePercent: 0.90, marketCap: 1900000000000, overallScore: 4.0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'https://logo.clearbit.com/nvidia.com', sector: 'เทคโนโลยี', price: 875.40, change: 12.30, changePercent: 1.42, marketCap: 2150000000000, overallScore: 4.7 },
];

export default function HomePage() {
  const { data: session } = useSession();
  const [stocks, setStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPopularStocks()
      .then(data => setStocks(data))
      .catch(() => setStocks(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const tickerData = stocks.length > 0 ? stocks : FALLBACK;

  return (
    <div>
      {/* ===== TICKER ===== */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '7px 0' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...tickerData, ...tickerData].map((s, i) => (
              <Link key={i} href={`/stocks/${s.symbol}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '0 24px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{s.symbol}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{formatCurrency(s.price)}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }} className={s.change >= 0 ? 'num-up' : 'num-down'}>
                  {s.change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(s.changePercent))}
                </span>
                <span style={{ color: 'var(--border)', marginLeft: '4px' }}>·</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className="hero-bg" style={{ padding: '88px 24px 104px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '8%', width: '380px', height: '380px', background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', right: '6%', width: '320px', height: '320px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '22px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.8rem', padding: '6px 16px', gap: '6px' }}>
              <Sparkles size={13} /> แพลตฟอร์มเรียนรู้หุ้นสำหรับมือใหม่
            </span>
          </div>
          <h1 className="animate-fade-in-up" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.5rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.02em', marginBottom: '22px', animationDelay: '0.1s' }}>
            เรียนรู้การลงทุน<br />
            <span className="gradient-text">อย่างมั่นใจ</span>
          </h1>
          <p className="animate-fade-in-up" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: '540px', margin: '0 auto 40px', animationDelay: '0.2s' }}>
            ข้อมูลหุ้นแบบเข้าใจง่าย งบการเงินแบบ Visual
            และ Portfolio Simulator — ทดลองลงทุนโดยไม่เสียเงินจริง
          </p>
          <div className="animate-fade-in-up" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            {session?.user ? (
              <>
                <Link href="/stocks" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 28px' }}><BarChart3 size={17} /> ดูหุ้น</Link>
                <Link href="/settings" className="btn btn-outline" style={{ fontSize: '0.95rem', padding: '13px 28px' }}>ตั้งค่าโปรไฟล์ <ChevronRight size={16} /></Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ fontSize: '0.95rem', padding: '13px 28px' }}><Sparkles size={17} /> เริ่มต้นฟรี</Link>
                <Link href="/stocks" className="btn btn-outline" style={{ fontSize: '0.95rem', padding: '13px 28px' }}><BarChart3 size={17} /> ดูหุ้น</Link>
              </>
            )}
          </div>
          <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginTop: '60px', animationDelay: '0.4s' }}>
            {[
              { Icon: TrendingUp, value: '50+', label: 'หุ้นให้ศึกษา' },
              { Icon: GraduationCap, value: '20+', label: 'บทเรียน' },
              { Icon: Trophy, value: 'ฟรี', label: 'ไม่มีค่าใช้จ่าย' },
            ].map(({ Icon, value, label }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '2px' }}>
                  <Icon size={16} style={{ color: 'var(--primary-light)' }} />
                  <span style={{ fontSize: '1.7rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED STOCKS ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px 48px' }}>
        <div className="section-header">
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>หุ้นยอดนิยม</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>หุ้นที่มือใหม่ควรรู้จัก</p>
          </div>
          <Link href="/stocks" className="btn btn-outline" style={{ fontSize: '0.82rem' }}>ดูทั้งหมด <ArrowRight size={14} /></Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: '176px' }} />)}
          </div>
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
            {stocks.map((stock) => (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none' }}>
                <div className="animate-fade-in-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border-light)'; d.style.transform = 'translateY(-2px)'; d.style.boxShadow = '0 8px 32px rgba(0,0,0,0.25)'; }}
                  onMouseOut={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = 'var(--border)'; d.style.transform = 'none'; d.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '9px', background: 'white', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={stock.logo} alt={stock.symbol} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>{stock.name}</div>
                      </div>
                    </div>
                    <span className="chip active" style={{ fontSize: '0.68rem', cursor: 'default' }}>{stock.sector}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.01em' }}>{formatCurrency(stock.price)}</div>
                      <div className={getPriceColor(stock.change)} style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: '2px' }}>
                        {stock.change >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(stock.changePercent))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Mkt Cap</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatLargeNumber(stock.marketCap)}</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>คะแนนรวม</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore}/5.0</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${(stock.overallScore / 5) * 100}%`, background: 'var(--gradient-primary)' }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '16px 24px 56px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>ทำไมต้อง FinLearn?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ออกแบบมาเพื่อนักลงทุนมือใหม่โดยเฉพาะ</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            { Icon: BarChart3, title: 'ข้อมูลเข้าใจง่าย', desc: 'งบการเงินแบบ Visual ตัวเลขพร้อมคำอธิบาย ไม่ต้องเป็นนักบัญชีก็เข้าใจได้', color: '#6366f1' },
            { Icon: Shield, title: 'ปลอดภัย ไม่เสียเงินจริง', desc: 'ทดลองสร้างพอร์ตจำลอง ฝึกตัดสินใจลงทุนโดยไม่มีความเสี่ยงใดๆ', color: '#22c55e' },
            { Icon: BookOpen, title: 'เรียนรู้ step-by-step', desc: 'บทเรียนตั้งแต่พื้นฐานถึงขั้นสูง พร้อม Quiz ทดสอบความเข้าใจ', color: '#8b5cf6' },
          ].map(({ Icon, title, desc, color }, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: `${color}18`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                <Icon size={21} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '6px' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', lineHeight: 1.65 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!session?.user && (
        <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 88px' }}>
          <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '20px', padding: '52px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '220px', height: '220px', background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-70px', left: '-30px', width: '260px', height: '260px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: '10px', letterSpacing: '-0.01em' }}>พร้อมเริ่มเรียนรู้แล้วหรือยัง?</h2>
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.95rem', marginBottom: '28px' }}>สมัครฟรี ไม่มีค่าใช้จ่าย ไม่ต้องใส่บัตรเครดิต</p>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '13px 32px', borderRadius: '12px', background: 'white', color: '#4f46e5', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transition: 'opacity 0.2s' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={e => (e.currentTarget.style.opacity = '1')}
              >
                <Sparkles size={17} /> เริ่มต้นฟรีเลย
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
