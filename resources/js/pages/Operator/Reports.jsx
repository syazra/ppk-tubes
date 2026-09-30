import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';

const metrics = [
    { summaryKey: 'total', label: 'Total Laporan', detail: 'Jumlah semua laporan kerusakan', icon: 'tool' },
    { summaryKey: 'new', label: 'Laporan Baru', detail: 'Laporan yang belum ditangani', icon: 'clock' },
    { summaryKey: 'processing', label: 'Sedang Diproses', detail: 'Laporan yang sedang ditindaklanjuti', icon: 'activity' },
    { summaryKey: 'completed', label: 'Laporan Selesai', detail: 'Laporan yang sudah diselesaikan', icon: 'check' },
];

const statusOptions = [
    { value: 'baru', label: 'Baru' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
    { value: 'ditolak', label: 'Ditolak' },
    { value: 'dibatalkan', label: 'Dibatalkan' },
];

function statusClass(value) {
    return {
        baru: 'bg-blue-100 text-blue-700',
        diproses: 'bg-yellow-100 text-yellow-700',
        selesai: 'bg-green-100 text-green-700',
        ditolak: 'bg-red-100 text-red-700',
        dibatalkan: 'bg-gray-100 text-gray-600',
    }[value] ?? 'bg-gray-100 text-gray-600';
}

function statusLabel(value) {
    return statusOptions.find(option => option.value === value)?.label ?? value;
}

function formatReportDate(value) {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
        : '—';
}

export default function Reports({ user, status, csrfToken, urls, reports, filters, summary }) {
    const filterForm = useForm({ search: filters.search, status: filters.status });

    function applyFilters(event) {
        event.preventDefault();
        filterForm.get(urls.reports, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <>
            {/* JUDUL */}
            <Head title="Laporan Kerusakan" />
            <AppLayout user={user} csrfToken={csrfToken} urls={urls} active="reports" title="Laporan Kerusakan" subtitle="Lihat laporan kerusakan fasilitas kampus.">
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                {/* RINGKASAN */}
                <section aria-labelledby="summary-title">
                    <div className="app-metric-grid">
                        {metrics.map(({ summaryKey, ...metric }, index) => <MetricCard key={metric.label} {...metric} value={summary[summaryKey]} index={index} />)}
                    </div>
                </section>

                <FilterTable
                    title="Semua Laporan"
                    description="Lihat dan telusuri laporan kerusakan fasilitas kampus."
                    filterForm={filterForm}
                    onSubmit={applyFilters}
                    filterFields={[
                        { name: 'search', id: 'report-search', label: 'Cari pelapor, fasilitas, atau deskripsi', placeholder: 'Cari pelapor, fasilitas, atau deskripsi' },
                        {
                            name: 'status',
                            id: 'report-status',
                            label: 'Filter status laporan',
                            type: 'select',
                            options: [{ value: '', label: 'Semua status' }, ...statusOptions],
                        },
                    ]}
                    rows={reports}
                    columns={[
                        { label: 'Pelapor' },
                        { label: 'Fasilitas / Ruangan' },
                        { label: 'Deskripsi' },
                        { label: 'Bukti Foto' },
                        { label: 'Status' },
                        { label: 'Tanggal' },
                    ]}
                    renderRow={report => (
                        <>
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-teal-darker">
                                <p className="font-semibold text-teal-darker">{report.user?.name ?? '—'}</p>
                                <p className="text-xs text-gray-500">{report.user?.email ?? '—'}</p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <p className="font-medium text-teal-darker">{report.room?.name ?? '—'}</p>
                                {report.room?.location && <p className="text-xs text-gray-500">{report.room.location}</p>}
                            </td>
                            <td className="max-w-sm whitespace-normal px-4 py-3 text-gray-600">{report.desc}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                {report.image_url
                                    ? <a href={report.image_url} target="_blank" rel="noreferrer" className="font-medium text-teal-dark-01 underline">Lihat foto</a>
                                    : <span className="text-gray-400">Tidak ada foto</span>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <span className={`rounded-full px-3 py-1 text-xs ${statusClass(report.status)}`}>{statusLabel(report.status)}</span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatReportDate(report.created_at)}</td>
                        </>
                    )}
                    emptyMessage="Belum ada laporan yang cocok dengan filter."
                    recordLabel="laporan"
                    paginationLabel="Navigasi halaman laporan"
                />
            </AppLayout>
        </>
    );
}
