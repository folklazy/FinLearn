'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    User, Mail, Lock, Eye, EyeOff, Save, GraduationCap, Target, Shield,
    Coins, Globe, Bell, Check, ChevronRight, Settings, TrendingUp,
    BookOpen, BarChart3, Zap, AlertCircle, Star, Trash2, ExternalLink, RefreshCw
} from 'lucide-react';

const experienceLevels = [
    { value: 'BEGINNER', label: 'มือใหม่', icon: BookOpen },
    { value: 'INTERMEDIATE', label: 'มีประสบการณ์', icon: TrendingUp },
    { value: 'ADVANCED', label: 'เชี่ยวชาญ', icon: Zap },
];

const primaryGoals = [
    { value: 'LEARN_BASICS', label: 'เรียนรู้พื้นฐาน', icon: BookOpen },
    { value: 'VALUE', label: 'ลงทุนแบบ Value', icon: Target },
    { value: 'GROWTH', label: 'ลงทุนแบบ Growth', icon: TrendingUp },
    { value: 'DIVIDEND', label: 'รับเงินปันผล', icon: Coins },
    { value: 'TRADING_EDU', label: 'เรียนรู้การเทรด', icon: BarChart3 },
];

const riskLevels = [
    { value: 'LOW', label: 'ต่ำ', color: '#22c55e' },
    { value: 'MEDIUM', label: 'ปานกลาง', color: '#f59e0b' },
    { value: 'HIGH', label: 'สูง', color: '#ef4444' },
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
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<ActiveSection>('displayname');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Display name
    const [displayName, setDisplayName] = useState('');

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

    if (!session?.user) { router.push('/login'); return null; }

    const showMsg = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
    };

    // ── handlers ──────────────────────────────────────────

    const handleSaveDisplayName = async () => {
        if (!displayName.trim()) { showMsg('error', 'กรุณากรอกชื่อที่แสดง'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: displayName.trim() }),
            });
            if (res.ok) showMsg('success', 'บันทึกชื่อที่แสดงสำเร็จ');
            else showMsg('error', 'เกิดข้อผิดพลาด');
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    const handleSendEmailOtp = async () => {
        if (!newEmail.trim()) { showMsg('error', 'กรุณากรอกอีเมลใหม่'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/email-change', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: newEmail.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { showMsg('error', data.error || 'เกิดข้อผิดพลาด'); return; }
            setEmailStep('otp');
            setEmailDigits(['', '', '', '', '', '']);
            setEmailCooldown(60);
            setTimeout(() => emailInputRefs.current[0]?.focus(), 100);
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
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
            if (!res.ok) { showMsg('error', data.error || 'เกิดข้อผิดพลาด'); return; }
            setEmailDigits(['', '', '', '', '', '']);
            setEmailCooldown(60);
            emailInputRefs.current[0]?.focus();
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    const handleVerifyEmailOtp = async () => {
        const otp = emailDigits.join('');
        if (otp.length !== 6) { showMsg('error', 'กรุณากรอกรหัส OTP ให้ครบ 6 หลัก'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/verify-email-change', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail: newEmail.trim(), otp }),
            });
            const data = await res.json();
            if (!res.ok) { showMsg('error', data.error || 'รหัส OTP ไม่ถูกต้อง'); setEmailDigits(['', '', '', '', '', '']); return; }
            setCurrentEmail(data.newEmail);
            setNewEmail('');
            setEmailStep('input');
            setEmailDigits(['', '', '', '', '', '']);
            showMsg('success', 'เปลี่ยนอีเมลสำเร็จ!');
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
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
        if (newPassword !== confirmNewPassword) { showMsg('error', 'รหัสผ่านใหม่ไม่ตรงกัน'); return; }
        if (newPassword.length < 6) { showMsg('error', 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                showMsg('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
                setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            } else { showMsg('error', data.error || 'เกิดข้อผิดพลาด'); }
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    const handleRemoveFromWatchlist = async (symbol: string) => {
        setRemovingSymbol(symbol);
        try {
            await fetch(`/api/watchlist/${symbol}`, { method: 'DELETE' });
            setWatchlist(prev => prev.filter(s => s !== symbol));
        } catch { showMsg('error', 'ลบไม่สำเร็จ'); }
        finally { setRemovingSymbol(null); }
    };

    const handleSaveInvestment = async () => {
        if (!experienceLevel || !primaryGoal) { showMsg('error', 'กรุณาเลือกระดับประสบการณ์และเป้าหมาย'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ experienceLevel, primaryGoal, ...(riskLevel && { riskLevel }), simulatorStartingCash: parseFloat(startingCash) }),
            });
            if (res.ok) showMsg('success', 'บันทึกข้อมูลการลงทุนสำเร็จ');
            else showMsg('error', 'เกิดข้อผิดพลาด');
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, displayCurrency, emailNotifications }),
            });
            if (res.ok) showMsg('success', 'บันทึกการตั้งค่าสำเร็จ');
            else showMsg('error', 'เกิดข้อผิดพลาด');
        } catch { showMsg('error', 'เกิดข้อผิดพลาด'); }
        finally { setSaving(false); }
    };

    // ── sidebar sections ───────────────────────────────────
    const sections = [
        { id: 'displayname' as ActiveSection, label: 'ชื่อที่แสดง', icon: User },
        { id: 'email' as ActiveSection, label: 'เปลี่ยนอีเมล', icon: Mail },
        { id: 'password' as ActiveSection, label: 'รหัสผ่าน', icon: Lock },
        { id: 'watchlist' as ActiveSection, label: 'Watchlist', icon: Star },
        { id: 'investment' as ActiveSection, label: 'ข้อมูลการลงทุน', icon: TrendingUp },
        { id: 'preferences' as ActiveSection, label: 'การตั้งค่า', icon: Settings },
    ];

    const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '28px' } as const;
    const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const };
    const labelStyle = { fontSize: '0.8rem', fontWeight: 500 as const, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' };

    return (
        <div style={{ maxWidth: '980px', margin: '0 auto', padding: '32px 24px' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>ตั้งค่าบัญชี</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>จัดการข้อมูลส่วนตัวและการตั้งค่าแอป</p>
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

                    {/* ===== ชื่อที่แสดง ===== */}
                    {activeSection === 'displayname' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20} /> ชื่อที่แสดง</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>ชื่อที่จะปรากฏในโปรไฟล์และกิจกรรมต่างๆ</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div>
                                    <label style={labelStyle}><User size={13} /> ชื่อที่แสดง</label>
                                    <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="เช่น นักลงทุนมือโปร" style={inputStyle} />
                                </div>
                                <button onClick={handleSaveDisplayName} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== เปลี่ยนอีเมล ===== */}
                    {activeSection === 'email' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={20} /> เปลี่ยนอีเมล</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>
                                อีเมลปัจจุบัน: <strong style={{ color: 'var(--text-secondary)' }}>{currentEmail}</strong>
                            </p>

                            {emailStep === 'input' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <div>
                                        <label style={labelStyle}><Mail size={13} /> อีเมลใหม่</label>
                                        <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="กรอกอีเมลใหม่" style={inputStyle} />
                                    </div>
                                    <button onClick={handleSendEmailOtp} disabled={saving || !newEmail.trim()} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', opacity: (!newEmail.trim() || saving) ? 0.6 : 1 }}>
                                        {saving ? 'กำลังส่ง...' : 'ส่งรหัส OTP'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        กรอกรหัส OTP ที่ส่งไปที่ <strong>{newEmail}</strong>
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
                                        ไม่ได้รับรหัส?{' '}
                                        <button type="button" onClick={handleResendEmailOtp} disabled={emailCooldown > 0 || saving} style={{ background: 'none', border: 'none', color: emailCooldown > 0 ? 'var(--text-muted)' : 'var(--primary-light)', fontWeight: 500, cursor: emailCooldown > 0 ? 'default' : 'pointer', fontSize: '0.8rem', fontFamily: 'inherit', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {emailCooldown > 0 ? `ส่งใหม่ใน ${emailCooldown}s` : <><RefreshCw size={11} /> ส่งรหัสใหม่</>}
                                        </button>
                                    </p>

                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={handleVerifyEmailOtp} disabled={saving || emailDigits.join('').length !== 6} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || emailDigits.join('').length !== 6) ? 0.6 : 1 }}>
                                            <Check size={15} /> {saving ? 'กำลังยืนยัน...' : 'ยืนยัน OTP'}
                                        </button>
                                        <button onClick={() => { setEmailStep('input'); setEmailDigits(['', '', '', '', '', '']); }} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                                            ยกเลิก
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== รหัสผ่าน ===== */}
                    {activeSection === 'password' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={20} /> เปลี่ยนรหัสผ่าน</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '24px' }}>
                                {hasPassword ? 'ตั้งรหัสผ่านใหม่ที่ปลอดภัย' : 'ตั้งรหัสผ่านสำหรับบัญชีนี้ (ล็อกอินด้วย Social ไม่ต้องใส่รหัสผ่านเดิม)'}
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {hasPassword && (
                                    <div style={{ position: 'relative' }}>
                                        <label style={labelStyle}><Lock size={13} /> รหัสผ่านปัจจุบัน</label>
                                        <input type={showPassword ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="รหัสผ่านปัจจุบัน" style={{ ...inputStyle, paddingRight: '42px' }} />
                                        <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}>
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                )}
                                <div>
                                    <label style={labelStyle}><Lock size={13} /> รหัสผ่านใหม่</label>
                                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}><Lock size={13} /> ยืนยันรหัสผ่านใหม่</label>
                                    <input type={showPassword ? 'text' : 'password'} value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} placeholder="ยืนยันรหัสผ่านใหม่" style={inputStyle} />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={saving || (hasPassword && !currentPassword) || !newPassword || !confirmNewPassword}
                                    className="btn btn-primary"
                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', opacity: (saving || (hasPassword && !currentPassword) || !newPassword || !confirmNewPassword) ? 0.6 : 1 }}
                                >
                                    <Save size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Watchlist ===== */}
                    {activeSection === 'watchlist' && (
                        <div style={card} className="animate-fade-in">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><Star size={20} /> Watchlist</h2>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '20px' }}>{watchlist.length} รายการ</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: '20px' }}>หุ้นที่คุณติดตามอยู่ กดที่ชื่อหุ้นเพื่อดูรายละเอียด</p>

                            {watchlistLoading ? (
                                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>กำลังโหลด...</div>
                            ) : watchlist.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <Star size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>ยังไม่มีหุ้นใน Watchlist</p>
                                    <Link href="/stocks" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                        <ExternalLink size={14} /> ค้นหาหุ้น
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
                                                        <ExternalLink size={10} /> ดูรายละเอียด
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
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} /> ข้อมูลการลงทุน</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}><GraduationCap size={13} /> ระดับประสบการณ์</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {experienceLevels.map(level => {
                                            const Icon = level.icon; const sel = experienceLevel === level.value;
                                            return <button key={level.value} onClick={() => setExperienceLevel(level.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${sel ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: sel ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><Icon size={14} /> {level.label}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Target size={13} /> เป้าหมายหลัก</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {primaryGoals.map(goal => {
                                            const Icon = goal.icon; const sel = primaryGoal === goal.value;
                                            return <button key={goal.value} onClick={() => setPrimaryGoal(goal.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)', border: `1px solid ${sel ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`, color: sel ? '#4ade80' : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><Icon size={14} /> {goal.label}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Shield size={13} /> ระดับความเสี่ยง</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {riskLevels.map(risk => {
                                            const sel = riskLevel === risk.value;
                                            return <button key={risk.value} onClick={() => setRiskLevel(risk.value)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', background: sel ? `${risk.color}15` : 'var(--bg-secondary)', border: `1px solid ${sel ? `${risk.color}66` : 'var(--border)'}`, color: sel ? risk.color : 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500 }}><div style={{ width: '7px', height: '7px', borderRadius: '50%', background: risk.color }} />{risk.label}</button>;
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Coins size={13} /> ทุนเริ่มต้น Simulator (USD)</label>
                                    <input type="number" value={startingCash} onChange={e => setStartingCash(e.target.value)} style={inputStyle} />
                                </div>
                                <button onClick={handleSaveInvestment} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== การตั้งค่า ===== */}
                    {activeSection === 'preferences' && (
                        <div style={card} className="animate-fade-in">
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={20} /> การตั้งค่า</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}><Globe size={13} /> ภาษา</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'th', label: '🇹🇭 ไทย' }, { value: 'en', label: '🇺🇸 English' }].map(lang => (
                                            <button key={lang.value} onClick={() => setLanguage(lang.value)} style={{ padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', background: language === lang.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${language === lang.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: language === lang.value ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{lang.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Coins size={13} /> สกุลเงินแสดงผล</label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'USD', label: '$ USD' }, { value: 'THB', label: '฿ THB' }].map(curr => (
                                            <button key={curr.value} onClick={() => setDisplayCurrency(curr.value)} style={{ padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', background: displayCurrency === curr.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${displayCurrency === curr.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`, color: displayCurrency === curr.value ? 'var(--primary-light)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>{curr.label}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}><Bell size={13} /> การแจ้งเตือนทางอีเมล</label>
                                    <button onClick={() => setEmailNotifications(!emailNotifications)} style={{ marginTop: '8px', width: '48px', height: '26px', borderRadius: '13px', background: emailNotifications ? 'var(--primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: emailNotifications ? '25px' : '3px', transition: 'left 0.2s' }} />
                                    </button>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>{emailNotifications ? 'เปิดรับการแจ้งเตือน' : 'ปิดการแจ้งเตือน'}</p>
                                </div>
                                <button onClick={handleSavePreferences} disabled={saving} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Save size={15} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
