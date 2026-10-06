import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import FilterTable from '../../components/FilterTable';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';

const reservationStatusLabels = {
	menunggu: 'Menunggu',
	disetujui: 'Disetujui',
	ditolak: 'Ditolak',
	dibatalkan: 'Dibatalkan',
};

const sortOptions = [
	{ value: 'created_near', label: 'Pengajuan terbaru' },
	{ value: 'created_far', label: 'Pengajuan terlama' },
	{ value: 'reservation_near', label: 'Waktu reservasi terdekat' },
	{ value: 'reservation_far', label: 'Waktu reservasi terjauh' },
];

function formatReservationDate(value) {
	if (!value) return '-';

	return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value) {
	return value ? value.slice(0, 5) : '-';
}

function ReservationActions({ reservation, onShowTicket }) {
	if (reservation.status === 'disetujui') {
		return (
			<button type="button" onClick={() => onShowTicket(reservation)} className="rounded-md border border-blue-400 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50">
				Lihat tiket
			</button>
		);
	}

	if (reservation.can_cancel) {
		return (
			<button
				type="button"
				onClick={() => {
					if (window.confirm('Yakin ingin membatalkan reservasi ini?')) {
						router.patch(reservation.cancel_url, {}, { preserveScroll: true });
					}
				}}
				className="rounded-md border border-red-300 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
			>
				Batalkan
			</button>
		);
	}

	return <span className="text-xs text-gray-400">{reservation.status === 'menunggu' ? 'Tidak dapat dibatalkan' : 'Tidak tersedia'}</span>;
}

export default function MyReservations({ user, csrfToken, urls, reservations, filters, status, error }) {
	const filterForm = useForm({ ...filters });
	const [selectedReservation, setSelectedReservation] = useState(null);

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reservations, { preserveState: true, preserveScroll: true, replace: true });
	}

	return (
		<AppLayout
			user={user}
			csrfToken={csrfToken}
			urls={urls}
			active="reservations"
			title="Reservasi Saya"
			subtitle="Lihat daftar fasilitas yang pernah kamu pinjam."
			actions={(
				<Link href="/reservations/form" className="inline-flex items-center rounded-md bg-teal-normal-01 px-4 py-2 text-sm font-semibold text-white-01 hover:bg-teal-normal-02">
					+ Tambah reservasi
				</Link>
			)}
		>
			<Head title="Reservasi Saya" />
			{status && <p role="status" className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{status}</p>}
			{error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

			<FilterTable
				title="Daftar reservasi"
				description="Cari fasilitas atau tanggal, lalu saring dan urutkan reservasi."
				filterForm={filterForm}
				onSubmit={applyFilters}
				filterFields={[
					{ name: 'search', id: 'reservation-search', label: 'Cari fasilitas atau tanggal', placeholder: 'Cari fasilitas atau tanggal' },
					{
						name: 'status',
						id: 'reservation-status',
						label: 'Filter status',
						type: 'select',
						options: [
							{ value: '', label: 'Semua status' },
							...Object.entries(reservationStatusLabels).map(([value, label]) => ({ value, label })),
						],
					},
					{ name: 'sort', id: 'reservation-sort', label: 'Urutkan reservasi', type: 'select', options: sortOptions },
				]}
				rows={reservations}
				columns={[
					{ label: 'Nama fasilitas' },
					{ label: 'Tanggal & waktu' },
					{ label: 'Tujuan penggunaan', type: 'desc' },
					{ label: 'Status' },
					{ label: 'Aksi' },
				]}
				renderRow={reservation => (
					<>
						<td className="px-4 py-3 font-medium text-teal-darker">
							<p>{reservation.room?.name ?? '-'}</p>
							<p className="text-xs font-normal text-gray-500">{reservation.room?.type ?? ''}</p>
						</td>
						<td className="whitespace-nowrap px-4 py-3 text-teal-dark-01">
							<p>{formatReservationDate(reservation.date_to_reserv)}</p>
							<p className="text-xs text-gray-500">{formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}</p>
						</td>
						<td className="px-4 py-3 text-gray-600">{reservation.desc}</td>
						<td className="whitespace-nowrap px-4 py-3">
							<StatusBadge color={getStatusColor(reservation.status)}>{reservationStatusLabels[reservation.status] ?? reservation.status}</StatusBadge>
						</td>
						<td className="whitespace-nowrap px-4 py-3">
							<ReservationActions reservation={reservation} onShowTicket={setSelectedReservation} />
						</td>
					</>
				)}
				emptyMessage="Belum ada reservasi."
				errorMessage={error}
				recordLabel="reservasi"
				paginationLabel="Navigasi halaman reservasi"
			/>

			{selectedReservation && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setSelectedReservation(null); }}>
					<section role="dialog" aria-modal="true" aria-labelledby="reservation-ticket-title" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
						<div className="mb-5 flex items-center justify-between">
							<h2 id="reservation-ticket-title" className="text-lg font-semibold text-teal-darker">Tiket reservasi</h2>
							<button type="button" onClick={() => setSelectedReservation(null)} aria-label="Tutup tiket" className="rounded p-2 text-gray-500 hover:bg-gray-100">Tutup</button>
						</div>
						<div className="flex items-start justify-between gap-4">
							<div className="space-y-3 text-sm">
								<div><p className="text-gray-500">Status</p><StatusBadge color="teal">Disetujui</StatusBadge></div>
								<div><p className="text-gray-500">ID reservasi</p><p className="font-semibold">RSV-{selectedReservation.id}</p></div>
								<div><p className="text-gray-500">Fasilitas</p><p className="font-semibold">{selectedReservation.room?.name ?? '-'}</p></div>
								<div><p className="text-gray-500">Tanggal</p><p>{formatReservationDate(selectedReservation.date_to_reserv)}</p></div>
								<div><p className="text-gray-500">Waktu</p><p>{formatTime(selectedReservation.start_time)} - {formatTime(selectedReservation.end_time)}</p></div>
								<div><p className="text-gray-500">Tujuan</p><p>{selectedReservation.desc}</p></div>
							</div>
							<img src={selectedReservation.qr_url} alt={`QR Code reservasi RSV-${selectedReservation.id}`} className="h-32 w-32 shrink-0" />
						</div>
					</section>
				</div>
			)}
		</AppLayout>
	);
}