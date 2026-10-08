import { Head, Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import AppLayout from '../../components/AppLayout';
import EmptyState from '../../components/EmptyState';
import StatusBadge, { getStatusColor } from '../../components/StatusBadge';
import reservationImage from '../../../../background-preview.png';
import reportImage from '../../../../background-composite-preview.png';

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

function HistoryHeading({ title, href }) {
	return (
		<div className="app-section-heading">
			<h2 className="text-lg font-bold text-teal-darker">{title}</h2>
			<Link href={href} className="text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline">
				Lihat lainnya
			</Link>
		</div>
	);
}

export default function Dashboard({ user, csrfToken, urls, recentReservations = [], recentReports = [] }) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<AppLayout
			user={user}
			csrfToken={csrfToken}
			urls={urls}
			active="dashboard"
			title="Beranda CampuSpace"
			subtitle="Selamat datang di halaman beranda CampuSpace."
		>
			<Head title="Beranda CampuSpace" />

			<section className="mb-8 grid gap-4 sm:grid-cols-2">
				<motion.article
					initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35 }}
					className="relative isolate flex min-h-64 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50 p-6 sm:p-8"
				>
					<img src={reservationImage} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 h-full w-1/2 object-cover object-center opacity-35" />
					<div className="flex max-w-sm flex-col items-start justify-between gap-6">
						<div>
							<p className="text-sm font-medium text-teal-800">Butuh fasilitas?</p>
							<h2 className="mt-2 text-2xl font-bold leading-tight text-teal-darker">Reservasi fasilitas di sini</h2>
						</div>
						<Link href={urls.reservationForm} className="inline-flex min-h-11 items-center rounded-md bg-lime-300 px-5 py-2.5 text-sm font-semibold text-teal-950 transition hover:bg-lime-400">
							Mulai reservasi
						</Link>
					</div>
				</motion.article>

				<motion.article
					initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.35, delay: shouldReduceMotion ? 0 : 0.08 }}
					className="relative isolate flex min-h-64 overflow-hidden rounded-xl border border-cyan-100 bg-cyan-50 p-6 sm:p-8"
				>
					<img src={reportImage} alt="" aria-hidden="true" className="absolute inset-y-0 right-0 -z-10 h-full w-1/2 object-cover object-center opacity-35" />
					<div className="flex max-w-sm flex-col items-start justify-between gap-6">
						<div>
							<p className="text-sm font-medium text-teal-800">Menemukan fasilitas rusak?</p>
							<h2 className="mt-2 text-2xl font-bold leading-tight text-teal-darker">Laporkan fasilitas di sini</h2>
						</div>
						<Link href={urls.reportCreate} className="inline-flex min-h-11 items-center rounded-md bg-lime-300 px-5 py-2.5 text-sm font-semibold text-teal-950 transition hover:bg-lime-400">
							Mulai laporkan
						</Link>
					</div>
				</motion.article>
			</section>

			<section className="app-insights-grid">
				<article className="app-panel flex min-h-[340px] flex-col">
					<HistoryHeading title="Riwayat Reservasi" href={urls.reservations} />
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
					) : (
						<EmptyState title="Belum ada reservasi">
							Belum pernah membuat reservasi. <Link href={urls.reservationForm} className="font-medium text-teal-700 hover:underline">Buat reservasi</Link> untuk mulai meminjam fasilitas.
						</EmptyState>
					)}
				</article>

				<article className="app-panel flex min-h-[340px] flex-col">
					<HistoryHeading title="Riwayat Laporan" href={urls.reports} />
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
					) : (
						<EmptyState title="Belum ada laporan">
							Belum pernah membuat laporan. <Link href={urls.reportCreate} className="font-medium text-teal-700 hover:underline">Buat laporan</Link> jika menemukan fasilitas rusak.
						</EmptyState>
					)}
				</article>
			</section>
		</AppLayout>
	);
}