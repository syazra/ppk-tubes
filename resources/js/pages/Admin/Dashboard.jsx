import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import Button from '../../components/Button';
import Icon from '../../components/Icons';
import AppLayout from '../../components/AppLayout';
import ActionCard from '../../components/ActionCard';
import MetricCard from '../../components/MetricCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';

const statusLabels = {
    baru: 'Baru',
    menunggu: 'Menunggu',
    diproses: 'Sedang diproses',
    selesai: 'Selesai',
    disetujui: 'Disetujui',
    ditolak: 'Ditolak',
    dibatalkan: 'Dibatalkan',
};

function formatDate(value) {
    if (!value) return '-';

    const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
    return Number.isNaN(date.getTime())
        ? '-'
        : new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatTime(value) {
    return value ? value.slice(0, 5) : '-';
}

// Ringkasan metrik untuk dasbor admin
const metrics = [
    { summaryKey: 'students', label: 'Total Mahasiswa', icon: 'users' },
    // { summaryKey: 'pending_reservations', label: 'Reservasi Menunggu', icon: 'clock' },
    { summaryKey: 'monthly_reservations', label: 'Reservasi Bulan Ini', icon: 'calendar' },
    { summaryKey: 'monthly_reports', label: 'Laporan Bulan Ini', icon: 'tool' },
    { summaryKey: 'active_rooms', label: 'Ruangan Aktif', icon: 'room' },
];

export default function Dashboard({ user, status, csrfToken, urls, summary, recentReservations = [], recentReports = [] }) {
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
                        title="Fasilitas yang direservasi"
                        href={urls?.reservations}
                        emptyTitle="Belum ada reservasi"
                        emptyMessage="Fasilitas yang direservasi akan ditampilkan di sini."
                    >
                        {recentReservations.length ? (
                            <div className="flex-1 divide-y divide-gray-100">
                                {recentReservations.map((reservation, index) => (
                                    <div key={reservation.id} className={`flex flex-wrap items-center justify-between gap-3 py-4 ${index === 0 ? 'pt-0' : ''}`}>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-teal-darker">{reservation.room?.name ?? 'Ruangan'}</h3>
                                            <p className="mt-1 text-xs text-gray-500">{reservation.room?.location ?? 'Fasilitas'}</p>
                                            <p className="mt-1 text-sm text-teal-700">
                                                {formatDate(reservation.date_to_reserv)}, {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
                                            </p>
                                        </div>
                                        <StatusBadge color={getStatusColor(reservation.status)}>
                                            {statusLabels[reservation.status] ?? reservation.status}
                                        </StatusBadge>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </ActionCard>

                    <ActionCard
                        title="Fasilitas yang Dilaporkan"
                        href={urls?.reports}
                        emptyTitle="Belum ada laporan yang diproses"
                        emptyMessage="Fasilitas yang sedang diperbaiki atau sudah selesai akan ditampilkan di sini."
                    >
                        {recentReports.length ? (
                            <div className="flex-1 divide-y divide-gray-100">
                                {recentReports.map((report, index) => (
                                    <div key={report.id} className={`flex flex-wrap items-center justify-between gap-3 py-4 ${index === 0 ? 'pt-0' : ''}`}>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-teal-darker">{report.room?.name ?? 'Fasilitas'}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{report.desc?.length > 60 ? `${report.desc.slice(0, 60)}...` : report.desc}</p>
                                            <p className="mt-1 text-xs text-gray-500">Diperbarui {formatDate(report.updated_at)}</p>
                                        </div>
                                        <StatusBadge color={getStatusColor(report.status)}>
                                            {statusLabels[report.status] ?? report.status}
                                        </StatusBadge>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </ActionCard>
                </motion.section>
            </AppLayout>
        </>
    );
}
