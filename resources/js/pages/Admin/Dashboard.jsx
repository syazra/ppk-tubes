import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import AdminIcon from '../../components/AdminIcon';
import AdminLayout from '../../components/AdminLayout';

const metrics = [
    { label: 'Total Mahasiswa', detail: 'Jumlah akun mahasiswa terdaftar', icon: 'users' },
    { label: 'Reservasi Menunggu', detail: 'Permintaan yang menunggu tindak lanjut', icon: 'clock' },
    { label: 'Reservasi Bulan Ini', detail: 'Total aktivitas reservasi bulanan', icon: 'calendar' },
    { label: 'Ruangan Aktif', detail: 'Ruangan yang tersedia untuk reservasi', icon: 'room' },
];

function MetricCard({ label, detail, icon, index }) {
    const reducedMotion = useReducedMotion();

    return (
        <motion.article className="admin-metric-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : index * 0.07 }} whileHover={reducedMotion ? undefined : { y: -4 }}>
            <div className="flex items-center justify-between gap-3">
                <span className="admin-metric-icon"><AdminIcon name={icon} /></span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Belum tersedia</span>
            </div>
            <p className="mt-5 text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-teal-darker" aria-label={`${label}: data belum tersedia`}>—</p>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">{detail}</p>
        </motion.article>
    );
}

function EmptyState({ icon, title, children }) {
    return (
        <div className="admin-empty-state">
            <span className="admin-metric-icon"><AdminIcon name={icon} className="h-6 w-6" /></span>
            <h3 className="text-sm font-semibold text-teal-darker">{title}</h3>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-500">{children}</p>
        </div>
    );
}

export default function Dashboard({ admin, status, csrfToken, urls }) {
    const reducedMotion = useReducedMotion();

    return (
        <>
            <Head title="Dasbor Admin" />
            <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="dashboard" title="Dasbor Admin" subtitle="Ringkasan aktivitas dan layanan CampuSpace.">
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                <section className="admin-welcome" aria-labelledby="welcome-title">
                    <div className="relative z-10 min-w-0">
                        <span className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-teal-dark-01"><AdminIcon name="campus" className="h-4 w-4" />CampuSpace</span>
                        <h2 id="welcome-title" className="break-words text-xl font-bold tracking-tight text-teal-darker sm:text-2xl">Selamat datang, {admin.name}.</h2>
                        <p className="mt-2 max-w-lg text-sm leading-relaxed text-teal-dark-02/75">Mulai kelola akun dan pantau aktivitas reservasi kampus Anda.</p>
                    </div>
                    <Link href={urls.registrations} className="admin-primary-link"><AdminIcon name="student" className="h-4 w-4" />Kelola akun<AdminIcon name="arrow" className="h-4 w-4" /></Link>
                    <Link href={urls.facilities} className="admin-primary-link"><AdminIcon name="room" className="h-4 w-4" />Kelola fasilitas<AdminIcon name="arrow" className="h-4 w-4" /></Link>
                </section>

                <section aria-labelledby="summary-title">
                    <div className="admin-section-heading">
                        <div>
                            <h2 id="summary-title" className="text-lg font-bold tracking-tight text-teal-darker">Ringkasan kampus</h2>
                            <p className="mt-1 text-xs leading-relaxed text-gray-500">Indikator akan terisi saat data tersedia.</p>
                        </div>
                        <span className="admin-status-badge"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Menunggu data</span>
                    </div>
                    <div className="admin-metric-grid">
                        {metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} index={index} />)}
                    </div>
                </section>

                <motion.section className="admin-insights-grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.25 }} aria-label="Aktivitas kampus">
                    <div className="admin-panel">
                        <div className="flex items-start justify-between gap-3">
                            <div><h2 className="text-base font-semibold text-teal-darker">Aktivitas Reservasi</h2><p className="mt-1 text-xs text-gray-500">Gambaran aktivitas reservasi kampus.</p></div>
                            <AdminIcon name="chart" className="h-5 w-5 shrink-0 text-teal-dark-01" />
                        </div>
                        <EmptyState icon="chart" title="Belum ada data reservasi">Tren reservasi akan muncul di sini saat sumber data tersedia.</EmptyState>
                    </div>
                    <div className="admin-panel">
                        <div className="flex items-start justify-between gap-3">
                            <div><h2 className="text-base font-semibold text-teal-darker">Aktivitas Terbaru</h2><p className="mt-1 text-xs text-gray-500">Perubahan dan pembaruan terbaru.</p></div>
                            <AdminIcon name="activity" className="h-5 w-5 shrink-0 text-teal-dark-01" />
                        </div>
                        <EmptyState icon="activity" title="Belum ada aktivitas">Ringkasan aktivitas akan ditampilkan saat data tersedia.</EmptyState>
                        <Link href={urls.registrations} className="admin-panel-link">Lihat dan kelola akun<AdminIcon name="arrow" className="h-4 w-4" /></Link>
                    </div>
                </motion.section>
            </AdminLayout>
        </>
    );
}
