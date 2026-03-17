'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, ChevronRight, ChevronLeft, Award, CheckCircle, XCircle, Lightbulb, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { useI18n } from '@/lib/i18n';

interface LessonSection {
    heading: string;
    content: string;
    headingEn?: string;
    contentEn?: string;
}

interface QuizQuestion {
    question: string;
    questionEn?: string;
    options: string[];
    optionsEn?: string[];
    answer: number;
}

interface Lesson {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
    icon: string;
    thumbnail?: string;
    sections: LessonSection[];
    keyTakeaways: string[];
    keyTakeawaysEn?: string[];
    quiz?: QuizQuestion[];
}

const DIFF_COLORS_BASE: Record<string, { key: string; color: string; bg: string; border: string }> = {
    beginner: { key: 'learn.beginner', color: 'var(--success)', bg: 'var(--success-bg)', border: 'rgba(52,211,153,0.2)' },
    intermediate: { key: 'learn.intermediate', color: 'var(--warning)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
    advanced: { key: 'learn.advanced', color: 'var(--danger)', bg: 'var(--danger-bg)', border: 'rgba(251,113,133,0.2)' },
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
                            <div key={li} style={{
                                paddingLeft: '18px', margin: '5px 0', lineHeight: 1.8,
                                position: 'relative',
                            }}>
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
    const [activeSection, setActiveSection] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    useEffect(() => {
        if (!params.id) return;
        api.getLesson(params.id as string)
            .then(data => setLesson(data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [params.id]);

    const goToSection = useCallback((idx: number) => {
        setActiveSection(idx);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '48px', maxWidth: '800px' }}>
                <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '28px', borderRadius: '8px' }} />
                <div className="skeleton" style={{ height: '120px', marginBottom: '16px', borderRadius: 'var(--radius-md)' }} />
                <div className="skeleton" style={{ height: '10px', width: '100%', marginBottom: '28px', borderRadius: '100px' }} />
                <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-md)' }} />
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

    const diffBase = DIFF_COLORS_BASE[lesson.difficulty] || DIFF_COLORS_BASE.beginner;
    const diff = { ...diffBase, label: t(diffBase.key) };
    const section = lesson.sections[activeSection];
    const progress = ((activeSection + 1) / lesson.sections.length) * 100;
    const quizScore = lesson.quiz ? Object.entries(quizAnswers).filter(([i, a]) => lesson.quiz![Number(i)].answer === a).length : 0;
    const isLastSection = activeSection === lesson.sections.length - 1;

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '800px' }}>

            {/* ── Back link ── */}
            <Link href="/learn" className="animate-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--primary-light)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                <ArrowLeft size={15} /> {t('learn.allLessons')}
            </Link>

            {/* ── Hero thumbnail ── */}
            {lesson.thumbnail && (
                <div className="animate-fade-up" style={{
                    position: 'relative', width: '100%', aspectRatio: '21/9',
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    marginBottom: '24px', background: 'linear-gradient(135deg, #1a1c2e 0%, #2d1f3d 100%)',
                }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={lesson.thumbnail}
                        alt={lesson.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(14,15,20,0.85) 0%, transparent 60%)',
                    }} />
                    <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{
                                fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
                                padding: '2px 8px', borderRadius: '4px',
                                background: diff.bg, color: diff.color,
                            }}>{diff.label.toUpperCase()}</span>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={11} /> {lesson.duration} {t('learn.minutes')}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <BookOpen size={11} /> {lesson.sections.length} {t('learn.topics')}
                            </span>
                        </div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3, color: '#fff' }}>{locale === 'en' ? lesson.titleEn : lesson.title}</h1>
                        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{locale === 'en' ? lesson.title : lesson.titleEn}</p>
                    </div>
                </div>
            )}

            {/* ── Header (fallback if no thumbnail) ── */}
            {!lesson.thumbnail && (
                <div className="animate-fade-up delay-1" style={{ marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '14px',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.8rem', flexShrink: 0,
                        }}>
                            {lesson.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.3 }}>{locale === 'en' ? lesson.titleEn : lesson.title}</h1>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>{locale === 'en' ? lesson.title : lesson.titleEn}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px',
                            background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
                        }}>{diff.label}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {lesson.duration} {t('learn.minutes')}</span>
                        <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--border-light)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {lesson.sections.length} {t('learn.topics')}</span>
                    </div>
                </div>
            )}

            {/* ── Progress bar ── */}
            <div className="animate-fade-up delay-2" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
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

            {/* ── Section stepper (horizontal pills) ── */}
            <div className="animate-fade-up delay-3 carousel-scroll" style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
                {lesson.sections.map((s, i) => {
                    const done = i < activeSection;
                    const active = i === activeSection;
                    return (
                        <button key={i} onClick={() => goToSection(i)} style={{
                            display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap',
                            padding: '7px 14px', borderRadius: '100px',
                            fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                            fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0,
                            transition: 'all 0.15s',
                            background: active ? 'var(--primary)' : done ? 'rgba(34,197,94,0.08)' : 'var(--bg-secondary)',
                            color: active ? 'white' : done ? 'var(--success)' : 'var(--text-muted)',
                            border: active ? '1px solid var(--primary)' : done ? '1px solid rgba(34,197,94,0.2)' : '1px solid var(--border)',
                        }}>
                            {done && <CheckCircle size={12} />}
                            <span>{i + 1}. {(() => { const h = locale === 'en' ? (s.headingEn || s.heading) : s.heading; return h.length > 18 ? h.slice(0, 18) + '…' : h; })()}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Section content ── */}
            <div className="detail-section animate-fade-up" style={{ marginBottom: '24px' }}>
                <h2 className="section-heading">
                    <span className="accent-bar" />
                    {locale === 'en' ? (section.headingEn || section.heading) : section.heading}
                </h2>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {renderContent(locale === 'en' ? (section.contentEn || section.content) : section.content)}
                </div>

                {/* Prev / Next nav */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginTop: '32px', paddingTop: '18px', borderTop: '1px solid var(--border)',
                }}>
                    <button onClick={() => goToSection(activeSection - 1)}
                        disabled={activeSection === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                            color: activeSection === 0 ? 'var(--text-muted)' : 'var(--primary-light)',
                            background: 'none', border: 'none', cursor: activeSection === 0 ? 'default' : 'pointer',
                            opacity: activeSection === 0 ? 0.3 : 1, transition: 'opacity 0.15s',
                        }}>
                        <ChevronLeft size={16} /> {t('learn.prev')}
                    </button>
                    <span style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)',
                        padding: '4px 12px', borderRadius: '100px',
                        background: 'var(--bg-secondary)',
                    }}>
                        {activeSection + 1} / {lesson.sections.length}
                    </span>
                    <button onClick={() => goToSection(activeSection + 1)}
                        disabled={isLastSection}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '0.82rem', fontWeight: 600, fontFamily: 'inherit',
                            color: isLastSection ? 'var(--text-muted)' : 'var(--primary-light)',
                            background: 'none', border: 'none', cursor: isLastSection ? 'default' : 'pointer',
                            opacity: isLastSection ? 0.3 : 1, transition: 'opacity 0.15s',
                        }}>
                        {t('learn.next')} <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* ── Key Takeaways ── */}
            <div className="detail-section" style={{ marginBottom: '24px', borderLeft: '3px solid var(--success)' }}>
                <h3 className="section-heading" style={{ marginBottom: '16px' }}>
                    <span className="accent-bar" style={{ background: 'var(--success)' }} />
                    <Lightbulb size={16} className="heading-icon" /> {t('learn.keyTakeaways')}
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {(locale === 'en' ? (lesson.keyTakeawaysEn || lesson.keyTakeaways) : lesson.keyTakeaways).map((tip, i) => (
                        <li key={i} style={{
                            fontSize: '0.85rem', color: 'var(--text-secondary)',
                            padding: '8px 0', display: 'flex', alignItems: 'flex-start', gap: '10px',
                            borderBottom: i < lesson.keyTakeaways.length - 1 ? '1px solid var(--border)' : 'none',
                        }}>
                            <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '3px' }} />
                            <span style={{ lineHeight: 1.6 }}>{tip}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ── Quiz ── */}
            {lesson.quiz && lesson.quiz.length > 0 && (
                <div className="detail-section" style={{ marginBottom: '24px' }}>
                    <h3 className="section-heading" style={{ marginBottom: '20px' }}>
                        <span className="accent-bar" style={{ background: 'var(--primary-light)' }} />
                        <Award size={16} className="heading-icon" /> {t('learn.quiz')}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {lesson.quiz.map((q, qi) => (
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
                                                    color: 'var(--text-secondary)', cursor: quizSubmitted ? 'default' : 'pointer',
                                                    transition: 'all 0.2s var(--ease)',
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

                    {/* Submit / Result */}
                    <div style={{ marginTop: '24px' }}>
                        {!quizSubmitted ? (
                            <button onClick={() => setQuizSubmitted(true)}
                                disabled={Object.keys(quizAnswers).length < (lesson.quiz?.length || 0)}
                                style={{
                                    padding: '11px 28px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700,
                                    fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '8px',
                                    background: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 'var(--bg-secondary)' : 'var(--primary)',
                                    color: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 'var(--text-muted)' : 'white',
                                    border: 'none', cursor: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 'default' : 'pointer',
                                    opacity: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                }}>
                                <Award size={15} /> {t('learn.checkAnswers')}
                            </button>
                        ) : (
                            <div style={{
                                padding: '16px 20px', borderRadius: 'var(--radius-md)',
                                background: quizScore === lesson.quiz!.length ? 'rgba(74,222,128,0.06)' : 'rgba(250,204,21,0.06)',
                                border: `1px solid ${quizScore === lesson.quiz!.length ? 'rgba(74,222,128,0.2)' : 'rgba(250,204,21,0.2)'}`,
                                display: 'flex', alignItems: 'center', gap: '14px',
                            }}>
                                <div style={{
                                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                                    background: quizScore === lesson.quiz!.length ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Award size={22} style={{ color: quizScore === lesson.quiz!.length ? '#4ade80' : '#facc15' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '2px' }}>
                                        {quizScore === lesson.quiz!.length
                                            ? t('learn.perfect')
                                            : `${t('learn.got')} ${quizScore} ${t('learn.of')} ${lesson.quiz!.length} ${t('learn.questions')}`}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                        {quizScore === lesson.quiz!.length ? t('learn.perfectDesc') : t('learn.tryAgainDesc')}
                                    </p>
                                </div>
                                {quizScore < lesson.quiz!.length && (
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
            )}

            {/* ── Back to lessons CTA ── */}
            <div style={{ textAlign: 'center', marginTop: '36px' }}>
                <Link href="/learn" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600,
                    textDecoration: 'none', padding: '10px 24px', borderRadius: '100px',
                    border: '1px solid var(--border)', transition: 'all 0.2s var(--ease)',
                }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary-light)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                    {t('learn.viewAll')} <ChevronRight size={15} />
                </Link>
            </div>
        </div>
    );
}
