'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, BarChart3, ArrowRight, Sparkles, Shield, Users } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency, formatPercent, formatLargeNumber, getPriceColor } from '@/lib/utils';

interface PopularStock {
  symbol: string;
  name: string;
  logo: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  overallScore: number;
}

export default function HomePage() {
  const [stocks, setStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPopularStocks()
      .then(data => setStocks(data))
      .catch(() => {
        // Fallback mock data if backend not running
        setStocks([
          { symbol: 'AAPL', name: 'Apple Inc.', logo: 'https://logo.clearbit.com/apple.com', sector: 'เทคโนโลยี', price: 231.34, change: 2.47, changePercent: 1.08, marketCap: 3450000000000, overallScore: 4.2 },
          { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: 'https://logo.clearbit.com/google.com', sector: 'เทคโนโลยี', price: 176.45, change: 1.56, changePercent: 0.89, marketCap: 2100000000000, overallScore: 4.5 },
          { symbol: 'MSFT', name: 'Microsoft Corp.', logo: 'https://logo.clearbit.com/microsoft.com', sector: 'เทคโนโลยี', price: 417.88, change: 2.68, changePercent: 0.65, marketCap: 3100000000000, overallScore: 4.6 },
          { symbol: 'TSLA', name: 'Tesla, Inc.', logo: 'https://logo.clearbit.com/tesla.com', sector: 'ยานยนต์', price: 248.42, change: -4.68, changePercent: -1.85, marketCap: 800000000000, overallScore: 3.2 },
          { symbol: 'AMZN', name: 'Amazon.com', logo: 'https://logo.clearbit.com/amazon.com', sector: 'เทคโนโลยี', price: 186.21, change: 1.66, changePercent: 0.90, marketCap: 1900000000000, overallScore: 4.0 },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero-bg" style={{ padding: '80px 24px 100px', textAlign: 'center', position: 'relative' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-in-up" style={{ marginBottom: '20px' }}>
            <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '6px 16px' }}>
              <Sparkles size={14} /> แพลตฟอร์มเรียนรู้หุ้น #1 สำหรับมือใหม่
            </span>
          </div>
          <h1 className="animate-fade-in-up" style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '20px',
            animationDelay: '0.1s',
          }}>
            เรียนรู้การลงทุน
            <br />
            <span className="gradient-text">อย่างมั่นใจ</span>
          </h1>
          <p className="animate-fade-in-up" style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '36px',
            maxWidth: '600px',
            margin: '0 auto 36px',
            animationDelay: '0.2s',
          }}>
            ข้อมูลหุ้นแบบเข้าใจง่าย งบการเงินแบบ Visual
            และ Portfolio Simulator ทดลองลงทุนโดยไม่เสียเงินจริง
          </p>
          <div className="animate-fade-in-up" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', animationDelay: '0.3s' }}>
            <Link href="/stocks" className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              <BarChart3 size={18} /> เริ่มดูหุ้น
            </Link>
            <Link href="#" className="btn btn-outline" style={{ fontSize: '1rem', padding: '14px 28px' }}>
              <BookOpen size={18} /> เรียนรู้พื้นฐาน
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-fade-in-up" style={{
          maxWidth: '700px', margin: '60px auto 0',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px',
          position: 'relative', zIndex: 1,
          animationDelay: '0.4s',
        }}>
          {[
            { icon: <TrendingUp size={20} />, value: '50+', label: 'หุ้นให้ศึกษา' },
            { icon: <BookOpen size={20} />, value: '20+', label: 'บทเรียน' },
            { icon: <Users size={20} />, value: 'ฟรี!', label: 'ไม่มีค่าใช้จ่าย' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--primary-light)', marginBottom: '4px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED STOCKS ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '4px' }}>
              📈 หุ้นยอดนิยม
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              หุ้นที่มือใหม่ควรรู้จัก
            </p>
          </div>
          <Link href="/stocks" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            ดูทั้งหมด <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="glass-card" style={{ height: '200px', animation: 'pulse-glow 2s infinite', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {stocks.map((stock) => (
              <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card animate-fade-in-up" style={{ padding: '24px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={stock.logo}
                        alt={stock.name}
                        style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'white', padding: '4px' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{stock.symbol}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stock.name}</div>
                      </div>
                    </div>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{stock.sector}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{formatCurrency(stock.price)}</div>
                      <div className={getPriceColor(stock.change)} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                        {stock.change >= 0 ? '▲' : '▼'} {formatPercent(stock.changePercent)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Market Cap</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{formatLargeNumber(stock.marketCap)}</div>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>คะแนนรวม</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-light)' }}>{stock.overallScore}/5.0</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${(stock.overallScore / 5) * 100}%`,
                        background: 'var(--gradient-primary)',
                      }} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
            🎯 ทำไมต้อง FinLearn?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            ออกแบบมาเพื่อนักลงทุนมือใหม่โดยเฉพาะ
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {[
            {
              icon: <BarChart3 size={28} />,
              title: 'ข้อมูลเข้าใจง่าย',
              desc: 'งบการเงินแบบ Visual, ตัวเลขพร้อมคำอธิบาย ไม่ต้องเป็นนักบัญชีก็เข้าใจ',
              color: 'var(--primary)',
            },
            {
              icon: <Shield size={28} />,
              title: 'ปลอดภัย ไม่เสียเงินจริง',
              desc: 'ทดลองสร้างพอร์ตจำลอง ฝึกตัดสินใจลงทุนโดยไม่มีความเสี่ยง',
              color: 'var(--success)',
            },
            {
              icon: <BookOpen size={28} />,
              title: 'เรียนรู้ step-by-step',
              desc: 'บทเรียนตั้งแต่พื้นฐานถึงขั้นสูง พร้อม Quiz ทดสอบความเข้าใจ',
              color: 'var(--accent)',
            },
          ].map((feat, i) => (
            <div key={i} className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: `${feat.color}15`,
                border: `1px solid ${feat.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feat.color,
                margin: '0 auto 16px',
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
