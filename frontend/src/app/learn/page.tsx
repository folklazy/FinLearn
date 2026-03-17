'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, Search, X, ChevronRight, Sparkles, GraduationCap } from 'lucide-react';
import { api } from '@/lib/api';
import { useI18n } from '@/lib/i18n';

interface LessonSummary {
    id: string;
    title: string;
    titleEn: string;
    description: string;
    descriptionEn?: string;
    category: string;
    module: number;
    order: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    duration: number;
    icon: string;
    thumbnail?: string;
}

interface ModuleData {
    id: number;
    category: string;
    name: string;
    nameEn: string;
    description: string;
    descriptionEn: string;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

type Difficulty = '' | 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_KEYS: { key: Difficulty; tKey: string }[] = [
    { key: '', tKey: 'learn.all' },
    { key: 'beginner', tKey: 'learn.beginner' },
    { key: 'intermediate', tKey: 'learn.intermediate' },
    { key: 'advanced', tKey: 'learn.advanced' },
];

const DIFF_META: Record<string, { tKey: string; color: string; bg: string; gradient: string }> = {
    beginner: { tKey: 'diff.beginner', color: '#34d399', bg: 'rgba(52,211,153,0.08)', gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15) 0%, rgba(52,211,153,0.03) 100%)' },
    intermediate: { tKey: 'diff.intermediate', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(251,191,36,0.03) 100%)' },
    advanced: { tKey: 'diff.advanced', color: '#fb7185', bg: 'rgba(251,113,133,0.08)', gradient: 'linear-gradient(135deg, rgba(251,113,133,0.15) 0%, rgba(251,113,133,0.03) 100%)' },
};

const MODULE_ACCENTS = [
    { glow: 'rgba(52,211,153,0.12)', line: '#34d399' },
    { glow: 'rgba(96,165,250,0.12)', line: '#60a5fa' },
    { glow: 'rgba(167,139,250,0.12)', line: '#a78bfa' },
    { glow: 'rgba(251,191,36,0.12)', line: '#fbbf24' },
    { glow: 'rgba(244,114,182,0.12)', line: '#f472b6' },
    { glow: 'rgba(52,211,153,0.12)', line: '#34d399' },
    { glow: 'rgba(251,113,133,0.12)', line: '#fb7185' },
    { glow: 'rgba(139,92,246,0.12)', line: '#8b5cf6' },
];

function LessonNode({ lesson, accentColor }: { lesson: LessonSummary; accentColor: string }) {
    const { t, locale } = useI18n();

    return (
        <Link href={`/learn/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px', borderRadius: '12px',
                cursor: 'pointer', transition: 'all 0.2s var(--ease)',
                background: 'transparent',
            }}
                onMouseOver={e => { e.currentTarget.style.background = 'var(--tint-bg)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
            >
                <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: `${accentColor}12`, border: `1px solid ${accentColor}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0, transition: 'all 0.2s',
                }}>
                    {lesson.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                        fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)',
                        lineHeight: 1.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {locale === 'en' ? lesson.titleEn : lesson.title}
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={9} /> {lesson.duration} {t('min')}
                        </span>
                    </div>
                </div>
                <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, opacity: 0.5 }} />
            </div>
        </Link>
    );
}

