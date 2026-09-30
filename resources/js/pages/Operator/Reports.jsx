import { Head } from '@inertiajs/react';
import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';

export default function Reports({ user, status, csrfToken, urls }) {
	return (
		<>
			<Head title="Laporan Kerusakan" />
			<AppLayout user={user} csrfToken={csrfToken} urls={urls} active="reports" title="Laporan Kerusakan" subtitle="Lihat laporan kerusakan fasilitas kampus.">
				{status && <div role="status" className="mb-5 rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}
				<section className="app-panel">
					<h2 className="text-base font-semibold text-teal-darker">Semua laporan</h2>
					<EmptyState title="Daftar laporan belum tersedia">Data laporan operator belum disediakan oleh halaman ini.</EmptyState>
				</section>
			</AppLayout>
		</>
	);
}
