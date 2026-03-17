'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, Play, Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface LessonSummary {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn?: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    icon: string;
    thumbnail?: string;
}

type Difficulty = '' | 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_KEYS: { key: Difficulty; tKey: string }[] = [
    { key: '', tKey: 'learn.all' },
    { key: 'beginner', tKey: 'learn.beginner' },
    { key: 'intermediate', tKey: 'learn.intermediate' },
    { key: 'advanced', tKey: 'learn.advanced' },
];

const DIFF_META: Record<string, { tKey: string; color: string; bg: string }> = {
    beginner: { tKey: 'diff.beginner', color: 'var(--success)', bg: 'var(--success-bg)' },
    intermediate: { tKey: 'diff.intermediate', color: 'var(--warning)', bg: 'rgba(251,191,36,0.08)' },
    advanced: { tKey: 'diff.advanced', color: 'var(--danger)', bg: 'var(--danger-bg)' },
};

const CARD_GRADIENTS = [
    'linear-gradient(135deg, #1a1c2e 0%, #2d1f3d 100%)',
    'linear-gradient(135deg, #1a2332 0%, #1f2d3d 100%)',
    'linear-gradient(135deg, #1c2420 0%, #1a3328 100%)',
    'linear-gradient(135deg, #2a1c1c 0%, #3d2020 100%)',
    'linear-gradient(135deg, #1c1c2a 0%, #282040 100%)',
    'linear-gradient(135deg, #2a261c 0%, #3d3420 100%)',
];

