import { Head, Link, useForm } from '@inertiajs/react';

function Icon({ name, className = 'h-5 w-5' }) {
    const paths = {
        campus: <><path d="m2 10 10-7 10 7" /><path d="M4 10v10h16V10" /><path d="M9 20v-6h6v6" /></>,
        home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9" /><path d="M9 21v-7h6v7" /></>,
        student: <><circle cx="10" cy="7" r="3" /><path d="M4 21v-2a6 6 0 0 1 12 0v2" /><path d="M19 8v6m-3-3h6" /></>,
        user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
    };

    return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function NavLink({ href, children, active = false }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 rounded-l-full py-3 pl-4 pr-6 text-sm text-white-01 transition ${active ? 'bg-teal-dark-01/50 font-semibold' : 'hover:bg-white/10'}`}
        >
            {children}
        </Link>
    );
}

function FieldError({ message }) {
    return message ? <p className="mt-2 text-sm text-red-600">{message}</p> : null;
}

export default function Dashboard({ admin, status, csrfToken, urls }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    function submit(event) {
        event.preventDefault();
        post(urls.students, {
            onSuccess: () => reset(),
        });
    }

    return (
        <>
            <Head title="Dashboard Admin" />
            <div className="flex min-h-screen bg-green-light-01 text-teal-darker">
                <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col justify-between border-r border-teal-light-03 bg-grad-teal-02">
                    <div>
                        <div className="flex h-16 items-center border-b border-teal-light-03/40 px-6">
                            <a href={urls.guest} className="flex items-center gap-3 text-lg font-bold text-white-01">
                                <Icon name="campus" className="h-8 w-8" />
                                <span>CampuSpace</span>
                            </a>
                        </div>
                        <nav className="space-y-1 py-4">
                            <NavLink href={urls.dashboard} active><Icon name="home" />Dashboard</NavLink>
                            <a href="#register-student" className="ml-4 flex items-center gap-3 rounded-l-full py-3 pl-4 pr-6 text-sm text-white-01 hover:bg-white/10"><Icon name="student" />Registrasi Mahasiswa</a>
                            <a href={urls.profile} className="ml-4 flex items-center gap-3 rounded-l-full py-3 pl-4 pr-6 text-sm text-white-01 hover:bg-white/10"><Icon name="user" />Profile</a>
                        </nav>
                    </div>
                    <div className="border-t border-teal-light-03/40 p-4">
                        <div className="mb-2 px-2 py-2">
                            <div className="truncate text-sm font-medium text-green-light-01">{admin.name}</div>
                            <div className="truncate text-xs text-green-normal-01">{admin.email}</div>
                        </div>
                        <a href={urls.profile} className="block rounded-md px-3 py-1.5 text-xs font-medium text-green-light-01">Profile</a>
                        <form method="post" action={urls.logout}>
                            <input type="hidden" name="_token" value={csrfToken} />
                            <button type="submit" className="w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-red-500">Log Out</button>
                        </form>
                    </div>
                </aside>

                <main className="min-w-0 flex-1 overflow-y-auto">
                    <header className="mb-2 px-6 py-4">
                        <h1 className="pb-1 text-xl font-semibold leading-tight text-teal-darker">Dashboard Admin</h1>
                        <p className="text-sm leading-tight text-teal-dark-01">Kelola akses mahasiswa ke Pinjamin.</p>
                    </header>
                    <section className="mb-5 max-w-7xl px-6 lg:px-8">
                        <div className="overflow-hidden rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
                            <div id="register-student" className="max-w-2xl p-6 sm:p-8">
                                <h2 className="text-xl font-bold text-teal-darker">Registrasi Mahasiswa</h2>
                                <p className="mt-1 text-sm text-gray-600">Buat akun mahasiswa dengan alamat email kampus yang valid.</p>
                                {status && (
                                    <div role="status" className="mt-5 rounded-lg border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">
                                        {status}
                                    </div>
                                )}
                                <form onSubmit={submit} className="mt-6 space-y-5">
                                    <div>
                                        <label htmlFor="name" className="mb-2 block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                                        <input id="name" name="name" type="text" value={data.name} onChange={e => setData('name', e.target.value)} required autoComplete="off" className="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                                        <FieldError message={errors.name} />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-teal-darker">Email mahasiswa</label>
                                        <input id="email" name="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} required autoComplete="off" placeholder="nama@students.kampus.ac.id" className="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                                        <p className="mt-2 text-xs text-gray-500">Harus menggunakan domain @students.kampus.ac.id.</p>
                                        <FieldError message={errors.email} />
                                    </div>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-teal-darker">Kata sandi awal</label>
                                            <input id="password" name="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required minLength={8} autoComplete="new-password" className="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                                            <FieldError message={errors.password} />
                                        </div>
                                        <div>
                                            <label htmlFor="password_confirmation" className="mb-2 block text-sm font-semibold text-teal-darker">Ulangi kata sandi</label>
                                            <input id="password_confirmation" name="password_confirmation" type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required autoComplete="new-password" className="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={processing} className="rounded-xl bg-teal-dark-01 px-5 py-3 text-sm font-semibold text-white-01 transition hover:bg-teal-dark-02 focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2 disabled:opacity-60">
                                        {processing ? 'Menyimpan...' : 'Buat akun mahasiswa'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
