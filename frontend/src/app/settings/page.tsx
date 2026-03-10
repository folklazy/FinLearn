'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
    User, Mail, Lock, Eye, EyeOff, Save, GraduationCap, Target, Shield,
    Coins, Globe, Bell, Check, ChevronRight, Settings, TrendingUp,
    BookOpen, BarChart3, Zap, AlertCircle, Star, Trash2, ExternalLink, RefreshCw,
    Camera
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const experienceLevelsData = [
    { value: 'BEGINNER', labelKey: 'onboard.exp.beginner', icon: BookOpen },
    { value: 'INTERMEDIATE', labelKey: 'onboard.exp.intermediate', icon: TrendingUp },
    { value: 'ADVANCED', labelKey: 'onboard.exp.advanced', icon: Zap },
];

const primaryGoalsData = [
    { value: 'LEARN_BASICS', labelKey: 'onboard.goal.basics', icon: BookOpen },
    { value: 'VALUE', labelKey: 'onboard.goal.value', icon: Target },
    { value: 'GROWTH', labelKey: 'onboard.goal.growth', icon: TrendingUp },
    { value: 'DIVIDEND', labelKey: 'onboard.goal.dividend', icon: Coins },
    { value: 'TRADING_EDU', labelKey: 'onboard.goal.trading', icon: BarChart3 },
];

const riskLevelsData = [
    { value: 'LOW', labelKey: 'onboard.risk.low', color: '#22c55e' },
    { value: 'MEDIUM', labelKey: 'onboard.risk.medium', color: '#f59e0b' },
    { value: 'HIGH', labelKey: 'onboard.risk.high', color: '#ef4444' },
];

type ActiveSection = 'displayname' | 'email' | 'password' | 'watchlist' | 'investment' | 'preferences';

interface UserProfile {
    displayName?: string;
    experienceLevel?: string;
    primaryGoal?: string;
    riskLevel?: string;
    simulatorStartingCash?: number;
    language?: string;
    displayCurrency?: string;
    emailNotifications?: boolean;
}

interface UserData {
    id: string;
    email: string;
    name: string;
    image: string | null;
    profile: UserProfile | null;
    hasPassword?: boolean;
}

