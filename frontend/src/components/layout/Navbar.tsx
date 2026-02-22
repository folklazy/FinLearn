'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, LogIn, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { api } from '@/lib/api';

interface SearchResult {
    symbol: string;
    name: string;
    sector: string;
    exchange: string;
    logo?: string;
}

const NAV_LINKS = [
    { href: '/', label: 'หน้าหลัก' },
    { href: '/stocks', label: 'หุ้น' },
    { href: '/learn', label: 'บทเรียน' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [userMenu, setUserMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const menuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced live search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const results = await api.searchStocks(searchQuery) as SearchResult[];
                setSearchResults(results || []);
                setShowDropdown(true);
                setActiveIndex(-1);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 280);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [searchQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) setShowDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navigateToStock = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
        setSearchQuery('');
        setShowDropdown(false);
        setActiveIndex(-1);
        setMobileOpen(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (activeIndex >= 0 && searchResults[activeIndex]) {
            navigateToStock(searchResults[activeIndex].symbol);
        } else if (searchQuery.trim()) {
            router.push(`/stocks?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setShowDropdown(false);
            setMobileOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || searchResults.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, searchResults.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, -1)); }
        else if (e.key === 'Escape') { setShowDropdown(false); setActiveIndex(-1); }
    };

    const isActive = (href: string) => href !== '#' && (href === '/' ? pathname === '/' : pathname.startsWith(href));

    return (
        <nav style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: 'rgba(14,15,20,0.82)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid var(--border)',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

                    {/* ── Logo ── */}
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '9px',
                            background: 'var(--gradient-primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '15px', fontWeight: 800, color: 'white',
                        }}>F</div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 750, letterSpacing: '-0.02em' }}>
                            Fin<span className="gradient-text">Learn</span>
                        </span>
                    </Link>

                    {/* ── Desktop links ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }} className="hidden-mobile">
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href} style={{
                                padding: '7px 14px', borderRadius: '8px', fontSize: '0.84rem',
                                fontWeight: isActive(link.href) ? 600 : 450,
                                color: isActive(link.href) ? 'var(--text-primary)' : 'var(--text-muted)',
                                background: isActive(link.href) ? 'rgba(124,108,240,0.08)' : 'transparent',
                                transition: 'all 0.2s var(--ease)',
                            }}
                                onMouseOver={e => { if (!isActive(link.href)) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}}
                                onMouseOut={e => { if (!isActive(link.href)) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}}
                            >{link.label}</Link>
                        ))}
                    </div>

                    {/* ── Right side ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="hidden-mobile">
                        {/* Search */}
                        <div ref={searchContainerRef} style={{ position: 'relative' }}>
                            <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                                {searchLoading ? (
                                    <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                ) : (
                                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                                )}
                                <input type="text" value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                                    placeholder="ค้นหาหุ้น..."
                                    className="input"
                                    style={{ width: '200px', padding: '7px 12px 7px 34px', fontSize: '0.82rem', borderRadius: '9px', background: 'var(--bg-secondary)', transition: 'width 0.2s' }}
                                />
                            </form>

                            {/* Search Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="animate-scale-in" style={{
                                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                                    minWidth: '340px', background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border)', borderRadius: '12px',
                                    boxShadow: '0 16px 48px rgba(0,0,0,0.4)', zIndex: 9999, overflow: 'hidden',
                                }}>
                                    <div style={{ padding: '6px 12px 4px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid var(--border)' }}>
                                        ผลการค้นหา — {searchResults.length} รายการ
                                    </div>
                                    {searchResults.slice(0, 8).map((result, idx) => (
                                        <button key={result.symbol}
                                            onClick={() => navigateToStock(result.symbol)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            style={{
                                                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                                                padding: '10px 14px', background: idx === activeIndex ? 'rgba(99,102,241,0.1)' : 'transparent',
                                                border: 'none', cursor: 'pointer', color: 'var(--text-primary)',
                                                textAlign: 'left', fontFamily: 'inherit', transition: 'background 0.1s',
                                                borderBottom: idx < Math.min(searchResults.length, 8) - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                            }}
                                        >
                                            {/* Logo */}
                                            <div style={{ width: '34px', height: '34px', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-secondary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <img src={result.logo || `https://financialmodelingprep.com/image-stock/${result.symbol}.png`}
                                                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = `<span style="font-size:0.75rem;font-weight:700;color:var(--primary-light)">${result.symbol.slice(0, 3)}</span>`;
                                                    }}
                                                />
                                            </div>
                                            {/* Name + exchange */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {result.name}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                    {result.exchange ? `${result.exchange}:${result.symbol}` : result.symbol}
                                                </div>
                                            </div>
                                            {/* Sector */}
                                            {result.sector && (
                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flexShrink: 0, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {result.sector}
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                    {searchResults.length > 8 && (
                                        <div style={{ padding: '8px 14px', fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                                            + {searchResults.length - 8} รายการเพิ่มเติม · กด Enter เพื่อดูทั้งหมด
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Auth */}
                        {status === 'loading' ? (
                            <div className="skeleton" style={{ width: '80px', height: '34px', borderRadius: '9px' }} />
                        ) : session?.user ? (
                            <div ref={menuRef} style={{ position: 'relative' }}>
                                <button onClick={() => setUserMenu(!userMenu)} style={{
                                    display: 'flex', alignItems: 'center', gap: '7px',
                                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                                    borderRadius: '9px', padding: '5px 10px 5px 6px',
                                    color: 'var(--text-primary)', cursor: 'pointer',
                                    transition: 'border-color 0.2s var(--ease)', fontFamily: 'inherit',
                                }}
                                    onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                                    onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                >
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                    ) : (
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={13} color="white" />
                                        </div>
                                    )}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 500, maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {session.user.name || 'User'}
                                    </span>
                                    <ChevronDown size={13} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: userMenu ? 'rotate(180deg)' : 'none' }} />
                                </button>

                                {userMenu && (
                                    <div className="animate-scale-in" style={{
                                        position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                                        minWidth: '200px', background: 'var(--bg-elevated)',
                                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                                        padding: '6px', boxShadow: 'var(--shadow-lg)', zIndex: 1000,
                                    }}>
                                        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                                            <p style={{ fontSize: '0.82rem', fontWeight: 600 }}>{session.user.name}</p>
                                            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{session.user.email}</p>
                                        </div>
                                        <Link href="/settings" onClick={() => setUserMenu(false)} style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 12px', borderRadius: '8px',
                                            color: 'var(--text-secondary)', fontSize: '0.82rem',
                                            transition: 'all 0.15s',
                                        }}
                                            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                        ><Settings size={15} /> ตั้งค่าบัญชี</Link>
                                        <button onClick={() => { signOut({ callbackUrl: '/' }); setUserMenu(false); }} style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '8px 12px', borderRadius: '8px',
                                            background: 'none', border: 'none', fontFamily: 'inherit',
                                            color: 'var(--danger)', cursor: 'pointer', fontSize: '0.82rem',
                                            transition: 'background 0.15s',
                                        }}
                                            onMouseOver={e => (e.currentTarget.style.background = 'var(--danger-bg)')}
                                            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                                        ><LogOut size={15} /> ออกจากระบบ</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-primary" style={{ padding: '7px 18px', fontSize: '0.82rem', gap: '6px' }}>
                                <LogIn size={14} /> เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>

                    {/* ── Mobile toggle ── */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="show-mobile"
                        style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}>
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* ── Mobile menu ── */}
                {mobileOpen && (
                    <div style={{ padding: '12px 0 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '4px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="ค้นหาหุ้น..." className="input"
                                style={{ paddingLeft: '34px', fontSize: '0.85rem', background: 'var(--bg-secondary)' }} />
                        </form>
                        {NAV_LINKS.map(link => (
                            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                                style={{
                                    padding: '10px 8px', borderRadius: '8px', fontSize: '0.88rem',
                                    fontWeight: isActive(link.href) ? 600 : 400,
                                    color: isActive(link.href) ? 'var(--primary-light)' : 'var(--text-secondary)',
                                }}>{link.label}</Link>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                            {session?.user ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 8px' }}>
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                        ) : <User size={18} style={{ color: 'var(--text-muted)' }} />}
                                        <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{session.user.name || session.user.email}</span>
                                    </div>
                                    <Link href="/settings" onClick={() => setMobileOpen(false)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 8px', color: 'var(--text-secondary)', fontSize: '0.88rem', borderRadius: '8px' }}>
                                        <Settings size={15} /> ตั้งค่าบัญชี
                                    </Link>
                                    <button onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 8px', background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.88rem', fontFamily: 'inherit' }}>
                                        <LogOut size={15} /> ออกจากระบบ
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="btn btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', gap: '6px' }}>
                                    <LogIn size={15} /> เข้าสู่ระบบ
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
