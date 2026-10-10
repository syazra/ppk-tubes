import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import MetricCard from '../../components/MetricCard';
import PopCard from '../../components/PopCard';
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

const sortOptions = [
	{ value: 'created_near', label: 'Pengajuan terbaru' },
	{ value: 'created_far', label: 'Pengajuan terlama' },
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

function openPicker(event) {
    if (typeof event.currentTarget.showPicker === 'function') {
        event.currentTarget.showPicker();
    }
}

export default function Reports({ user, status, csrfToken, urls, reports, filters, summary, errors = {} }) {
    const filterForm = useForm({ search: filters.search, status: filters.status });

    const [selectedReportForProcess, setSelectedReportForProcess] = useState(null);
    const processForm = useForm({ estimated_completion_at: '' });

    const [selectedReportForExtend, setSelectedReportForExtend] = useState(null);
    const extendForm = useForm({ estimated_completion_at: '' });

    const [selectedReportForReject, setSelectedReportForReject] = useState(null);
    const rejectForm = useForm({ rejection_reason: '' });

    const [selectedReportForComplete, setSelectedReportForComplete] = useState(null);
    const completeForm = useForm({ resolution: '' });

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
            ? toDateTimeLocal(report.estimated_completion_at)
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

    function handleOpenRejectModal(report) {
        setSelectedReportForReject(report);
        rejectForm.reset();
    }

    function submitReject(event) {
        event.preventDefault();
        rejectForm.patch(`/operator/reports/${selectedReportForReject.id}/reject`, {
            preserveScroll: true,
            onSuccess: () => setSelectedReportForReject(null),
        });
    }

    function handleOpenCompleteModal(report) {
        setSelectedReportForComplete(report);
        completeForm.reset();
    }

    function submitComplete(event) {
        event.preventDefault();
        completeForm.patch(`/operator/reports/${selectedReportForComplete.id}/complete`, {
            preserveScroll: true,
            onSuccess: () => setSelectedReportForComplete(null),
        });
    }

    return (
        <>
            {/* JUDUL */}
            <Head title="Laporan Kerusakan" />
            <AppLayout user={user} csrfToken={csrfToken} urls={urls} active="reports" title="Laporan Kerusakan" subtitle="Lihat laporan kerusakan fasilitas kampus.">
                {status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}
                {errors.report && <p role="alert" className="mb-4 text-sm text-red-700">{errors.report}</p>}

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
                        { 
                            name: 'search', 
                            id: 'report-search', 
                            label: 'Cari pelapor, fasilitas, atau deskripsi', 
                            placeholder: 'Cari pelapor, fasilitas, atau deskripsi' 
                        },
                        {
                            name: 'status',
                            id: 'report-status',
                            label: 'Filter status laporan',
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
                    rows={reports}
                    columns={[
                        { label: 'Pelapor' },
                        { label: 'Fasilitas' },
                        { label: 'Deskripsi', type: 'desc' },
                        { label: 'Bukti' },
                        { label: 'Tanggal' },
                        { label: 'Estimasi Selesai' },
                        { label: 'Status' },
                        { label: 'Aksi', type: 'act' },
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
                            <td className="whitespace-nowrap px-4 py-4">
                                {report.images?.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {report.images.map((image, index) => (
                                            <a
                                                key={image.id ?? index}
                                                href={image.url ?? `/reports/images/${image.id}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-semibold text-teal-dark-01 hover:underline"
                                            >
                                                Lihat foto {index + 1}
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Tidak ada
                                    </span>
                                )}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">{formatReportDate(report.created_at)}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                <div className="flex flex-row items-start gap-2 align-center">
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
                            <td className="whitespace-nowrap px-4 py-3">
                                <StatusBadge color={getStatusColor(report.status)}>{statusLabel(report.status)}</StatusBadge>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex flex-col gap-1">
                                    {report.status === 'baru' ? (
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => handleOpenProcessModal(report)} className="font-medium text-teal-normal-01 underline">Proses</button>
                                            <button type="button" onClick={() => handleOpenRejectModal(report)} className="font-medium text-red-600 underline">Tolak</button>
                                        </div>
                                    ) : report.status === 'diproses' ? (
                                        <div className="flex gap-3">
                                            <button type="button" onClick={() => handleOpenCompleteModal(report)} className="font-medium text-green-600 underline">Selesai</button>
                                        </div>
                                    ) : report.status === 'ditolak' ? (
                                        <span className="text-xs text-gray-400 italic">
                                            {report.rejection_reason || 'Fasilitas sedang dalam perbaikan'}
                                        </span>
                                    ) : report.status === 'selesai' ? (
                                        <span className="text-xs text-gray-400 italic">
                                            {report.resolution || 'Fasilitas sudah diperbaiki'}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </div>                                
                            </td>
                        </>
                    )}
                    emptyMessage="Belum ada laporan yang cocok dengan filter."
                    recordLabel="laporan"
                    paginationLabel="Navigasi halaman laporan"
                />

                {/* PROSES LAPORAN */}
                {selectedReportForProcess && (
                    <PopCard
                        title="Tentukan Estimasi Selesai"
                        description="Masukkan tanggal dan waktu perkiraan laporan ini selesai ditindaklanjuti."
                        onCancel={() => setSelectedReportForProcess(null)}
                        onDone={submitProcess}
                        doneLabel="Simpan & Proses"
                        doneDisabled={processForm.processing}
                        onClose={() => setSelectedReportForProcess(null)}
                    >
                                <div className="mb-4">
                                    <label htmlFor="estimated_completion_at" className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Estimasi</label>
                                    <input 
                                        type="datetime-local" 
                                        id="estimated_completion_at"
                                        min={getCurrentDateTimeLocal()}
                                        value={processForm.data.estimated_completion_at}
                                        onChange={e => processForm.setData('estimated_completion_at', e.target.value)}
                                        onClick={openPicker}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
                                        required
                                    />
                                    {processForm.errors.estimated_completion_at && (
                                        <p className="mt-1 text-xs text-red-600">{processForm.errors.estimated_completion_at}</p>
                                    )}
                                </div>

                    </PopCard>
                )}

                {/* PERPANJANG ESTIMASI LAPORAN */}
                {selectedReportForExtend && (
                    <PopCard
                        title="Ubah / Perpanjang Estimasi Selesai"
                        description="Pilih tanggal dan waktu terbaru untuk penyelesaian perbaikan laporan ini."
                        onCancel={() => setSelectedReportForExtend(null)}
                        onDone={submitExtend}
                        doneLabel="Perbarui Estimasi"
                        doneDisabled={extendForm.processing}
                        onClose={() => setSelectedReportForExtend(null)}
                    >
                                <div className="mb-4">
                                    <label htmlFor="extend_estimated_at" className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Waktu Estimasi Baru</label>
                                    <input 
                                        type="datetime-local" 
                                        id="extend_estimated_at"
                                        min={getCurrentDateTimeLocal()}
                                        value={extendForm.data.estimated_completion_at}
                                        onChange={e => extendForm.setData('estimated_completion_at', e.target.value)}
                                        onClick={openPicker}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none bg-white text-gray-800"
                                        required
                                    />
                                    {extendForm.errors.estimated_completion_at && (
                                        <p className="mt-1 text-xs text-red-600">{extendForm.errors.estimated_completion_at}</p>
                                    )}
                                </div>
                    </PopCard>
                )}

                {/* MODAL TOLAK LAPORAN (Dengan Template & Ketik Manual) */}
                {selectedReportForReject && (
                    <PopCard
                        title="Tolak Laporan"
                        description="Gunakan template cepat di bawah atau ketik alasan penolakan secara manual."
                        onCancel={() => setSelectedReportForReject(null)}
                        onDone={submitReject}
                        doneLabel="Konfirmasi Tolak"
                        doneDisabled={rejectForm.processing}
                        doneVariant="danger"
                        onClose={() => setSelectedReportForReject(null)}
                    >
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Alasan Cepat</label>
                                    <button 
                                        type="button"
                                        onClick={() => rejectForm.setData('rejection_reason', 'Laporan tidak valid / Deskripsi kerusakan kurang jelas')}
                                        className="mb-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition"
                                    >
                                        + Gunakan: "Laporan tidak valid / Deskripsi kerusakan kurang jelas"
                                    </button>

                                    <label htmlFor="rejection_reason" className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan (Opsional / Edit Manual)</label>
                                    <textarea 
                                        id="rejection_reason"
                                        rows="3"
                                        value={rejectForm.data.rejection_reason}
                                        onChange={e => rejectForm.setData('rejection_reason', e.target.value)}
                                        placeholder="Kosongkan jika ingin memakai template default..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
                                    ></textarea>
                                    {rejectForm.errors.rejection_reason && (
                                        <p className="mt-1 text-xs text-red-600">{rejectForm.errors.rejection_reason}</p>
                                    )}
                                </div>
                    </PopCard>
                )}

                {/* MODAL SELESAI / RESOLUSI */}
                {selectedReportForComplete && (
                    <PopCard
                        title="Selesaikan Laporan"
                        description="Gunakan template cepat di bawah atau tulis resolusi secara manual."
                        onCancel={() => setSelectedReportForComplete(null)}
                        onDone={submitComplete}
                        doneLabel="Tandai Selesai"
                        doneDisabled={completeForm.processing}
                        onClose={() => setSelectedReportForComplete(null)}
                    >
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Resolusi Cepat</label>
                                    <button 
                                        type="button"
                                        onClick={() => completeForm.setData('resolution', 'Fasilitas sudah diperbaiki')}
                                        className="mb-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition"
                                    >
                                        + Gunakan: "Fasilitas sudah diperbaiki"
                                    </button>

                                    <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">Resolusi / Catatan Perbaikan (Opsional)</label>
                                    <textarea 
                                        id="resolution"
                                        rows="4"
                                        value={completeForm.data.resolution}
                                        onChange={e => completeForm.setData('resolution', e.target.value)}
                                        placeholder="Kosongkan jika ingin memakai template default..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                                    ></textarea>
                                    {completeForm.errors.resolution && (
                                        <p className="mt-1 text-xs text-red-600">{completeForm.errors.resolution}</p>
                                    )}
                                </div>
                    </PopCard>
                )}
            </AppLayout>
        </>
    );
}
