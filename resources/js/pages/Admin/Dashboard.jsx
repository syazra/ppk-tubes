import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import Button from '../../components/Button';
import Icon from '../../components/Icons';
import AppLayout from '../../components/AppLayout';
import ActionCard from '../../components/ActionCard';
import MetricCard from '../../components/MetricCard';
import EmptyState from '../../components/EmptyState';

// Ringkasan metrik untuk dasbor admin
const metrics = [
    { summaryKey: 'students', label: 'Total Mahasiswa', icon: 'users' },
    { summaryKey: 'pending_reservations', label: 'Reservasi Menunggu', icon: 'clock' },
    { summaryKey: 'monthly_reservations', label: 'Reservasi Bulan Ini', icon: 'calendar' },
    { summaryKey: 'active_rooms', label: 'Ruangan Aktif', icon: 'room' },
];

export default function Dashboard({ user, status, csrfToken, urls, summary }) {
    const reducedMotion = useReducedMotion();
    const currentUser = user;

    return (
        <>
            {/* JUDUL */}
            <Head title="Dasbor Admin" />
            <AppLayout
                user={currentUser}
                csrfToken={csrfToken}
                urls={urls}
                active="dashboard"
                title={`Selamat datang, ${currentUser?.name || 'Petugas'}`}
                subtitle="Lihat dan kelola ringkasan aktivitas layanan fasilitas Buana."
                actions={(
                    <div className="flex flex-wrap gap-3">
                        <Button as={Link} href={urls?.registrations || '#'} className="gap-2">
                            <Icon name="student" className="h-4 w-4" />
                            Kelola akun
                        </Button>
                        <Button as={Link} href={urls.facilities} className="gap-2">
                            <Icon name="room" className="h-4 w-4" />
                            Kelola fasilitas
                        </Button>
                    </div>
                )}>
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                {/* RINGKASAN */}
                <div className="app-metric-grid">
                    {metrics.map(({ summaryKey, ...metric }, index) => <MetricCard key={metric.label} {...metric} value={summary[summaryKey]} index={index} />)}
                </div>

                {/* AKTIVITAS */}
                <motion.section className="app-insights-grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.25 }} aria-label="Aktivitas kampus">
                    <ActionCard
                        title="Aktivitas Reservasi"
                        href={urls?.reservations || '#'}
                        emptyTitle="Belum ada data reservasi"
                        emptyMessage="Tren reservasi akan muncul di sini saat sumber data tersedia."
                    />

                    <ActionCard
                        title="Aktivitas Terbaru"
                        href={urls?.dashboard || '#'}
                        emptyTitle="Belum ada aktivitas"
                        emptyMessage="Ringkasan aktivitas akan ditampilkan saat data tersedia."
                    >
                    </ActionCard>
                </motion.section>
            </AppLayout>
        </>
    );
}
