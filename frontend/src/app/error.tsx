'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '48px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '56px', height: '56px', borderRadius: '16px',
        background: 'rgba(251,113,133,0.08)', border: '1px solid rgba(251,113,133,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <AlertCircle size={24} style={{ color: 'var(--danger)' }} />
      </div>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
        {t('error.title')}
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '360px' }}>
        {error.message || t('error.fallback')}
      </p>
      <button
        onClick={reset}
        className="btn btn-secondary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
      >
        <RefreshCw size={14} /> {t('error.retry')}
      </button>
    </div>
  );
}
