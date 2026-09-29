import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import AdminIcon, { adminInitials } from './AdminIcon';

export default function AdminNavbar({ admin, urls, title, collapsed, onToggleSidebar, onOpenMenu, mobileOpen }) {
    return (
        <header className="admin-navbar">
            <div className="flex min-w-0 items-center gap-3">
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onOpenMenu} className="admin-icon-button lg:hidden" aria-label="Buka menu navigasi" aria-controls="admin-mobile-navigation" aria-expanded={mobileOpen}>
                    <AdminIcon name="menu" />
                </motion.button>
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onToggleSidebar} className="admin-icon-button hidden lg:flex" aria-label={collapsed ? 'Perluas menu navigasi' : 'Ciutkan menu navigasi'} aria-controls="admin-desktop-navigation" aria-expanded={!collapsed} title={collapsed ? 'Perluas menu navigasi' : 'Ciutkan menu navigasi'}>
                    <motion.span animate={{ rotate: collapsed ? 180 : 0 }}><AdminIcon name="panel" /></motion.span>
                </motion.button>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="hidden text-gray-500 sm:inline">Panel Admin</span>
                    <AdminIcon name="chevron" className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
                    <span className="truncate font-semibold text-teal-darker">{title}</span>
                </div>
            </div>
            <Link href={urls.profile} className="admin-navbar-profile" aria-label={`Buka profil ${admin.name}`}>
                <span className="hidden min-w-0 text-right sm:block">
                    <span className="block max-w-[12rem] truncate text-sm font-semibold text-teal-darker">{admin.name}</span>
                    <span className="block text-xs text-gray-500">Administrator</span>
                </span>
                <span className="admin-avatar">{adminInitials(admin.name)}</span>
            </Link>
        </header>
    );
}
