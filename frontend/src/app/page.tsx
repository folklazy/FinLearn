'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowRight, BarChart3, BookOpen, Shield, Sparkles, Star, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatPercent } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useCurrency } from '@/lib/currency';


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
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const { formatPrice } = useCurrency();
  const [stocks, setStocks] = useState<PopularStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWatchlist, setIsWatchlist] = useState(false);
  const [watchlistEmpty, setWatchlistEmpty] = useState(false);
  const [watchlistSet, setWatchlistSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      // Logged in: try to load watchlist via lightweight batch endpoint
      fetch('/api/watchlist')
        .then(r => r.ok ? r.json() : { symbols: [] })
        .then(async ({ symbols }: { symbols: string[] }) => {
          if (symbols?.length) setWatchlistSet(new Set(symbols.map(s => s.toUpperCase())));
          if (!symbols || symbols.length === 0) {
            setWatchlistEmpty(true);
            return api.getPopularStocks();
          }
          setIsWatchlist(true);
          return api.getStocksBatch(symbols);
        })
        .then(data => setStocks(data?.length ? data : FALLBACK))
        .catch(() => setStocks(FALLBACK))
        .finally(() => setLoading(false));
    } else {
      // Not logged in: popular stocks
      api.getPopularStocks()
        .then(data => setStocks(data))
        .catch(() => setStocks(FALLBACK))
        .finally(() => setLoading(false));
    }
  }, [session, status]);

  const displayStocks = stocks.length > 0 ? stocks : FALLBACK;

  const toggleWatchlist = async (symbol: string) => {
    if (!session?.user) return;
    const sym = symbol.toUpperCase();
    const removing = watchlistSet.has(sym);
    setWatchlistSet(prev => {
      const next = new Set(prev);
      if (removing) next.delete(sym); else next.add(sym);
      return next;
    });
    try {
      if (removing) {
        await fetch(`/api/watchlist/${sym}`, { method: 'DELETE' });
      } else {
        await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: sym }) });
      }
    } catch {
      setWatchlistSet(prev => {
        const next = new Set(prev);
        if (removing) next.add(sym); else next.delete(sym);
        return next;
      });
    }
  };

  return (
    <div>
      {/* ─── Ticker Strip ─── */}
      <div className="ticker-strip">
        <div className="ticker-track">
          {(() => {
            const MIN_ITEMS = 12;
            let normalized = [...displayStocks];
            while (normalized.length < MIN_ITEMS) normalized = [...normalized, ...displayStocks];
            normalized = normalized.slice(0, Math.max(MIN_ITEMS, displayStocks.length));
            const tripled = [...normalized, ...normalized, ...normalized];
            return tripled.map((s, i) => (
              <Link key={i} href={`/stocks/${s.symbol}`} className="ticker-item">
                <span className="ticker-symbol">{s.symbol}</span>
<span className="ticker-price">{formatPrice(s.price)}</span>
                <span className={`ticker-change ${s.change >= 0 ? 'up' : 'down'}`}>{formatPercent(s.changePercent)}</span>
              </Link>
            ));
          })()}
        </div>
      </div>

      {/* ═══ Hero ═══ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 96px' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06) 0%, transparent 70%)', borderRadius: '50%' }} />
        </div>

        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="animate-fade-up" style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
              padding: '6px 14px', borderRadius: '100px',
              background: 'rgba(124,108,240,0.08)', border: '1px solid rgba(124,108,240,0.15)',
              color: 'var(--primary-light)',
            }}>
              <Sparkles size={11} /> {t('hero.badge')}
            </span>
          </div>

          <h1 className="animate-fade-up delay-1" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', fontWeight: 800,
            lineHeight: 1.08, letterSpacing: '-0.035em', marginBottom: '18px',
          }}>
            {t('hero.title1')}<br />
            <span className="gradient-text">{t('hero.title2')}</span>
          </h1>

          <p className="animate-fade-up delay-2" style={{
            fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: '460px', margin: '0 auto 32px',
          }}>
            {t('hero.subtitle')}
          </p>

          <div className="animate-fade-up delay-3" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {session?.user ? (
              <>
                <Link href="/stocks" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '0.88rem' }}><BarChart3 size={15} /> {t('hero.exploreStocks')}</Link>
                <Link href="/portfolio" className="btn btn-secondary" style={{ padding: '12px 26px', fontSize: '0.88rem' }}>{t('portfolio.simulator')}</Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: '12px 26px', fontSize: '0.88rem' }}>{t('hero.startFree')} <ArrowRight size={14} /></Link>
                <Link href="/stocks" className="btn btn-secondary" style={{ padding: '12px 26px', fontSize: '0.88rem' }}><BarChart3 size={15} /> {t('hero.viewStocks')}</Link>
              </>
            )}
          </div>

          {/* Stats strip */}
          <div className="animate-fade-up delay-4" style={{
            display: 'inline-flex', gap: '0', marginTop: '52px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: '14px', overflow: 'hidden',
          }}>
            {[
              { value: '50+', label: t('hero.stat.stocks') },
              { value: '25+', label: t('hero.stat.lessons') },
              { value: '$100K', label: t('hero.stat.simulated') },
            ].map(({ value, label }, i) => (
              <div key={i} style={{
                padding: '16px 28px', textAlign: 'center',
                borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Featured Stocks ═══ */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '3px', height: '20px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {isWatchlist ? 'Watchlist' : t('stocks.popular')}
              </h2>
              {isWatchlist && <Star size={14} fill="#facc15" style={{ color: '#facc15' }} />}
              {watchlistEmpty && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {t('stocks.watchlistEmpty')} <Link href="/stocks" style={{ color: 'var(--primary-light)' }}>{t('stocks.addStocks')}</Link>
                </span>
              )}
            </div>
            <Link href={isWatchlist ? '/watchlist' : '/stocks'} style={{
              fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '3px',
              padding: '6px 12px', borderRadius: '100px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              textDecoration: 'none', transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              {isWatchlist ? t('stocks.viewWatchlist') : t('stocks.viewAll')} <ChevronRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: '14px' }} />)}
            </div>
          ) : (() => {
            const items = isWatchlist ? displayStocks : displayStocks.slice(0, 6);
            const needsScroll = items.length > 6;
            return (
              <div className={needsScroll ? 'homepage-scroll' : undefined}
                style={needsScroll ? { maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' } : undefined}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {items.map((stock, i) => {
                    const isUp = stock.change >= 0;
                    const inWL = watchlistSet.has(stock.symbol.toUpperCase());
                    return (
                      <Link key={stock.symbol} href={`/stocks/${stock.symbol}`} style={{ textDecoration: 'none' }}>
                        <div className={`animate-fade-up delay-${Math.min(i + 1, 6)}`}
                          style={{
                            padding: '18px 20px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px',
                            background: 'var(--bg-card-solid)', border: '1px solid var(--border)', borderRadius: '14px',
                            cursor: 'pointer', transition: 'border-color 0.2s, box-shadow 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                          {/* Top: Logo + Info + Star */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '38px', height: '38px', borderRadius: '10px',
                              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden',
                            }}>
                              {stock.logo ? (
                                <Image src={stock.logo} alt="" width={22} height={22} unoptimized style={{ objectFit: 'contain' }} />
                              ) : (
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>{stock.symbol.slice(0, 2)}</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em' }}>{stock.symbol}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.name}</div>
                            </div>
                            {session?.user && (
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, color: inWL ? '#facc15' : 'var(--text-muted)', transition: 'color 0.15s', display: 'flex' }}
                                onMouseEnter={e => { if (!inWL) e.currentTarget.style.color = '#facc15'; }}
                                onMouseLeave={e => { if (!inWL) e.currentTarget.style.color = 'var(--text-muted)'; }}
                                aria-label={inWL ? t('stocks.removeWatchlist') : t('stocks.addWatchlist')}
                              >
                                <Star size={15} fill={inWL ? '#facc15' : 'none'} />
                              </button>
                            )}
                          </div>

                          {/* Bottom: Price + Change */}
                          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>
                              {formatPrice(stock.price)}
                            </span>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '3px',
                              fontSize: '0.74rem', fontWeight: 700,
                              padding: '3px 10px', borderRadius: '100px',
                              background: isUp ? 'rgba(52,211,153,0.08)' : 'rgba(251,113,133,0.08)',
                              color: isUp ? 'var(--success)' : 'var(--danger)',
                            }}>
                              {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {formatPercent(stock.changePercent)}
                            </span>
                          </div>

                          {/* Sector + Score */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {stock.sector || 'Technology'}
                            </span>
                            {stock.overallScore > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '40px', height: '3px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                  <div style={{ width: `${(stock.overallScore / 5) * 100}%`, height: '100%', borderRadius: '100px', background: 'var(--gradient-primary)', transition: 'width 0.8s var(--ease)' }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)' }}>{stock.overallScore.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '3px', height: '20px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('features.title')}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t('features.subtitle')}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { Icon: BarChart3, title: t('features.data.title'), desc: t('features.data.desc'), accent: '#7c6cf0', href: '/stocks' },
              { Icon: Shield, title: t('features.sim.title'), desc: t('features.sim.desc'), accent: '#34d399', href: '/portfolio' },
              { Icon: BookOpen, title: t('features.learn.title'), desc: t('features.learn.desc'), accent: '#c4b5fd', href: '/learn' },
            ].map(({ Icon, title, desc, accent, href }, i) => (
              <Link key={i} href={href} style={{ textDecoration: 'none' }}>
                <div className={`animate-fade-up delay-${i + 1}`} style={{
                  padding: '24px', borderRadius: '14px',
                  background: 'var(--bg-card-solid)', border: '1px solid var(--border)',
                  transition: 'border-color 0.2s, box-shadow 0.2s', cursor: 'pointer', height: '100%',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: `${accent}12`, border: `1px solid ${accent}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: accent, marginBottom: '16px',
                  }}>
                    <Icon size={18} />
                  </div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65 }}>{desc}</p>
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, color: accent }}>
                    {t('features.start')} <ChevronRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      {!session?.user && (
        <section className="section" style={{ paddingBottom: '80px' }}>
          <div className="container">
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border)',
              borderRadius: '18px', padding: '48px 32px', textAlign: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(124,108,240,0.06), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>{t('cta.title')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
                  {t('cta.subtitle')}
                </p>
                <Link href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 28px', borderRadius: '100px',
                  background: 'var(--primary)', color: '#fff',
                  fontSize: '0.88rem', fontWeight: 700, textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}>
                  {t('hero.startFree')} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
