import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';

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

function statusClass(value) {
    return {
        disetujui: 'bg-green-100 text-green-700',
        ditolak: 'bg-red-100 text-red-700',
        dibatalkan: 'bg-gray-100 text-gray-600',
        menunggu: 'bg-yellow-100 text-yellow-700',
    }[value] ?? 'bg-gray-100 text-gray-600';
}

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

    function applyFilters(event) {
        event.preventDefault();
        filterForm.get(urls.reservations, { preserveState: true, preserveScroll: true, replace: true });
    }

    function updateReservation(reservation, decision) {
        router.patch(`${urls[decision]}/${reservation.id}/${decision}`, {}, { preserveScroll: true });
    }

    return (
        <>
            {/* JUDUL */}
            <Head title="Kelola Reservasi" />
            <AppLayout user={user} csrfToken={csrfToken} urls={urls} active="reservations" title="Kelola Reservasi" subtitle="Lihat dan kelola reservasi kampus.">
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
                    description=""
                    filterForm={filterForm}
                    onSubmit={applyFilters}
                    filterFields={[
                        { name: 'search', id: 'reservation-search', label: 'Cari nama peminjam, fasilitas, atau tujuan', placeholder: 'Cari peminjam, fasilitas, atau tujuan' },
                        {
                            name: 'status',
                            id: 'reservation-status',
                            label: 'Filter status reservasi',
                            type: 'select',
                            options: [{ value: '', label: 'Semua status' }, ...statusOptions],
                        },
                    ]}
                    rows={reservations}
                    columns={[
                        { label: 'Peminjam' },
                        { label: 'Fasilitas' },
                        { label: 'Tanggal & Waktu' },
                        { label: 'Tujuan Penggunaan' },
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
                            <td className="max-w-xs px-4 py-3 text-gray-600">{reservation.desc}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <span className={`rounded-full px-3 py-1 text-xs ${statusClass(reservation.status)}`}>{statusLabel(reservation.status)}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex gap-3">
                                    {reservation.status === 'menunggu' ? (
                                        <>
                                            <button type="button" onClick={() => updateReservation(reservation, 'approve')} className="font-medium text-teal-normal-01 underline">Setujui</button>
                                            <button type="button" onClick={() => updateReservation(reservation, 'reject')} className="font-medium text-red-600 underline">Tolak</button>
                                        </>
                                    ) : <span className="text-xs text-gray-400">Aksi tidak tersedia</span>}
                                </div>
                            </td>
                        </>
                    )}
                    emptyMessage="Belum ada reservasi yang cocok dengan filter."
                    recordLabel="reservasi"
                    paginationLabel="Navigasi halaman reservasi"
                />

            </AppLayout>
        </>
    );
}