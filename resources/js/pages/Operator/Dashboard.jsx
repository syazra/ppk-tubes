import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import Button from '../../components/Button';
import Icon from '../../components/Icons';
import AppLayout from '../../components/AppLayout';
import ActionCard from '../../components/ActionCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';

const statusLabels = {
    baru: 'Baru',
    menunggu: 'Menunggu',
    diproses: 'Diproses',
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

export default function Dashboard({ user, status, csrfToken, urls, recentReservations = [], recentReports = [] }) {
    const reducedMotion = useReducedMotion();

    return (
        <>
            <Head title="Dasbor Petugas" />
            <AppLayout
                user={user}
                csrfToken={csrfToken}
                urls={urls}
                active="dashboard"
                title={`Selamat datang, ${user?.name || 'Petugas'}`}
                subtitle="Ringkasan aktivitas reservasi dan pelaporan fasilitas Buana."
                actions={
                    <div className="flex flex-wrap gap-3">
                        <Button as={Link} href={urls?.reservations || '#'} className="gap-2">
                            <Icon name="calendar" className="h-4 w-4" />
                            Lihat reservasi
                        </Button>
                        <Button as={Link} href={urls?.reports || '#'} className="gap-2">
                            <Icon name="tool" className="h-4 w-4" />
                            Lihat laporan
                        </Button>
                    </div>
                }
            >
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                {/* Ringkasan */}
                <motion.section className="app-insights-grid" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : 0.25 }} aria-label="Aktivitas kampus">
                    <ActionCard
                        title="Reservasi terbaru"
                        href={urls.reservations}
                        emptyTitle="Belum ada reservasi"
                        emptyMessage={
                            <>
                                Belum ada reservasi terbaru. <Link href={urls.reservations} className="font-medium text-teal-700 hover:underline">Lihat daftar reservasi</Link> untuk memantau antrian.
                            </>
                        }
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
                        title="Laporan terbaru"
                        href={urls.reports}
                        emptyTitle="Belum ada laporan"
                        emptyMessage={
                            <>
                                Belum ada laporan baru. <Link href={urls.reports} className="font-medium text-teal-700 hover:underline">Lihat semua laporan</Link> untuk memantau status perbaikan.
                            </>
                        }
                    >
                        {recentReports.length ? (
                            <div className="flex-1 divide-y divide-gray-100">
                                {recentReports.map((report, index) => (
                                    <div key={report.id} className={`flex flex-wrap items-center justify-between gap-3 py-4 ${index === 0 ? 'pt-0' : ''}`}>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-teal-darker">{report.room?.name ?? 'Fasilitas'}</h3>
                                            <p className="mt-1 text-xs text-gray-500">{report.desc?.length > 50 ? `${report.desc.slice(0, 50)}...` : report.desc}</p>
                                            <p className="mt-1 text-sm text-teal-700">{formatDate(report.created_at)}</p>
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