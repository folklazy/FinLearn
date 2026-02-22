'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';

interface LessonSummary {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    icon: string;
}

interface LessonCategory {
    id: string;
    name: string;
    nameEn: string;
    icon: string;
    lessonCount: number;
}

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    beginner: { label: 'มือใหม่', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    intermediate: { label: 'ปานกลาง', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
    advanced: { label: 'ขั้นสูง', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
};

export default function LearnPage() {
    const [categories, setCategories] = useState<LessonCategory[]>([]);
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getLessons()
            .then(data => {
                setCategories(data.categories || []);
                setLessons(data.lessons || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = selectedCategory
        ? lessons.filter(l => l.category === selectedCategory)
        : lessons;

    const totalDuration = lessons.reduce((sum, l) => sum + l.duration, 0);

    return (
        <div className="container" style={{ paddingTop: '48px', paddingBottom: '64px' }}>
            {/* Hero */}
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <GraduationCap size={22} style={{ color: 'var(--primary-light)' }} />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)' }}>Learn to Invest</p>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em' }}>บทเรียนการลงทุน</h1>
                    </div>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', lineHeight: 1.6 }}>
                    เรียนรู้การลงทุนตั้งแต่พื้นฐานจนถึงกลยุทธ์ขั้นสูง ออกแบบมาเพื่อนักลงทุนมือใหม่ชาวไทยโดยเฉพาะ
                </p>
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <BookOpen size={14} /> {lessons.length} บทเรียน
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} /> {totalDuration} นาที
                    </div>
                </div>
            </div>

            {/* Categories */}
            {!loading && categories.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '36px' }}>
                    <button onClick={() => setSelectedCategory('')}
                        className={`card-solid`} style={{
                            padding: '16px', cursor: 'pointer', textAlign: 'left', border: !selectedCategory ? '1px solid var(--primary)' : '1px solid transparent',
                            background: !selectedCategory ? 'var(--primary-bg)' : undefined, transition: 'all 0.2s',
                        }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📖</div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>ทั้งหมด</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{lessons.length} บทเรียน</div>
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                            className={`card-solid`} style={{
                                padding: '16px', cursor: 'pointer', textAlign: 'left', border: selectedCategory === cat.id ? '1px solid var(--primary)' : '1px solid transparent',
                                background: selectedCategory === cat.id ? 'var(--primary-bg)' : undefined, transition: 'all 0.2s',
                            }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{cat.icon}</div>
                            <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{cat.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.lessonCount} บทเรียน</div>
                        </button>
                    ))}
                </div>
            )}

            {/* Lessons */}
            {loading ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />)}
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {filtered.map((lesson, i) => {
                        const diff = DIFFICULTY_LABELS[lesson.difficulty] || DIFFICULTY_LABELS.beginner;
                        return (
                            <Link key={lesson.id} href={`/learn/${lesson.id}`}>
                                <div className={`card-solid animate-fade-up delay-${Math.min(i + 1, 6)}`}
                                    style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ fontSize: '2rem', width: '48px', textAlign: 'center', flexShrink: 0 }}>
                                        {lesson.icon}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                            <h3 style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '-0.01em' }}>{lesson.title}</h3>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px', borderRadius: '100px', background: diff.bg, color: diff.color }}>
                                                {diff.label}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {lesson.description}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={11} /> {lesson.duration} นาที
                                            </span>
                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                {lesson.titleEn}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.4 }}>📚</p>
                    <p style={{ color: 'var(--text-muted)' }}>ไม่พบบทเรียนในหมวดนี้</p>
                </div>
            )}
        </div>
    );
}
