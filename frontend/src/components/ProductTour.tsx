'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/* ═══════════════════════════════════════════
   Multi-Page Guided Tour
   Navigates between pages, highlights real
   content sections — like usertour.io
   ═══════════════════════════════════════════ */

const TOUR_STEP_KEY = 'finlearn_tour_step';
const TOUR_DONE_KEY = 'finlearn_tour_done';
const HIGHLIGHT_DELAY = 800;
const HIGHLIGHT_DELAY_DATA = 1200;

interface TourStep {
    page: string;
    element: string | null; // null = centered modal
    icon: string;
    titleTH: string; titleEN: string;
    descTH: string;  descEN: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    padding?: number;  // stagePadding override (default 8)
    radius?: number;   // stageRadius override (default 12)
}

const STEPS: TourStep[] = [
    // 0 — Welcome modal
    {
        page: '/',
        element: null,
        icon: '👋',
        titleTH: 'ยินดีต้อนรับสู่ FinLearn!', titleEN: 'Welcome to FinLearn!',
        descTH: 'พาดูฟีเจอร์หลักแต่ละส่วน ใช้เวลาไม่ถึงนาที',
        descEN: "Quick tour of each feature — under a minute.",
    },
    // 1 — Navbar links
    {
        page: '/',
        element: '#tour-nav-links',
        icon: '🧭',
        titleTH: 'เมนูหลัก', titleEN: 'Main Navigation',
        descTH: 'ใช้เมนูนี้เพื่อสลับไปหน้าบทเรียน หุ้น Watchlist และ Portfolio ได้ทันที',
        descEN: 'Use these links to jump between Lessons, Stocks, Watchlist & Portfolio.',
        side: 'bottom', align: 'center',
        padding: 14, radius: 14,
    },
    // 2 — Navbar quick search
    {
        page: '/',
        element: '#tour-search',
        icon: '🔍',
        titleTH: 'ค้นหาด่วน', titleEN: 'Quick Search',
        descTH: 'พิมพ์ชื่อหรือสัญลักษณ์หุ้นเพื่อค้นหาได้จากทุกหน้า',
        descEN: 'Type a stock name or symbol to search from anywhere.',
        side: 'bottom', align: 'end',
        padding: 14, radius: 14,
    },
    // 3 — Learn: difficulty tabs
    {
        page: '/learn',
        element: '#tour-learn-tabs',
        icon: '🎯',
        titleTH: 'เลือกระดับความยาก', titleEN: 'Difficulty Levels',
        descTH: 'กรองบทเรียนตามระดับ — เริ่มต้น กลาง หรือขั้นสูง เลือกที่เหมาะกับคุณ',
        descEN: 'Filter lessons by level — Beginner, Intermediate, or Advanced.',
        side: 'bottom', align: 'start',
        padding: 10, radius: 14,
    },
    // 4 — Learn: featured lesson
    {
        page: '/learn',
        element: '#tour-featured-lesson',
        icon: '📚',
        titleTH: 'บทเรียนแนะนำ', titleEN: 'Featured Lesson',
        descTH: 'เริ่มจากบทเรียนเด่นที่คัดมาให้ คลิกเพื่ออ่านและทำแบบทดสอบท้ายบท',
        descEN: 'Start with this curated lesson. Click to read and take quizzes.',
        side: 'top', align: 'start',
    },
    // 5 — Stocks: search bar
    {
        page: '/stocks',
        element: '#tour-stock-search',
        icon: '📊',
        titleTH: 'ค้นหาหุ้น', titleEN: 'Stock Search',
        descTH: 'พิมพ์ชื่อหรือสัญลักษณ์เพื่อค้นหาหุ้นจาก S&P 500 กว่า 500 ตัว',
        descEN: 'Type a name or symbol to search 500+ S&P 500 stocks.',
        side: 'bottom', align: 'center',
        padding: 12, radius: 14,
    },
    // 6 — Stocks: tabs (Popular / S&P 500 / Search)
    {
        page: '/stocks',
        element: '#tour-stock-tabs',
        icon: '📂',
        titleTH: 'สลับมุมมอง', titleEN: 'Browse Tabs',
        descTH: 'สลับดูหุ้นยอดนิยม S&P 500 ทั้งหมด หรือผลการค้นหา กรองตาม Sector ได้',
        descEN: 'Switch between Popular, full S&P 500 list, or Search results.',
        side: 'bottom', align: 'start',
        padding: 10, radius: 14,
    },
    // 7 — Watchlist header
    {
        page: '/watchlist',
        element: '#tour-watchlist-header',
        icon: '⭐',
        titleTH: 'รายการจับตา', titleEN: 'Your Watchlist',
        descTH: 'หุ้นที่คุณกด ★ จะแสดงที่นี่ ดูราคาเรียลไทม์และเปรียบเทียบได้',
        descEN: 'Stocks you ★ appear here. Track real-time prices and compare.',
        side: 'bottom', align: 'center',
        padding: 10, radius: 14,
    },
    // 8 — Portfolio: performance overview
    {
        page: '/portfolio',
        element: '#tour-portfolio-overview',
        icon: '💼',
        titleTH: 'สรุปพอร์ต', titleEN: 'Portfolio Overview',
        descTH: 'ดูมูลค่าพอร์ตรวม กำไร/ขาดทุน สัดส่วนการลงทุน และเงินสดคงเหลือ',
        descEN: 'View total value, P&L, allocation chart, and cash balance.',
        side: 'right', align: 'start',
    },
    // 9 — Portfolio: holdings & history tabs
    {
        page: '/portfolio',
        element: '#tour-portfolio-tabs',
        icon: '📋',
        titleTH: 'หุ้นที่ถือ & ประวัติ', titleEN: 'Holdings & History',
        descTH: 'สลับดูหุ้นที่ถืออยู่หรือประวัติการซื้อขาย เพิ่มหุ้นใหม่ได้จากปุ่มด้านข้าง',
        descEN: 'Toggle between current holdings and trade history. Add stocks from the side button.',
        side: 'bottom', align: 'start',
        padding: 10, radius: 14,
    },
    // 10 — Finale modal
    {
        page: '/',
        element: null,
        icon: '🚀',
        titleTH: 'พร้อมแล้ว!', titleEN: "You're all set!",
        descTH: 'เริ่มจากบทเรียนแรก หรือสำรวจหุ้นได้เลย ขอให้สนุกกับการเรียนรู้!',
        descEN: 'Start with your first lesson or explore stocks. Enjoy learning!',
    },
];

