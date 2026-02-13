'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Menu, X, TrendingUp, BookOpen, Briefcase, LogIn, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/stocks?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
        setShowUserMenu(false);
    };

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            background: 'rgba(10, 14, 26, 0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
                    {/* Logo */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '18px', fontWeight: 900, color: 'white',
                        }}>
                            F
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Fin<span className="gradient-text">Learn</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
                        className="hidden-mobile">
                        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                            <TrendingUp size={16} /> หน้าหลัก
                        </Link>
                        <Link href="/stocks" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                            <Briefcase size={16} /> หุ้นทั้งหมด
                        </Link>
                        <Link href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                            onMouseOver={e => (e.currentTarget.style.color = 'var(--text-primary)')}
                            onMouseOut={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                            <BookOpen size={16} /> บทเรียน
                        </Link>
                    </div>

                    {/* Search + Auth */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="hidden-mobile">
                        {/* Search */}
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาหุ้น... (เช่น AAPL)"
                                style={{
                                    width: '220px',
                                    padding: '8px 12px 8px 36px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, width 0.3s',
                                }}
                                onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.width = '280px'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.width = '220px'; }}
                            />
                        </form>

                        {/* Auth Buttons */}
                        {status === 'loading' ? (
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-tertiary)', animation: 'pulse 2s infinite' }} />
                        ) : session?.user ? (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        background: 'none', border: '1px solid var(--border)',
                                        borderRadius: '10px', padding: '6px 12px',
                                        color: 'var(--text-primary)', cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                    onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                                    onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                >
                                    {session.user.image ? (
                                        <img
                                            src={session.user.image}
                                            alt=""
                                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                        />
                                    ) : (
                                        <User size={18} />
                                    )}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {session.user.name || session.user.email}
                                    </span>
                                </button>

                                {/* Dropdown */}
                                {showUserMenu && (
                                    <div style={{
                                        position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                                        minWidth: '200px', background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)', borderRadius: '12px',
                                        padding: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                        zIndex: 1000,
                                    }}>
                                        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                {session.user.name}
                                            </p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleSignOut}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                                                padding: '8px 12px', borderRadius: '8px',
                                                background: 'none', border: 'none',
                                                color: '#ef4444', cursor: 'pointer',
                                                fontSize: '0.8rem', fontWeight: 500,
                                                transition: 'background 0.2s',
                                            }}
                                            onMouseOver={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'none')}
                                        >
                                            <LogOut size={16} /> ออกจากระบบ
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '8px 16px', borderRadius: '10px',
                                    background: 'var(--gradient-primary)',
                                    color: 'white', textDecoration: 'none',
                                    fontSize: '0.8rem', fontWeight: 600,
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                                onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                            >
                                <LogIn size={16} /> เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                        className="show-mobile"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div style={{
                        padding: '16px 0',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', flexDirection: 'column', gap: '12px',
                    }}>
                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาหุ้น..."
                                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none' }}
                            />
                        </form>
                        <Link href="/" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 0' }}>หน้าหลัก</Link>
                        <Link href="/stocks" onClick={() => setIsOpen(false)} style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 0' }}>หุ้นทั้งหมด</Link>
                        <Link href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', padding: '8px 0' }}>บทเรียน</Link>

                        {/* Mobile Auth */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                            {session?.user ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0' }}>
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                        ) : (
                                            <User size={20} style={{ color: 'var(--text-muted)' }} />
                                        )}
                                        <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>
                                            {session.user.name || session.user.email}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 0', background: 'none', border: 'none',
                                            color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem',
                                        }}
                                    >
                                        <LogOut size={16} /> ออกจากระบบ
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        padding: '10px', borderRadius: '10px',
                                        background: 'var(--gradient-primary)',
                                        color: 'white', textDecoration: 'none',
                                        fontSize: '0.875rem', fontWeight: 600,
                                    }}
                                >
                                    <LogIn size={16} /> เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
      `}</style>
        </nav>
    );
}
