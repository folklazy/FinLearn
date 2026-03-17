'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, ChevronRight, ChevronLeft, Award, CheckCircle, XCircle, RotateCcw, Play, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface LessonSection { heading: string; content: string; headingEn?: string; contentEn?: string; }
interface QuizQuestion { question: string; questionEn?: string; options: string[]; optionsEn?: string[]; answer: number; }
interface Lesson {
    id: string; title: string; titleEn: string; description: string; category: string;
    difficulty: string; duration: number; icon: string; thumbnail?: string;
    sections: LessonSection[]; keyTakeaways: string[]; keyTakeawaysEn?: string[]; quiz?: QuizQuestion[];
}

const DIFF_COLORS: Record<string, { key: string; color: string; bg: string; border: string }> = {
    beginner: { key: 'learn.beginner', color: 'var(--success)', bg: 'var(--success-bg)', border: 'rgba(52,211,153,0.2)' },
    intermediate: { key: 'learn.intermediate', color: 'var(--warning)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
    advanced: { key: 'learn.advanced', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(251,113,133,0.2)' },
};

const CAT_LABELS: Record<string, { th: string; en: string }> = {
    basics: { th: 'พื้นฐาน', en: 'Getting Started' },
    analysis: { th: 'วิเคราะห์', en: 'Analysis' },
    strategy: { th: 'กลยุทธ์', en: 'Strategy' },
    risk: { th: 'ความเสี่ยง', en: 'Risk Management' },
};

function renderContent(content: string) {
    return content.split('\n\n').map((para, i) => {
        if (para.startsWith('|')) {
            const rows = para.split('\n').filter(r => r.trim() && !r.match(/^\|[\s-|]+\|$/));
            return (
                <div key={i} style={{ overflowX: 'auto', margin: '16px 0' }}>
                    <table className="data-table" style={{ fontSize: '0.82rem' }}>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri}>
                                    {row.split('|').filter(Boolean).map((cell, ci) => {
                                        const Tag = ri === 0 ? 'th' : 'td';
                                        return <Tag key={ci}>{cell.trim()}</Tag>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        const formatted = para
            .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary);font-weight:700">$1</strong>')
            .replace(/\n- /g, '\n• ')
            .replace(/\n(\d+)\. /g, '\n$1. ');
        const lines = formatted.split('\n');
        return (
            <div key={i} style={{ marginBottom: '14px' }}>
                {lines.map((line, li) => {
                    if (line.startsWith('• ') || line.match(/^\d+\./)) {
                        return (
                            <div key={li} style={{ paddingLeft: '18px', margin: '5px 0', lineHeight: 1.8, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, top: 0, lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: line.startsWith('• ') ? '•' : '' }} />
                                <span dangerouslySetInnerHTML={{ __html: line.startsWith('• ') ? line.slice(2) : line }} />
                            </div>
                        );
                    }
                    return <p key={li} style={{ lineHeight: 1.8, margin: '3px 0' }} dangerouslySetInnerHTML={{ __html: line }} />;
                })}
            </div>
        );
    });
}

export default function LessonDetailPage() {
    const params = useParams();
    const { t, locale } = useI18n();
    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState(-1);
    const [visitedSections, setVisitedSections] = useState<Set<number>>(new Set());
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!params.id) return;
        api.getLesson(params.id as string)
            .then(data => setLesson(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [params.id]);

    const goToSection = useCallback((idx: number) => {
        setActiveSection(idx);
        if (idx >= 0 && idx < (lesson?.sections.length ?? 0)) {
            setVisitedSections(prev => new Set(prev).add(idx));
        }
        setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }, [lesson?.sections.length]);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '48px', maxWidth: '1100px' }}>
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '28px', borderRadius: '8px' }} />
                <div style={{ display: 'flex', gap: '32px' }}>
                    <div style={{ flex: 1 }}>
                        <div className="skeleton" style={{ height: '260px', marginBottom: '20px', borderRadius: '16px' }} />
                        <div className="skeleton" style={{ height: '28px', width: '60%', marginBottom: '12px', borderRadius: '8px' }} />
                        <div className="skeleton" style={{ height: '80px', borderRadius: '8px' }} />
                    </div>
                    <div style={{ width: '340px', flexShrink: 0 }}>
                        <div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '16px', opacity: 0.3 }}>📚</div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '10px' }}>{t('learn.notFound')}</h1>
                <Link href="/learn" style={{ color: 'var(--primary-light)', fontSize: '0.88rem', textDecoration: 'none' }}>
                    <ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    {t('learn.backToLessons')}
                </Link>
            </div>
        );
    }

    const diffBase = DIFF_COLORS[lesson.difficulty] || DIFF_COLORS.beginner;
    const diff = { ...diffBase, label: t(diffBase.key) };
    const catLabel = CAT_LABELS[lesson.category];
    const hasQuiz = !!(lesson.quiz && lesson.quiz.length > 0);
    const quizStepIdx = lesson.sections.length;
    const isQuizStep = activeSection === quizStepIdx;
    const isReading = activeSection >= 0 && activeSection < lesson.sections.length;
    const section = isReading ? lesson.sections[activeSection] : null;
    const totalSteps = lesson.sections.length + (hasQuiz ? 1 : 0);
    const progress = activeSection >= 0 ? (Math.min(activeSection + 1, totalSteps) / totalSteps) * 100 : 0;
    const quizScore = lesson.quiz ? Object.entries(quizAnswers).filter(([i, a]) => lesson.quiz![Number(i)].answer === a).length : 0;
    const isLastSection = activeSection === lesson.sections.length - 1;
    const allSectionsDone = visitedSections.size >= lesson.sections.length;
    const estPerSection = Math.round(lesson.duration / lesson.sections.length);

    return (
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '80px', maxWidth: '1100px' }}>

            {/* Back link */}
            <Link href="/learn" className="animate-fade-up" style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px',
                textDecoration: 'none', transition: 'color 0.15s',
            }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <ArrowLeft size={15} /> {locale === 'th' ? 'กลับไปหน้าบทเรียน' : 'Back to lessons'}
            </Link>

            {/* ══════ Two-column layout ══════ */}
            <div className="animate-fade-up lesson-layout" style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

                {/* ── LEFT COLUMN (main content) ── */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Hero thumbnail */}
                    <div style={{
                        position: 'relative', width: '100%', aspectRatio: '16/9',
                        borderRadius: '16px', overflow: 'hidden', marginBottom: '20px',
                        background: 'linear-gradient(135deg, #1a1c2e 0%, #2d1f3d 100%)',
                    }}>
                        {lesson.thumbnail ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={lesson.thumbnail} alt={lesson.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,14,0.9) 0%, rgba(14,14,14,0.2) 50%, transparent 100%)' }} />
                            </>
                        ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                                {lesson.icon}
                            </div>
                        )}
                        {/* Play button overlay */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            width: '60px', height: '60px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                            onClick={() => goToSection(0)}
                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}>
                            <Play size={22} fill="white" style={{ color: 'white', marginLeft: '3px' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '16px', left: '20px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {locale === 'th' ? 'เริ่มอ่านบทเรียน' : 'START LESSON'}
                        </div>
                    </div>

                    {/* Metadata pills */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {catLabel && (
                            <span style={{
                                fontSize: '0.68rem', fontWeight: 700, padding: '4px 12px', borderRadius: '6px',
                                background: 'var(--primary)', color: 'white',
                            }}>
                                {locale === 'en' ? catLabel.en : catLabel.th}
                            </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <Clock size={12} /> {lesson.duration} {t('learn.minutes')}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <BookOpen size={12} /> {lesson.sections.length} {t('learn.topics')}
                        </span>
                        <span style={{
                            fontSize: '0.62rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px',
                            background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
                        }}>{diff.label}</span>
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3, marginBottom: '8px' }}>
                        {locale === 'en' ? lesson.titleEn : lesson.title}
                    </h1>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.6 }}>
                        {lesson.description}
                    </p>

                    {/* ── What you'll learn ── */}
                    <div style={{
                        padding: '20px 24px', borderRadius: '14px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        marginBottom: '24px',
                    }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>
                            {locale === 'th' ? 'สิ่งที่คุณจะได้เรียนรู้' : 'What you\'ll learn'}
                        </h2>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
                            {(locale === 'en' ? (lesson.keyTakeawaysEn || lesson.keyTakeaways) : lesson.keyTakeaways).map((tip, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                    <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                                    <span style={{ lineHeight: 1.6 }}>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* ══ Mobile Section Nav (visible only on mobile) ══ */}
                    <div className="lesson-mobile-nav">
                        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', WebkitOverflowScrolling: 'touch' }}>
                            {lesson.sections.map((s, i) => {
                                const isActive = activeSection === i;
                                const isDone = visitedSections.has(i) && activeSection !== i;
                                return (
                                    <button key={i} onClick={() => goToSection(i)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '7px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
                                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                        flexShrink: 0, transition: 'all 0.15s',
                                        background: isActive ? 'var(--primary)' : isDone ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)',
                                        color: isActive ? 'white' : isDone ? 'var(--success)' : 'var(--text-secondary)',
                                        border: isActive ? '1px solid var(--primary)' : isDone ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--border)',
                                    }}>
                                        {isDone && <CheckCircle2 size={11} />}
                                        {locale === 'th' ? `หัวข้อ ${i + 1}` : `Section ${i + 1}`}
                                    </button>
                                );
                            })}
                            {hasQuiz && (
                                <button onClick={() => { if (allSectionsDone) goToSection(quizStepIdx); }} style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '7px 14px', borderRadius: '100px', whiteSpace: 'nowrap',
                                    fontSize: '0.75rem', fontWeight: 600, cursor: allSectionsDone ? 'pointer' : 'default',
                                    fontFamily: 'inherit', flexShrink: 0, transition: 'all 0.15s',
                                    opacity: allSectionsDone ? 1 : 0.4,
                                    background: isQuizStep ? 'var(--primary)' : 'var(--bg-secondary)',
                                    color: isQuizStep ? 'white' : 'var(--text-secondary)',
                                    border: isQuizStep ? '1px solid var(--primary)' : '1px solid var(--border)',
                                }}>
                                    <Award size={11} /> Quiz
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ══════ READING MODE ══════ */}
                    {isReading && section && (
                        <div ref={contentRef}>
                            {/* Progress bar */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {t('learn.topic')} {activeSection + 1} / {lesson.sections.length}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                        {Math.round(progress)}%
                                    </span>
                                </div>
                                <div className="progress-bar" style={{ height: '4px' }}>
                                    <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width 0.4s var(--ease)' }} />
                                </div>
                            </div>

                            {/* Section content */}
                            <div className="detail-section" style={{ marginBottom: '24px' }}>
                                <h2 className="section-heading">
                                    <span className="accent-bar" />
                                    {locale === 'en' ? (section.headingEn || section.heading) : section.heading}
                                </h2>
                                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                                    {renderContent(locale === 'en' ? (section.contentEn || section.content) : section.content)}
                                </div>

                                {/* Prev / Next */}
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    marginTop: '32px', paddingTop: '18px', borderTop: '1px solid var(--border)',
                                }}>
                                    <button onClick={() => goToSection(activeSection - 1)} disabled={activeSection === 0}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                                            color: activeSection === 0 ? 'var(--text-muted)' : 'var(--primary-light)',
                                            background: 'none', border: 'none', cursor: activeSection === 0 ? 'default' : 'pointer',
                                            opacity: activeSection === 0 ? 0.3 : 1, transition: 'opacity 0.15s',
                                        }}>
                                        <ChevronLeft size={16} /> {t('learn.prev')}
                                    </button>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '100px', background: 'var(--bg-secondary)' }}>
                                        {activeSection + 1} / {lesson.sections.length}
                                    </span>
                                    {isLastSection && hasQuiz && allSectionsDone ? (
                                        <button onClick={() => goToSection(quizStepIdx)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                                                color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
                                            }}>
                                            {locale === 'th' ? 'ทำแบบทดสอบ' : 'Take Quiz'} <Award size={15} />
                                        </button>
                                    ) : (
                                        <button onClick={() => goToSection(activeSection + 1)} disabled={isLastSection}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                                                color: isLastSection ? 'var(--text-muted)' : 'var(--primary-light)',
                                                background: 'none', border: 'none', cursor: isLastSection ? 'default' : 'pointer',
                                                opacity: isLastSection ? 0.3 : 1, transition: 'opacity 0.15s',
                                            }}>
                                            {t('learn.next')} <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ══════ QUIZ MODE ══════ */}
                    {isQuizStep && hasQuiz && (
                        <div ref={contentRef}>
                            {/* Progress bar */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                        {locale === 'th' ? 'แบบทดสอบความเข้าใจ' : 'Comprehension Quiz'}
                                    </span>
                                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-light)' }}>100%</span>
                                </div>
                                <div className="progress-bar" style={{ height: '4px' }}>
                                    <div className="progress-fill" style={{ width: '100%', transition: 'width 0.4s var(--ease)' }} />
                                </div>
                            </div>
                            <QuizBlock quiz={lesson.quiz!} locale={locale} t={t}
                                quizAnswers={quizAnswers} setQuizAnswers={setQuizAnswers}
                                quizSubmitted={quizSubmitted} setQuizSubmitted={setQuizSubmitted}
                                quizScore={quizScore} />
                            {/* Back to sections */}
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
                                <button onClick={() => goToSection(lesson.sections.length - 1)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit', color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <ChevronLeft size={16} /> {locale === 'th' ? 'กลับไปเนื้อหา' : 'Back to content'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN (sidebar) ── */}
                <div style={{ width: '340px', flexShrink: 0, position: 'sticky', top: '80px' }}
                    className="lesson-sidebar">

                    {/* CTA card */}
                    <div style={{
                        padding: '20px', borderRadius: '16px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        marginBottom: '16px',
                    }}>
                        <button onClick={() => goToSection(isReading || isQuizStep ? activeSection : 0)} style={{
                            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                            background: 'var(--success)', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                            fontFamily: 'inherit', cursor: 'pointer', transition: 'all 0.15s',
                            letterSpacing: '-0.01em',
                        }}
                            onMouseOver={e => { e.currentTarget.style.opacity = '0.9'; }}
                            onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}>
                            {isReading || isQuizStep
                                ? (locale === 'th' ? 'อ่านต่อ' : 'Continue Reading')
                                : (locale === 'th' ? 'เริ่มเรียนเลย' : 'Start Learning')}
                        </button>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <FileText size={11} />
                            {locale === 'th' ? 'เรียนได้ทันที ไม่มีค่าใช้จ่าย' : 'Start instantly, completely free'}
                        </p>
                    </div>

                    {/* Section list */}
                    <div style={{
                        borderRadius: '16px', overflow: 'hidden',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid var(--border)',
                        }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                                {locale === 'th' ? 'เนื้อหาบทเรียน' : 'Lesson Content'}
                            </span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {lesson.sections.length} {t('learn.topics')} · {lesson.duration} {t('learn.minutes')}
                            </span>
                        </div>

                        {/* Section items */}
                        <div style={{ padding: '8px 12px 12px' }}>
                            {lesson.sections.map((s, i) => {
                                const isActive = activeSection === i;
                                const isDone = visitedSections.has(i) && activeSection !== i;
                                return (
                                    <button key={i} onClick={() => goToSection(i)} style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 10px', borderRadius: '10px', border: 'none',
                                        background: isActive ? 'var(--tint-bg)' : 'transparent',
                                        cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                                        transition: 'background 0.15s',
                                    }}
                                        onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--tint-bg)'; }}
                                        onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                                        <div style={{
                                            width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isDone ? 'rgba(34,197,94,0.12)' : isActive ? 'rgba(124,108,240,0.12)' : 'var(--tint-bg)',
                                            border: `1px solid ${isDone ? 'rgba(34,197,94,0.25)' : isActive ? 'rgba(124,108,240,0.25)' : 'var(--border)'}`,
                                        }}>
                                            {isDone ? (
                                                <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                                            ) : (
                                                <Play size={11} fill={isActive ? 'var(--primary-light)' : 'var(--text-muted)'} style={{ color: isActive ? 'var(--primary-light)' : 'var(--text-muted)', marginLeft: '1px' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.78rem', fontWeight: isActive ? 650 : 500,
                                                color: isDone ? 'var(--success)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            }}>
                                                {locale === 'en' ? (s.headingEn || s.heading) : s.heading}
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                                            {estPerSection} {t('learn.minutes')}
                                        </span>
                                    </button>
                                );
                            })}

                            {/* Quiz row */}
                            {hasQuiz && (
                                <button onClick={() => { if (allSectionsDone) goToSection(quizStepIdx); }} style={{
                                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 10px', borderRadius: '10px', border: 'none',
                                    background: isQuizStep ? 'var(--tint-bg)' : 'transparent',
                                    cursor: allSectionsDone ? 'pointer' : 'default',
                                    opacity: allSectionsDone ? 1 : 0.45,
                                    fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.15s',
                                }}
                                    onMouseOver={e => { if (allSectionsDone && !isQuizStep) e.currentTarget.style.background = 'var(--tint-bg)'; }}
                                    onMouseOut={e => { if (!isQuizStep) e.currentTarget.style.background = 'transparent'; }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: isQuizStep ? 'rgba(124,108,240,0.12)' : quizSubmitted ? 'rgba(34,197,94,0.12)' : 'var(--tint-bg)',
                                        border: `1px solid ${isQuizStep ? 'rgba(124,108,240,0.25)' : quizSubmitted ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                                    }}>
                                        {quizSubmitted ? (
                                            <CheckCircle size={13} style={{ color: 'var(--success)' }} />
                                        ) : (
                                            <Award size={12} style={{ color: isQuizStep ? 'var(--primary-light)' : 'var(--text-muted)' }} />
                                        )}
                                    </div>
                                    <span style={{ fontSize: '0.78rem', fontWeight: isQuizStep ? 650 : 500, color: isQuizStep ? 'var(--text-primary)' : quizSubmitted ? 'var(--success)' : 'var(--text-muted)' }}>
                                        {locale === 'th' ? 'แบบทดสอบความเข้าใจ' : 'Comprehension Quiz'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Responsive handled by globals.css */}
        </div>
    );
}

/* ── Quiz Component (extracted to keep main component cleaner) ── */
function QuizBlock({ quiz, locale, t, quizAnswers, setQuizAnswers, quizSubmitted, setQuizSubmitted, quizScore }: {
    quiz: QuizQuestion[]; locale: string; t: (k: string) => string;
    quizAnswers: Record<number, number>; setQuizAnswers: React.Dispatch<React.SetStateAction<Record<number, number>>>;
    quizSubmitted: boolean; setQuizSubmitted: React.Dispatch<React.SetStateAction<boolean>>; quizScore: number;
}) {
    return (
        <div className="detail-section" style={{ marginBottom: '24px' }}>
            <h3 className="section-heading" style={{ marginBottom: '20px' }}>
                <span className="accent-bar" style={{ background: 'var(--primary-light)' }} />
                <Award size={16} className="heading-icon" /> {t('learn.quiz')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {quiz.map((q, qi) => (
                    <div key={qi}>
                        <p style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--primary-light)', marginRight: '6px' }}>{qi + 1}.</span>
                            {locale === 'en' ? (q.questionEn || q.question) : q.question}
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(locale === 'en' ? (q.optionsEn || q.options) : q.options).map((opt, oi) => {
                                const selected = quizAnswers[qi] === oi;
                                const isCorrect = quizSubmitted && q.answer === oi;
                                const isWrong = quizSubmitted && selected && q.answer !== oi;
                                return (
                                    <button key={oi} onClick={() => { if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                                        style={{
                                            padding: '11px 16px', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', textAlign: 'left',
                                            fontFamily: 'inherit', lineHeight: 1.4,
                                            background: isCorrect ? 'rgba(74,222,128,0.1)' : isWrong ? 'rgba(248,113,113,0.1)' : selected ? 'rgba(124,108,240,0.06)' : 'var(--bg-secondary)',
                                            border: isCorrect ? '1px solid rgba(74,222,128,0.4)' : isWrong ? '1px solid rgba(248,113,113,0.4)' : selected ? '1px solid var(--primary)' : '1px solid var(--border)',
                                            color: 'var(--text-secondary)', cursor: quizSubmitted ? 'default' : 'pointer', transition: 'all 0.2s var(--ease)',
                                        }}>
                                        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{
                                                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.68rem', fontWeight: 700,
                                                    background: isCorrect ? 'rgba(74,222,128,0.2)' : isWrong ? 'rgba(248,113,113,0.2)' : selected ? 'rgba(124,108,240,0.15)' : 'var(--tint-bg)',
                                                    color: isCorrect ? '#4ade80' : isWrong ? '#f87171' : selected ? 'var(--primary-light)' : 'var(--text-muted)',
                                                    border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : isWrong ? 'rgba(248,113,113,0.3)' : selected ? 'rgba(124,108,240,0.3)' : 'var(--border)'}`,
                                                }}>
                                                    {String.fromCharCode(65 + oi)}
                                                </span>
                                                <span>{opt}</span>
                                            </span>
                                            {isCorrect && <CheckCircle size={15} style={{ color: '#4ade80', flexShrink: 0 }} />}
                                            {isWrong && <XCircle size={15} style={{ color: '#f87171', flexShrink: 0 }} />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '24px' }}>
                {!quizSubmitted ? (
                    <button onClick={() => setQuizSubmitted(true)}
                        disabled={Object.keys(quizAnswers).length < quiz.length}
                        style={{
                            padding: '11px 28px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700,
                            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
                            background: Object.keys(quizAnswers).length < quiz.length ? 'var(--bg-secondary)' : 'var(--primary)',
                            color: Object.keys(quizAnswers).length < quiz.length ? 'var(--text-muted)' : 'white',
                            border: 'none', cursor: Object.keys(quizAnswers).length < quiz.length ? 'default' : 'pointer',
                            opacity: Object.keys(quizAnswers).length < quiz.length ? 0.5 : 1, transition: 'all 0.2s',
                        }}>
                        <Award size={15} /> {t('learn.checkAnswers')}
                    </button>
                ) : (
                    <div style={{
                        padding: '16px 20px', borderRadius: 'var(--radius-md)',
                        background: quizScore === quiz.length ? 'rgba(74,222,128,0.06)' : 'rgba(250,204,21,0.06)',
                        border: `1px solid ${quizScore === quiz.length ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`,
                        display: 'flex', alignItems: 'center', gap: '14px',
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                            background: quizScore === quiz.length ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Award size={22} style={{ color: quizScore === quiz.length ? '#4ade80' : '#facc15' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>
                                {quizScore === quiz.length ? t('learn.perfect') : `${t('learn.got')} ${quizScore} ${t('learn.of')} ${quiz.length} ${t('learn.questions')}`}
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                {quizScore === quiz.length ? t('learn.perfectDesc') : t('learn.tryAgainDesc')}
                            </p>
                        </div>
                        {quizScore < quiz.length && (
                            <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
                                    color: 'var(--primary-light)', background: 'none',
                                    border: '1px solid rgba(124,108,240,0.2)', borderRadius: '100px',
                                    padding: '6px 14px', cursor: 'pointer', flexShrink: 0,
                                }}>
                                <RotateCcw size={13} /> {t('learn.retry')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
