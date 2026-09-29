import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import Icon from '../../components/Icons';
import AppLayout from '../../components/AppLayout';
import MetricCard from '../../components/MetricCard';
import EmptyState from '../../components/EmptyState';

// Ringkasan metrik untuk dasbor admin
const metrics = [
    { label: 'Total Mahasiswa', detail: 'Jumlah akun mahasiswa terdaftar', icon: 'users' },
    { label: 'Reservasi Menunggu', detail: 'Permintaan yang menunggu tindak lanjut', icon: 'clock' },
    { label: 'Reservasi Bulan Ini', detail: 'Total aktivitas reservasi bulanan', icon: 'calendar' },
    { label: 'Ruangan Aktif', detail: 'Ruangan yang tersedia untuk reservasi', icon: 'room' },
];

export default function Dashboard({ user, status, csrfToken, urls }) {
    const reducedMotion = useReducedMotion();
    const currentUser = user;

    return (
        <>
            {/* JUDUL */}
            <Head title="Dasbor Admin" />
            <AppLayout user={currentUser} csrfToken={csrfToken} urls={urls} active="dashboard" title="Dasbor Admin" subtitle="Ringkasan aktivitas dan layanan CampuSpace." actions={<Link href={urls?.registrations || '#'} className="app-primary-link"><Icon name="student" className="h-4 w-4" />Kelola akun</Link>}>
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                {/* RINGKASAN */}
                <section aria-labelledby="summary-title">
                    <div className="app-section-heading">
                        <div>
                            <h2 id="summary-title" className="text-lg font-bold tracking-tight text-teal-darker">Ringkasan kampus</h2>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">Indikator akan terisi saat data tersedia.</p>
                        </div>
                        <span className="app-status-badge"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Menunggu data</span>
                    </div>
                    <div className="app-metric-grid">
                        {metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} index={index} />)}
                    </div>
                </section>

                {/* AKTIVITAS */}
                <motion.section className="app-insights-grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.25 }} aria-label="Aktivitas kampus">
                    <div className="app-panel">
                        <div className="flex items-start justify-between gap-3">
                            <div><h2 className="text-base font-semibold text-teal-darker">Aktivitas Reservasi</h2><p className="mt-1 text-xs text-gray-500">Gambaran aktivitas reservasi kampus.</p></div>
                            <Icon name="chart" className="h-5 w-5 shrink-0 text-teal-dark-01" />
                        </div>
                        <EmptyState title="Belum ada data reservasi">Tren reservasi akan muncul di sini saat sumber data tersedia.</EmptyState>
                    </div>
                    <div className="app-panel">
                        <div className="flex items-start justify-between gap-3">
                            <div><h2 className="text-base font-semibold text-teal-darker">Aktivitas Terbaru</h2><p className="mt-1 text-xs text-gray-500">Perubahan dan pembaruan terbaru.</p></div>
                            <Icon name="activity" className="h-5 w-5 shrink-0 text-teal-dark-01" />
                        </div>
                        <EmptyState title="Belum ada aktivitas">Ringkasan aktivitas akan ditampilkan saat data tersedia.</EmptyState>
                        <Link href={urls?.registrations || '#'} className="app-panel-link">Lihat dan kelola akun<Icon name="arrow" className="h-4 w-4" /></Link>
                    </div>
                </motion.section>
            </AppLayout>
        </>
    );
}
