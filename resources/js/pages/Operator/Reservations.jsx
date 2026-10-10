import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';
import { reservationColumns, reservationCells } from '../../components/ReservationTableFields';
import ReservationTicket from '../../components/ReservationTicket';
import { reservationStatusLabels, reservationSortOptions } from '../../lib/reservationPresentation';

const metrics = [
    { summaryKey: 'total', label: 'Total Reservasi', icon: 'calendar' },
    { summaryKey: 'approved', label: 'Reservasi Disetujui', icon: 'check' },
    { summaryKey: 'pending', label: 'Reservasi Menunggu', icon: 'clock' },
    { summaryKey: 'rejected', label: 'Reservasi Ditolak', icon: 'close' },
];

export default function Reservations({ user, status, csrfToken, urls, reservations, filters, summary, errors = {} }) {
    const filterForm = useForm({ ...filters });
    const [selectedReservation, setSelectedReservation] = useState(null);

    function applyFilters(event) {
        event.preventDefault();
        filterForm.get(urls.reservations, { preserveState: true, preserveScroll: true, replace: true });
    }

    function updateReservation(reservation, decision) {
        const actionText = decision === 'approve' ? 'menyetujui' : 'menolak';
        if (!window.confirm(`Yakin ingin ${actionText} reservasi dari ${reservation.user?.name ?? 'peminjam'} ?`)) {
            return;
        }
        router.patch(`${urls[decision]}/${reservation.id}/${decision}`, {}, { preserveScroll: true });
    }

    return (
        <>
            {/* JUDUL */}
            <Head title="Kelola Reservasi" />
            <AppLayout user={user} csrfToken={csrfToken} urls={urls} active="reservations"
                title="Kelola Reservasi"
                subtitle="Lihat dan kelola reservasi kampus."
            >
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}
                {errors.reservation && <p role="alert" className="mb-4 text-sm text-red-700">{errors.reservation}</p>}
                {errors.rejection_reason && <p role="alert" className="mb-4 text-sm text-red-700">{errors.rejection_reason}</p>}

                {/* RINGKASAN */}
                <section aria-labelledby="summary-title">
                    <div className="app-metric-grid">
                        {metrics.map(({ summaryKey, ...metric }, index) => <MetricCard key={metric.label} {...metric} value={summary[summaryKey]} index={index} />)}
                    </div>
                </section>

                {/* AKTIVITAS */}
                <FilterTable
                    title="Semua Reservasi"
                    description="Lihat dan telusuri reservasi fasilitas kampus."
                    filterForm={filterForm}
                    onSubmit={applyFilters}
                    filterFields={[
                        { name: 'search',
                            id: 'reservation-search',
                            label: 'Cari peminjam, fasilitas, tanggal, atau kegiatan',
                            placeholder: 'Cari peminjam, fasilitas, tanggal, atau kegiatan'
                        },
                        {
                            name: 'status',
                            id: 'reservation-status',
                            label: 'Filter status reservasi',
                            type: 'select',
                            options: [{ value: '', label: 'Semua status' }, ...Object.entries(reservationStatusLabels).map(([value, label]) => ({ value, label }))],
                        },
                        {
                            name: 'sort',
                            id: 'reservation-sort',
                            label: 'Urutkan reservasi',
                            type: 'select',
                            options: reservationSortOptions
                        },
                    ]}
                    rows={reservations}
                    columns={[{ label: 'Peminjam' }, ...reservationColumns, { label: 'Aksi', type: 'act' }]}
                    renderRow={reservation => (
                        <>
                            <td className="whitespace-nowrap px-4 py-3">
                                <p className="font-semibold text-teal-darker">{reservation.user?.name ?? '—'}</p>
                                <p className="text-xs text-gray-500">{reservation.user?.email ?? '—'}</p>
                            </td>
                            {reservationCells(reservation)}
                            <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex gap-3">
                                    {reservation.status === 'menunggu' ? (
                                        <>
                                            <button type="button" onClick={() => updateReservation(reservation, 'approve')} className="font-medium text-teal-normal-01 underline">Setujui</button>
                                            <button type="button" onClick={() => updateReservation(reservation, 'reject')} className="font-medium text-red-600 underline">Tolak</button>
                                        </>
                                    ) : reservation.status === 'disetujui' ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReservation(reservation)}
                                            className="rounded-md border border-blue-400 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                        >
                                            Lihat tiket
                                        </button>
                                    ) : reservation.status === 'ditolak' ? (
                                        <span className="text-xs text-gray-400 italic">
                                            {reservation.rejection_reason || 'Tidak ada alasan penolakan.'}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Aksi tidak tersedia</span>
                                    )}
                                </div>
                            </td>
                        </>
                    )}
                    emptyMessage="Belum ada reservasi yang cocok dengan filter."
                    recordLabel="reservasi"
                    paginationLabel="Navigasi halaman reservasi"
                />
                {selectedReservation && <ReservationTicket reservation={selectedReservation} onClose={() => setSelectedReservation(null)} />}
            </AppLayout>
        </>
    );
}
