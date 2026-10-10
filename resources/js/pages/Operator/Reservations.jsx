import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';
import PopCard from '../../components/PopCard';

const metrics = [
    { summaryKey: 'total', label: 'Total Reservasi', icon: 'calendar' },
    { summaryKey: 'approved', label: 'Reservasi Disetujui', icon: 'check' },
    { summaryKey: 'pending', label: 'Reservasi Menunggu', icon: 'clock' },
    { summaryKey: 'rejected', label: 'Reservasi Ditolak', icon: 'close' },
];

const statusOptions = [
    { value: 'menunggu', label: 'Menunggu' },
    { value: 'disetujui', label: 'Disetujui' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

const sortOptions = [
    { value: 'created_near', label: 'Pengajuan terbaru' },
    { value: 'created_far', label: 'Pengajuan terlama' },
];

function formatReservationDate(value) {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`))
        : '—';
}

function formatTime(value) {
    return value ? value.slice(0, 5) : '—';
}

function statusLabel(value) {
    return statusOptions.find(option => option.value === value)?.label ?? value;
}

export default function Reservations({ user, status, csrfToken, urls, reservations, filters, summary }) {
    const filterForm = useForm({ search: filters.search, status: filters.status });
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
                            label: 'Cari nama peminjam, fasilitas, atau tujuan', 
                            placeholder: 'Cari peminjam, fasilitas, atau tujuan' 
                        },
                        {
                            name: 'status',
                            id: 'reservation-status',
                            label: 'Filter status reservasi',
                            type: 'select',
                            options: [{ value: '', label: 'Semua status' }, ...statusOptions],
                        },
                        { 
                            name: 'sort', 
                            id: 'reservation-sort', 
                            label: 'Urutkan reservasi', 
                            type: 'select', 
                            options: sortOptions 
                        },
                    ]}
                    rows={reservations}
                    columns={[
                        { label: 'Peminjam' },
                        { label: 'Fasilitas' },
                        { label: 'Tanggal & Waktu' },
                        { label: 'Deskripsi', type: 'desc' },
                        { label: 'Status' },
                        { label: 'Aksi' },
                    ]}
                    renderRow={reservation => (
                        <>
                            <td className="whitespace-nowrap px-4 py-3">
                                <p className="font-semibold text-teal-darker">{reservation.user?.name ?? '—'}</p>
                                <p className="text-xs text-gray-500">{reservation.user?.email ?? '—'}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-teal-darker">
                                <p>{reservation.room?.name ?? '—'}</p>
                                {reservation.room?.location && <p className="text-xs font-normal text-gray-500">{reservation.room.location}</p>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-teal-dark-01">
                                <p>{formatReservationDate(reservation.date_to_reserv)}</p>
                                <p className="text-xs text-gray-500">{formatTime(reservation.start_time)}–{formatTime(reservation.end_time)}</p>
                            </td>
                            <td className="whitespace-normal text-xs max-w-xs px-4 py-3 text-gray-600">{reservation.desc}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <StatusBadge color={getStatusColor(reservation.status)}>{statusLabel(reservation.status)}</StatusBadge>
                            </td>
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
                                            {reservation.rejection_reason ?? 'Ditolak oleh oprator'}
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
                {/* PREVIEW TIKET MODAL (Hanya Tampilan) */}
                {selectedReservation && (
                    <PopCard
                        title="Tiket reservasi"
                        description={null}
                        onCancel={null}
                        onDone={null}
                        onClose={() => setSelectedReservation(null)}
                    >
                        <div className="flex items-start justify-between gap-4 px-3">
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="text-gray-500">Status</p>
                                    <StatusBadge color="teal">Disetujui</StatusBadge>
                                </div>
                                <div>
                                    <p className="text-gray-500">ID reservasi</p>
                                    <p className="font-semibold">RSV-{selectedReservation.id}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Peminjam</p>
                                    <p className="font-semibold">{selectedReservation.user?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Fasilitas</p>
                                    <p className="font-semibold">{selectedReservation.room?.name ?? '-'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Tanggal</p>
                                    <p className="font-semibold">{formatReservationDate(selectedReservation.date_to_reserv)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Waktu</p>
                                    <p className="font-semibold">{formatTime(selectedReservation.start_time)} - {formatTime(selectedReservation.end_time)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Tujuan</p>
                                    <p className="font-semibold">{selectedReservation.desc}</p>
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-center gap-3">
                                <img
                                    src={selectedReservation.qr_url}
                                    alt={`QR Code reservasi RSV-${selectedReservation.id}`}
                                    className="h-36 w-36 object-contain"
                                />
                                <span className="text-xs text-gray-400 text-center">Scan QR untuk verifikasi</span>
                            </div>
                        </div>
                    </PopCard>
                )}
            </AppLayout>
        </>
    );
}