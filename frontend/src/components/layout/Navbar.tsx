'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, LogIn, LogOut, User, Settings, ChevronDown, Globe, Sun, Moon } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { api } from '@/lib/api';
import { useI18n, Locale } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';

interface SearchResult {
    symbol: string;
    name: string;
    sector: string;
    exchange: string;
    logo?: string;
}

const NAV_KEYS: { href: string; key: string }[] = [
    { href: '/', key: 'nav.home' },
    { href: '/stocks', key: 'nav.stocks' },
    { href: '/learn', key: 'nav.learn' },
    { href: '/watchlist', key: 'nav.watchlist' },
    { href: '/portfolio', key: 'nav.portfolio' },
];

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [userMenu, setUserMenu] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const { t, locale, setLocale } = useI18n();
    const { theme, toggleTheme } = useTheme();
    const [langMenu, setLangMenu] = useState(false);
    const langRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
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

    // Close menus on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
            if (langRef.current && !langRef.current.contains(e.target as Node)) setLangMenu(false);
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
                setSearchOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Keyboard shortcut: Cmd/Ctrl + K to open search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(prev => !prev);
                setTimeout(() => searchInputRef.current?.focus(), 50);
            }
            if (e.key === 'Escape') {
                setSearchOpen(false);
                setSearchQuery('');
                setShowDropdown(false);
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    // Auto-focus search input when opened
    useEffect(() => {
        if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
    }, [searchOpen]);

    const navigateToStock = (symbol: string) => {
        router.push(`/stocks/${symbol}`);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchOpen(false);
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
            setSearchOpen(false);
            setMobileOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || searchResults.length === 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(p => Math.min(p + 1, searchResults.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(p => Math.max(p - 1, -1)); }
        else if (e.key === 'Escape') { setShowDropdown(false); setActiveIndex(-1); setSearchOpen(false); }
    };

    const isActive = (href: string) => href !== '#' && (href === '/' ? pathname === '/' : pathname.startsWith(href));

    const userInitial = session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-content">

                    {/* ── Left: Logo + Links ── */}
                    <div className="navbar-left">
                        <Link href="/" className="navbar-logo">
                            <div className="navbar-logo-mark">F</div>
                            <span className="navbar-logo-text">
                                Fin<span className="gradient-text">Learn</span>
                            </span>
                        </Link>

                        <div className="navbar-separator" />

                        <div className="navbar-links hidden-mobile" id="tour-nav-links">
                            {NAV_KEYS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    id={`tour-nav-${link.href.replace('/', '') || 'home'}`}
                                    className={`navbar-link${isActive(link.href) ? ' active' : ''}`}
                                >
                                    {t(link.key)}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Search + Auth ── */}
                    <div className="navbar-right hidden-mobile">
                        {/* Search */}
                        <div ref={searchContainerRef} id="tour-search" style={{ position: 'relative' }}>
                            {searchOpen ? (
                                <form onSubmit={handleSearch} className="navbar-search-expanded">
                                    <Search size={14} className="navbar-search-icon" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('nav.searchPlaceholder')}
                                        className="navbar-search-input"
                                        autoFocus
                                    />
                                    {searchLoading && <div className="navbar-search-spinner" />}
                                    <button
                                        type="button"
                                        onClick={() => { setSearchOpen(false); setSearchQuery(''); setShowDropdown(false); }}
                                        className="navbar-search-close"
                                        aria-label={t('nav.searchClose')}
                                    >
                                        <X size={14} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="navbar-search-trigger"
                                    aria-label={`${t('nav.searchPlaceholder')} (⌘K)`}
                                >
                                    <Search size={15} />
                                    <span className="navbar-search-hint">{t('nav.search')}</span>
                                    <kbd className="navbar-kbd">⌘K</kbd>
                                </button>
                            )}

                            {/* Search Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="navbar-dropdown" role="listbox" aria-label={t('nav.searchResults')}>
                                    <div className="navbar-dropdown-header">
                                        {t('nav.searchResults')} {searchResults.length} {t('nav.searchItems')}
                                    </div>
                                    {searchResults.slice(0, 8).map((result, idx) => (
                                        <button
                                            key={result.symbol}
                                            onClick={() => navigateToStock(result.symbol)}
                                            onMouseEnter={() => setActiveIndex(idx)}
                                            className={`navbar-dropdown-item${idx === activeIndex ? ' active' : ''}`}
                                        >
                                            <div className="navbar-dropdown-logo">
                                                <img
                                                    src={result.logo || `https://financialmodelingprep.com/image-stock/${result.symbol}.png`}
                                                    alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.parentElement!.innerHTML = `<span style="font-size:0.7rem;font-weight:700;color:var(--text-muted)">${result.symbol.slice(0, 3)}</span>`;
                                                    }}
                                                />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div className="navbar-dropdown-name">{result.name}</div>
                                                <div className="navbar-dropdown-meta">
                                                    {result.exchange ? `${result.exchange}:${result.symbol}` : result.symbol}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {searchResults.length > 8 && (
                                        <div className="navbar-dropdown-footer">
                                            + {searchResults.length - 8} {t('nav.searchMore')}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Auth */}
                        {status === 'loading' ? (
                            <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                        ) : session?.user ? (
                            <div ref={menuRef} id="tour-user-menu" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setUserMenu(!userMenu)}
                                    className={`navbar-avatar-btn${userMenu ? ' active' : ''}`}
                                    aria-label={t('nav.userMenu')}
                                    aria-expanded={userMenu}
                                    aria-haspopup="true"
                                >
                                    {session.user.image ? (
                                        <img src={session.user.image} alt="" className="navbar-avatar-img" />
                                    ) : (
                                        <div className="navbar-avatar-fallback">{userInitial}</div>
                                    )}
                                    <span className="navbar-avatar-name">{session.user.name || t('nav.account')}</span>
                                    <ChevronDown size={13} className={`navbar-avatar-chevron${userMenu ? ' open' : ''}`} />
                                </button>

                                {userMenu && (
                                    <div className="navbar-user-dropdown animate-scale-in" role="menu">
                                        <div className="navbar-user-info">
                                            <p className="navbar-user-name">{session.user.name || 'User'}</p>
                                            <p className="navbar-user-email">{session.user.email}</p>
                                        </div>
                                        <div className="navbar-user-menu-items">
                                            <Link href="/settings" onClick={() => setUserMenu(false)} className="navbar-user-menu-item">
                                                <Settings size={15} /> {t('nav.settings')}
                                            </Link>
                                            <button
                                                onClick={() => { signOut({ callbackUrl: '/' }); setUserMenu(false); }}
                                                className="navbar-user-menu-item danger"
                                            >
                                                <LogOut size={15} /> {t('nav.logout')}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="navbar-login-btn primary">
                                <LogIn size={15} /> {t('nav.login')}
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="navbar-lang-btn"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                            style={{ padding: '7px' }}
                        >
                            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                        </button>

                        {/* Language Selector */}
                        <div ref={langRef} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setLangMenu(!langMenu)}
                                className="navbar-lang-btn"
                                aria-label="Language"
                                aria-expanded={langMenu}
                            >
                                <Globe size={14} />
                                <span style={{ fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>{locale}</span>
                            </button>
                            {langMenu && (
                                <div className="navbar-lang-dropdown animate-scale-in">
                                    {(['th', 'en'] as Locale[]).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => { setLocale(l); setLangMenu(false); }}
                                            className={`navbar-lang-option${locale === l ? ' active' : ''}`}
                                        >
                                            <span style={{ fontSize: '1rem' }}>{l === 'th' ? '🇹🇭' : '🇺🇸'}</span>
                                            <span>{l === 'th' ? 'ไทย' : 'English'}</span>
                                            {locale === l && <span style={{ marginLeft: 'auto', color: 'var(--primary-light)', fontSize: '0.8rem' }}>✓</span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile toggle ── */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-menu"
                        className="navbar-mobile-toggle show-mobile"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* ── Mobile menu ── */}
                {mobileOpen && (
                    <div id="mobile-menu" className="navbar-mobile-menu">
                        <form onSubmit={handleSearch} className="navbar-mobile-search">
                            <Search size={14} className="navbar-mobile-search-icon" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('nav.searchPlaceholder')}
                                className="input"
                                style={{ paddingLeft: '36px', fontSize: '0.88rem' }}
                            />
                        </form>

                        <div className="navbar-mobile-links">
                            {NAV_KEYS.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`navbar-mobile-link${isActive(link.href) ? ' active' : ''}`}
                                >
                                    {t(link.key)}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile Theme + Language */}
                        <div style={{ display: 'flex', gap: '6px', padding: '0 16px', marginTop: '8px' }}>
                            <button
                                onClick={toggleTheme}
                                style={{
                                    flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                    fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
                                    border: '1px solid var(--border)', transition: 'all 0.15s',
                                }}
                            >
                                {theme === 'dark' ? <><Sun size={14} /> Light</> : <><Moon size={14} /> Dark</>}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', padding: '0 16px', marginTop: '6px' }}>
                            {(['th', 'en'] as Locale[]).map(l => (
                                <button
                                    key={l}
                                    onClick={() => { setLocale(l); }}
                                    style={{
                                        flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                        fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 600,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                        background: locale === l ? 'var(--primary)' : 'var(--bg-elevated)',
                                        color: locale === l ? '#fff' : 'var(--text-secondary)',
                                        border: locale === l ? '1px solid var(--primary)' : '1px solid var(--border)',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    {l === 'th' ? '🇹🇭 ไทย' : '🇺🇸 EN'}
                                </button>
                            ))}
                        </div>

                        <div className="navbar-mobile-footer">
                            {session?.user ? (
                                <>
                                    <div className="navbar-mobile-user">
                                        {session.user.image ? (
                                            <img src={session.user.image} alt="" className="navbar-avatar-img" style={{ width: '28px', height: '28px' }} />
                                        ) : (
                                            <div className="navbar-avatar-fallback" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>{userInitial}</div>
                                        )}
                                        <span>{session.user.name || session.user.email}</span>
                                    </div>
                                    <Link href="/settings" onClick={() => setMobileOpen(false)} className="navbar-mobile-link">
                                        <Settings size={15} /> {t('nav.settings')}
                                    </Link>
                                    <button
                                        onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false); }}
                                        className="navbar-mobile-link danger"
                                    >
                                        <LogOut size={15} /> {t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <Link href="/login" onClick={() => setMobileOpen(false)} className="navbar-login-btn primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <LogIn size={15} /> {t('nav.login')}
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