function Thumbnail({ src, alt, icon, index, featured }: { src?: string; alt: string; icon: string; index: number; featured?: boolean }) {
    const [imgError, setImgError] = useState(false);
    const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

    return (
        <div style={{
            position: 'relative', width: '100%',
            aspectRatio: featured ? '16/9' : '16/10',
            borderRadius: 'var(--radius-md)', overflow: 'hidden',
            background: gradient,
        }}>
            {src && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            ) : (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: featured ? '4rem' : '2.5rem', opacity: 0.5,
                }}>
                    {icon}
                </div>
            )}
            {featured && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: 'var(--logo-bg)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                        <Play size={22} fill="var(--bg-primary)" style={{ color: 'var(--bg-primary)', marginLeft: '2px' }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function LessonCard({ lesson, index = 0, featured = false }: { lesson: LessonSummary; index?: number; featured?: boolean }) {
    const { t, locale } = useI18n();
    const diff = DIFF_META[lesson.difficulty] || DIFF_META.beginner;
    const catKey = `learn.cat.${lesson.category}`;
    const cat = t(catKey);

    return (
        <Link href={`/learn/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ cursor: 'pointer', transition: 'transform 0.2s var(--ease), box-shadow 0.2s var(--ease)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
                <Thumbnail src={lesson.thumbnail} alt={lesson.title} icon={lesson.icon} index={index} featured={featured} />

                {/* Meta row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px', marginBottom: '8px' }}>
                    <span style={{
                        fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em',
                        padding: '2px 7px', borderRadius: '4px',
                        background: diff.bg, color: diff.color,
                    }}>
                        {t(diff.tKey)}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} /> {lesson.duration} {t('min')}
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {cat}
                    </span>
                </div>

                {/* Title */}
                <h3 style={{
                    fontSize: featured ? '1.2rem' : '0.92rem',
                    fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.35,
                    marginBottom: '5px', color: 'var(--text-primary)',
                }}>
                    {locale === 'en' ? lesson.titleEn : lesson.title}
                </h3>

                {/* Description */}
                <p style={{
                    fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                }}>
                    {locale === 'en' ? (lesson.descriptionEn || lesson.description) : lesson.description}
                </p>
            </div>
        </Link>
    );
}

export default function LearnPage() {
    const { t, locale } = useI18n();
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [selectedDiff, setSelectedDiff] = useState<Difficulty>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getLessons()
            .then(data => setLessons(data.lessons || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = lessons.filter(l => {
        if (selectedDiff && l.difficulty !== selectedDiff) return false;
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            return l.title.toLowerCase().includes(q) || l.titleEn.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
        }
        return true;
    });

    const featured = filtered[0];
    const sideCard = filtered[1];
    const grid = filtered.slice(2);
    const totalDuration = lessons.reduce((s, l) => s + l.duration, 0);

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '1040px' }}>

            {/* ── Page header ── */}
            <div className="animate-fade-up" style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '28px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {t('learn.title')}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '14px' }}>
                    {t('learn.subtitle.prefix')} · {lessons.length} {t('learn.subtitle.lessons')} · {totalDuration} {t('learn.subtitle.minutes')}
                </p>
            </div>

            {/* ── Search bar ── */}
            <div className="animate-fade-up delay-1" style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '4px 4px 4px 18px',
                    transition: 'border-color 0.25s var(--ease), box-shadow 0.25s var(--ease)',
                }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,108,240,0.08)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('learn.searchPlaceholder')}
                        style={{
                            flex: 1, border: 'none', outline: 'none', background: 'transparent',
                            color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit',
                            padding: '10px 0',
                        }}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')}
                            style={{
                                background: 'var(--tint-bg-hover)', border: 'none', borderRadius: '8px',
                                padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-bg-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--tint-bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            aria-label="Clear search"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Difficulty level tabs ── */}
            <div id="tour-learn-tabs" className="animate-fade-up delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {DIFFICULTY_KEYS.map(tab => {
                    const active = selectedDiff === tab.key;
                    const meta = tab.key ? DIFF_META[tab.key] : null;
                    const count = tab.key ? lessons.filter(l => l.difficulty === tab.key).length : lessons.length;
                    return (
                        <button key={tab.key} onClick={() => setSelectedDiff(tab.key)}
                            style={{
                                padding: '8px 18px', borderRadius: '100px', whiteSpace: 'nowrap',
                                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                                transition: 'all 0.15s', flexShrink: 0,
                                background: active ? 'var(--primary)' : 'var(--bg-secondary)',
                                color: active ? 'white' : meta ? meta.color : 'var(--text-secondary)',
                                border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
                            }}>
                            {t(tab.tKey)}
                            <span style={{ opacity: 0.6, marginLeft: '6px', fontSize: '0.72rem' }}>{count}</span>
                        </button>
                    );
                })}
            </div>

            {/* ── Loading skeleton ── */}
            {loading ? (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', marginBottom: '36px' }}>
                        <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 'var(--radius-md)' }} />
                        <div>
                            <div className="skeleton" style={{ aspectRatio: '16/10', borderRadius: 'var(--radius-md)', marginBottom: '12px' }} />
                            <div className="skeleton" style={{ height: '14px', width: '50%', marginBottom: '8px' }} />
                            <div className="skeleton" style={{ height: '18px', width: '80%' }} />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                <div className="skeleton" style={{ aspectRatio: '16/10', borderRadius: 'var(--radius-md)', marginBottom: '12px' }} />
                                <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '8px' }} />
                                <div className="skeleton" style={{ height: '16px', width: '75%' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('learn.noResults')}</p>
                </div>
            ) : (
                <div id="tour-lessons">
                    {/* ── Featured hero + side card ── */}
                    {featured && (
                        <div className="animate-fade-up delay-2" style={{
                            display: 'grid', gap: '24px', marginBottom: '40px',
                            gridTemplateColumns: sideCard ? '1.5fr 1fr' : '1fr',
                        }}>
                            <div id="tour-featured-lesson">
                                <LessonCard lesson={featured} index={0} featured />
                            </div>
                            {sideCard && <LessonCard lesson={sideCard} index={1} />}
                        </div>
                    )}

                    {/* ── 3-column grid ── */}
                    {grid.length > 0 && (
                        <div className="animate-fade-up delay-3" style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '28px',
                        }}>
                            {grid.map((lesson, i) => (
                                <LessonCard key={lesson.id} lesson={lesson} index={i + 2} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
