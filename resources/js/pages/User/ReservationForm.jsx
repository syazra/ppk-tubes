import { useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import useRoomSlots from '../../hooks/useRoomSlots';
import AvailabilityTimeline from '../../components/AvailabilityTimeline';
import { selectReservationRange } from '../../lib/reservationRange';
import AppLayout from '../../components/AppLayout';
import GuestFacilityFilters from '../../components/GuestFacilityFilters';
import FacilitiesCatalog from '../../components/FacilitiesCatalog';

const fieldClassName = 'mt-2 block w-full rounded-lg border border-gray-300 bg-white-01 px-4 py-3 text-sm text-gray-800 focus:border-teal-dark-01 focus:ring-teal-dark-01';

function FieldError({ children }) {
	return children ? <p role="alert" className="mt-2 text-sm text-red-700">{children}</p> : null;
}

function getCatalogParams(filters) {
	return {
		type: filters.type ?? '',
		location: filters.location ?? '',
		capacity: filters.capacity ?? '',
		date: filters.date ?? '',
	};
}

export default function ReservationForm({
	user,
	auth,
	csrfToken,
	urls,
	locations = [],
	facilities,
	filters = {},
	types = [],
	catalogDate,
	timezone,
	minimumDate,
	selectedFacility: initialFacility = null,
	oldInput = {},
	photoPlaceholderUrl,
	photoFallbackUrl,
}) {
	// scroll langsung ke form
	// useEffect(() => {
	// 	const element = document.getElementById('reservation-form');
	// 	if (element) {
	// 		setTimeout(() => {
	// 		element.scrollIntoView({ behavior: 'smooth', block: 'start' });
	// 		}, 250);
	// 	}
	// }, []);

	const initialRoomId = oldInput.room_id ?? initialFacility?.id ?? '';
	const form = useForm({
		room_id: initialRoomId ? String(initialRoomId) : '',
		date_to_reserv: oldInput.date_to_reserv ?? '',
		desc: oldInput.desc ?? '',
		start_time: oldInput.start_time ?? '',
		end_time: oldInput.end_time ?? '',
	});
	const filterForm = useForm(getCatalogParams({ ...filters, date: catalogDate }));
	const [selectedFacility, setSelectedFacility] = useState(initialFacility);
	const [slotAnchor, setSlotAnchor] = useState(null);
	const [slotMessage, setSlotMessage] = useState('');
	const [catalogProcessing, setCatalogProcessing] = useState(false);
	const dateInputRef = useRef(null);
	const mainSlotState = useRoomSlots(selectedFacility?.slots_url, form.data.date_to_reserv, Boolean(selectedFacility && form.data.date_to_reserv));
	const slots = mainSlotState.slots;

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reservationForm, { preserveState: true, preserveScroll: true, replace: true });
	}

	function resetFilters() {
		const reset = { type: '', location: '', capacity: '', date: catalogDate };
		filterForm.setData(reset);
		router.get(urls.reservationForm, reset, { preserveScroll: true, replace: true });
	}

	function updateFilter(event) {
		filterForm.setData(event.target.name, event.target.value);
	}

	function selectFacility(facility) {
		setSelectedFacility(facility);
		setSlotAnchor(null);
		setSlotMessage('');
		form.setData(data => ({
			...data,
			room_id: String(facility.id),
			date_to_reserv: catalogDate >= minimumDate ? catalogDate : data.date_to_reserv,
			start_time: '',
			end_time: '',
		}));
	}

	function changeReservationDate(event) {
		const date = event.target.value;
		setSlotAnchor(null);
		setSlotMessage('');
		form.setData(data => ({ ...data, date_to_reserv: date, start_time: '', end_time: '' }));
	}

	function selectSlot(index) {
		const range = selectReservationRange(slots, index, slotAnchor, form.data.start_time, form.data.end_time);
		if (!range) return;
		setSlotAnchor(range.anchor);
		setSlotMessage(range.message);
		form.setData(data => ({ ...data, start_time: range.startTime, end_time: range.endTime }));
	}

	function submitReservation(event) {
		event.preventDefault();
		if (!selectedFacility || !form.data.room_id) {
			setSlotMessage('Pilih fasilitas dari katalog terlebih dahulu.');
			return;
		}
		if (!form.data.start_time || !form.data.end_time || slotAnchor !== null) {
			setSlotMessage('Pilih slot awal dan slot akhir terlebih dahulu.');
			return;
		}
		if (mainSlotState.loading || mainSlotState.error || !slots.length) {
			setSlotMessage('Tunggu sampai jadwal selesai dimuat sebelum mengirim reservasi.');
			return;
		}
		form.post(urls.store, { preserveScroll: true });
	}

	return (
		<AppLayout user={user} auth={auth} csrfToken={csrfToken} urls={urls} active="reservations" title="Form Reservasi" subtitle="Pilih fasilitas, periksa jadwal, lalu ajukan peminjaman.">
			<Head title="Form Reservasi" />

			{/* FILTER KATALOG */}
			<GuestFacilityFilters
				values={filterForm.data}
				types={types}
				locations={locations}
				details={`07.00-20.00 ${timezone === 'Asia/Jakarta' ? 'WIB' : timezone} · Slot 30 menit`}
				className="gff-contained"
				errors={filterForm.errors}
				processing={filterForm.processing}
				onChange={updateFilter}
				onSubmit={applyFilters}
				onReset={resetFilters}
			/>
			
			{/* HASIL FILTER KATALOG */}
			<section className="py-6">
				<FacilitiesCatalog
					rooms={facilities}
					selectedDate={catalogDate}
					processing={filterForm.processing || catalogProcessing}
					timezone={timezone}
					selectedFacilityId={selectedFacility?.id}
					photoPlaceholderUrl={photoPlaceholderUrl}
					photoFallbackUrl={photoFallbackUrl}
					onReset={resetFilters}
					onProcessingChange={setCatalogProcessing}
					showSchedule = {false}
			>
				{(facility, isSelected) => (
					<button
						type="button"
						className={`fc-select ${isSelected ? 'fc-select-selected' : ''}`}
						disabled={isSelected}
						aria-pressed={isSelected}
						onClick={() => selectFacility(facility)}
					>
						{isSelected ? 'Fasilitas dipilih' : 'Pilih fasilitas'}
					</button>
				)}
			</FacilitiesCatalog>
			</section>

			{/* FORM RESERVASI */}
			<form id="reservation-form" onSubmit={submitReservation} className="space-y-6 rounded-md border border-gray-200 bg-white-01 p-5 sm:p-6">
				<div className="reservation-schedule-layout">
					{/* ISI DETAIL */}
					<section aria-labelledby="reservation-details-title" className="space-y-5">
						<div>
							<h2 id="reservation-details-title" className="text-lg font-bold text-teal-darker">Detail reservasi</h2>
							<p className="mt-1 text-sm text-gray-600">Fasilitas dipilih dari katalog di atas.</p>
						</div>
						<input type="hidden" id="room_id" name="room_id" value={form.data.room_id} readOnly />
						<div aria-live="polite" aria-atomic="true" className="rounded-md bg-teal-50 p-3 text-sm text-teal-900">
							{selectedFacility ? `Fasilitas dipilih: ${selectedFacility.name} · ${selectedFacility.location}` : 'Belum ada fasilitas dipilih. Pilih fasilitas dari katalog di atas.'}
						</div>
						<FieldError>{form.errors.room_id}</FieldError>
						<div>
							<label htmlFor="date_to_reserv" className="block text-sm font-semibold text-teal-darker">Hari / tanggal</label>
							<input ref={dateInputRef}
							id="date_to_reserv" name="date_to_reserv" type="date" min={minimumDate} value={form.data.date_to_reserv} onChange={changeReservationDate}
							onClick={event => {
								if (typeof event.currentTarget.showPicker === 'function') {
									event.currentTarget.showPicker();
								}
							}}
							className={fieldClassName} required />
							<FieldError>{form.errors.date_to_reserv}</FieldError>
						</div>
						<div>
							<label htmlFor="desc" className="block text-sm font-semibold text-teal-darker">Tujuan penggunaan</label>
							<textarea id="desc" name="desc" rows={4} value={form.data.desc} onChange={event => form.setData('desc', event.target.value)} className={fieldClassName} placeholder="Masukkan tujuan penggunaan ruangan" required />
							<FieldError>{form.errors.desc}</FieldError>
						</div>
					</section>

					{/* ISI JADWAL */}
					<section aria-labelledby="time-availability-title" className="reservation-schedule-panel">
						<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
							<h2 id="time-availability-title" className="text-sm font-semibold text-teal-darker">Ketersediaan waktu</h2>
							<span className="text-xs text-gray-500">{timezone === 'Asia/Jakarta' ? 'WIB' : timezone}</span>
						</div>
						<div className="rounded-xl border bg-gray-50 p-4 sm:p-5">
							{!selectedFacility || !form.data.date_to_reserv ? (
								<p className="text-sm italic text-gray-400">Pilih fasilitas dan tanggal untuk melihat jadwal.</p>
							) : mainSlotState.loading ? (
								<p role="status" className="text-sm text-gray-500">Memuat jadwal...</p>
							) : mainSlotState.error ? (
								<div role="alert" className="flex flex-wrap items-center gap-3 text-sm text-red-700">
									<span>{mainSlotState.error}</span>
									<button type="button" onClick={mainSlotState.retry} className="font-semibold underline">Coba lagi</button>
								</div>
							) : (
								<AvailabilityTimeline slots={slots} label={`Ketersediaan waktu ${selectedFacility.name}`} onSelect={selectSlot} startTime={form.data.start_time} endTime={form.data.end_time} />
							)}
							{form.data.start_time && form.data.end_time && <p role="status" className="mt-3 text-sm font-medium text-teal-700">Waktu terpilih: {form.data.start_time} - {form.data.end_time}</p>}
							{slotMessage && <p role="alert" className="mt-2 text-sm text-red-700">{slotMessage}</p>}
							<FieldError>{form.errors.time}</FieldError>
							<FieldError>{form.errors.start_time}</FieldError>
							<FieldError>{form.errors.end_time}</FieldError>
						</div>
					</section>
				</div>

				{/* TOMBOL */}
				<div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
					<Link href={urls.reservations} className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</Link>
					<button type="submit" disabled={form.processing} className="inline-flex min-h-11 items-center rounded-md bg-teal-normal-01 px-5 py-2.5 text-sm font-semibold text-white-01 hover:bg-teal-normal-02 disabled:cursor-not-allowed disabled:opacity-60">
						{form.processing ? 'Mengirim...' : 'Kirim reservasi'}
					</button>
				</div>
			</form>

		</AppLayout>
	);
}
