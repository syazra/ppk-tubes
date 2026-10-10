import { Head, router } from '@inertiajs/react';

export default function AuthPanel({ title, description, logoutUrl, children }) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-teal-darker px-5 py-12">
            <Head title={title} />
            <section className="w-full max-w-md rounded-2xl bg-white-01 p-8 shadow-xl" aria-labelledby="auth-title">
                <p className="mb-5 text-center text-2xl font-semibold text-teal-darker">Buana</p>
                <h1 id="auth-title" className="text-center text-xl font-bold text-teal-darker">{title}</h1>
                <p className="mb-6 mt-3 text-center text-sm text-gray-600">{description}</p>
                {children}
                <button type="button" onClick={() => router.post(logoutUrl)} className="mt-5 w-full rounded-lg px-4 py-2 text-sm text-gray-600 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-teal-dark-01">
                    Keluar dari akun
                </button>
            </section>
        </main>
    );
}
