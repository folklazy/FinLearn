'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowRight, BarChart3, BookOpen, Shield, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface PopularStock {
  symbol: string; name: string; logo: string; sector: string;
  price: number; change: number; changePercent: number; marketCap: number; overallScore: number;
}

const FALLBACK: PopularStock[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', sector: 'Tech', price: 231.34, change: 2.47, changePercent: 1.08, marketCap: 3450000000000, overallScore: 4.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', sector: 'Tech', price: 176.45, change: 1.56, changePercent: 0.89, marketCap: 2100000000000, overallScore: 4.5 },
  { symbol: 'MSFT', name: 'Microsoft', logo: 'https://logo.clearbit.com/microsoft.com', sector: 'Tech', price: 417.88, change: 2.68, changePercent: 0.65, marketCap: 3100000000000, overallScore: 4.6 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', sector: 'Auto', price: 248.42, change: -4.68, changePercent: -1.85, marketCap: 800000000000, overallScore: 3.2 },
  { symbol: 'AMZN', name: 'Amazon.com', logo: 'https://logo.clearbit.com/amazon.com', sector: 'Tech', price: 186.21, change: 1.66, changePercent: 0.90, marketCap: 1900000000000, overallScore: 4.0 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: 'https://logo.clearbit.com/nvidia.com', sector: 'Tech', price: 875.40, change: 12.30, changePercent: 1.42, marketCap: 2150000000000, overallScore: 4.7 },
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

  const displayStocks = stocks.length > 0 ? stocks : FALLBACK;

  return (
    <div>
      {/* ─── Ticker Strip ─── */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 0', background: 'var(--bg-secondary)' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner" style={{ gap: '0' }}>
            {[...displayStocks, ...displayStocks].map((s, i) => (
              <Link key={i} href={`/stocks/${s.symbol}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '0 28px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.symbol}</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(s.price)}</span>
                <span className={s.change >= 0 ? 'num-up' : 'num-down'} style={{ fontWeight: 600 }}>
                  {s.change >= 0 ? '+' : ''}{formatPercent(s.changePercent)}
                </span>
                <span style={{ color: 'var(--border-light)', margin: '0 4px' }}>·</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Hero ─── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 120px' }}>
        {/* Ambient glow */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-up">
            <span className="badge badge-primary" style={{ marginBottom: '24px' }}>
              <Sparkles size={12} /> เรียนรู้ฟรี · ไม่มีความเสี่ยง
            </span>
          </div>

          <h1 className="animate-fade-up delay-1" style={{
            fontSize: 'clamp(2.6rem, 5vw, 4rem)', fontWeight: 800,
            lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: '20px'
          }}>
            เข้าใจหุ้นง่ายๆ<br />
            <span className="gradient-text">ลงทุนอย่างมั่นใจ</span>
          </h1>

          <p className="animate-fade-up delay-2" style={{
            fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: '500px', margin: '0 auto 36px'
          }}>
            ข้อมูลหุ้นแบบเข้าใจง่าย งบการเงินแบบ Visual
            และ Portfolio Simulator สำหรับมือใหม่
          </p>

          <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {session?.user ? (
              <>
                <Link href="/stocks" className="btn btn-primary" style={{ padding: '13px 28px' }}><BarChart3 size={16} /> สำรวจหุ้น</Link>
                <Link href="/settings" className="btn btn-secondary" style={{ padding: '13px 28px' }}>ตั้งค่าโปรไฟล์</Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: '13px 28px' }}>เริ่มต้นฟรี <ArrowRight size={15} /></Link>
                <Link href="/stocks" className="btn btn-secondary" style={{ padding: '13px 28px' }}><BarChart3 size={16} /> ดูหุ้น</Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="animate-fade-up delay-4" style={{
            display: 'flex', justifyContent: 'center', gap: '56px', marginTop: '72px', flexWrap: 'wrap'
          }}>
            {[
              { value: '50+', label: 'หุ้นให้ศึกษา' },
              { value: '20+', label: 'บทเรียน' },
              { value: 'ฟรี', label: 'ไม่มีค่าใช้จ่าย' },
            ].map(({ value, label }, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Stocks ─── */}
      <section className="section" style={{ paddingTop: '0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: '8px' }}>Popular Stocks</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>หุ้นยอดนิยม</h2>
            </div>
            <Link href="/stocks" className="btn btn-ghost" style={{ gap: '6px', fontSize: '0.82rem' }}>
              ดูทั้งหมด <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '160px' }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {displayStocks.slice(0, 6).map((stock, i) => (
                <Link key={stock.symbol} href={`/stocks/${stock.symbol}`}>
                  <div className={`card-solid animate-fade-up delay-${Math.min(i + 1, 6)}`}
                    style={{ padding: '22px', cursor: 'pointer' }}>
                    {/* Top row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={stock.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stock.name}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: '100px',
                        background: stock.change >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: stock.change >= 0 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {stock.change >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                      </span>
                    </div>
                    {/* Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {formatCurrency(stock.price)}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Score</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore}/5</div>
                      </div>
                    </div>
                    {/* Progress */}
                    <div className="progress-bar" style={{ marginTop: '14px' }}>
                      <div className="progress-fill" style={{ width: `${(stock.overallScore / 5) * 100}%` }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: '10px' }}>Why FinLearn</p>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '10px' }}>ออกแบบมาเพื่อมือใหม่</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              เครื่องมือทุกอย่างที่คุณต้องการเพื่อเริ่มต้นเรียนรู้การลงทุน
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              { Icon: BarChart3, title: 'ข้อมูลเข้าใจง่าย', desc: 'งบการเงินแบบ Visual ตัวเลขพร้อมคำอธิบาย ไม่ต้องเป็นนักบัญชีก็เข้าใจได้', accent: 'var(--primary)' },
              { Icon: Shield, title: 'ปลอดภัย ไม่เสียเงินจริง', desc: 'ทดลองสร้างพอร์ตจำลอง ฝึกตัดสินใจลงทุนโดยไม่มีความเสี่ยงใดๆ', accent: 'var(--success)' },
              { Icon: BookOpen, title: 'เรียนรู้ step-by-step', desc: 'บทเรียนตั้งแต่พื้นฐานถึงขั้นสูง พร้อม Quiz ทดสอบความเข้าใจ', accent: 'var(--accent)' },
            ].map(({ Icon, title, desc, accent }, i) => (
              <div key={i} className="card-solid" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${accent} 15%, transparent)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      {!session?.user && (
        <section className="section" style={{ paddingBottom: '100px' }}>
          <div className="container">
            <div style={{
              background: 'var(--gradient-subtle)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl)', padding: '64px 40px', textAlign: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(124,108,240,0.08), transparent 70%)', borderRadius: '50%' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '12px' }}>พร้อมเริ่มเรียนรู้แล้วหรือยัง?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
                  สมัครฟรี ไม่มีค่าใช้จ่าย ไม่ต้องใส่บัตรเครดิต
                </p>
                <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '0.95rem' }}>
                  เริ่มต้นฟรีเลย <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
