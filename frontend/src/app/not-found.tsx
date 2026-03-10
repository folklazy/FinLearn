'use client';

import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: '4rem', fontWeight: 800, letterSpacing: '-0.04em',
        color: 'var(--text-muted)', marginBottom: '8px', lineHeight: 1,
      }}>
        404
      </div>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
        {t('notfound.title')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '340px' }}>
        {t('notfound.desc')}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Home size={14} /> {t('notfound.home')}
        </Link>
        <Link href="/stocks" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
          <Search size={14} /> {t('notfound.search')}
        </Link>
      </div>
    </div>
  );
}
