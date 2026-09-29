import { Link } from '@inertiajs/react';

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        campus: <path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />,
        home: <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />,
        student: <path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />,
        user: <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />,
    };

    return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function NavLink({ href, children, active = false }) {
    return (
        <Link href={href} aria-current={active ? 'page' : undefined} className={`ml-4 flex items-center gap-3 rounded-l-full py-3 pl-4 pr-6 text-sm text-white-01 transition ${active ? 'bg-teal-dark-01/50 font-semibold' : 'hover:bg-white/10'}`}>
            {children}
        </Link>
    );
}

export default function AdminSidebar({ admin, csrfToken, urls, active }) {
    return (
        <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-teal-light-03 bg-grad-teal-02">
            <div>
                <div className="flex h-16 items-center border-b border-teal-light-03/40 px-6">
                    <a href={urls.guest} className="flex items-center gap-3 text-lg font-bold text-white-01">
                        <Icon name="campus" className="h-8 w-8" />
                        <span>CampuSpace</span>
                    </a>
                </div>
                <nav className="space-y-1 py-4">
                    <NavLink href={urls.dashboard} active={active === 'dashboard'}><Icon name="home" />Dashboard</NavLink>
                    <NavLink href={urls.registrations} active={active === 'registrations'}><Icon name="student" />Registrasi Akun</NavLink>
                    <NavLink href={urls.profile} active={active === 'profile'}><Icon name="user" />Profile</NavLink>
                </nav>
            </div>
            <div className="border-t border-teal-light-03/40 p-4">
                <div className="mb-2 px-2 py-2">
                    <div className="truncate text-sm font-medium text-green-light-01">{admin.name}</div>
                    <div className="truncate text-xs text-green-normal-01">{admin.email}</div>
                </div>
                <Link href={urls.profile} className="block rounded-md px-3 py-1.5 text-xs font-medium text-green-light-01">Profile</Link>
                <form method="post" action={urls.logout}>
                    <input type="hidden" name="_token" value={csrfToken} />
                    <button type="submit" className="w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-red-500">Log Out</button>
                </form>
            </div>
        </aside>
    );
}
