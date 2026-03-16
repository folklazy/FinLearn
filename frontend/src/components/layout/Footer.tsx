'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';

export default function Footer() {
    const { t, locale } = useI18n();
    const isTH = locale === 'th';
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="container">
                {/* ── Main grid ── */}
                <div className="footer-grid">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <div className="footer-logo-icon">F</div>
                            <span>Fin<span className="gradient-text">Learn</span></span>
                        </Link>
                        <p className="footer-tagline">{t('footer.tagline')}</p>
                        <span className="footer-badge">
                            {isTH ? 'แพลตฟอร์มการศึกษา' : 'Education Platform'}
                        </span>
                    </div>

                    {/* Product column */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">
                            {isTH ? 'เครื่องมือ' : 'Product'}
                        </h4>
                        <ul className="footer-links">
                            <li><Link href="/" className="footer-link">{t('footer.home')}</Link></li>
                            <li><Link href="/stocks" className="footer-link">{t('footer.stocks')}</Link></li>
                            <li><Link href="/watchlist" className="footer-link">{isTH ? 'รายการจับตา' : 'Watchlist'}</Link></li>
                            <li><Link href="/portfolio" className="footer-link">{isTH ? 'พอร์ตโฟลิโอ' : 'Portfolio'}</Link></li>
                        </ul>
                    </div>

                    {/* Learn column */}
                    <div className="footer-col">
                        <h4 className="footer-col-title">{t('footer.resources')}</h4>
                        <ul className="footer-links">
                            <li><Link href="/learn" className="footer-link">{t('footer.lessons')}</Link></li>
                            <li><Link href="/glossary" className="footer-link">{t('footer.glossary')}</Link></li>
                        </ul>
                    </div>
                </div>

                {/* ── Disclaimer ── */}
                <div className="footer-disclaimer">
                    <span className="footer-disclaimer-label">Disclaimer —</span>
                    {t('footer.disclaimer')}
                </div>

                {/* ── Bottom bar ── */}
                <div className="footer-bottom">
                    <span>© {year} FinLearn</span>
                    <span className="footer-sep" />
                    <span>{isTH ? 'ไม่ใช่คำแนะนำทางการเงิน' : 'Not financial advice'}</span>
                    <span className="footer-sep" />
                    <span>{isTH ? 'เพื่อการศึกษาเท่านั้น' : 'For educational use only'}</span>
                </div>
            </div>
        </footer>
    );
}
