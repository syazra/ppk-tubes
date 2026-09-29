import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import AdminIcon, { adminInitials } from './AdminIcon';

const navigation = [
    { key: 'dashboard', icon: 'home', label: 'Dasbor' },
    { key: 'registrations', icon: 'student', label: 'Registrasi Akun' },
    { key: 'profile', icon: 'user', label: 'Profil' },
];

export default function AdminSidebar({ admin, csrfToken, urls, active, collapsed = false, onNavigate, onClose, mobile = false }) {
    return (
        <div className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''}`}>
            <div className="admin-sidebar-brand">
                <a href={urls.guest} className="flex min-w-0 items-center gap-3" aria-label="CampuSpace — halaman utama" title={collapsed ? 'CampuSpace' : undefined}>
                    <span className="admin-brand-mark"><AdminIcon name="campus" className="h-6 w-6" /></span>
                    {!collapsed && <span className="admin-sidebar-label"><span className="block text-lg font-bold tracking-tight">CampuSpace</span><span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-white/50">Panel Admin</span></span>}
                </a>
                {mobile && <button type="button" className="admin-sidebar-close" aria-label="Tutup menu navigasi" onClick={onClose} data-drawer-close><AdminIcon name="close" /></button>}
            </div>

            <nav id={mobile ? undefined : 'admin-desktop-navigation'} aria-label="Navigasi admin" className="admin-sidebar-nav">
                <p className={`admin-nav-heading ${collapsed ? 'sr-only' : ''}`}>Menu utama</p>
                {navigation.map(item => (
                    <Link key={item.key} href={urls[item.key]} onClick={onNavigate} aria-current={active === item.key ? 'page' : undefined} aria-label={collapsed ? item.label : undefined} title={collapsed ? item.label : undefined} className={`admin-nav-link ${active === item.key ? 'is-active' : ''}`}>
                        {active === item.key && <motion.span layoutId={mobile ? 'mobile-admin-active' : 'desktop-admin-active'} className="admin-nav-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                        <AdminIcon name={item.icon} className="relative z-10 h-5 w-5 shrink-0" />
                        {!collapsed && <span className="admin-sidebar-label relative z-10">{item.label}</span>}
                        {!collapsed && active === item.key && <span className="relative z-10 ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-green-normal-01" />}
                    </Link>
                ))}
            </nav>

            <div className="admin-sidebar-footer">
                <Link href={urls.profile} onClick={onNavigate} className="admin-sidebar-account" title={collapsed ? admin.name : undefined} aria-label={`Profil ${admin.name}`}>
                    <span className="admin-avatar shrink-0">{adminInitials(admin.name)}</span>
                    {!collapsed && <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{admin.name}</span><span className="mt-0.5 block truncate text-xs text-white/50">{admin.email}</span></span>}
                </Link>
                <form method="post" action={urls.logout}>
                    <input type="hidden" name="_token" value={csrfToken} />
                    <button type="submit" className="admin-logout" title={collapsed ? 'Keluar' : undefined} aria-label="Keluar"><AdminIcon name="logout" className="h-5 w-5 shrink-0" />{!collapsed && <span>Keluar</span>}</button>
                </form>
            </div>
        </div>
    );
}
