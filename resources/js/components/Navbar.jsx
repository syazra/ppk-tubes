import { Link } from '@inertiajs/react';
import { motion } from 'motion/react';
import Icon, { initials } from './Icons';

export default function Navbar({ user, admin, auth, urls, title, collapsed, onToggleSidebar, onOpenMenu, mobileOpen }) {
    const currentUser = user || admin || auth?.user;
    const userName = currentUser?.name || 'Pengguna';

    const getRoleLabel = (u) => {
        if (!u) return 'Pengguna';
        if (u.role === 'admin' || u.account_type === 'admin') return 'Administrator';
        if (u.role === 'operator' || u.account_type === 'petugas') return 'Petugas';
        if (u.account_type === 'mahasiswa') return 'Mahasiswa';
        if (u.account_type === 'dosen') return 'Dosen';
        if (u.account_type === 'staf') return 'Staf';
        if (u.role === 'user') return 'Pengguna';
        return u.role || u.account_type || 'Pengguna';
    };

    const roleLabel = getRoleLabel(currentUser);

    return (
        <header className="app-navbar admin-navbar">
            <div className="flex min-w-0 items-center gap-3">
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onOpenMenu} className="app-icon-button admin-icon-button lg:hidden" aria-label="Buka menu navigasi" aria-expanded={mobileOpen}>
                    <Icon name="menu" />
                </motion.button>
                <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onToggleSidebar} className="app-icon-button admin-icon-button hidden lg:flex" aria-label={collapsed ? 'Perluas menu' : 'Ciutkan menu'} aria-expanded={!collapsed}>
                    <motion.span animate={{ rotate: collapsed ? 180 : 0 }}><Icon name="panel" /></motion.span>
                </motion.button>
                <div className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="hidden text-gray-500 sm:inline">Dasbor</span>
                    <Icon name="chevron" className="hidden h-3.5 w-3.5 text-gray-400 sm:block" />
                    <span className="truncate font-semibold text-teal-darker">{title}</span>
                </div>
            </div>
            <Link href={urls?.profile || '#'} className="app-navbar-profile admin-navbar-profile" aria-label={`Buka profil ${userName}`}>
                <span className="hidden min-w-0 text-right sm:block">
                    <span className="block max-w-[12rem] truncate text-sm font-semibold text-teal-darker">{userName}</span>
                    <span className="block text-xs text-gray-500">{roleLabel}</span>
                </span>
                <span className="app-avatar admin-avatar">{initials(userName)}</span>
            </Link>
        </header>
    );
}