/* ── Build popover HTML — clean single-card layout ── */
function buildPopover(step: TourStep, idx: number, isTH: boolean): string {
    const total = STEPS.length;
    const isFirst = idx === 0;
    const isLast = idx === total - 1;
    const pct = Math.round(((idx + 1) / total) * 100);

    const title = isTH ? step.titleTH : step.titleEN;
    const desc = isTH ? step.descTH : step.descEN;
    const skipLabel = isTH ? 'ข้ามทัวร์' : 'Skip';

    const prevBtn = !isFirst
        ? `<button data-tour-action="prev" class="flt-btn flt-btn-ghost">${isTH ? '← ย้อนกลับ' : '← Back'}</button>`
        : '';
    const nextLabel = isLast
        ? (isTH ? 'เริ่มใช้งาน →' : 'Get started →')
        : (isTH ? 'ถัดไป →' : 'Next →');
    const nextAction = isLast ? 'done' : 'next';

    return `
        <div class="flt-card">
            <div class="flt-header">
                <span class="flt-title">${title}</span>
                <button data-tour-action="skip" class="flt-close" aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <p class="flt-desc">${desc}</p>
            <div class="flt-progress-row">
                <div class="flt-bar"><div class="flt-bar-fill" style="width:${pct}%"></div></div>
                <span class="flt-counter">${idx + 1}/${total}</span>
            </div>
            <div class="flt-footer">
                <button data-tour-action="skip" class="flt-skip">${skipLabel}</button>
                <div class="flt-actions">
                    ${prevBtn}
                    <button data-tour-action="${nextAction}" class="flt-btn flt-btn-primary">${nextLabel}</button>
                </div>
            </div>
        </div>
    `;
}

