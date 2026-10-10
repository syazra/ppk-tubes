import { Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Icon from './Icons';
import PublicBrand from './PublicBrand';
import '../../css/public-navigation.css';

export default function PublicNavbar({ urls = {}, active, headerRef, children }) {
    const page = usePage() || {};
    const props = page.props || {};
    const { auth } = props;
    const rawUrl = page.url || '';
    const pathOnly = rawUrl.replace(/^https?:\/\/[^\/]+/, '').split('?')[0].split('#')[0];
    const isFacilities = page.component === 'Guest/Facilities' || pathOnly === '/fasilitas' || pathOnly.startsWith('/fasilitas/');
    const isAbout = page.component === 'Guest/About' || pathOnly === '/tentang' || pathOnly.startsWith('/tentang/');
    const isLanding = page.component === 'Landing' || pathOnly === '/' || pathOnly === '';
    const currentActive = active ?? (
        isFacilities ? 'facilities' :
        isAbout ? 'about' :
        isLanding ? 'landing' :
        null
    );
    const safeUrls = urls || {};
    const landingUrl = safeUrls.landing || '/';
    const facilitiesUrl = safeUrls.facilities || '/fasilitas';
    const aboutUrl = safeUrls.about || '/tentang';
    const loginUrl = safeUrls.login || '/login';
    const accountUrl = auth?.user ? (auth.dashboardUrl || '/dashboard') : loginUrl;
    const accountLabel = auth?.user ? 'Kembali ke dasbor' : 'Masuk';
    const [menuOpen, setMenuOpen] = useState(false);
    const navbarRef = useRef(null);
    const toggleRef = useRef(null);
    const menuId = useId();
    const links = [
        { key: 'landing', label: 'Beranda', url: landingUrl },
        { key: 'facilities', label: 'Fasilitas', url: facilitiesUrl },
        { key: 'about', label: 'Tentang', url: aboutUrl },
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
                <Link href={landingUrl} className="cs-brand pn-brand" aria-label="Buana — Beranda" onClick={() => setMenuOpen(false)}><PublicBrand /></Link>
                <nav className="pn-desktop-links" aria-label="Navigasi utama">
                    {links.map(link => <Link key={link.key} href={link.url} className="pn-link" aria-current={currentActive === link.key ? 'page' : undefined}>{link.label}</Link>)}
                </nav>
                <div className="pn-actions">
                    <Link href={accountUrl} className="pn-login" onClick={() => setMenuOpen(false)}>{accountLabel}<Icon name="landing-arrow" className="pn-icon pn-login-arrow" /></Link>
                    <button ref={toggleRef} className="pn-menu-toggle" type="button" aria-expanded={menuOpen} aria-controls={menuId} aria-label={menuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'} onClick={() => setMenuOpen(open => !open)}><Icon name={menuOpen ? 'landing-close' : 'landing-menu'} className="pn-icon" /></button>
                </div>
            </div>
            <nav className="pn-mobile-links" id={menuId} hidden={!menuOpen} aria-label="Navigasi utama seluler">
                {links.map(link => <Link key={link.key} href={link.url} className="pn-link" aria-current={currentActive === link.key ? 'page' : undefined} onClick={() => setMenuOpen(false)}><span>{link.label}</span><Icon name="landing-arrow" className="pn-icon" /></Link>)}
            </nav>
            {children}
        </header>
    );
}
