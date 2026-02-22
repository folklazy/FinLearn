'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, BookOpen, CheckCircle2, ChevronRight, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';

interface LessonSection {
    heading: string;
    content: string;
}

interface QuizQuestion {
    question: string;
    options: string[];
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
    sections: LessonSection[];
    keyTakeaways: string[];
    quiz?: QuizQuestion[];
}

const DIFF_COLORS: Record<string, { label: string; color: string; bg: string }> = {
    beginner: { label: 'มือใหม่', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    intermediate: { label: 'ปานกลาง', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
    advanced: { label: 'ขั้นสูง', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

function renderContent(content: string) {
    // Simple markdown-like rendering: **bold**, \n\n = paragraph, - list items
    return content.split('\n\n').map((para, i) => {
        if (para.startsWith('|')) {
            // Table
            const rows = para.split('\n').filter(r => r.trim() && !r.match(/^\|[\s-|]+\|$/));
            return (
                <div key={i} style={{ overflowX: 'auto', margin: '12px 0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                                    {row.split('|').filter(Boolean).map((cell, ci) => {
                                        const Tag = ri === 0 ? 'th' : 'td';
                                        return <Tag key={ci} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: ri === 0 ? 600 : 400 }}>{cell.trim()}</Tag>;
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Process inline formatting
        const formatted = para
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n- /g, '\n• ')
            .replace(/\n(\d+)\. /g, '\n$1. ');

        const lines = formatted.split('\n');
        return (
            <div key={i} style={{ marginBottom: '12px' }}>
                {lines.map((line, li) => {
                    if (line.startsWith('• ') || line.match(/^\d+\./)) {
                        return <div key={li} style={{ paddingLeft: '16px', margin: '3px 0', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: line }} />;
                    }
                    return <p key={li} style={{ lineHeight: 1.7, margin: '2px 0' }} dangerouslySetInnerHTML={{ __html: line }} />;
                })}
            </div>
        );
    });
}

export default function LessonDetailPage() {
    const params = useParams();
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

    if (loading) {
        return (
            <div className="container" style={{ paddingTop: '48px', maxWidth: '800px' }}>
                <div className="skeleton" style={{ height: '40px', width: '300px', marginBottom: '24px' }} />
                <div className="skeleton" style={{ height: '200px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ height: '200px' }} />
            </div>
        );
    }

    if (!lesson) {
        return (
            <div className="container" style={{ paddingTop: '48px', textAlign: 'center' }}>
                <p style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</p>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>ไม่พบบทเรียน</h1>
                <Link href="/learn" style={{ color: 'var(--primary-light)', fontSize: '0.9rem' }}>← กลับไปหน้าบทเรียน</Link>
            </div>
        );
    }

    const diff = DIFF_COLORS[lesson.difficulty] || DIFF_COLORS.beginner;
    const section = lesson.sections[activeSection];
    const quizScore = lesson.quiz ? Object.entries(quizAnswers).filter(([i, a]) => lesson.quiz![Number(i)].answer === a).length : 0;

    return (
        <div className="container" style={{ paddingTop: '48px', paddingBottom: '64px', maxWidth: '800px' }}>
            {/* Back */}
            <Link href="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '24px', textDecoration: 'none' }}>
                <ArrowLeft size={16} /> กลับไปหน้าบทเรียน
            </Link>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2.5rem' }}>{lesson.icon}</span>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>{lesson.title}</h1>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{lesson.titleEn}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', background: diff.bg, color: diff.color }}>{diff.label}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {lesson.duration} นาที</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {lesson.sections.length} หัวข้อ</span>
                </div>
            </div>

            {/* Section navigation */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {lesson.sections.map((s, i) => (
                    <button key={i} onClick={() => setActiveSection(i)} style={{
                        padding: '7px 14px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: activeSection === i ? 600 : 400,
                        background: activeSection === i ? 'var(--primary-bg)' : 'var(--bg-secondary)',
                        color: activeSection === i ? 'var(--primary-light)' : 'var(--text-muted)',
                        border: activeSection === i ? '1px solid var(--primary)' : '1px solid transparent',
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        {i + 1}. {s.heading.length > 20 ? s.heading.slice(0, 20) + '...' : s.heading}
                    </button>
                ))}
            </div>

            {/* Section content */}
            <div className="card-solid" style={{ padding: '28px', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>
                    {section.heading}
                </h2>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {renderContent(section.content)}
                </div>

                {/* Section nav */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
                        disabled={activeSection === 0}
                        style={{ fontSize: '0.82rem', color: activeSection === 0 ? 'var(--text-muted)' : 'var(--primary-light)', background: 'none', border: 'none', cursor: activeSection === 0 ? 'default' : 'pointer', opacity: activeSection === 0 ? 0.4 : 1 }}>
                        ← ก่อนหน้า
                    </button>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{activeSection + 1} / {lesson.sections.length}</span>
                    <button onClick={() => setActiveSection(Math.min(lesson.sections.length - 1, activeSection + 1))}
                        disabled={activeSection === lesson.sections.length - 1}
                        style={{ fontSize: '0.82rem', color: activeSection === lesson.sections.length - 1 ? 'var(--text-muted)' : 'var(--primary-light)', background: 'none', border: 'none', cursor: activeSection === lesson.sections.length - 1 ? 'default' : 'pointer', opacity: activeSection === lesson.sections.length - 1 ? 0.4 : 1 }}>
                        ถัดไป →
                    </button>
                </div>
            </div>

            {/* Key Takeaways */}
            <div className="card-solid" style={{ padding: '24px', marginBottom: '24px', borderLeft: '3px solid var(--primary)' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} /> สรุปสิ่งสำคัญ
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {lesson.keyTakeaways.map((tip, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '6px 0', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>✓</span> {tip}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Quiz */}
            {lesson.quiz && lesson.quiz.length > 0 && (
                <div className="card-solid" style={{ padding: '24px', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={16} style={{ color: 'var(--primary-light)' }} /> ทดสอบความเข้าใจ
                    </h3>
                    {lesson.quiz.map((q, qi) => (
                        <div key={qi} style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '10px' }}>{qi + 1}. {q.question}</p>
                            <div style={{ display: 'grid', gap: '6px' }}>
                                {q.options.map((opt, oi) => {
                                    const selected = quizAnswers[qi] === oi;
                                    const isCorrect = quizSubmitted && q.answer === oi;
                                    const isWrong = quizSubmitted && selected && q.answer !== oi;
                                    return (
                                        <button key={oi} onClick={() => { if (!quizSubmitted) setQuizAnswers(prev => ({ ...prev, [qi]: oi })); }}
                                            style={{
                                                padding: '10px 14px', borderRadius: '8px', fontSize: '0.82rem', textAlign: 'left',
                                                background: isCorrect ? 'rgba(74,222,128,0.15)' : isWrong ? 'rgba(248,113,113,0.15)' : selected ? 'var(--primary-bg)' : 'var(--bg-secondary)',
                                                border: isCorrect ? '1px solid #4ade80' : isWrong ? '1px solid #f87171' : selected ? '1px solid var(--primary)' : '1px solid transparent',
                                                color: 'var(--text-secondary)', cursor: quizSubmitted ? 'default' : 'pointer', transition: 'all 0.2s',
                                            }}>
                                            {opt}
                                            {isCorrect && ' ✅'}
                                            {isWrong && ' ❌'}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    {!quizSubmitted ? (
                        <button onClick={() => setQuizSubmitted(true)}
                            disabled={Object.keys(quizAnswers).length < (lesson.quiz?.length || 0)}
                            style={{
                                padding: '10px 24px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                background: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 'var(--bg-tertiary)' : 'var(--primary)',
                                color: 'white', border: 'none', cursor: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 'default' : 'pointer',
                                opacity: Object.keys(quizAnswers).length < (lesson.quiz?.length || 0) ? 0.5 : 1,
                            }}>
                            ตรวจคำตอบ
                        </button>
                    ) : (
                        <div style={{ padding: '14px 18px', borderRadius: '10px', background: quizScore === lesson.quiz.length ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Award size={20} style={{ color: quizScore === lesson.quiz.length ? '#4ade80' : '#facc15' }} />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                                    {quizScore === lesson.quiz.length ? 'เก่งมาก! ตอบถูกทุกข้อ! 🎉' : `ได้ ${quizScore}/${lesson.quiz.length} ข้อ`}
                                </div>
                                {quizScore < lesson.quiz.length && (
                                    <button onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                                        style={{ fontSize: '0.78rem', color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}>
                                        ลองใหม่อีกครั้ง →
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Next lesson */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link href="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none' }}>
                    ดูบทเรียนทั้งหมด <ChevronRight size={16} />
                </Link>
            </div>
        </div>
    );
}
