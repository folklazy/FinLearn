'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Clock, BookOpen, Search, X, ChevronRight, ChevronDown } from 'lucide-react';
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

const DIFF_META: Record<string, { tKey: string; color: string; bg: string }> = {
    beginner: { tKey: 'diff.beginner', color: 'var(--success)', bg: 'var(--success-bg)' },
    intermediate: { tKey: 'diff.intermediate', color: 'var(--warning)', bg: 'rgba(251,191,36,0.08)' },
    advanced: { tKey: 'diff.advanced', color: 'var(--danger)', bg: 'var(--danger-bg)' },
};

function LessonRow({ lesson }: { lesson: LessonSummary }) {
    const { t, locale } = useI18n();
    const diff = DIFF_META[lesson.difficulty] || DIFF_META.beginner;

    return (
        <Link href={`/learn/${lesson.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '12px 16px', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s var(--ease)',
            }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            >
                <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--tint-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', flexShrink: 0,
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

function ModuleSection({ mod, lessons, isOpen, onToggle, locale }: {
    mod: ModuleData; lessons: LessonSummary[]; isOpen: boolean; onToggle: () => void; locale: string;
}) {
    const diff = DIFF_META[mod.difficulty] || DIFF_META.beginner;
    const totalMin = lessons.reduce((s, l) => s + l.duration, 0);

    return (
        <div style={{ marginBottom: '8px' }}>
            <button onClick={onToggle} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 20px', borderRadius: isOpen ? 'var(--radius-lg) var(--radius-lg) 0 0' : 'var(--radius-lg)',
                background: isOpen ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                border: isOpen ? '1px solid var(--border-strong)' : '1px solid var(--border)',
                borderBottom: isOpen ? '1px solid var(--border)' : undefined,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all 0.2s var(--ease)',
            }}
                onMouseOver={e => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
                onMouseOut={e => { if (!isOpen) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
                <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: diff.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0,
                }}>
                    {mod.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: diff.color }}>
                            Module {mod.id}
                        </span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '3px', background: 'var(--tint-bg)' }}>
                            {lessons.length} lessons · {totalMin} min
                        </span>
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {locale === 'en' ? mod.nameEn : mod.name}
                    </h3>
                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                        {locale === 'en' ? mod.descriptionEn : mod.description}
                    </p>
                </div>
                <ChevronDown size={18} style={{
                    color: 'var(--text-muted)', flexShrink: 0,
                    transition: 'transform 0.2s var(--ease)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }} />
            </button>
            {isOpen && lessons.length > 0 && (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: '6px',
                    padding: '12px 16px', background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)', borderTop: 'none',
                    borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                }}>
                    {lessons.map(l => <LessonRow key={l.id} lesson={l} />)}
                </div>
            )}
        </div>
    );
}

export default function LearnPage() {
    const { t, locale } = useI18n();
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [modules, setModules] = useState<ModuleData[]>([]);
    const [selectedDiff, setSelectedDiff] = useState<Difficulty>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [openModules, setOpenModules] = useState<Record<number, boolean>>({ 1: true });

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

    const toggleModule = (id: number) => setOpenModules(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '860px' }}>

            {/* ── Page header ── */}
            <div className="animate-fade-up" style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ width: '4px', height: '28px', borderRadius: '100px', background: 'var(--gradient-primary)' }} />
                    <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {t('learn.completePath')}
                    </h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginLeft: '14px' }}>
                    {t('learn.subtitle.prefix')} · {modules.length} modules · {lessons.length} {t('learn.subtitle.lessons')} · {totalDuration} {t('learn.subtitle.minutes')}
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

            {/* ── Difficulty tabs ── */}
            <div id="tour-learn-tabs" className="animate-fade-up delay-1" style={{ display: 'flex', gap: '6px', marginBottom: '32px', flexWrap: 'wrap' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton" style={{ height: '90px', borderRadius: 'var(--radius-lg)' }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                    <BookOpen size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('learn.noResults')}</p>
                </div>
            ) : isSearching ? (
                /* Flat search results */
                <div id="tour-lessons" className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {filtered.map(l => <LessonRow key={l.id} lesson={l} />)}
                </div>
            ) : (
                /* Module-based learning path */
                <div id="tour-lessons" className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {modules.map(mod => {
                        const modLessons = filtered.filter(l => l.module === mod.id).sort((a, b) => a.order - b.order);
                        if (modLessons.length === 0) return null;
                        return (
                            <ModuleSection key={mod.id} mod={mod} lessons={modLessons}
                                isOpen={!!openModules[mod.id]} onToggle={() => toggleModule(mod.id)} locale={locale}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