function RoadmapModule({ mod, lessons, index, locale }: {
    mod: ModuleData; lessons: LessonSummary[]; index: number; locale: string;
}) {
    const { t } = useI18n();
    const diff = DIFF_META[mod.difficulty] || DIFF_META.beginner;
    const accent = MODULE_ACCENTS[index % MODULE_ACCENTS.length];
    const totalMin = lessons.reduce((s, l) => s + l.duration, 0);
    const isLast = index === 7;

    return (
        <div style={{ position: 'relative', paddingLeft: '48px' }}>
            {/* Timeline line */}
            {!isLast && (
                <div style={{
                    position: 'absolute', left: '19px', top: '52px', bottom: '-12px', width: '2px',
                    background: `linear-gradient(to bottom, ${accent.line}40 0%, ${accent.line}10 100%)`,
                }} />
            )}

            {/* Timeline node (circle) */}
            <div style={{
                position: 'absolute', left: '8px', top: '18px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'var(--bg-primary)', border: `2px solid ${accent.line}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2, boxShadow: `0 0 12px ${accent.glow}`,
            }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accent.line }} />
            </div>

            {/* Module card */}
            <div style={{
                background: diff.gradient, border: `1px solid ${diff.color}18`,
                borderRadius: '16px', overflow: 'hidden', marginBottom: '24px',
                transition: 'all 0.25s var(--ease)',
            }}
                onMouseOver={e => { e.currentTarget.style.borderColor = `${diff.color}35`; e.currentTarget.style.boxShadow = `0 4px 24px ${accent.glow}`; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = `${diff.color}18`; e.currentTarget.style.boxShadow = 'none'; }}
            >
                {/* Module header */}
                <div style={{ padding: '20px 22px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '14px',
                            background: `${diff.color}15`, border: `1px solid ${diff.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.4rem', flexShrink: 0,
                        }}>
                            {mod.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{
                                    fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em',
                                    textTransform: 'uppercase', color: diff.color,
                                }}>
                                    {t('learn.module')} {mod.id}
                                </span>
                                <span style={{
                                    fontSize: '0.58rem', fontWeight: 600, color: 'var(--text-muted)',
                                    padding: '2px 8px', borderRadius: '100px', background: 'var(--tint-bg)',
                                }}>
                                    {lessons.length} {t('learn.lessonsCount')} · {totalMin} {t('min')}
                                </span>
                                <span style={{
                                    fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.04em',
                                    padding: '2px 7px', borderRadius: '4px', background: diff.bg, color: diff.color,
                                }}>
                                    {t(diff.tKey)}
                                </span>
                            </div>
                            <h3 style={{
                                fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
                                lineHeight: 1.3, letterSpacing: '-0.01em',
                            }}>
                                {locale === 'en' ? mod.nameEn : mod.name}
                            </h3>
                            <p style={{
                                fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5,
                                marginTop: '4px',
                            }}>
                                {locale === 'en' ? mod.descriptionEn : mod.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lessons list */}
                <div style={{
                    borderTop: `1px solid ${diff.color}10`,
                    padding: '6px 8px 8px',
                }}>
                    {lessons.map(l => (
                        <LessonNode key={l.id} lesson={l} accentColor={diff.color} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SearchLessonRow({ lesson }: { lesson: LessonSummary }) {
    const { t, locale } = useI18n();
    const diff = DIFF_META[lesson.difficulty] || DIFF_META.beginner;

    return (
        <Link href={`/learn/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s var(--ease)',
            }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            >
                <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: diff.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: diff.color, flexShrink: 0,
                }}>
                    {lesson.order}
                </div>
                <span style={{ fontSize: '1.15rem', flexShrink: 0 }}>{lesson.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                        fontSize: '0.86rem', fontWeight: 650, color: 'var(--text-primary)',
                        lineHeight: 1.3, marginBottom: '2px',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {locale === 'en' ? lesson.titleEn : lesson.title}
                    </h4>
                    <p style={{
                        fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {locale === 'en' ? (lesson.descriptionEn || lesson.description) : lesson.description}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                        fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.04em',
                        padding: '2px 6px', borderRadius: '4px', background: diff.bg, color: diff.color,
                    }}>
                        {t(diff.tKey)}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={10} /> {lesson.duration}{t('min')}
                    </span>
                    <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
            </div>
        </Link>
    );
}

