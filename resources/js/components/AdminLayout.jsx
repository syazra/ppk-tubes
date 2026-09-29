import { useEffect, useRef, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ admin, csrfToken, urls, active, title, subtitle, actions, children }) {
    const [collapsed, setCollapsed] = useState(() => {
        try { return window.localStorage.getItem('admin-sidebar-collapsed') === 'true'; } catch { return false; }
    });
    const [mobileOpen, setMobileOpen] = useState(false);
    const dialogRef = useRef(null);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        try { window.localStorage.setItem('admin-sidebar-collapsed', String(collapsed)); } catch { /* Navigation still works when storage is unavailable. */ }
    }, [collapsed]);

    useEffect(() => {
        if (!mobileOpen) return;
        const dialog = dialogRef.current;
        dialog.showModal();
        dialog.querySelector('[data-drawer-close]')?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileOpen]);

    useEffect(() => {
        const desktop = window.matchMedia('(min-width: 1024px)');
        const closeOnDesktop = () => {
            if (desktop.matches) {
                setMobileOpen(false);
                dialogRef.current?.close();
            }
        };
        desktop.addEventListener('change', closeOnDesktop);
        return () => desktop.removeEventListener('change', closeOnDesktop);
    }, []);

    useEffect(() => { setMobileOpen(false); }, [active]);

    function keepDrawerFocus(event) {
        if (event.key !== 'Tab') return;
        const controls = event.currentTarget.querySelectorAll('a[href], button:not([disabled])');
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    }

    return (
        <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
            <div className="admin-shell">
                <a href="#admin-main" className="admin-skip-link">Langsung ke konten</a>
                <motion.aside initial={false} animate={{ width: collapsed ? 88 : 272 }} transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32 }} className="admin-desktop-sidebar">
                    <AdminSidebar admin={admin} csrfToken={csrfToken} urls={urls} active={active} collapsed={collapsed} />
                </motion.aside>

                <motion.dialog ref={dialogRef} id="admin-mobile-navigation" aria-label="Menu navigasi admin" className="admin-mobile-dialog" initial={false} animate={{ opacity: mobileOpen ? 1 : 0 }} onKeyDown={keepDrawerFocus} onCancel={event => { event.preventDefault(); setMobileOpen(false); }} onClose={() => setMobileOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMobileOpen(false); }} onAnimationComplete={() => { if (!mobileOpen) dialogRef.current?.close(); }}>
                    <motion.div className="admin-mobile-panel" initial={false} animate={{ x: mobileOpen ? 0 : '-100%' }} transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
                        <AdminSidebar admin={admin} csrfToken={csrfToken} urls={urls} active={active} mobile onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} />
                    </motion.div>
                </motion.dialog>

                <div className="admin-workspace">
                    <AdminNavbar admin={admin} urls={urls} title={title} collapsed={collapsed} mobileOpen={mobileOpen} onToggleSidebar={() => setCollapsed(value => !value)} onOpenMenu={() => setMobileOpen(true)} />
                    <main id="admin-main" tabIndex={-1} className="admin-main">
                        <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}>
                            <div className={`admin-page-heading${active === 'dashboard' ? ' admin-dashboard-heading' : ''}`}>
                                <div className="min-w-0">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-dark-01">Panel Admin</p>
                                    <h1 className="text-2xl font-bold tracking-tight text-teal-darker sm:text-3xl">{title}</h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500">{subtitle}</p>
                                </div>
                                {actions && <div className="admin-page-actions">{actions}</div>}
                            </div>
                            <div className="admin-page-content">{children}</div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </MotionConfig>
    );
}
