import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';

const statusLabels = {
	baru: 'Menunggu',
	diproses: 'Diproses',
	selesai: 'Selesai',
	ditolak: 'Ditolak',
	dibatalkan: 'Dibatalkan',
};

function ReportActions({ report }) {
	const cancelForm = useForm({});

	if (report.status !== 'baru') {
		return <span className="text-xs italic text-gray-400">Tidak tersedia</span>;
	}

	return (
		<button
			type="button"
			disabled={cancelForm.processing}
			onClick={() => {
				if (window.confirm('Apakah kamu yakin ingin membatalkan laporan ini?')) {
					cancelForm.patch(`/reports/${report.id}/cancel`, { preserveScroll: true });
				}
			}}
			className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-60"
		>
			{cancelForm.processing ? 'Memproses...' : 'Batalkan'}
		</button>
	);
}

function formatDate(value) {
	if (!value) return '-';

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '-';

	return new Intl.DateTimeFormat('id-ID', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

export default function MyReports({ reports, user, auth, csrfToken, urls, error, filters }) {
	const records = Array.isArray(reports) ? reports : reports.data;
	const filterForm = useForm({
		search: filters?.search ?? '',
		status: filters?.status ?? '',
	});
	const [appliedFilters, setAppliedFilters] = useState(filterForm.data);

	const filteredReports = records.filter(report => {
		const search = appliedFilters.search.trim().toLocaleLowerCase('id-ID');
		const matchesSearch = !search
			|| report.desc.toLocaleLowerCase('id-ID').includes(search)
			|| report.room?.name.toLocaleLowerCase('id-ID').includes(search)
			|| report.room?.location?.toLocaleLowerCase('id-ID').includes(search);

		return matchesSearch && (!appliedFilters.status || report.status === appliedFilters.status);
	});

	const submitFilters = event => {
		event.preventDefault();
		setAppliedFilters({ ...filterForm.data });
	};

	return (
		<AppLayout
			user={user}
			auth={auth}
			csrfToken={csrfToken}
			urls={urls}
			active="reports"
			title="Riwayat Laporan Saya"
			subtitle="Pantau status laporan kerusakan fasilitas yang telah kamu kirimkan."
			actions={(
				<Link
					href="/report/create"
					className="inline-flex items-center rounded-md bg-teal-normal-01 px-4 py-2 text-sm font-semibold text-white-01 hover:bg-teal-normal-02"
				>
					+ Buat laporan baru
				</Link>
			)}
		>
			<Head title="Riwayat Laporan Saya" />
			<FilterTable
				title="Daftar laporan"
				description="Cari berdasarkan fasilitas atau deskripsi, lalu saring berdasarkan status laporan."
				filterForm={filterForm}
				onSubmit={submitFilters}
				filterFields={[
					{
						name: 'search',
						id: 'report-search',
						label: 'Cari laporan',
						placeholder: 'Cari fasilitas atau deskripsi laporan',
					},
					{
						name: 'status',
						id: 'report-status',
						label: 'Filter status',
						type: 'select',
						options: [
							{ value: '', label: 'Semua status' },
							{ value: 'baru', label: 'Menunggu diproses' },
							{ value: 'diproses', label: 'Sedang diproses' },
							{ value: 'selesai', label: 'Selesai' },
							{ value: 'ditolak', label: 'Ditolak' },
							{ value: 'dibatalkan', label: 'Dibatalkan' },
						],
					},
				]}
				rows={{
					data: filteredReports,
					from: filteredReports.length ? 1 : 0,
					to: filteredReports.length,
					total: filteredReports.length,
					links: [],
				}}
				columns={[
					{ label: 'Fasilitas' },
					{ label: 'Deskripsi', type: 'desc' },
					{ label: 'Bukti' },
					{ label: 'Status' },
					{ label: 'Tanggal' },
					{ label: 'Aksi' },
				]}
				renderRow={report => (
					<>
						<td className="min-w-40 px-4 py-4 font-medium text-teal-darker">
							<p>{report.room?.name ?? 'Ruangan dihapus'}</p>
							<p className="mt-1 text-xs font-normal text-gray-500">{report.room?.location ?? '-'}</p>
						</td>
						<td className="break-words whitespace-normal px-4 py-4 text-gray-600">
							{report.desc}
						</td>
						<td className="whitespace-nowrap px-4 py-4">
							{report.image ? (
								<a
									href={report.image.startsWith('http') ? report.image : `/storage/${report.image.replace(/^\//, '')}`}
									target="_blank"
									rel="noreferrer"
									className="text-sm font-semibold text-teal-dark-01 hover:underline"
								>
									Lihat foto
								</a>
							) : (
								<span className="text-xs text-gray-400">Tidak ada</span>
							)}
						</td>
						<td className="whitespace-nowrap px-4 py-4">
							<StatusBadge color={getStatusColor(report.status)}>
								{statusLabels[report.status]}
							</StatusBadge>
						</td>
						<td className="whitespace-nowrap px-4 py-4 text-xs text-gray-500">{formatDate(report.created_at)}</td>
						<td className="whitespace-nowrap px-4 py-4 text-center">
							<ReportActions report={report} />
						</td>
					</>
				)}
				emptyMessage="Belum ada laporan yang sesuai dengan filter."
				errorMessage={error}
				recordLabel="laporan"
				paginationLabel="Navigasi halaman laporan"
			/>
		</AppLayout>
	);
}