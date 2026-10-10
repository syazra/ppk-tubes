import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import AppLayout from '../../components/AppLayout';
import ActionCard from '../../components/ActionCard';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';
import reservationImage from '../../../../background-preview.png';
import Button from '../../components/Button';

const statusLabels = {
	baru: 'Menunggu diproses',
	menunggu: 'Menunggu',
	diproses: 'Sedang diproses',
	selesai: 'Selesai',
	disetujui: 'Disetujui',
	ditolak: 'Ditolak',
	dibatalkan: 'Dibatalkan',
};

function formatDate(value) {
	if (!value) return '-';

	const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
	return Number.isNaN(date.getTime())
		? '-'
		: new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

function formatTime(value) {
	return value ? value.slice(0, 5) : '-';
}

export default function Dashboard({ user, csrfToken, urls, recentReservations = [], recentReports = [] }) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<AppLayout
			user={user}
			csrfToken={csrfToken}
			urls={urls}
			active="dashboard"
			title={`Selamat datang, ${user?.name || 'Petugas'}`}
			subtitle="Lihat aktivitas reservasi dan pelaporan kamu di Buana."
		>
			<Head title="Beranda CampuSpace" />

			{/* SHORTCUT BUTTON */}
			<section className="mb-8">
				<motion.article
					initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="relative isolate flex min-h-56 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8"
				>
					<img src={reservationImage} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 h-full w-1/2 object-cover object-center opacity-35" />
					<div className="flex max-w-2xl flex-col items-start justify-between gap-6">
						<div>
							<p className="text-sm font-medium text-teal-800">Tombol Cepat Katalog Fasilitas</p>
							<h2 className="mt-2 text-xl sm:text-3xl font-bold leading-tight text-teal-darker">Cari & Temukan Fasilitas Kampus</h2>
							<p className="mt-1 text-sm text-teal-700">Lihat ketersediaan ruangan dan ajukan peminjaman fasilitas kampus dengan mudah melalui katalog.</p>
						</div>
						<Button as={Link} href={urls?.catalog || route('user.catalog')}>
							Lihat katalog fasilitas
						</Button>
					</div>
				</motion.article>
			</section>

			{/* RINGKASAN / RIWAYAT TERBARU */}
			<motion.section
				className="app-insights-grid"
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.25 }}
				aria-label="Aktivitas kampus"
			>
				<ActionCard
					title="Riwayat Reservasi"
					href={urls.reservations}
					emptyTitle="Belum ada reservasi"
					emptyMessage={
						<>
							Belum pernah membuat reservasi. <Link href={urls.reservationForm} className="font-medium text-teal-700 hover:underline">Buat reservasi</Link> untuk mulai meminjam fasilitas.
						</>
					}
				>
					{recentReservations.length ? (
						<div className="flex-1 divide-y divide-gray-100">
							{recentReservations.map((reservation, index) => (
								<div key={reservation.id} className={`flex flex-wrap items-center justify-between gap-3 py-4 ${index === 0 ? 'pt-0' : ''}`}>
									<div className="min-w-0">
										<h3 className="font-semibold text-teal-darker">{reservation.room?.name ?? 'Ruangan'}</h3>
										<p className="mt-1 text-xs text-gray-500">{reservation.room?.type ?? 'Fasilitas'}</p>
										<p className="mt-1 text-sm text-teal-700">
											{formatDate(reservation.date_to_reserv)}, {formatTime(reservation.start_time)} - {formatTime(reservation.end_time)}
										</p>
									</div>
									<StatusBadge color={getStatusColor(reservation.status)}>
										{statusLabels[reservation.status] ?? reservation.status}
									</StatusBadge>
								</div>
							))}
						</div>
					) : null}
				</ActionCard>

				<ActionCard
					title="Riwayat Laporan"
					href={urls.reports}
					emptyTitle="Belum ada laporan"
					emptyMessage={
						<>
							Belum pernah membuat laporan. <Link href={urls.reportCreate} className="font-medium text-teal-700 hover:underline">Buat laporan</Link> jika menemukan fasilitas rusak.
						</>
					}
				>
					{recentReports.length ? (
						<div className="flex-1 divide-y divide-gray-100">
							{recentReports.map((report, index) => (
								<div key={report.id} className={`flex flex-wrap items-center justify-between gap-3 py-4 ${index === 0 ? 'pt-0' : ''}`}>
									<div className="min-w-0">
										<h3 className="font-semibold text-teal-darker">{report.room?.name ?? 'Fasilitas'}</h3>
										<p className="mt-1 text-xs text-gray-500">{report.desc?.length > 50 ? `${report.desc.slice(0, 50)}...` : report.desc}</p>
										<p className="mt-1 text-sm text-teal-700">{formatDate(report.created_at)}</p>
									</div>
									<StatusBadge color={getStatusColor(report.status)}>
										{statusLabels[report.status] ?? report.status}
									</StatusBadge>
								</div>
							))}
						</div>
					) : null}
				</ActionCard>
			</motion.section>
		</AppLayout>
	);
}