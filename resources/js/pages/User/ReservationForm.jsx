import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';

const fieldClassName = 'mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-teal-dark-01 focus:ring-teal-dark-01';
const openingMinute = 7 * 60;
const closingMinute = 20 * 60;
const slotStep = 30;

const timeSlots = Array.from(
	{ length: (closingMinute - openingMinute) / slotStep },
	(_, index) => openingMinute + index * slotStep,
);

function FieldError({ children }) {
	return children ? <p role="alert" className="mt-2 text-sm text-red-700">{children}</p> : null;
}

function formatTime(minutes) {
	const hour = Math.floor(minutes / 60);
	const minute = minutes % 60;
	return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function timeToMinutes(value) {
	const [hour, minute] = value.split(':').map(Number);
	return hour * 60 + minute;
}

function getMinimumDate() {
	const minimum = new Date(Date.now() + 3 * 60 * 60 * 1000);
	minimum.setMinutes(minimum.getMinutes() - minimum.getTimezoneOffset());
	return minimum.toISOString().slice(0, 10);
}

export default function ReservationForm({ rooms = [], user, auth, csrfToken, urls }) {
	const form = useForm({ room_id: '', date_to_reserv: '', desc: '', start_time: '', end_time: '' });
	const [bookedRanges, setBookedRanges] = useState([]);
	const [anchorMinutes, setAnchorMinutes] = useState(null);
	const [loadingSlots, setLoadingSlots] = useState(false);
	const [slotError, setSlotError] = useState('');

	useEffect(() => {
		const { room_id: roomId, date_to_reserv: date } = form.data;
		const controller = new AbortController();

		setBookedRanges([]);
		setAnchorMinutes(null);
		setSlotError('');
		form.setData('start_time', '');
		form.setData('end_time', '');

		if (!roomId || !date) {
			setLoadingSlots(false);
			return () => controller.abort();
		}

		setLoadingSlots(true);
		const params = new URLSearchParams({ room_id: roomId, date });

		fetch(`${urls.slots}?${params.toString()}`, {
			headers: { Accept: 'application/json' },
			signal: controller.signal,
		})
			.then(response => {
				if (!response.ok) throw new Error('Jadwal tidak dapat dimuat.');
				return response.json();
			})
			.then(reservations => {
				setBookedRanges(reservations.map(reservation => ({
					start: timeToMinutes(reservation.start_time),
					end: timeToMinutes(reservation.end_time),
				})));
			})
			.catch(error => {
				if (error.name !== 'AbortError') setSlotError('Gagal memuat jadwal, silakan coba lagi.');
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoadingSlots(false);
			});

		return () => controller.abort();
	}, [form.data.room_id, form.data.date_to_reserv, urls.slots]);

	const selectedDate = form.data.date_to_reserv;
	const minimumBookingTime = Date.now() + 12 * 60 * 60 * 1000;
	const isSlotBlocked = minutes => {
		const slotDateTime = new Date(`${selectedDate}T${formatTime(minutes)}:00`).getTime();
		const isTooSoon = slotDateTime < minimumBookingTime;
		const isBooked = bookedRanges.some(range => minutes < range.end && minutes + slotStep > range.start);
		return isTooSoon || isBooked;
	};
	const hasAvailableSlot = timeSlots.some(minutes => !isSlotBlocked(minutes));

	function updateSelectedRange(start, end) {
		form.setData('start_time', formatTime(start));
		form.setData('end_time', formatTime(end));
	}

	function selectSlot(minutes) {
		setSlotError('');

		if (anchorMinutes === null) {
			setAnchorMinutes(minutes);
			updateSelectedRange(minutes, minutes + slotStep);
			return;
		}

		const start = Math.min(anchorMinutes, minutes);
		const end = Math.max(anchorMinutes, minutes) + slotStep;
		const rangeIsBlocked = timeSlots
			.filter(slot => slot >= start && slot < end)
			.some(isSlotBlocked);

		if (rangeIsBlocked) {
			setAnchorMinutes(null);
			form.setData('start_time', '');
			form.setData('end_time', '');
			setSlotError('Rentang waktu melewati slot yang tidak tersedia. Pilih rentang lain.');
			return;
		}

		setAnchorMinutes(null);
		updateSelectedRange(start, end);
	}

	function submit(event) {
		event.preventDefault();
		if (!form.data.start_time || !form.data.end_time || anchorMinutes !== null) {
			setSlotError('Pilih slot awal dan slot akhir terlebih dahulu.');
			return;
		}

		form.post(urls.store, { preserveScroll: true });
	}

	return (
		<AppLayout
			user={user}
			auth={auth}
			csrfToken={csrfToken}
			urls={urls}
			active="reservations"
			title="Form Reservasi"
			subtitle="Ajukan peminjaman fasilitas sesuai kebutuhan kamu."
		>
			<Head title="Form Reservasi" />

			<section className="mb-8 max-w-3xl px-6 lg:px-8">
				<form onSubmit={submit} className="space-y-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm">
					<div>
						<label htmlFor="room_id" className="block text-sm font-semibold text-teal-darker">Ruangan</label>
						<select
							id="room_id"
							value={form.data.room_id}
							onChange={event => form.setData('room_id', event.target.value)}
							className={fieldClassName}
							aria-invalid={Boolean(form.errors.room_id)}
							aria-describedby={form.errors.room_id ? 'room-error' : undefined}
							required
						>
							<option value="">Pilih ruangan</option>
							{rooms.map(room => <option key={room.id} value={room.id}>{room.name} - Lokasi: {room.location} ({room.type})</option>)}
						</select>
						<div id="room-error"><FieldError>{form.errors.room_id}</FieldError></div>
					</div>

					<div>
						<label htmlFor="date_to_reserv" className="block text-sm font-semibold text-teal-darker">Hari / tanggal</label>
						<input
							id="date_to_reserv"
							type="date"
							min={getMinimumDate()}
							value={form.data.date_to_reserv}
							onChange={event => form.setData('date_to_reserv', event.target.value)}
							className={fieldClassName}
							aria-invalid={Boolean(form.errors.date_to_reserv)}
							aria-describedby={form.errors.date_to_reserv ? 'date-error' : undefined}
							required
						/>
						<div id="date-error"><FieldError>{form.errors.date_to_reserv}</FieldError></div>
					</div>

					<div>
						<label htmlFor="desc" className="block text-sm font-semibold text-teal-darker">Tujuan penggunaan</label>
						<textarea
							id="desc"
							rows={4}
							value={form.data.desc}
							onChange={event => form.setData('desc', event.target.value)}
							className={fieldClassName}
							placeholder="Masukkan tujuan penggunaan ruangan"
							aria-invalid={Boolean(form.errors.desc)}
							aria-describedby={form.errors.desc ? 'desc-error' : undefined}
							required
						/>
						<div id="desc-error"><FieldError>{form.errors.desc}</FieldError></div>
					</div>

					<div>
						<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
							<label className="block text-sm font-semibold text-teal-darker">Ketersediaan waktu</label>
							<div className="flex flex-wrap gap-4 text-xs text-gray-500">
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded border bg-white" />Kosong</span>
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-teal-600" />Dipilih</span>
								<span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-400" />Sudah dipesan / terlalu dekat</span>
							</div>
						</div>

						<div className="rounded-xl border bg-gray-50 p-4 sm:p-5">
							{!form.data.room_id || !selectedDate ? (
								<p className="text-sm italic text-gray-400">Pilih ruangan dan tanggal terlebih dahulu untuk melihat jadwal.</p>
							) : loadingSlots ? (
								<p role="status" className="text-sm text-gray-500">Memuat jadwal...</p>
							) : slotError && !bookedRanges.length ? (
								<p role="alert" className="text-sm text-red-700">{slotError}</p>
							) : (
								<div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
									<div className="grid grid-rows-[repeat(27,2.5rem)] text-xs text-gray-500">
										{timeSlots.map(minutes => (
											<div key={minutes} className="flex items-start pt-1">
												{minutes % 60 === 0 ? formatTime(minutes) : ''}
											</div>
										))}
										<div className="flex items-start pt-1">20:00</div>
									</div>
									<div className="grid grid-rows-[repeat(26,2.5rem)] overflow-hidden rounded border border-gray-200">
										{timeSlots.map(minutes => {
											const blocked = isSlotBlocked(minutes);
											const startMinutes = form.data.start_time ? timeToMinutes(form.data.start_time) : null;
											const endMinutes = form.data.end_time ? timeToMinutes(form.data.end_time) : null;
											const selected = startMinutes !== null && minutes >= startMinutes && minutes < endMinutes;

											return (
												<button
													key={minutes}
													type="button"
													disabled={blocked}
													onClick={() => selectSlot(minutes)}
													aria-pressed={selected}
													aria-label={`${formatTime(minutes)} sampai ${formatTime(minutes + slotStep)}${blocked ? ', tidak tersedia' : ''}`}
													className={`h-10 border-b border-gray-200 transition ${blocked ? 'cursor-not-allowed bg-gray-400' : selected ? 'bg-teal-600 text-white' : 'cursor-pointer bg-white hover:bg-teal-100'}`}
												>
													<span className="sr-only">{formatTime(minutes)} - {formatTime(minutes + slotStep)}</span>
												</button>
											);
										})}
									</div>
								</div>
							)}
							{form.data.room_id && selectedDate && !loadingSlots && !slotError && !hasAvailableSlot && (
								<p role="status" className="mt-3 text-sm text-gray-500">Sudah tidak dapat reservasi pada waktu yang tersedia.</p>
							)}
							{form.data.start_time && form.data.end_time && (
								<p className="mt-3 text-sm font-medium text-teal-700">Waktu terpilih: {form.data.start_time} - {form.data.end_time}</p>
							)}
							{slotError && bookedRanges.length > 0 && <p role="alert" className="mt-2 text-sm text-red-700">{slotError}</p>}
							{form.errors.time && <FieldError>{form.errors.time}</FieldError>}
							{form.errors.start_time && <FieldError>{form.errors.start_time}</FieldError>}
							{form.errors.end_time && <FieldError>{form.errors.end_time}</FieldError>}
						</div>
					</div>

					<div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
						<Link href={urls.reservations} className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</Link>
						<button type="submit" disabled={form.processing} className="inline-flex items-center rounded-md bg-teal-normal-01 px-5 py-2.5 text-sm font-semibold text-white-01 hover:bg-teal-normal-02 disabled:cursor-not-allowed disabled:opacity-60">
							{form.processing ? 'Mengirim...' : 'Kirim reservasi'}
						</button>
					</div>
				</form>
			</section>
		</AppLayout>
	);
}