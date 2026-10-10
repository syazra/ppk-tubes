import { Head, useForm } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';

const inputClassName = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-teal-dark-01 focus:outline-none focus:ring-1 focus:ring-teal-dark-01';

function Field({ id, label, type = 'text', value, onChange, error, autoComplete, required = false, readOnly = false }) {
	return (
		<div>
			<label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
			<input
				id={id}
				name={id}
				type={type}
				value={value}
				onChange={onChange}
				autoComplete={autoComplete}
				required={required}
				readOnly={readOnly}
				className={`${inputClassName} ${readOnly ? 'cursor-not-allowed bg-gray-100 text-gray-500' : ''}`}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? `${id}-error` : undefined}
			/>
			{error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
		</div>
	);
}

function ProfileInformation({ user, status, urls }) {
	const form = useForm({ name: user.name ?? '', email: user.email ?? '' });

	function submit(event) {
		event.preventDefault();
		form.patch(urls.profileUpdate, { preserveScroll: true });
	}

	return (
		<section className="mb-6 max-w-3xl rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
			<header>
				<h2 className="text-lg font-semibold text-teal-darker">Informasi akun</h2>
				<p className="mt-1 text-sm text-gray-600">Edit nama profil akun Anda. Alamat email hanya bisa diubah oleh Administrator.</p>
			</header>
			<form onSubmit={submit} className="mt-6 max-w-xl space-y-6">
				<Field id="name" label="Nama" value={form.data.name} onChange={event => form.setData('name', event.target.value)} error={form.errors.name} autoComplete="name" required />
				<Field id="email" label="Email" type="email" value={form.data.email} onChange={event => form.setData('email', event.target.value)} error={form.errors.email} autoComplete="username" required readOnly />
				<div className="flex items-center gap-4">
					<Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</Button>
					{status === 'profile-updated' && <p role="status" className="text-sm text-gray-600">Tersimpan.</p>}
				</div>
			</form>
		</section>
	);
}

function UpdatePassword({ status, urls }) {
	const form = useForm({ current_password: '', password: '', password_confirmation: '' });

	function submit(event) {
		event.preventDefault();
		form.put(urls.passwordUpdate, {
			errorBag: 'updatePassword',
			preserveScroll: true,
			onSuccess: () => form.reset(),
		});
	}

	return (
		<section className="mb-6 max-w-3xl rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
			<header>
				<h2 className="text-lg font-semibold text-teal-darker">Ganti kata sandi</h2>
				<p className="mt-1 text-sm text-gray-600">Pastikan akun Anda menggunakan kata sandi yang panjang dan aman.</p>
			</header>
			<form onSubmit={submit} className="mt-6 max-w-xl space-y-6">
				<Field id="current_password" label="Kata sandi saat ini" type="password" value={form.data.current_password} onChange={event => form.setData('current_password', event.target.value)} error={form.errors.current_password} autoComplete="current-password" required />
				<Field id="password" label="Kata sandi baru" type="password" value={form.data.password} onChange={event => form.setData('password', event.target.value)} error={form.errors.password} autoComplete="new-password" required />
				<Field id="password_confirmation" label="Konfirmasi kata sandi" type="password" value={form.data.password_confirmation} onChange={event => form.setData('password_confirmation', event.target.value)} error={form.errors.password_confirmation} autoComplete="new-password" required />
				<div className="flex items-center gap-4">
					<Button type="submit" disabled={form.processing}>{form.processing ? 'Menyimpan...' : 'Simpan'}</Button>
					{status === 'password-updated' && <p role="status" className="text-sm text-gray-600">Tersimpan.</p>}
				</div>
			</form>
		</section>
	);
}

export default function EditProfile({ user, status, csrfToken, urls }) {
	return (
		<AppLayout user={user} csrfToken={csrfToken} urls={urls} active="profile" 
            title="Profil Anda" 
            subtitle="Lihat dan ubah informasi akun dan kata sandi Anda."
        >
			<Head title="Profil Anda" />
            <ProfileInformation user={user} status={status} urls={urls} />
            <UpdatePassword status={status} urls={urls} />
		</AppLayout>
	);
}
