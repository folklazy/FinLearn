'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Lock, Eye, EyeOff, Save, GraduationCap, Target, Shield,
    Coins, Globe, Bell, Check, ChevronRight, Settings, TrendingUp,
    BookOpen, BarChart3, Zap, AlertCircle
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

type ActiveSection = 'account' | 'investment' | 'preferences';

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
}

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<ActiveSection>('account');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Account fields
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Password fields
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Profile fields
    const [displayName, setDisplayName] = useState('');
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
                setName(user.name || '');
                setEmail(user.email || '');
                if (user.profile) {
                    setDisplayName(user.profile.displayName || '');
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

    useEffect(() => {
        if (session?.user) {
            loadProfile();
        }
    }, [session, loadProfile]);

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!session?.user) {
        router.push('/login');
        return null;
    }

    const showMessage = (type: string, text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleSaveAccount = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) showMessage('success', 'บันทึกข้อมูลบัญชีสำเร็จ');
            else showMessage('error', 'เกิดข้อผิดพลาด');
        } catch {
            showMessage('error', 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            showMessage('error', 'รหัสผ่านใหม่ไม่ตรงกัน');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('success', 'เปลี่ยนรหัสผ่านสำเร็จ');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setShowPasswordForm(false);
            } else {
                showMessage('error', data.error || 'เกิดข้อผิดพลาด');
            }
        } catch {
            showMessage('error', 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveInvestment = async () => {
        if (!displayName || !experienceLevel || !primaryGoal) {
            showMessage('error', 'กรุณากรอกข้อมูลที่จำเป็น');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    displayName,
                    experienceLevel,
                    primaryGoal,
                    ...(riskLevel && { riskLevel }),
                    simulatorStartingCash: parseFloat(startingCash),
                }),
            });
            if (res.ok) showMessage('success', 'บันทึกข้อมูลการลงทุนสำเร็จ');
            else showMessage('error', 'เกิดข้อผิดพลาด');
        } catch {
            showMessage('error', 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, displayCurrency, emailNotifications }),
            });
            if (res.ok) showMessage('success', 'บันทึกการตั้งค่าสำเร็จ');
            else showMessage('error', 'เกิดข้อผิดพลาด');
        } catch {
            showMessage('error', 'เกิดข้อผิดพลาด');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'account' as ActiveSection, label: 'ข้อมูลบัญชี', icon: User },
        { id: 'investment' as ActiveSection, label: 'ข้อมูลการลงทุน', icon: TrendingUp },
        { id: 'preferences' as ActiveSection, label: 'การตั้งค่า', icon: Settings },
    ];

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ตั้งค่าบัญชี
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.875rem' }}>
                    จัดการข้อมูลส่วนตัว การลงทุน และการตั้งค่าแอป
                </p>
            </div>

            {/* Toast Message */}
            {message.text && (
                <div
                    className="animate-fade-in"
                    style={{
                        position: 'fixed', top: '80px', right: '24px', zIndex: 1000,
                        padding: '12px 20px', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        fontSize: '0.875rem', fontWeight: 500,
                        background: message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                        border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        color: message.type === 'success' ? '#22c55e' : '#ef4444',
                    }}
                >
                    {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <div style={{ display: 'flex', gap: '24px' }}>
                {/* Sidebar */}
                <div style={{ width: '220px', flexShrink: 0 }} className="hidden-mobile">
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: '16px', padding: '8px', position: 'sticky', top: '80px',
                    }}>
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 14px', borderRadius: '10px',
                                        background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        border: 'none', cursor: 'pointer',
                                        color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
                                        fontSize: '0.85rem', fontWeight: active ? 600 : 400,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Icon size={18} />
                                    <span style={{ flex: 1, textAlign: 'left' }}>{section.label}</span>
                                    {active && <ChevronRight size={14} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Mobile tabs */}
                <div className="show-mobile" style={{ display: 'none', width: '100%' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto' }}>
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const active = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        padding: '8px 14px', borderRadius: '10px', whiteSpace: 'nowrap',
                                        background: active ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                                        border: `1px solid ${active ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                                        color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
                                        fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                    }}
                                >
                                    <Icon size={14} /> {section.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* ===== Account Section ===== */}
                    {activeSection === 'account' && (
                        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '16px', padding: '24px',
                            }}>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={20} /> ข้อมูลบัญชี
                                </h2>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>ชื่อ</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={{
                                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail size={14} /> อีเมล
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            disabled
                                            style={{
                                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                color: 'var(--text-muted)', fontSize: '0.875rem', outline: 'none',
                                                cursor: 'not-allowed', opacity: 0.7,
                                            }}
                                        />
                                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>ไม่สามารถเปลี่ยนอีเมลได้</p>
                                    </div>

                                    <button
                                        onClick={handleSaveAccount}
                                        disabled={saving}
                                        className="btn btn-primary"
                                        style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                                    >
                                        <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                    </button>
                                </div>
                            </div>

                            {/* Password Section */}
                            <div style={{
                                background: 'var(--bg-card)', border: '1px solid var(--border)',
                                borderRadius: '16px', padding: '24px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showPasswordForm ? '20px' : '0' }}>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Lock size={20} /> รหัสผ่าน
                                    </h2>
                                    <button
                                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                                        className="btn btn-outline"
                                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                    >
                                        {showPasswordForm ? 'ยกเลิก' : 'เปลี่ยนรหัสผ่าน'}
                                    </button>
                                </div>

                                {showPasswordForm && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={currentPassword}
                                                onChange={(e) => setCurrentPassword(e.target.value)}
                                                placeholder="รหัสผ่านปัจจุบัน"
                                                style={{
                                                    width: '100%', padding: '10px 40px 10px 14px', borderRadius: '10px',
                                                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                    color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                                }}
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} style={{
                                                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                            }}>
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                                            style={{
                                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                            }}
                                        />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={confirmNewPassword}
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            placeholder="ยืนยันรหัสผ่านใหม่"
                                            style={{
                                                width: '100%', padding: '10px 14px', borderRadius: '10px',
                                                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                                color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                            }}
                                        />
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={saving || !newPassword || !confirmNewPassword}
                                            className="btn btn-primary"
                                            style={{ alignSelf: 'flex-start' }}
                                        >
                                            <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== Investment Profile Section ===== */}
                    {activeSection === 'investment' && (
                        <div className="animate-fade-in" style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: '16px', padding: '24px',
                        }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrendingUp size={20} /> ข้อมูลการลงทุน
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Display Name */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <User size={14} /> ชื่อที่แสดง *
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                            color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                        }}
                                    />
                                </div>

                                {/* Experience Level */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <GraduationCap size={14} /> ระดับประสบการณ์ *
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {experienceLevels.map((level) => {
                                            const Icon = level.icon;
                                            const selected = experienceLevel === level.value;
                                            return (
                                                <button
                                                    key={level.value}
                                                    onClick={() => setExperienceLevel(level.value)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                                        background: selected ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                                                        border: `1px solid ${selected ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                                                        color: selected ? 'var(--primary-light)' : 'var(--text-secondary)',
                                                        fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Icon size={14} /> {level.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Primary Goal */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Target size={14} /> เป้าหมายหลัก *
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                        {primaryGoals.map((goal) => {
                                            const Icon = goal.icon;
                                            const selected = primaryGoal === goal.value;
                                            return (
                                                <button
                                                    key={goal.value}
                                                    onClick={() => setPrimaryGoal(goal.value)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                                        background: selected ? 'rgba(34,197,94,0.15)' : 'var(--bg-secondary)',
                                                        border: `1px solid ${selected ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                                                        color: selected ? '#4ade80' : 'var(--text-secondary)',
                                                        fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <Icon size={14} /> {goal.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Risk Level */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Shield size={14} /> ระดับความเสี่ยง
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {riskLevels.map((risk) => {
                                            const selected = riskLevel === risk.value;
                                            return (
                                                <button
                                                    key={risk.value}
                                                    onClick={() => setRiskLevel(risk.value)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '6px',
                                                        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
                                                        background: selected ? `${risk.color}15` : 'var(--bg-secondary)',
                                                        border: `1px solid ${selected ? `${risk.color}66` : 'var(--border)'}`,
                                                        color: selected ? risk.color : 'var(--text-secondary)',
                                                        fontSize: '0.8rem', fontWeight: 500, transition: 'all 0.2s',
                                                    }}
                                                >
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: risk.color }} />
                                                    {risk.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Starting Cash */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Coins size={14} /> ทุนเริ่มต้น Simulator (USD)
                                    </label>
                                    <input
                                        type="number"
                                        value={startingCash}
                                        onChange={(e) => setStartingCash(e.target.value)}
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '10px',
                                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                            color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleSaveInvestment}
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{ alignSelf: 'flex-start' }}
                                >
                                    <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== Preferences Section ===== */}
                    {activeSection === 'preferences' && (
                        <div className="animate-fade-in" style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: '16px', padding: '24px',
                        }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Settings size={20} /> การตั้งค่า
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Language */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Globe size={14} /> ภาษา
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'th', label: '🇹🇭 ไทย' }, { value: 'en', label: '🇺🇸 English' }].map((lang) => (
                                            <button
                                                key={lang.value}
                                                onClick={() => setLanguage(lang.value)}
                                                style={{
                                                    padding: '8px 20px', borderRadius: '10px', cursor: 'pointer',
                                                    background: language === lang.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                                                    border: `1px solid ${language === lang.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                                                    color: language === lang.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                                                    fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                                                }}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Display Currency */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Coins size={14} /> สกุลเงินแสดงผล
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        {[{ value: 'USD', label: '$ USD' }, { value: 'THB', label: '฿ THB' }].map((curr) => (
                                            <button
                                                key={curr.value}
                                                onClick={() => setDisplayCurrency(curr.value)}
                                                style={{
                                                    padding: '8px 20px', borderRadius: '10px', cursor: 'pointer',
                                                    background: displayCurrency === curr.value ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)',
                                                    border: `1px solid ${displayCurrency === curr.value ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                                                    color: displayCurrency === curr.value ? 'var(--primary-light)' : 'var(--text-secondary)',
                                                    fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
                                                }}
                                            >
                                                {curr.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Email Notifications */}
                                <div>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Bell size={14} /> การแจ้งเตือนทางอีเมล
                                    </label>
                                    <button
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        style={{
                                            marginTop: '8px',
                                            width: '48px', height: '26px', borderRadius: '13px',
                                            background: emailNotifications ? 'var(--primary)' : 'var(--border)',
                                            border: 'none', cursor: 'pointer', position: 'relative',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <div style={{
                                            width: '20px', height: '20px', borderRadius: '50%',
                                            background: 'white', position: 'absolute', top: '3px',
                                            left: emailNotifications ? '25px' : '3px',
                                            transition: 'left 0.2s',
                                        }} />
                                    </button>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                                        {emailNotifications ? 'เปิดรับการแจ้งเตือน' : 'ปิดการแจ้งเตือน'}
                                    </p>
                                </div>

                                <button
                                    onClick={handleSavePreferences}
                                    disabled={saving}
                                    className="btn btn-primary"
                                    style={{ alignSelf: 'flex-start' }}
                                >
                                    <Save size={16} /> {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
