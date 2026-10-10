import { useEffect, useId, useRef, useState } from 'react';
import { motion, MotionConfig } from 'motion/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Di seluruh komponen, pakai kelas 'app' (bukan user, bukan admin, dll)

export default function AppLayout({ user, auth, csrfToken, urls, active, title, subtitle, actions, children, navigation }) {
    const currentUser = user || auth?.user;
    const [collapsed, setCollapsed] = useState(() => {
        try { return window.localStorage.getItem('app-sidebar-collapsed') === 'true'; } catch { return false; }
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const dialogRef = useRef(null);
    const drawerId = useId();

    useEffect(() => {
        try { window.localStorage.setItem('app-sidebar-collapsed', String(collapsed)); } catch {}
    }, [collapsed]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!mobileOpen) {
            if (dialog.open) dialog.close();
            return;
        }
        if (!dialog.open) dialog.showModal();
        dialog.querySelector('[data-drawer-close]')?.focus();
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prevOverflow; };
    }, [mobileOpen]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    return (
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
            <div className="app-shell">
                <a href="#app-main" className="app-skip-link">Langsung ke konten</a>
                <motion.aside initial={false} animate={{ width: collapsed ? 88 : 272 }} className="app-desktop-sidebar">
                    <Sidebar user={currentUser} csrfToken={csrfToken} urls={urls} active={active} collapsed={collapsed} navigation={navigation} />
                </motion.aside>

                <dialog ref={dialogRef} id={drawerId} className="app-mobile-dialog" aria-label="Menu navigasi" onClose={() => setMobileOpen(false)} onCancel={() => setMobileOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMobileOpen(false); }}>
                    <div className="app-mobile-panel">
                        <Sidebar user={currentUser} csrfToken={csrfToken} urls={urls} active={active} mobile onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} navigation={navigation} />
                    </div>
                </dialog>

                <div className="app-workspace">
                    <Navbar user={currentUser} urls={urls} title={title} collapsed={collapsed} mobileOpen={mobileOpen} drawerId={drawerId} onToggleSidebar={() => setCollapsed(v => !v)} onOpenMenu={() => setMobileOpen(true)} />
                    <main id="app-main" tabIndex={-1} className="app-main">
                        <div className="app-page-heading">
                            <div>
                                <h1 className="text-2xl font-bold">{title}</h1>
                                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                            </div>
                            {actions && <div className="app-page-actions">{actions}</div>}
                        </div>
                        <div className="app-page-content">{children}</div>
                    </main>
                </div>
            </div>
        </MotionConfig>
    );
}
