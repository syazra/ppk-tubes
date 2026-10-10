import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import FilterTable from '../../components/FilterTable';
import ReservationTicket, { ReservationTicketContent } from '../../components/ReservationTicket';
import { renderToStaticMarkup } from 'react-dom/server';
import { waitForPageReady } from '../../lib/pageReady';
import { printTicket } from '../../lib/ticketPrint';
import { reservationStatusLabels, reservationSortOptions } from '../../lib/reservationPresentation';
import { reservationColumns, reservationCells } from '../../components/ReservationTableFields';

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
                    {reservation.rejection_reason || 'Tidak ada alasan penolakan.'}
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
	const [downloading, setDownloading] = useState(false);
	const [downloadError, setDownloadError] = useState('');

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reservations, { preserveState: true, preserveScroll: true, replace: true });
	}

    const handlePrintTicket = async () => {
        if (!selectedReservation || downloading) return;
        setDownloading(true);
        setDownloadError('');
        try {
            await printTicket(renderToStaticMarkup(<ReservationTicketContent reservation={selectedReservation} print />));
        } catch (error) {
            setDownloadError(error.message || 'Tiket gagal dicetak. Silakan coba lagi.');
        } finally {
            setDownloading(false);
        }
    };

	const handleDownloadTicket = async () => {
        if (!selectedReservation || downloading) return;
        setDownloading(true);
        setDownloadError('');
        const ticket = document.createElement('div');
        try {
            const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
            Object.assign(ticket.style, {
                position: 'fixed', left: '-10000px', top: '0', width: '794px',
                background: '#ffffff', color: '#111827', fontFamily: 'Arial, sans-serif',
            });
            ticket.innerHTML = renderToStaticMarkup(<ReservationTicketContent reservation={selectedReservation} print />);
            document.body.appendChild(ticket);
            await waitForPageReady(ticket);
            const canvas = await html2canvas(ticket, {
                scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: 794,
                width: ticket.scrollWidth, height: ticket.scrollHeight, scrollX: 0, scrollY: 0,
            });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const width = pdf.internal.pageSize.getWidth();
            const height = pdf.internal.pageSize.getHeight();
            const scale = Math.min((width - 20) / canvas.width, (height - 20) / canvas.height);
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', (width - canvas.width * scale) / 2, (height - canvas.height * scale) / 2, canvas.width * scale, canvas.height * scale);
            pdf.save(`Tiket-RSV-${selectedReservation.id}.pdf`);
        } catch (error) {
            console.error('Gagal membuat tiket:', error);
            setDownloadError('Tiket gagal dibuat. Silakan coba lagi.');
        } finally {
            ticket.remove();
            setDownloading(false);
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
				description="Cari fasilitas, tanggal, atau kegiatan, lalu saring dan urutkan reservasi."
				filterForm={filterForm}
				onSubmit={applyFilters}
				filterFields={[
					{
						name: 'search',
						id: 'reservation-search',
						label: 'Cari fasilitas, tanggal, atau kegiatan',
						placeholder: 'Cari fasilitas, tanggal, atau kegiatan'
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
						options: reservationSortOptions
					},
				]}
				rows={reservations}
				columns={[...reservationColumns, { label: 'Aksi', type: 'act' }]}
				renderRow={reservation => (
					<>
						{reservationCells(reservation)}
                            <td className="whitespace-nowrap px-4 py-3">
							<ReservationActions reservation={reservation} onShowTicket={setSelectedReservation} />
						</td>
					</>
				)}
				emptyMessage="Belum ada reservasi yang cocok dengan filter."
				errorMessage={error}
				recordLabel="reservasi"
				paginationLabel="Navigasi halaman reservasi"
			/>

            {selectedReservation && <ReservationTicket
                reservation={selectedReservation}
                onClose={() => { setSelectedReservation(null); setDownloadError(''); }}
                onDownload={handleDownloadTicket}
                onPrint={handlePrintTicket}
                downloading={downloading}
                error={downloadError}
            />}
		</AppLayout>
	);
}
