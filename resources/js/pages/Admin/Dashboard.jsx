import { Head } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';

function MetricCard({ label, detail }) {
    return (
        <article className="rounded-lg border border-green-light-03 bg-white-01 p-5 shadow-sm">
            <p className="text-sm font-medium text-teal-dark-01">{label}</p>
            <p className="mt-4 text-3xl font-semibold text-teal-darker" aria-label={`${label}: data belum tersedia`}>—</p>
            <p className="mt-2 text-xs text-gray-500">{detail}</p>
        </article>
    );
}

export default function Dashboard({ admin, status, csrfToken, urls }) {
    return (
        <>
            <Head title="Dashboard Admin" />
            <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="dashboard" title="Dashboard Admin" subtitle="Ringkasan aktivitas dan layanan Pinjamin.">
                <section className="mb-6 max-w-7xl px-6 lg:px-8">
                    {status && (
                        <div role="status" className="mb-5 rounded-lg border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">
                            {status}
                        </div>
                    )}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-teal-darker">Ringkasan</h2>
                        <p className="mt-1 text-sm text-gray-600">Indikator dashboard akan terisi saat sumber telemetri tersedia.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <MetricCard label="Total Mahasiswa" detail="Jumlah akun mahasiswa terdaftar" />
                        <MetricCard label="Reservasi Menunggu" detail="Permintaan yang menunggu tindak lanjut" />
                        <MetricCard label="Reservasi Bulan Ini" detail="Total aktivitas reservasi bulanan" />
                        <MetricCard label="Ruangan Aktif" detail="Ruangan yang tersedia untuk reservasi" />
                    </div>
                </section>

                <section className="mb-6 grid max-w-7xl gap-5 px-6 lg:grid-cols-3 lg:px-8">
                    <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm lg:col-span-2">
                        <h2 className="text-lg font-semibold text-teal-darker">Aktivitas Reservasi</h2>
                        <p className="mt-1 text-sm text-gray-600">Tren reservasi akan ditampilkan di sini.</p>
                        <div className="mt-5 flex h-52 items-center justify-center rounded-lg border border-dashed border-teal-light-03 bg-teal-light-01/50 text-sm text-teal-dark-01">
                            Data telemetri belum tersedia
                        </div>
                    </div>
                    <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-teal-darker">Aktivitas Terbaru</h2>
                        <p className="mt-1 text-sm text-gray-600">Ringkasan perubahan terbaru.</p>
                        <div className="mt-5 flex h-52 items-center justify-center rounded-lg border border-dashed border-teal-light-03 bg-teal-light-01/50 px-4 text-center text-sm text-teal-dark-01">
                            Data aktivitas belum tersedia
                        </div>
                    </div>
                </section>
            </AdminLayout>
        </>
    );
}