export default function SettingsPage() {
    const { t } = useI18n();
    const { data: session, status, update: updateSession } = useSession();
    const [activeSection, setActiveSection] = useState<ActiveSection>('displayname');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Display name
    const [displayName, setDisplayName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Email change
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailStep, setEmailStep] = useState<'input' | 'otp'>('input');
    const [emailDigits, setEmailDigits] = useState(['', '', '', '', '', '']);
    const [emailCooldown, setEmailCooldown] = useState(0);
    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Password fields
    const [hasPassword, setHasPassword] = useState(true);
    const [currentPassword, setCurrentPassword] = useState('');    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Watchlist
    const [watchlist, setWatchlist] = useState<string[]>([]);
    const [watchlistLoading, setWatchlistLoading] = useState(false);
    const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);

    // Investment profile fields
    const [experienceLevel, setExperienceLevel] = useState('');
    const [primaryGoal, setPrimaryGoal] = useState('');
    const [riskLevel, setRiskLevel] = useState('');
    const [startingCash, setStartingCash] = useState('100000');

    // Preferences
    const [language, setLanguage] = useState('th');
    const [displayCurrency, setDisplayCurrency] = useState('USD');
    const [emailNotifications, setEmailNotifications] = useState(true);

    const loadProfile = useCallback(async () => {
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                const user: UserData = data.user;
                setCurrentEmail(user.email || '');
                setHasPassword(user.hasPassword ?? false);
                setDisplayName(user.profile?.displayName || user.name || '');
                if (user.profile) {
                    setExperienceLevel(user.profile.experienceLevel || '');
                    setPrimaryGoal(user.profile.primaryGoal || '');
                    setRiskLevel(user.profile.riskLevel || '');
                    setStartingCash(user.profile.simulatorStartingCash?.toString() || '100000');
                    setLanguage(user.profile.language || 'th');
                    setDisplayCurrency(user.profile.displayCurrency || 'USD');
                    setEmailNotifications(user.profile.emailNotifications ?? true);
                }
            }
        } catch (err) {
            console.error('Error loading profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadWatchlist = useCallback(async () => {
        setWatchlistLoading(true);
        try {
            const res = await fetch('/api/watchlist');
            if (res.ok) {
                const data = await res.json();
                setWatchlist(data.symbols || []);
            }
        } catch (err) {
            console.error('Watchlist load error:', err);
        } finally {
            setWatchlistLoading(false);
        }
    }, []);

    useEffect(() => {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        if (emailCooldown > 0) {
            cooldownRef.current = setInterval(() => {
                setEmailCooldown(c => {
                    if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
                    return c - 1;
                });
            }, 1000);
        }
        return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
    }, [emailCooldown]);

    useEffect(() => {
        if (session?.user) loadProfile();
    }, [session, loadProfile]);

    useEffect(() => {
        if (activeSection === 'watchlist') loadWatchlist();
    }, [activeSection, loadWatchlist]);

    if (status === 'loading' || loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
                <Settings size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>{t('settings.loginTitle')}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 20px' }}>
                    {t('settings.loginDesc')}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 22px', borderRadius: '100px',
                        background: 'var(--primary)', color: 'white',
                        fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                        {t('login.submit')} <ChevronRight size={15} />
                    </Link>
                    <Link href="/register" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '10px 22px', borderRadius: '100px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                        fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none',
                    }}>
                        {t('login.register')}
                    </Link>
                </div>
            </div>
        );
    }

    const showMsg = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
    };

    // ── handlers ──────────────────────────────────────────

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { showMsg('error', t('settings.avatar.tooLarge')); return; }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const src = ev.target?.result as string;
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX = 200;
                const ratio = Math.min(MAX / img.width, MAX / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
                const base64 = canvas.toDataURL('image/jpeg', 0.85);
                setAvatarPreview(base64);
            };
            img.src = src;
        };
        reader.readAsDataURL(file);
    };

    const handleSaveImage = async () => {
        if (!avatarPreview) return;
        setImageUploading(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: avatarPreview }),
            });
            if (res.ok) {
                await updateSession({ image: avatarPreview });
                showMsg('success', t('settings.avatar.success'));
            } else showMsg('error', t('settings.error'));
        } catch { showMsg('error', t('settings.error')); }
        finally { setImageUploading(false); }
    };

    const handleSaveDisplayName = async () => {
        if (!displayName.trim()) { showMsg('error', t('settings.dn.empty')); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: displayName.trim(), name: displayName.trim() }),
            });
            if (res.ok) {
                await updateSession({ name: displayName.trim() });
                showMsg('success', t('settings.dn.success'));
            } else showMsg('error', t('settings.error'));
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleSendEmailOtp = async () => {
        if (!newEmail.trim()) { showMsg('error', t('settings.email.empty')); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/email-change', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { showMsg('error', data.error || t('settings.error')); return; }
            setEmailStep('otp');
            setEmailDigits(['', '', '', '', '', '']);
            setEmailCooldown(60);
            setTimeout(() => emailInputRefs.current[0]?.focus(), 100);
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleResendEmailOtp = async () => {
        if (emailCooldown > 0) return;
        setSaving(true);
        try {
            const res = await fetch('/api/user/email-change', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { showMsg('error', data.error || t('settings.error')); return; }
            setEmailDigits(['', '', '', '', '', '']);
            setEmailCooldown(60);
            emailInputRefs.current[0]?.focus();
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleVerifyEmailOtp = async () => {
        const otp = emailDigits.join('');
        if (otp.length !== 6) { showMsg('error', t('reset.errOtp6')); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/verify-email-change', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: newEmail.trim(), otp }),
            });
            const data = await res.json();
            if (!res.ok) { showMsg('error', data.error || t('settings.email.otpInvalid')); setEmailDigits(['', '', '', '', '', '']); return; }
            setCurrentEmail(data.newEmail);
            setNewEmail('');
            setEmailStep('input');
            setEmailDigits(['', '', '', '', '', '']);
            showMsg('success', t('settings.email.success'));
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleDigitChange = (i: number, val: string) => {
        const v = val.replace(/\D/g, '').slice(-1);
        const next = [...emailDigits]; next[i] = v; setEmailDigits(next);
        if (v && i < 5) emailInputRefs.current[i + 1]?.focus();
    };
    const handleDigitKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !emailDigits[i] && i > 0) emailInputRefs.current[i - 1]?.focus();
    };
    const handleDigitPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = [...emailDigits];
        for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? '';
        setEmailDigits(next);
        emailInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) { showMsg('error', t('settings.pwd.mismatch')); return; }
        if (newPassword.length < 8 || newPassword.length > 64) { showMsg('error', t('settings.pwd.lengthErr')); return; }
        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) { showMsg('error', t('settings.pwd.mixErr')); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                showMsg('success', t('settings.pwd.success'));
                setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            } else { showMsg('error', data.error || t('settings.error')); }
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleRemoveFromWatchlist = async (symbol: string) => {
        setRemovingSymbol(symbol);
        try {
            await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
            setWatchlist(prev => prev.filter(s => s !== symbol));
        } catch { showMsg('error', t('settings.wl.removeFail')); }
        finally { setRemovingSymbol(null); }
    };

    const handleSaveInvestment = async () => {
        if (!experienceLevel || !primaryGoal) { showMsg('error', t('settings.inv.selectErr')); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experienceLevel, primaryGoal, ...(riskLevel && { riskLevel }), simulatorStartingCash: parseFloat(startingCash) }),
            });
            if (res.ok) showMsg('success', t('settings.inv.success'));
            else showMsg('error', t('settings.error'));
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, displayCurrency, emailNotifications }),
            });
            if (res.ok) showMsg('success', t('settings.pref.success'));
            else showMsg('error', t('settings.error'));
        } catch { showMsg('error', t('settings.error')); }
        finally { setSaving(false); }
    };

    // ── sidebar sections ───────────────────────────────────
    const sections = [
        { id: 'displayname' as ActiveSection, label: t('settings.sidebar.displayname'), icon: User },
        { id: 'email' as ActiveSection, label: t('settings.sidebar.email'), icon: Mail },
        { id: 'password' as ActiveSection, label: t('settings.sidebar.password'), icon: Lock },
        { id: 'watchlist' as ActiveSection, label: t('settings.sidebar.watchlist'), icon: Star },
        { id: 'investment' as ActiveSection, label: t('settings.sidebar.investment'), icon: TrendingUp },
        { id: 'preferences' as ActiveSection, label: t('settings.sidebar.preferences'), icon: Settings },
    ];

    const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' } as const;
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: '0.8rem', fontWeight: 500 as const, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' };

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('settings.title')}</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>{t('settings.subtitle')}</p>
            </div>

            {/* Toast */}
            {message.text && (
                <div style={{ position: 'fixed', top: '80px', right: '24px', zIndex: 1000, padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 500, background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, color: message.type === 'success' ? '#22c55e' : '#ef4444' }}>
                    {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />} {message.text}
                </div>
            )}

            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                {/* Sidebar */}
                <div style={{ width: '210px', flexShrink: 0, position: 'sticky', top: '80px' }} className="hidden-mobile">
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '8px' }}>
                        {sections.map(s => {
                            const Icon = s.icon;
                            const active = activeSection === s.id;
                            return (
                                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: active ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: active ? 600 : 400, transition: 'all 0.15s' }}>
                                    <Icon size={17} />
                                    <span style={{ flex: 1, textAlign: 'left' }}>{s.label}</span>
                                    {active && <ChevronRight size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile tabs */}
                <div className="show-mobile" style={{ display: 'none', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {sections.map(s => {
                            const Icon = s.icon;
                            const active = activeSection === s.id;
                            return (
                                <button key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', whiteSpace: 'nowrap', background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)', border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`, color: active ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 500, cursor: 'pointer' }}>
                                    <Icon size={13} /> {s.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* ===== ชื่อที่แสดง + รูปโปรไฟล์ ===== */}
                    {activeSection === 'displayname' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">

                            {/* รูปโปรไฟล์ */}
                            <div style={card}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={20} /> {t('settings.avatar.title')}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>{t('settings.avatar.desc')}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                                    {/* Avatar preview */}
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {(avatarPreview || session?.user?.image) ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={avatarPreview || session?.user?.image || ''} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-light)' }}>
                                                    {(displayName || session?.user?.name || 'U')[0].toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: 'var(--primary)', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <Camera size={12} color="white" />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button onClick={() => fileInputRef.current?.click()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                            <Camera size={14} /> {t('settings.avatar.choose')}
                                        </button>
                                        {avatarPreview && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={handleSaveImage} disabled={imageUploading} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                                                    <Save size={13} /> {imageUploading ? t('settings.avatar.saving') : t('settings.avatar.save')}
                                                </button>
                                                <button onClick={() => { setAvatarPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ padding: '8px 12px', borderRadius: '10px', background: 'none', border: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                                    {t('settings.avatar.cancel')}
                                                </button>
                                            </div>
                                        )}
                                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('settings.avatar.formats')}</p>
                                    </div>
                                </div>

                                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                            </div>

                            {/* ชื่อที่แสดง */}
                            <div style={card}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> {t('settings.dn.title')}</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>{t('settings.dn.desc')}</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}><User size={13} /> {t('settings.dn.title')}</label>
                                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder={t('settings.dn.placeholder')} style={inputStyle} />
                                    </div>
                                    <button onClick={handleSaveDisplayName} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Save size={15} /> {saving ? t('settings.saving') : t('settings.save')}
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ===== Change Email ===== */}
                    {activeSection === 'email' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={20} /> {t('settings.email.title')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>
                                {t('settings.email.current')}: <strong style={{ color: 'var(--text-secondary)' }}>{currentEmail}</strong>
                            </p>

                            {emailStep === 'input' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}><Mail size={13} /> {t('settings.email.new')}</label>
                                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={t('settings.email.newPlaceholder')} style={inputStyle} />
                                    </div>
                                    <button onClick={handleSendEmailOtp} disabled={saving || !newEmail.trim()} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', opacity: (!newEmail.trim() || saving) ? 0.6 : 1 }}>
                                        {saving ? t('settings.sending') : t('forgot.submit')}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {t('settings.email.otpSent')} <strong>{newEmail}</strong>
                                    </p>

                                    {/* OTP boxes */}
                                    <div style={{ display: 'flex', gap: '10px' }} onPaste={handleDigitPaste}>
                                        {emailDigits.map((d, i) => (
                                            <input key={i} ref={el => { emailInputRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={d}
                                                onChange={e => handleDigitChange(i, e.target.value)} onKeyDown={e => handleDigitKeyDown(i, e)} disabled={saving}
                                                style={{ width: '48px', height: '54px', textAlign: 'center', fontSize: '1.4rem', fontWeight: 700, background: 'var(--bg-elevated)', border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '10px', color: 'var(--text-primary)', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }} />
                                        ))}
                                    </div>

                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {t('reset.noCode')}{' '}
                                        <button type="button" onClick={handleResendEmailOtp} disabled={emailCooldown > 0 || saving} style={{ background: 'none', border: 'none', color: emailCooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)', fontWeight: 500, cursor: emailCooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {emailCooldown > 0 ? `${t('reset.resendIn')} ${emailCooldown}s` : <><RefreshCw size={11} /> {t('reset.resend')}</>}
                                        </button>
                                    </p>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={handleVerifyEmailOtp} disabled={saving || emailDigits.join('').length !== 6} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || emailDigits.join('').length !== 6) ? 0.6 : 1 }}>
                                            <Check size={15} /> {saving ? t('settings.email.verifying') : t('settings.email.verify')}
                                        </button>
                                        <button onClick={() => { setEmailStep('input'); setEmailDigits(['', '', '', '', '', '']); }} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                                            {t('settings.avatar.cancel')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== Password ===== */}
                    {activeSection === 'password' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={20} /> {t('settings.pwd.title')}</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>
                                {hasPassword ? t('settings.pwd.descHas') : t('settings.pwd.descNo')}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {hasPassword && (
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}><Lock size={13} /> {t('settings.pwd.current')}</label>
                                        <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder={t('settings.pwd.current')} style={{ ...inputStyle, paddingRight: '42px' }} />
                                        <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                )}
                                <div>
                                    <label style={labelStyle}><Lock size={13} /> {t('settings.pwd.new')}</label>
                                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('settings.pwd.new')} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}><Lock size={13} /> {t('settings.pwd.confirm')}</label>
                                    <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder={t('settings.pwd.confirm')} style={inputStyle} />
                                </div>
                                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-elevated)', fontSize: '0.78rem', lineHeight: 1.7 }}>
                                    <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>{t('reg.pwdRequire')}</p>
                                    <p style={{ color: newPassword.length >= 8 && newPassword.length <= 64 ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>• {t('reg.pwdLength')}</p>
                                    <p style={{ color: /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'var(--success)' : 'var(--text-muted)', margin: 0 }}>• {t('reg.pwdMix')}</p>
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving || (hasPassword && !currentPassword) || !newPassword || !confirmNewPassword}
                                    className="btn btn-primary"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || (hasPassword && !currentPassword) || !newPassword || !confirmNewPassword) ? 0.6 : 1 }}
                                >
                                    <Save size={15} /> {saving ? t('settings.saving') : t('settings.pwd.saveBtn')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Watchlist ===== */}
                    {activeSection === 'watchlist' && (
                        <div style={card} className="animate-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={20} /> Watchlist</h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '20px' }}>{watchlist.length} {t('wl.items')}</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>{t('settings.wl.desc')}</p>

                            {watchlistLoading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('settings.wl.loading')}</div>
                            ) : watchlist.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <Star size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{t('settings.wl.empty')}</p>
                                    <Link href="/stocks" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                        <ExternalLink size={14} /> {t('notfound.search')}
                                    </Link>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {watchlist.map(symbol => (
                                        <div key={symbol} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <Link href={`/stocks/${symbol}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flex: 1 }}>
                                                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary-light)' }}>{symbol.slice(0, 2)}</span>
                                                </div>
                                                <div>
                                                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>{symbol}</p>
                                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                        <ExternalLink size={10} /> {t('wl.viewDetail')}
                                                    </p>
                                                </div>
                                            </Link>
                                            <button onClick={() => handleRemoveFromWatchlist(symbol)} disabled={removingSymbol === symbol} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '6px', borderRadius: '8px', display: 'flex', opacity: removingSymbol === symbol ? 0.5 : 1, transition: 'opacity 0.15s' }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== ข้อมูลการลงทุน ===== */}
                    {activeSection === 'investment' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> {t('settings.inv.title')}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}><GraduationCap size={13} /> {t('onboard.expLevel')}</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {experienceLevelsData.map(level => {
                                            const Icon = level.icon; const sel = experienceLevel === level.value;
                                            return <button key={level.value} onClick={() => setExperienceLevel(level.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: sel ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><Icon size={14} /> {t(level.labelKey)}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Target size={13} /> {t('onboard.goal')}</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {primaryGoalsData.map(goal => {
                                            const Icon = goal.icon; const sel = primaryGoal === goal.value;
                                            return <button key={goal.value} onClick={() => setPrimaryGoal(goal.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)', border: `1px solid ${sel ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, color: sel ? '#4ade80' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><Icon size={14} /> {t(goal.labelKey)}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Shield size={13} /> {t('onboard.riskLevel')}</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {riskLevelsData.map(risk => {
                                            const sel = riskLevel === risk.value;
                                            return <button key={risk.value} onClick={() => setRiskLevel(risk.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? `${risk.color}15` : 'var(--bg-secondary)', border: `1px solid ${sel ? `${risk.color}66` : 'var(--border)'}`, color: sel ? risk.color : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: risk.color }} />{t(risk.labelKey)}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Coins size={13} /> {t('onboard.startCash')}</label>
                                    <input type="number" value={startingCash} onChange={e => setStartingCash(e.target.value)} style={inputStyle} />
                                </div>
                                <button onClick={handleSaveInvestment} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={15} /> {saving ? t('settings.saving') : t('settings.save')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Preferences ===== */}
                    {activeSection === 'preferences' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} /> {t('settings.pref.title')}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}><Globe size={13} /> {t('settings.pref.lang')}</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'th', label: '🇹🇭 ไทย' }, { value: 'en', label: '🇺🇸 English' }].map(lang => (
                                            <button key={lang.value} onClick={() => setLanguage(lang.value)} style={{ padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', background: language === lang.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${language === lang.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: language === lang.value ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{lang.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Coins size={13} /> {t('settings.pref.currency')}</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'USD', label: '$ USD' }, { value: 'THB', label: '฿ THB' }].map(curr => (
                                            <button key={curr.value} onClick={() => setDisplayCurrency(curr.value)} style={{ padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', background: displayCurrency === curr.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${displayCurrency === curr.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: displayCurrency === curr.value ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{curr.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Bell size={13} /> {t('settings.pref.notif')}</label>
                                    <button onClick={() => setEmailNotifications(!emailNotifications)} style={{ marginTop: '8px', width: '48px', height: '26px', borderRadius: '13px', background: emailNotifications ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: emailNotifications ? '25px' : '3px', transition: 'left 0.2s' }} />
                                    </button>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{emailNotifications ? t('settings.pref.notifOn') : t('settings.pref.notifOff')}</p>
                                </div>
                                <button onClick={handleSavePreferences} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={15} /> {saving ? t('settings.saving') : t('settings.save')}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
