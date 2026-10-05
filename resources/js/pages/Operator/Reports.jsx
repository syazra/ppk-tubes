import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';

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

function statusLabel(value) {
    return statusOptions.find(option => option.value === value)?.label ?? value;
}

function formatReportDate(value) {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
        : '—';
}

function getCurrentDateTimeLocal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
}

export default function Reports({ user, status, csrfToken, urls, reports, filters, summary }) {
    const filterForm = useForm({ search: filters.search, status: filters.status });

    const [selectedReportForProcess, setSelectedReportForProcess] = useState(null);
    const processForm = useForm({ estimated_completion_at: '' });

    const [selectedReportForExtend, setSelectedReportForExtend] = useState(null);
    const extendForm = useForm({ estimated_completion_at: '' });

    function applyFilters(event) {
        event.preventDefault();
        filterForm.get(urls.reports, { preserveState: true, preserveScroll: true, replace: true });
    }

    function handleOpenProcessModal(report) {
        setSelectedReportForProcess(report);
        processForm.reset();
    }

    function submitProcess(event) {
        event.preventDefault();
        processForm.patch(`/operator/reports/${selectedReportForProcess.id}/process`, {
            preserveScroll: true,
            onSuccess: () => setSelectedReportForProcess(null),
        });
    }

    function handleOpenExtendModal(report) {
        setSelectedReportForExtend(report);
        const initialDate = report.estimated_completion_at 
            ? new Date(report.estimated_completion_at).toISOString().slice(0, 16) 
            : '';
        extendForm.setData('estimated_completion_at', initialDate);
    }

    function submitExtend(event) {
        event.preventDefault();
        extendForm.patch(`/operator/reports/${selectedReportForExtend.id}/extend`, {
            preserveScroll: true,
            onSuccess: () => setSelectedReportForExtend(null),
        });
    }

    function updateReport(report, decision) {
        router.patch(`/operator/reports/${report.id}/${decision}`, {}, { preserveScroll: true });
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
                        { label: 'Fasilitas' },
                        { label: 'Deskripsi', type: 'desc' },
                        { label: 'Bukti' },
                        { label: 'Status' },
                        { label: 'Tanggal' },
                        { label: 'Estimasi Selesai' },
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
                            <td className="whitespace-normal text-xs px-4 py-3 text-gray-600">{report.desc}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                {report.image_url
                                    ? <a href={report.image_url} target="_blank" rel="noreferrer" className="font-medium text-teal-normal-01 underline">Lihat foto</a>
                                    : <span className="text-gray-400">Tidak ada foto</span>}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <StatusBadge color={getStatusColor(report.status)}>{statusLabel(report.status)}</StatusBadge>
                            </td>
                            <td className="whitespace-nowrap text-xs px-4 py-3 text-gray-600">{formatReportDate(report.created_at)}</td>
                                <div className="flex gap-3">
                                    {report.status === 'baru' ? (
                                        <>
                                            <button type="button" onClick={() => handleOpenProcessModal(report)} className="font-medium text-teal-normal-01 underline">Proses</button>
                                            <button type="button" onClick={() => updateReport(report, 'reject')} className="font-medium text-red-600 underline">Tolak</button>
                                        </>
                                    ) : report.status === 'diproses' ? (
                                        <>
                                            <span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(report.status)}`}>{statusLabel(report.status)}</span>
                                            <button type="button" onClick={() => updateReport(report, 'complete')} className="font-medium text-green-600 underline">Selesai</button>
                                        </>
                                    ) : (
                                        <span className={`rounded px-2 py-1 text-xs font-semibold ${statusClass(report.status)}`}>{statusLabel(report.status)}</span>
                                    )}
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatReportDate(report.created_at)}</td>

                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span>{report.estimated_completion_at ? formatReportDate(report.estimated_completion_at) : '—'}</span>
                                    {/* Tombol edit/perpanjang hanya muncul jika status laporan sedang 'diproses' */}
                                    {report.status === 'diproses' && (
                                        <button 
                                            type="button" 
                                            onClick={() => handleOpenExtendModal(report)} 
                                            className="text-xs font-medium text-teal-600 hover:text-teal-800 underline"
                                        >
                                            Ubah
                                        </button>
                                    )}
                                </div>
                            </td>
                        </>
                    )}
                    emptyMessage="Belum ada laporan yang cocok dengan filter."
                    recordLabel="laporan"
                    paginationLabel="Navigasi halaman laporan"
                />
                {selectedReportForProcess && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-lg font-bold text-teal-darker mb-2">Tentukan Estimasi Selesai</h3>
                            <p className="text-sm text-gray-500 mb-4">Masukkan tanggal dan waktu perkiraan laporan ini selesai ditindaklanjuti.</p>
                            
                            <form onSubmit={submitProcess}>
                                <div className="mb-4">
                                    <label htmlFor="estimated_completion_at" className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Estimasi</label>
                                    <input 
                                        type="datetime-local" 
                                        id="estimated_completion_at"
                                        min={getCurrentDateTimeLocal()}
                                        value={processForm.data.estimated_completion_at}
                                        onChange={e => processForm.setData('estimated_completion_at', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                    {processForm.errors.estimated_completion_at && (
                                        <p className="mt-1 text-xs text-red-600">{processForm.errors.estimated_completion_at}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedReportForProcess(null)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processForm.processing}
                                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        Simpan & Proses
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {selectedReportForExtend && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
                            <h3 className="text-lg font-bold text-teal-darker mb-2">Ubah / Perpanjang Estimasi Selesai</h3>
                            <p className="text-sm text-gray-500 mb-4">Pilih tanggal dan waktu terbaru untuk penyelesaian perbaikan laporan ini.</p>
                            
                            <form onSubmit={submitExtend}>
                                <div className="mb-4">
                                    <label htmlFor="extend_estimated_at" className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Estimasi Baru</label>
                                    <input 
                                        type="datetime-local" 
                                        id="extend_estimated_at"
                                        min={getCurrentDateTimeLocal()}
                                        value={extendForm.data.estimated_completion_at}
                                        onChange={e => extendForm.setData('estimated_completion_at', e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none bg-white text-gray-800"
                                        required
                                    />
                                    {extendForm.errors.estimated_completion_at && (
                                        <p className="mt-1 text-xs text-red-600">{extendForm.errors.estimated_completion_at}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedReportForExtend(null)}
                                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={extendForm.processing}
                                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                                    >
                                        Perbarui Estimasi
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </AppLayout>
        </>
    );
}
