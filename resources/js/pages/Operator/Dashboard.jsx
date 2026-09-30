import { Head } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';

export default function Dashboard({ user, status, csrfToken, urls }) {
    return (
        <>
            <Head title="Dasbor Petugas" />
            <AppLayout user={user} csrfToken={csrfToken} urls={urls} active="dashboard" title="Dasbor Petugas" subtitle="Ringkasan aktivitas reservasi CampuSpace.">
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}
                <section className="app-panel">
                    <h2 className="text-base font-semibold text-teal-darker">Selamat datang, Operator</h2>
                    <p className="mt-1 text-sm text-gray-600">Kelola reservasi fasilitas dan laporan kerusakan kampus dari menu di samping.</p>
                </section>
            </AppLayout>
        </>
    );
}