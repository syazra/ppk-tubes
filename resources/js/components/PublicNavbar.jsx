import { Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from './Icons';
import PublicBrand from './PublicBrand';
import '../../css/public-navigation.css';

export default function PublicNavbar({ urls, active = 'landing', headerRef, children }) {
    const { auth } = usePage().props;
    const accountUrl = auth?.user ? auth.dashboardUrl : urls.login;
    const accountLabel = auth?.user ? 'Kembali ke dasbor' : 'Masuk';
    const [menuOpen, setMenuOpen] = useState(false);
    const navbarRef = useRef(null);
    const toggleRef = useRef(null);
    const menuId = useId();
    const links = [
        { key: 'landing', label: 'Beranda', url: urls.landing },
        { key: 'facilities', label: 'Fasilitas', url: urls.facilities },
        { key: 'about', label: 'Tentang', url: urls.about },
    ];
    const setHeaderRef = useCallback(node => {
        navbarRef.current = node;
        if (typeof headerRef === 'function') headerRef(node);
        else if (headerRef) headerRef.current = node;
    }, [headerRef]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 901px)');
        const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
        desktop.addEventListener('change', closeOnDesktop);
        return () => { desktop.removeEventListener('change', closeOnDesktop); };
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const closeAndFocus = () => { setMenuOpen(false); toggleRef.current?.focus(); };
        const handleEscape = event => {
            if (event.key === 'Escape') { event.preventDefault(); closeAndFocus(); }
        };
        const handleOutsideClick = event => {
            if (!navbarRef.current?.contains(event.target)) closeAndFocus();
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('pointerdown', handleOutsideClick);
        };
    }, [menuOpen]);

    return (
        <header className="pn" ref={setHeaderRef}>
            <div className="pn-inner">
                <Link href={urls.landing} className="cs-brand pn-brand" aria-label="CampuSpace — Beranda" onClick={() => setMenuOpen(false)}><PublicBrand /></Link>
                <nav className="pn-desktop-links" aria-label="Navigasi utama">
                    {links.map(link => <Link key={link.key} href={link.url} className="pn-link" aria-current={active === link.key ? 'page' : undefined}>{link.label}</Link>)}
                </nav>
                <div className="pn-actions">
                    <a href={accountUrl} className="pn-login" onClick={() => setMenuOpen(false)}>{accountLabel}<Icon name="landing-arrow" className="pn-icon pn-login-arrow" /></a>
                    <button ref={toggleRef} className="pn-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls={menuId} aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'} onClick={() => setMenuOpen(open => !open)}><Icon name={menuOpen ? 'landing-close' : 'landing-menu'} className="pn-icon" /></button>
                </div>
            </div>
            <nav className="pn-mobile-links" id={menuId} hidden={!menuOpen} aria-label="Navigasi utama seluler">
                {links.map(link => <Link key={link.key} href={link.url} className="pn-link" aria-current={active === link.key ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span>{link.label}</span><Icon name="landing-arrow" className="pn-icon" /></Link>)}
            </nav>
            {children}
        </header>
    );
}
