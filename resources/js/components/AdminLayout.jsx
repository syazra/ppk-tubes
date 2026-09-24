import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ admin, csrfToken, urls, active, title, subtitle, children }) {
    return (
        <div className="flex min-h-screen bg-green-light-01 text-teal-darker">
            <AdminSidebar admin={admin} csrfToken={csrfToken} urls={urls} active={active} />
            <main className="min-w-0 flex-1 overflow-y-auto">
                <header className="mb-2 px-6 py-4">
                    <h1 className="pb-1 text-xl font-semibold leading-tight text-teal-darker">{title}</h1>
                    <p className="text-sm leading-tight text-teal-dark-01">{subtitle}</p>
                </header>
                {children}
            </main>
        </div>
    );
}
