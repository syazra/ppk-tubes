import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';

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

	const submit = event => {
		event.preventDefault();
		form.post('/report/store', { forceFormData: true, preserveScroll: true });
	};

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

			<section className="mb-8 max-w-3xl px-6 lg:px-8">
				<form onSubmit={submit} className="space-y-6 rounded-md border border-gray-200 bg-white p-6 shadow-sm" encType="multipart/form-data">
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

					<div>
						<label htmlFor="images" className="block text-sm font-semibold text-teal-darker">
							Bukti kerusakan (foto)
						</label>

						<div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 pt-6 pb-6 transition-colors duration-200 hover:border-gray-400">

							{imagePreviews.length > 0 ? (
								<div className="mb-3 grid grid-cols-2 gap-3">
									{imagePreviews.map((preview, index) => (
										<div
											key={preview.url}
											className="flex flex-col items-center"
										>
											<img
												src={preview.url}
												alt={`Pratinjau foto kerusakan ${index + 1}`}
												className="h-28 w-28 rounded-lg border border-gray-200 object-cover shadow-sm"
											/>

											<span className="mt-1 max-w-[120px] truncate text-xs font-medium text-gray-700">
												{preview.file.name}
											</span>
										</div>
									))}
								</div>
							) : (
								<svg
									className="mb-2 h-12 w-12 text-gray-400"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
									aria-hidden="true"
								>
									<path
										d="M28 8H12a4 4 0 0 0-4 4v20m32-12v8m0 0v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-4m32-4-3.172-3.172a4 4 0 0 0-5.656 0L28 28M8 32l9.172-9.172a4 4 0 0 1 5.656 0L28 28m0 0 4 4m4-24h8m-4-4v8m-12 4h.02"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							)}

							<input
								id="images"
								name="images[]"
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageChange}
								className="hidden"
							/>

							<div className="my-2 flex w-full items-center justify-center gap-3">
								{imagePreviews.length === 0 && (
									<label
										htmlFor="images"
										className="shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition hover:bg-gray-50"
									>
										Pilih Foto
									</label>
								)}
								{imagePreviews.length === 1 && (
									<label
										htmlFor="images"
										className="shrink-0 cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-700 shadow-sm transition hover:bg-gray-50"
									>
										+ Tambah Foto
									</label>
								)}


								{imagePreviews.length === 0 && (
									<span className="max-w-xs truncate text-xs text-gray-500">
										Belum ada file yang dipilih
									</span>
								)}
							</div>

							<p id="image-help" className="mt-1 text-xs text-gray-400">
								PNG, JPG, JPEG (Maks. 2MB)
							</p>
						</div>

						<div id="image-error">
							<FieldError>{form.errors.images}</FieldError>
						</div>
					</div>

					<div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
						<Link
							href={urls.reports}
							className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
						>
							Batal
						</Link>
						<button
							type="submit"
							disabled={form.processing}
							className="inline-flex items-center rounded-md bg-teal-normal-01 px-5 py-2.5 text-sm font-semibold text-white-01 hover:bg-teal-normal-02 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{form.processing ? 'Mengirim...' : 'Kirim laporan'}
						</button>
					</div>
				</form>
			</section>
		</AppLayout>
	);
}