export default function LearnPage() {
    const { t, locale } = useI18n();
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [selectedDiff, setSelectedDiff] = useState<Difficulty>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getLessons()
            .then(data => {
                setLessons(data.lessons || []);
                setModules(data.modules || []);
            })
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

    const totalDuration = lessons.reduce((s, l) => s + l.duration, 0);
    const isSearching = searchQuery.trim().length > 0;

    const beginnerCount = lessons.filter(l => l.difficulty === 'beginner').length;
    const intermediateCount = lessons.filter(l => l.difficulty === 'intermediate').length;
    const advancedCount = lessons.filter(l => l.difficulty === 'advanced').length;

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '720px' }}>

            {/* ── Hero header ── */}
            <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 18px',
                    background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(124,108,240,0.2)',
                }}>
                    <GraduationCap size={26} style={{ color: 'white' }} />
                </div>
                <h1 style={{
                    fontSize: 'clamp(1.6rem, 4vw, 2rem)', fontWeight: 800,
                    letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '10px',
                }}>
                    {t('learn.completePath')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto' }}>
                    {t('learn.subtitle.prefix')}
                </p>

                {/* Stats pills */}
                <div style={{
                    display: 'inline-flex', gap: '0', marginTop: '24px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    borderRadius: '14px', overflow: 'hidden',
                }}>
                    {[
                        { value: `${modules.length}`, label: 'Modules', icon: '📦' },
                        { value: `${lessons.length}`, label: t('learn.subtitle.lessons'), icon: '📖' },
                        { value: `${totalDuration}`, label: t('learn.subtitle.minutes'), icon: '⏱️' },
                    ].map(({ value, label, icon }, i) => (
                        <div key={i} style={{
                            padding: '14px 22px', textAlign: 'center',
                            borderLeft: i > 0 ? '1px solid var(--border)' : 'none',
                        }}>
                            <div style={{ fontSize: '0.7rem', marginBottom: '3px' }}>{icon}</div>
                            <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '3px', fontWeight: 500 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Difficulty overview bar ── */}
            <div className="animate-fade-up delay-1" style={{
                display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center',
            }}>
                {[
                    { label: t('learn.beginner'), count: beginnerCount, color: '#34d399' },
                    { label: t('learn.intermediate'), count: intermediateCount, color: '#fbbf24' },
                    { label: t('learn.advanced'), count: advancedCount, color: '#fb7185' },
                ].map(({ label, count, color }) => (
                    <div key={label} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '100px',
                        background: `${color}08`, border: `1px solid ${color}18`,
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color }}>{count}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* ── Search bar ── */}
            <div className="animate-fade-up delay-1" style={{ marginBottom: '20px' }}>
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
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('learn.searchPlaceholder')}
                        style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'inherit', padding: '10px 0' }}
                    />
                    {searchQuery && (
                        <button type="button" onClick={() => setSearchQuery('')}
                            style={{ background: 'var(--tint-bg-hover)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--tint-bg-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--tint-bg-hover)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                            aria-label="Clear search"
                        ><X size={14} /></button>
                    )}
                </div>
            </div>

            {/* ── Difficulty filter tabs ── */}
            <div id="tour-learn-tabs" className="animate-fade-up delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '36px', flexWrap: 'wrap' }}>
                {DIFFICULTY_KEYS.map(tab => {
                    const active = selectedDiff === tab.key;
                    const meta = tab.key ? DIFF_META[tab.key] : null;
                    const count = tab.key ? lessons.filter(l => l.difficulty === tab.key).length : lessons.length;
                    return (
                        <button key={tab.key} onClick={() => setSelectedDiff(tab.key)} style={{
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

            {/* ── Content ── */}
            {loading ? (
                <div style={{ paddingLeft: '48px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ position: 'relative', marginBottom: '24px' }}>
                            <div className="skeleton" style={{ position: 'absolute', left: '-40px', top: '18px', width: '24px', height: '24px', borderRadius: '50%' }} />
                            <div className="skeleton" style={{ height: '160px', borderRadius: '16px' }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('learn.noResults')}</p>
                </div>
            ) : isSearching ? (
                <div id="tour-lessons" className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filtered.map(l => <SearchLessonRow key={l.id} lesson={l} />)}
                </div>
            ) : (
                <div id="tour-lessons">
                    {/* Start badge */}
                    <div className="animate-fade-up delay-2" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        paddingLeft: '48px', marginBottom: '20px',
                    }}>
                        <div style={{
                            position: 'relative',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 16px 6px 10px', borderRadius: '100px',
                            background: 'rgba(124,108,240,0.08)', border: '1px solid rgba(124,108,240,0.2)',
                        }}>
                            <Sparkles size={13} style={{ color: 'var(--primary-light)' }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary-light)' }}>
                                {locale === 'th' ? 'เริ่มต้นที่นี่' : 'Start here'}
                            </span>
                        </div>
                    </div>

                    {/* Roadmap modules */}
                    {modules.map((mod, index) => {
                        const modLessons = filtered.filter(l => l.module === mod.id).sort((a, b) => a.order - b.order);
                        if (modLessons.length === 0) return null;
                        return (
                            <div key={mod.id} className={`animate-fade-up delay-${Math.min(index + 2, 6)}`}>
                                <RoadmapModule mod={mod} lessons={modLessons} index={index} locale={locale} />
                            </div>
                        );
                    })}

                    {/* Finish badge */}
                    <div className="animate-fade-up" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        paddingLeft: '48px', marginTop: '-8px',
                    }}>
                        <div style={{
                            position: 'relative', left: '-40px',
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(124,108,240,0.3)',
                        }}>
                            <GraduationCap size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-light)',
                            marginLeft: '-30px',
                        }}>
                            {locale === 'th' ? 'จบหลักสูตร! 🎉' : 'Course complete! 🎉'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
