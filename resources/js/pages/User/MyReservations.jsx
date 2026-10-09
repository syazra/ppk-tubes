import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import FilterTable from '../../components/FilterTable';
import PopCard from '../../components/PopCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

	if (reservation.status === 'ditolak') {
        return (
            <div className="text-xs">
                <p className="text-gray-500 italic mt-0.5">
                    {reservation.rejection_reason ?? 'Tidak ada alasan'}
                </p>
            </div>
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

	const handleDownloadTicket = async () => {
		if (!selectedReservation) return;

		// Buka tab kosong SEBELUM proses async
		// supaya tidak diblokir browser sebagai popup
		const previewWindow = window.open('', '_blank');

		try {
			const ticket = document.createElement('div');

			ticket.style.position = 'fixed';
			ticket.style.left = '-10000px';
			ticket.style.top = '0';
			ticket.style.width = '794px';
			ticket.style.padding = '40px';
			ticket.style.background = '#ffffff';
			ticket.style.fontFamily = 'Arial, sans-serif';
			ticket.style.color = '#111827';
			ticket.style.boxSizing = 'border-box';

			ticket.innerHTML = `
				<div style="
					border: 1px solid #e5e7eb;
					border-radius: 20px;
					overflow: hidden;
					background: white;
				">

					<div style="
						padding: 32px 36px 24px;
						text-align: center;
					">
						<div style="
							width: 64px;
							height: 64px;
							margin: 0 auto 12px;
							border-radius: 50%;
							background: #dcfce7;
							display: flex;
							align-items: center;
							justify-content: center;
						">
							<svg
								width="32"
								height="32"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#16a34a"
								stroke-width="2.5"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<path d="M5 13l4 4L19 7"/>
							</svg>
						</div>

						<h2 style="
							margin: 0;
							font-size: 28px;
							font-weight: 600;
							color: #15803d;
						">
							Reservasi Valid
						</h2>

						<p style="
							margin: 6px 0 0;
							font-size: 22px;
							color: #6b7280;
						">
							Verifikasi Tiket Reservasi
						</p>
					</div>

					<div style="
						border-top: 1px dashed #d1d5db;
					"></div>

					<div style="
						display: flex;
						padding: 28px 36px;
						gap: 35px;
					">

						<div style="flex: 1;">

							<div style="margin-bottom: 18px;">
								<p style="
									margin: 0 0 5px;
									font-size: 16 px;
									color: #6b7280;
								">
									ID Reservasi
								</p>

								<p style="
									margin: 0;
									font-size: 18px;
									font-weight: 700;
									color: #134e4a;
								">
									RSV-${selectedReservation.id}
								</p>
							</div>

							<div style="
								display: grid;
								grid-template-columns: 1fr 1fr;
								gap: 18px 25px;
							">

								<div>
									<p style="
										margin:0 0 5px;
										font-size:16px;
										color:#6b7280;
									">
										Peminjam
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${user?.name ?? '-'}
									</p>
								</div>

								<div>
									<p style="
										margin:0 0 15px;
										font-size:16px;
										color:#6b7280;

									">
										Status
									</p>

									<span style="
										display:inline-flex;

										justify-content:center;
										width: 110px;
										height: 40px;
										box-sizing: border-box;
										border-radius:999px;
										background:#dcfce7;
										color:#15803d;
										font-size:17px;
										font-weight:600;
										line-height:1;
									">
										Disetujui
									</span>
								</div>

								<div>
									<p style="
										margin:0 0 5px;
										font-size:16px;
										color:#6b7280;
									">
										Fasilitas
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${selectedReservation.room?.name ?? '-'}
									</p>
								</div>

								<div>
									<p style="
										margin:0 0 5px;
										font-size:16px;
										color:#6b7280;
									">
										Tipe Fasilitas
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${selectedReservation.room?.type ?? '-'}
									</p>
								</div>

								<div>
									<p style="
										margin:0 0 5px;
										font-size:12px;
										color:#6b7280;
									">
										Tanggal Reservasi
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${selectedReservation.date_to_reserv}
									</p>
								</div>

								<div>
									<p style="
										margin:0 0 5px;
										font-size:12px;
										color:#6b7280;
									">
										Waktu
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${selectedReservation.start_time} -
										${selectedReservation.end_time}
									</p>
								</div>

								<div style="grid-column:1 / -1;">
									<p style="
										margin:0 0 5px;
										font-size:16px;
										color:#6b7280;
									">
										Tujuan Penggunaan
									</p>

									<p style="
										margin:0;
										font-size:18px;
										font-weight:600;
									">
										${selectedReservation.desc ?? '-'}
									</p>
								</div>

							</div>
						</div>

						<div style="
							width: 190px;
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
							border-left: 1px dashed #d1d5db;
							padding-left: 30px;
						">

							<img
								src="${selectedReservation.qr_url}"
								style="
									width:160px;
									height:160px;
									object-fit:contain;
								"
							/>

							<p style="
								margin:12px 0 0;
								font-size:14px;
								color:#6b7280;
								text-align:center;
							">
								Scan QR untuk verifikasi
							</p>

						</div>
					</div>

					<div style="
						border-top:1px solid #e5e7eb;
						padding:18px 36px;
						text-align:center;
					">
						<p style="
							margin:0;
							font-size:14px;
							color:#9ca3af;
						">
							Tunjukkan tiket ini sebagai bukti validasi reservasi.
						</p>
					</div>

				</div>
			`;

			document.body.appendChild(ticket);

			const canvas = await html2canvas(ticket, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
			});

			document.body.removeChild(ticket);

			const imgData = canvas.toDataURL('image/png');

			// ================================
			// UKURAN PDF MENGIKUTI TIKET
			// ================================

			const pdfWidth = 280;

			const pdfHeight =
				(canvas.height / canvas.width) * pdfWidth;

			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
				format: [pdfWidth, pdfHeight],
			});

			
			pdf.addImage(
				imgData,
				'PNG',
				0,
				0,
				pdfWidth,
				pdfHeight
			);

			// ================================
			// PREVIEW PDF
			// ================================

			const pdfBlob = pdf.output('blob');
			const pdfUrl = URL.createObjectURL(pdfBlob);

			if (previewWindow) {
				previewWindow.location.href = pdfUrl;
			} else {
				// Kalau popup diblokir browser
				window.open(pdfUrl, '_blank');
			}

		} catch (error) {
			console.error('Gagal membuat preview tiket:', error);

			if (previewWindow) {
				previewWindow.close();
			}
		}
	};
	return (
		<AppLayout
			user={user}
			csrfToken={csrfToken}
			urls={urls}
			active="reservations"
			title="Reservasi Saya"
			subtitle="Lihat daftar fasilitas yang pernah kamu pinjam."
			actions={(
				<Button as={Link} href="/reservations/form">
					+ Tambah reservasi
				</Button>
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
				<PopCard
					title="Tiket reservasi"
					description={null}
					onCancel={null}
					onDone={null}
					onClose={() => setSelectedReservation(null)}
				>
						<div className="flex items-start justify-between gap-4 px-3">
							
							{/* ringkasan tiket dll */}
							<div className="space-y-3 text-sm">
								<div>
									<p className="text-gray-500">Status</p>
									<StatusBadge color="teal">Disetujui</StatusBadge>
								</div>

								<div>
									<p className="text-gray-500">ID reservasi</p>
									<p className="font-semibold">
										RSV-{selectedReservation.id}
									</p>
								</div>

								<div>
									<p className="text-gray-500">Fasilitas</p>
									<p className="font-semibold">
										{selectedReservation.room?.name ?? '-'}
									</p>
								</div>

								<div>
									<p className="text-gray-500">Tanggal</p>
									<p className="font-semibold">
										{formatReservationDate(selectedReservation.date_to_reserv)}
									</p>
								</div>

								<div>
									<p className="text-gray-500">Waktu</p>
									<p className="font-semibold">
										{formatTime(selectedReservation.start_time)} -{' '}
										{formatTime(selectedReservation.end_time)}
									</p>
								</div>

								<div>
									<p className="text-gray-500">Tujuan</p>
									<p className="font-semibold">
										{selectedReservation.desc}
									</p>
								</div>
							</div>

							{/* QR + Download */}
							<div className="flex shrink-0 flex-col items-center gap-3">
								<img
									src={selectedReservation.qr_url}
									alt={`QR Code reservasi RSV-${selectedReservation.id}`}
									className="h-36 w-36"
								/>

								<button
									type="button"
									onClick={handleDownloadTicket}
									className="rounded-md bg-teal-normal-01 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-normal-01"
								>
									Download Tiket
								</button>
							</div>
						</div>
				</PopCard>
			)}
		</AppLayout>
	);
}