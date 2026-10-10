import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import ButtonGray from '../../components/ButtonGray';
import UploadFile from '../../components/UploadFile';
import GuestFacilityFilters from '../../components/GuestFacilityFilters';

const fieldClassName = 'mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 focus:border-teal-dark-01 focus:ring-teal-dark-01';

function FieldError({ children }) {
	if (!children) return null;

	return <p role="alert" className="mt-2 text-sm text-red-700">{children}</p>;
}

export default function ReportForm({ rooms = [], user, auth, csrfToken, urls }) {
	const form = useForm({ room_id: '', desc: '', images: [] });
	const [imagePreviews, setImagePreviews] = useState([]);

	useEffect(() => {
		return () => {
			imagePreviews.forEach(preview => {
				URL.revokeObjectURL(preview.url);
			});
		};
	}, [imagePreviews]);

	const handleImageChange = event => {
		const newImages = Array.from(event.target.files ?? []);

		if (newImages.length === 0) return;

		form.setData('images', [
			...form.data.images,
			...newImages,
		]);

		setImagePreviews(prev => [
			...prev,
			...newImages.map(image => ({
				file: image,
				url: URL.createObjectURL(image),
			})),
		]);

		// supaya input bisa dipilih ulang
		event.target.value = '';
	};

	const handleRemoveImage = index => {
		const preview = imagePreviews[index];

		URL.revokeObjectURL(preview.url);

		form.setData(
			'images',
			form.data.images.filter((_, i) => i !== index)
		);

		setImagePreviews(prev =>
			prev.filter((_, i) => i !== index)
		);
	};
	const submit = event => {
		event.preventDefault();
		form.post('/report/store', { forceFormData: true, preserveScroll: true });
	};

	function applyFilters(event) {
		event.preventDefault();
		filterForm.get(urls.reportCreate, { preserveState: true, preserveScroll: true, replace: true });
	}

	function resetFilters() {
		const reset = { type: '', location: '', capacity: '', date: catalogDate };
		filterForm.setData(reset);
		router.get(urls.reportCreate, reset, { preserveScroll: true, replace: true });
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

	return (
		<AppLayout
			user={user}
			auth={auth}
			csrfToken={csrfToken}
			urls={urls}
			active="reports"
			title="Pelaporan Fasilitas"
			subtitle="Pilih ruangan dan lampirkan foto bukti kerusakan dengan jelas."
		>
			<Head title="Pelaporan Fasilitas" />

			<form onSubmit={submit} className="" encType="multipart/form-data">
				{/* CARI FASILITAS */}
				{/* <GuestFacilityFilters
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
				/> */}
				<div>
					<label htmlFor="room_id" className="block text-sm font-semibold text-teal-darker">
						Pilih fasilitas / ruangan
					</label>
					<select
						id="room_id"
						name="room_id"
						value={form.data.room_id}
						onChange={event => form.setData('room_id', event.target.value)}
						className={fieldClassName}
						aria-invalid={Boolean(form.errors.room_id)}
						aria-describedby={form.errors.room_id ? 'room-error' : undefined}
						required
					>
						<option value="">Pilih ruangan / fasilitas</option>
						{rooms.map(room => (
							<option key={room.id} value={room.id}>
								{room.name} - Lokasi: {room.location} ({room.type ? room.type.charAt(0).toUpperCase() + room.type.slice(1) : '-'})
							</option>
						))}
					</select>
					<div id="room-error"><FieldError>{form.errors.room_id}</FieldError></div>
				</div>

				<div className="space-y-6 rounded-md border border-gray-200 bg-white-01 p-6 shadow-sm">
					{/* DESKRIPSI */}
					<div>
						<label htmlFor="desc" className="block text-sm font-semibold text-teal-darker">
							Deskripsi kerusakan
						</label>
						<textarea
							id="desc"
							name="desc"
							rows={6}
							value={form.data.desc}
							onChange={event => form.setData('desc', event.target.value)}
							className={fieldClassName}
							placeholder="Jelaskan detail kerusakan fasilitas yang terjadi..."
							aria-invalid={Boolean(form.errors.desc)}
							aria-describedby={form.errors.desc ? 'description-error' : undefined}
							required
						/>
						<div id="description-error"><FieldError>{form.errors.desc}</FieldError></div>
					</div>

					<UploadFile
						label="Bukti kerusakan (foto)"
						name="images"
						accept="image/*"
						multiple={true}
						value={form.data.images}
						onChange={(files) => form.setData('images', files)}
						error={form.errors.images}
						helperText="PNG, JPG, JPEG (Maks. 2MB)"
					/>

					{/* TOMBOL */}
					<div className="flex flex-wrap justify-end gap-4 pt-5">
						<ButtonGray as={Link} href={urls.reports}>
							Batal
						</ButtonGray>
						<Button type="submit" disabled={form.processing}>
							{form.processing ? 'Mengirim...' : 'Kirim laporan'}
						</Button>
					</div>
				</div>
			</form>
		</AppLayout>
	);
}