/* ── Wait for element to appear in DOM (must be visible) ── */
function waitForEl(selector: string, timeout = 5000): Promise<Element | null> {
    return new Promise(resolve => {
        const check = (el: Element | null): el is Element => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && el.getBoundingClientRect().width > 0;
        };
        const el = document.querySelector(selector);
        if (check(el)) return resolve(el);
        const t0 = Date.now();
        const iv = setInterval(() => {
            const el = document.querySelector(selector);
            if (check(el)) { clearInterval(iv); resolve(el); }
            else if (Date.now() - t0 > timeout) { clearInterval(iv); resolve(null); }
        }, 200);
    });
}

export default function ProductTour() {
    const { status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { locale } = useI18n();

    const [tourStep, setTourStep] = useState<number | null>(null);
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);
    const navigatingRef = useRef(false);

    /* ── Single init effect: resume in-progress tour OR start fresh after onboarding ── */
    useEffect(() => {
        if (status !== 'authenticated') return;
        if (tourStep !== null) return;
        if (localStorage.getItem(TOUR_DONE_KEY)) return;

        // Case 1: Resume a tour that was already in progress
        const saved = localStorage.getItem(TOUR_STEP_KEY);
        if (saved !== null) {
            queueMicrotask(() => setTourStep(parseInt(saved, 10)));
            return;
        }

        // Case 2: Fresh start — only if onboarding set the ready flag AND we're on homepage
        if (!localStorage.getItem('finlearn_tour_ready')) return;
        if (pathname !== '/') return;

        const timer = setTimeout(() => {
            localStorage.removeItem('finlearn_tour_ready');
            localStorage.setItem(TOUR_STEP_KEY, '0');
            setTourStep(0);
        }, 1200);
        return () => clearTimeout(timer);
    }, [status, pathname, tourStep]);

    /* ── Finish tour ── */
    const finishTour = useCallback(() => {
        localStorage.setItem(TOUR_DONE_KEY, 'true');
        localStorage.removeItem(TOUR_STEP_KEY);
        if (driverRef.current) {
            try { driverRef.current.destroy(); } catch { /* noop */ }
            driverRef.current = null;
        }
        setTourStep(null);
    }, []);

    /* ── Destroy current highlight safely ── */
    const destroyHighlight = useCallback(() => {
        if (driverRef.current) {
            try { driverRef.current.destroy(); } catch { /* noop */ }
            driverRef.current = null;
        }
    }, []);

    /* ── Scroll to top — works across all resolutions and browsers ── */
    const scrollToTop = useCallback((smooth = false) => {
        const behavior = smooth ? 'smooth' : 'instant';
        try {
            window.scrollTo({ top: 0, left: 0, behavior });
        } catch {
            window.scrollTo(0, 0);
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);

    /* ── Go to a specific step ── */
    const goToStep = useCallback((step: number) => {
        if (step < 0 || step >= STEPS.length) return;
        destroyHighlight();
        localStorage.setItem(TOUR_STEP_KEY, String(step));
        setTourStep(step);

        const target = STEPS[step];
        if (target.page !== pathname) {
            navigatingRef.current = true;
            router.push(target.page);
        } else {
            scrollToTop(true);
        }
    }, [pathname, router, destroyHighlight, scrollToTop]);

    /* ── Button click delegation (for buttons inside Driver.js popover) ── */
    useEffect(() => {
        if (tourStep === null) return;
        const handler = (e: MouseEvent) => {
            const btn = (e.target as HTMLElement).closest('[data-tour-action]');
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            const action = btn.getAttribute('data-tour-action');
            if (action === 'next') goToStep(tourStep + 1);
            else if (action === 'prev') goToStep(tourStep - 1);
            else if (action === 'done' || action === 'skip') finishTour();
        };
        document.addEventListener('click', handler, true);
        return () => document.removeEventListener('click', handler, true);
    }, [tourStep, goToStep, finishTour]);

    /* ── ESC key to skip ── */
    useEffect(() => {
        if (tourStep === null) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') finishTour(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [tourStep, finishTour]);

    /* ── Highlight current step when on correct page ── */
    useEffect(() => {
        if (tourStep === null) return;
        const step = STEPS[tourStep];
        if (!step) { queueMicrotask(finishTour); return; }

        // Only highlight when on the correct page
        if (step.page !== pathname) {
            // If we're not navigating (user went elsewhere manually), just wait
            if (!navigatingRef.current) return;
            navigatingRef.current = false;
            return;
        }
        
        // Just arrived at correct page after navigation - scroll to top
        if (navigatingRef.current) {
            scrollToTop(false);
        }
        navigatingRef.current = false;

        // For steps with no element, we render a React modal (see JSX return)
        if (!step.element) return;

        // Pages that need data to load get a longer delay
        const needsData = ['/learn', '/portfolio'].includes(step.page);
        const delay = needsData ? HIGHLIGHT_DELAY_DATA : HIGHLIGHT_DELAY;

        // Wait for element, then highlight
        const timer = setTimeout(async () => {
            const el = await waitForEl(step.element!, needsData ? 6000 : 5000);
            if (!el) {
                // Element never appeared — auto-skip to next step
                if (tourStep < STEPS.length - 1) {
                    queueMicrotask(() => goToStep(tourStep + 1));
                }
                return;
            }

            // Scroll element into view if not in viewport
            const rect = el.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await new Promise(r => setTimeout(r, 400));
            }

            const isTH = locale === 'th';
            const html = buildPopover(step, tourStep, isTH);

            destroyHighlight();

            const d = driver({
                animate: true,
                allowClose: false,
                overlayColor: 'rgba(0, 0, 0, 0.5)',
                overlayOpacity: 1,
                stagePadding: step.padding ?? 8,
                stageRadius: step.radius ?? 12,
                popoverClass: 'flt-driver flt-driver-custom',
                showButtons: [],
                showProgress: false,
                onDestroyStarted: () => {
                    finishTour();
                    d.destroy();
                },
            });

            driverRef.current = d;

            d.highlight({
                element: step.element!,
                popover: {
                    title: '',
                    description: html,
                    side: step.side || 'bottom',
                    align: step.align || 'center',
                },
            });
        }, delay);

        return () => clearTimeout(timer);
    }, [tourStep, pathname, locale, destroyHighlight, finishTour, scrollToTop, goToStep]);

    /* ── Clean up on unmount ── */
    useEffect(() => {
        return () => destroyHighlight();
    }, [destroyHighlight]);

    /* ── Render: modal overlay for welcome/finale steps ── */
    if (tourStep === null) return null;
    const step = STEPS[tourStep];
    if (!step || step.element || step.page !== pathname) return null;

    const isTH = locale === 'th';
    const isFirst = tourStep === 0;
    const isLast = tourStep === STEPS.length - 1;
    const title = isTH ? step.titleTH : step.titleEN;
    const desc = isTH ? step.descTH : step.descEN;
    const pct = Math.round(((tourStep + 1) / STEPS.length) * 100);

    const nextLabel = isFirst
        ? (isTH ? 'เริ่มทัวร์ →' : 'Start tour →')
        : isLast
            ? (isTH ? 'เริ่มใช้งาน →' : 'Get started →')
            : (isTH ? 'ถัดไป →' : 'Next →');

    return (
        <div className="flt-overlay" onClick={finishTour}>
            <div className="flt-modal" onClick={e => e.stopPropagation()}>
                {/* Close */}
                <button className="flt-modal-close" onClick={finishTour} aria-label="Close">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>

                {/* Icon */}
                <div className="flt-modal-icon">{step.icon}</div>

                {/* Title */}
                <h3 className="flt-modal-title">{title}</h3>

                {/* Description */}
                <p className="flt-modal-desc">{desc}</p>

                {/* Progress */}
                <div className="flt-progress-row" style={{ marginTop: '20px' }}>
                    <div className="flt-bar"><div className="flt-bar-fill" style={{ width: `${pct}%` }} /></div>
                    <span className="flt-counter">{tourStep + 1}/{STEPS.length}</span>
                </div>

                {/* Footer */}
                <div className="flt-footer" style={{ marginTop: '16px' }}>
                    {!isLast ? (
                        <button className="flt-skip" onClick={finishTour}>
                            {isTH ? 'ข้ามทัวร์' : 'Skip'}
                        </button>
                    ) : <span />}
                    <div className="flt-actions">
                        {!isFirst && (
                            <button className="flt-btn flt-btn-ghost" onClick={() => goToStep(tourStep - 1)}>
                                {isTH ? '← ย้อนกลับ' : '← Back'}
                            </button>
                        )}
                        <button className="flt-btn flt-btn-primary" onClick={isLast ? finishTour : () => goToStep(tourStep + 1)}>
                            {nextLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
