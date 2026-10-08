import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import FacilityCard from '../../components/FacilityCard';
import useRoomSlots from '../../hooks/useRoomSlots';
import AppLayout from '../../components/AppLayout';

const fieldClassName = 'mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-teal-dark-01 focus:ring-teal-dark-01';
const slotStep = 30;

function FieldError({ children }) {
	return children ? <p role="alert" className="mt-2 text-sm text-red-700">{children}</p> : null;
}

function formatTime(value) {
	return value?.slice(0, 5) ?? '-';
}

function timeToMinutes(value) {
	const [hour, minute] = value.split(':').map(Number);
	return hour * 60 + minute;
}

function formatDate(value) {
	if (!value) return '-';
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
}

function getCatalogParams(filters) {
	return {
		type: filters.type ?? '',
		location: filters.location ?? '',
		capacity: filters.capacity ?? '',
		date: filters.date ?? '',
	};
}

function paginationText(label) {
	const text = label.replace('&laquo; ', '').replace(' &raquo;', '').trim();
	return { Previous: 'Sebelumnya', Next: 'Berikutnya' }[text] ?? text;
}

export default function ReservationForm({
	user,
	auth,
	csrfToken,
	urls,
	rooms = [],
	facilities,
	filters = {},
	types = [],
	catalogDate,
	timezone,
	minimumDate,
	maxDurationMinutes = 180,
	selectedFacility: initialFacility = null,
	oldInput = {},
	photoPlaceholderUrl,
	photoFallbackUrl,
}) {
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
	const mainSlotState = useRoomSlots(selectedFacility?.slots_url, form.data.date_to_reserv, Boolean(selectedFacility && form.data.date_to_reserv));
	const slots = mainSlotState.slots;

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reservationForm, { preserveState: true, preserveScroll: true, replace: true });
	}

	function resetFilters() {
		const reset = { type: '', location: '', capacity: '', date: catalogDate };
		router.get(urls.reservationForm, reset, { preserveScroll: true, replace: true });
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

	function clearSelectedRange(message = '') {
		setSlotAnchor(null);
		form.setData(data => ({ ...data, start_time: '', end_time: '' }));
		setSlotMessage(message);
	}

	function selectSlot(index) {
		setSlotMessage('');
		const slot = slots[index];
		if (!slot || slot.status !== 'available') return;

		if (form.data.start_time && form.data.end_time
			&& slot.start_time >= form.data.start_time && slot.start_time < form.data.end_time) {
			clearSelectedRange();
			return;
		}

		if (slotAnchor === null) {
			setSlotAnchor(index);
			form.setData(data => ({ ...data, start_time: slot.start_time, end_time: slot.end_time }));
			return;
		}

		const first = Math.min(slotAnchor, index);
		const last = Math.max(slotAnchor, index);
		const selectedSlots = slots.slice(first, last + 1);
		const duration = selectedSlots.length * slotStep;
		if (duration > maxDurationMinutes) {
			setSlotAnchor(null);
			clearSelectedRange(`Durasi reservasi maksimal ${maxDurationMinutes / 60} jam.`);
			return;
		}
		if (selectedSlots.length !== last - first + 1 || selectedSlots.some(item => item.status !== 'available')) {
			clearSelectedRange('Rentang waktu melewati slot yang tidak tersedia. Pilih rentang lain.');
			return;
		}

		setSlotAnchor(null);
		form.setData(data => ({
			...data,
			start_time: selectedSlots[0].start_time,
			end_time: selectedSlots.at(-1).end_time,
		}));
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
		form.post(urls.store, { preserveScroll: true });
	}

	return (
		<AppLayout user={user} auth={auth} csrfToken={csrfToken} urls={urls} active="reservations" title="Form Reservasi" subtitle="Pilih fasilitas, periksa jadwal, lalu ajukan peminjaman.">
			<Head title="Form Reservasi" />

			<section className="mb-8 space-y-6">
				<section aria-labelledby="facility-browser-title" className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
					<div className="mb-5 flex flex-wrap items-start justify-between gap-3">
						<div>
							<h2 id="facility-browser-title" className="text-xl font-bold text-teal-darker">Cari fasilitas</h2>
							<p className="mt-1 text-sm text-gray-600">Temukan fasilitas dan periksa ketersediaan slot sebelum memilih.</p>
						</div>
						<p className="text-xs text-gray-500">Slot 30 menit · 07.00-20.00 · {timezone}</p>
					</div>

					<form onSubmit={applyFilters} className="grid gap-3 rounded-md bg-gray-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
						<div>
							<label htmlFor="facility-type" className="block text-xs font-semibold text-gray-700">Tipe fasilitas</label>
							<select id="facility-type" value={filterForm.data.type} onChange={event => filterForm.setData('type', event.target.value)} className={fieldClassName}>
								<option value="">Semua tipe</option>
								{types.map(type => <option key={type} value={type}>{type}</option>)}
							</select>
							<FieldError>{filterForm.errors.type}</FieldError>
						</div>
						<div>
							<label htmlFor="facility-location" className="block text-xs font-semibold text-gray-700">Lokasi</label>
							<input id="facility-location" type="search" maxLength={100} value={filterForm.data.location} onChange={event => filterForm.setData('location', event.target.value)} placeholder="Cari lokasi" className={fieldClassName} />
							<FieldError>{filterForm.errors.location}</FieldError>
						</div>
						<div>
							<label htmlFor="facility-capacity" className="block text-xs font-semibold text-gray-700">Kapasitas minimum</label>
							<input id="facility-capacity" type="number" min="1" max="100000" step="1" value={filterForm.data.capacity} onChange={event => filterForm.setData('capacity', event.target.value)} placeholder="Jumlah orang" className={fieldClassName} />
							<FieldError>{filterForm.errors.capacity}</FieldError>
						</div>
						<div>
							<label htmlFor="facility-date" className="block text-xs font-semibold text-gray-700">Tanggal ketersediaan</label>
							<input id="facility-date" type="date" required min={minimumDate} value={filterForm.data.date} onChange={event => filterForm.setData('date', event.target.value)} className={fieldClassName} />
							<FieldError>{filterForm.errors.date}</FieldError>
						</div>
						<div className="flex flex-wrap items-center gap-4 sm:col-span-2 xl:col-span-4">
							<button type="submit" disabled={filterForm.processing} className="inline-flex min-h-10 items-center rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">Cari fasilitas</button>
							<button type="button" onClick={resetFilters} className="text-sm font-semibold text-teal-700 underline">Reset filter</button>
						</div>
					</form>

					{facilities.data.length ? (
						<>
							<div className="my-4 flex flex-wrap justify-between gap-2 text-xs text-gray-500" aria-live="polite">
								<span>{facilities.total} fasilitas ditemukan</span>
								<span>Slot untuk {formatDate(catalogDate)}</span>
							</div>
							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
								{facilities.data.map(facility => (
									<FacilityCard
									key={facility.id}
									facility={facility}
									selected={String(selectedFacility?.id) === String(facility.id)}
									date={catalogDate}
									timezone={timezone}
									photoPlaceholderUrl={photoPlaceholderUrl}
									photoFallbackUrl={photoFallbackUrl}
									onSelect={selectFacility}
								/>
								))}
							</div>
							{facilities.links.length > 3 && (
								<nav aria-label="Halaman daftar fasilitas" className="mt-5 flex flex-wrap items-center justify-center gap-2">
									{facilities.links.map((link, index) => link.url ? (
										<Link key={`${link.label}-${index}`} href={link.url} preserveState preserveScroll className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded border px-3 text-sm ${link.active ? 'border-teal-700 bg-teal-700 text-white' : 'border-gray-200 bg-white text-teal-800 hover:bg-teal-50'}`}>
											{paginationText(link.label)}
										</Link>
									) : <span key={`${link.label}-${index}`} aria-disabled="true" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded border border-gray-100 px-3 text-sm text-gray-400">{paginationText(link.label)}</span>)}
								</nav>
							)}
						</>
					) : (
						<div className="mt-5 rounded-md border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
							<h3 className="font-semibold text-teal-darker">Tidak ada fasilitas yang cocok</h3>
							<p className="mt-1 text-sm text-gray-600">Coba ubah tipe, lokasi, atau kapasitas minimum.</p>
							<button type="button" onClick={resetFilters} className="mt-3 text-sm font-semibold text-teal-700 underline">Reset filter</button>
						</div>
					)}
				</section>

				<form onSubmit={submitReservation} className="space-y-6 rounded-md border border-gray-200 bg-white p-5 sm:p-6">
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
							<input id="date_to_reserv" name="date_to_reserv" type="date" min={minimumDate} value={form.data.date_to_reserv} onChange={event => form.setData('date_to_reserv', event.target.value)} className={fieldClassName} required />
							<FieldError>{form.errors.date_to_reserv}</FieldError>
						</div>
						<div>
							<label htmlFor="desc" className="block text-sm font-semibold text-teal-darker">Tujuan penggunaan</label>
							<textarea id="desc" name="desc" rows={4} value={form.data.desc} onChange={event => form.setData('desc', event.target.value)} className={fieldClassName} placeholder="Masukkan tujuan penggunaan ruangan" required />
							<FieldError>{form.errors.desc}</FieldError>
						</div>
					</section>

					<section aria-labelledby="time-availability-title">
						<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
							<h2 id="time-availability-title" className="text-sm font-semibold text-teal-darker">Ketersediaan waktu</h2>
							<div className="flex flex-wrap gap-4 text-xs text-gray-500">
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded border bg-white" />Tersedia</span>
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-teal-600" />Dipilih</span>
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-400" />Tidak tersedia</span>
							</div>
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
								<div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
									<div className="grid grid-rows-[repeat(27,2.5rem)] text-xs text-gray-500">
										{slots.map(slot => <div key={slot.start_time} className="flex items-start pt-1">{slot.start_time.endsWith(':00') ? slot.start_time : ''}</div>)}
										<div className="flex items-start pt-1">20:00</div>
									</div>
									<div className="grid grid-rows-[repeat(26,2.5rem)] overflow-hidden rounded border border-gray-200">
										{slots.map((slot, index) => {
											const unavailable = slot.status !== 'available';
											const startSelected = form.data.start_time && slot.start_time >= form.data.start_time;
											const endSelected = form.data.end_time && slot.start_time < form.data.end_time;
											const selected = Boolean(startSelected && endSelected);
											return (
												<button key={slot.start_time} type="button" disabled={unavailable} onClick={() => selectSlot(index)} aria-pressed={selected}
													aria-label={`${slot.start_time} sampai ${slot.end_time}${unavailable ? ', tidak tersedia' : ', tersedia'}`}
													className={`h-10 border-b border-gray-200 text-xs transition ${unavailable ? 'cursor-not-allowed bg-gray-400' : selected ? 'bg-teal-600 text-white' : 'cursor-pointer bg-white hover:bg-teal-100'}`}>
													<span className="sr-only">{slot.start_time} - {slot.end_time}</span>
												</button>
											);
										})}
									</div>
								</div>
							)}
							{form.data.start_time && form.data.end_time && <p role="status" className="mt-3 text-sm font-medium text-teal-700">Waktu terpilih: {form.data.start_time} - {form.data.end_time}</p>}
							{slotMessage && <p role="alert" className="mt-2 text-sm text-red-700">{slotMessage}</p>}
							<FieldError>{form.errors.time}</FieldError>
							<FieldError>{form.errors.start_time}</FieldError>
							<FieldError>{form.errors.end_time}</FieldError>
						</div>
					</section>

					<div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
						<Link href={urls.reservations} className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</Link>
						<button type="submit" disabled={form.processing} className="inline-flex min-h-11 items-center rounded-md bg-teal-normal-01 px-5 py-2.5 text-sm font-semibold text-white-01 hover:bg-teal-normal-02 disabled:cursor-not-allowed disabled:opacity-60">
							{form.processing ? 'Mengirim...' : 'Kirim reservasi'}
						</button>
					</div>
				</form>
			</section>
		</AppLayout>
	);
}