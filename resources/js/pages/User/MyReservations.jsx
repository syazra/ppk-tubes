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

export default function MyReservations({ user, csrfToken, urls, reservations, filters, status, error, preview = false }) {
	const filterForm = useForm({ ...filters });
	const [selectedReservation, setSelectedReservation] = useState(null);

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reservations, { preserveState: true, preserveScroll: true, replace: true });
	}

	
	const handleDownloadTicket = async () => {
		if (!selectedReservation) return;

		// Buka tab kosong sebelum proses async agar tidak diblokir browser
		const previewWindow = window.open('', '_blank');

		let ticket;

		try {
			ticket = document.createElement('div');

			Object.assign(ticket.style, {
				position: 'fixed',
				left: '-10000px',
				top: '0',
				width: '794px',
				padding: '32px',
				background: '#ffffff',
				fontFamily: 'Arial, sans-serif',
				color: '#111827',
				boxSizing: 'border-box',
				height : 'auto',
				minHeight : '0',
				overflowWrap : 'anywhere'
			});

			const isInstitution =
				selectedReservation.reservation_type === 'Instansi';

			const field = (label, value, fullWidth = false) => `
				<div style="
					min-width: 0;
					${fullWidth ? 'grid-column: 1 / -1;' : ''}
				">
					<p style="
						margin: 0 0 6px;
						font-size: 13px;
						color: #6b7280;
						line-height: 1.4;
					">${label}</p>

					<p style="
						margin: 0;
						font-size: 16px;
						font-weight: 600;
						color: #111827;
						line-height: 1.5;
						overflow-wrap: anywhere;
						white-space: pre-wrap;
					">${value ?? '-'}</p>
				</div>
			`;

			ticket.innerHTML = `
				<div style="
					width: 100%;
					box-sizing: border-box;
					border: 1px solid #e5e7eb;
					border-radius: 16px;
					overflow: hidden;
					background: #ffffff;
				">

					<!-- HEADER -->
					<div style="
						padding: 26px 30px;
						text-align: center;
						background: #ffffff;
					">
						<div style="
							width: 52px;
							height: 52px;
							margin: 0 auto 10px;
							border-radius: 50%;
							background: #dcfce7;
							display: flex;
							align-items: center;
							justify-content: center;
						">
							<svg
								width="28"
								height="28"
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
							font-size: 25px;
							font-weight: 700;
							color: #15803d;
						">Reservasi Valid</h2>

						<p style="
							margin: 6px 0 0;
							font-size: 15px;
							color: #6b7280;
						">Verifikasi Tiket Reservasi</p>
					</div>

					<div style="border-top: 1px dashed #d1d5db;"></div>

					<!-- ID RESERVASI -->
					<div style="padding: 24px 30px 8px;">
						<p style="
							margin: 0 0 5px;
							font-size: 13px;
							color: #6b7280;
						">ID RESERVASI</p>

						<p style="
							margin: 0;
							font-size: 22px;
							font-weight: 700;
							color: #134e4a;
						">RSV-${selectedReservation.id}</p>
					</div>

					<!-- PEMINJAM, STATUS, DAN QR -->
					<div style="
						display: grid;
						grid-template-columns: minmax(0, 1fr) 170px;
						gap: 24px;
						align-items: center;
						padding: 16px 30px 26px;
					">
						<div style="
							display: grid;
							grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
							gap: 20px 24px;
							align-items: start;
						">
							${field('Peminjam', user?.name ?? '-')}

							<div>
								<p style="
									margin: 0 0 8px;
									font-size: 13px;
									color: #6b7280;
								">Status</p>

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
									">Disetujui</span>
							</div>

							${field(
								'Jenis Peminjaman',
								isInstitution ? 'Instansi' : 'Individu',
								true
							)}
						</div>

						<div style="
							border-left: 1px dashed #d1d5db;
							padding-left: 20px;
							display: flex;
							flex-direction: column;
							align-items: center;
							justify-content: center;
						">
							<img
								src="${selectedReservation.qr_url}"
								style="
									display: block;
									width: 135px;
									height: 135px;
									object-fit: contain;
								"
							/>

							<p style="
								margin: 10px 0 0;
								font-size: 12px;
								color: #6b7280;
								text-align: center;
								line-height: 1.5;
							">Scan QR untuk verifikasi</p>
						</div>
					</div>

					<div style="border-top: 1px dashed #d1d5db;"></div>

					<!-- DETAIL RESERVASI -->
					<div style="padding: 24px 30px 28px;">
						<h3 style="
							margin: 0 0 20px;
							font-size: 17px;
							font-weight: 700;
							color: #134e4a;
						">Detail Reservasi</h3>

						<div style="
							display: grid;
							grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
							gap: 20px 28px;
							align-items: start;
						">
							${field(
								'Fasilitas',
								selectedReservation.room?.name ?? '-'
							)}

							${field(
								'Tipe Fasilitas',
								selectedReservation.room?.type ?? '-'
							)}

							${field(
								'Tanggal Reservasi',
								selectedReservation.date_to_reserv
							)}

							${field(
								'Waktu',
								`${selectedReservation.start_time} - ${selectedReservation.end_time}`
							)}

							${
								isInstitution
									? `
										${field(
											'Instansi',
											selectedReservation.institution ?? '-'
										)}

										${field(
											'Nama Kegiatan',
											selectedReservation.activity_name ?? '-'
										)}

										${field(
											'Deskripsi Kegiatan',
											selectedReservation.desc ?? '-',
											true
										)}
									`
									: `
										${field(
											'Tujuan Penggunaan',
											selectedReservation.activity_name ?? '-',
											true
										)}
									`
							}
						</div>
					</div>

					<!-- FOOTER -->
					<div style="
						border-top: 1px solid #e5e7eb;
						padding: 16px 30px;
						text-align: center;
						background: #f9fafb;
					">
						<p style="
							margin: 0;
							font-size: 12px;
							color: #6b7280;
							line-height: 1.5;
						">
							Tunjukkan tiket ini sebagai bukti validasi reservasi.
						</p>
					</div>
				</div>
			`;

			document.body.appendChild(ticket);

			// Tunggu browser menyelesaikan layout dan pemuatan gambar
			await new Promise((resolve) => requestAnimationFrame(resolve));

			const canvas = await html2canvas(ticket, {
				scale: 2,
				useCORS: true,
				backgroundColor: '#ffffff',
				windowWidth: 794,
				width: ticket.scrollWidth,
				height: ticket.scrollHeight,
				scrollX: 0,
				scrollY: 0,
			});
			document.body.removeChild(ticket);
			ticket = null;

			const imgData = canvas.toDataURL('image/png');

			// Ukuran A4 landscape: 297 × 210 mm
			const pdf = new jsPDF({
				orientation: 'landscape',
				unit: 'mm',
				format: 'a4',
			});

			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();

			const margin = 10;
			const availableWidth = pageWidth - margin * 2;
			const availableHeight = pageHeight - margin * 2;

			// Skala agar seluruh tiket muat di satu halaman
			const scale = Math.min(
				availableWidth / canvas.width,
				availableHeight / canvas.height
			);

			const imgWidth = canvas.width * scale;
			const imgHeight = canvas.height * scale;

			// Posisikan tiket di tengah halaman
			const x = (pageWidth - imgWidth) / 2;
			const y = (pageHeight - imgHeight) / 2;

			pdf.addImage(
				imgData,
				'PNG',
				x,
				y,
				imgWidth,
				imgHeight
			);
			// Preview PDF di tab baru
			const pdfBlob = pdf.output('blob');
			const pdfUrl = URL.createObjectURL(pdfBlob);

			if (previewWindow) {
				previewWindow.location.href = pdfUrl;
			} else {
				window.open(pdfUrl, '_blank');
			}

		} catch (error) {
			console.error('Gagal membuat preview tiket:', error);

			if (ticket?.parentNode) {
				ticket.parentNode.removeChild(ticket);
			}

			if (previewWindow) {
				previewWindow.close();
			}
		}
	};


	return (
		<AppLayout
			preview={preview}
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
			{!preview && <Head title="Reservasi Saya" />}
			{status && <p role="status" className="mb-4 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">{status}</p>}
			{error && <p role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

			<FilterTable
				title="Daftar reservasi"
				description="Cari fasilitas atau tanggal, lalu saring dan urutkan reservasi."
				filterForm={filterForm}
				onSubmit={applyFilters}
				filterFields={[
					{ 
						name: 'search', 
						id: 'reservation-search', 
						label: 'Cari fasilitas atau tanggal', 
						placeholder: 'Cari fasilitas atau tanggal' 
					},
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
					{ label: 'Nama fasilitas' },
					{ label: 'Tanggal & waktu' },
					{ label : 'Jenis' },
					{ label: 'Tujuan penggunaan', type: 'desc' },
					{ label: 'Status' },
					{ label: 'Aksi', type: 'act' },
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
						<td className="px-4 py-3 text-gray-600">{reservation.reservation_type}</td>
						<td className="px-4 py-3 text-gray-600">{reservation.activity_name}</td>
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

			{/* PREVIEW TIKET */}
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

								{selectedReservation.reservation_type === 'Instansi' ? (
									<>
										<div>
											<p className="text-gray-500">Instansi</p>
											<p className="font-semibold">
												{selectedReservation.institution ?? '-'}
											</p>
										</div>

										<div>
											<p className="text-gray-500">Nama Kegiatan</p>
											<p className="font-semibold">
												{selectedReservation.activity_name ?? '-'}
											</p>
										</div>

										<div>
											<p className="text-gray-500">Deskripsi Kegiatan</p>
											<p className="font-semibold">
												{selectedReservation.desc ?? '-'}
											</p>
										</div>
									</>
								) : (
									<div>
										<p className="text-gray-500">Tujuan Penggunaan</p>
										<p className="font-semibold">
											{selectedReservation.activity_name ?? '-'}
										</p>
									</div>
								)}

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
