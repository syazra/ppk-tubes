import { Link } from '@inertiajs/react';
import FacilityCard from './FacilityCard';
import Icon from './Icons';
import '../../css/guest-facilities.css';

function paginationLabel(link, index, total) {
	if (index === 0) return 'Sebelumnya';
	if (index === total - 1) return 'Berikutnya';
	return /^\d+$/.test(link.label) ? link.label : '…';
}

export default function FacilitiesCatalog({
	rooms,
	selectedDate,
	processing,
	photoPlaceholderUrl,
	photoFallbackUrl,
	timezone = 'WIB',
	showSchedule = true,
	selectedFacilityId = null,
	onReset,
	onProcessingChange,
	children,
}) {
	const roomList = rooms.data ?? [];
	const pagination = rooms.links ?? [];

	return (
		<div id="daftar-fasilitas" aria-busy={processing}>
			<div className="gf-results-meta">
				<p role="status" className='px-3'>{rooms.total > 0 ? `Menampilkan ${rooms.from}-${rooms.to} dari ${rooms.total} fasilitas` : '0 fasilitas ditemukan'}</p>
				{/* <p>Buka slot waktu untuk melihat jadwal.</p> */}
			</div>
			{roomList.length > 0 ? (
				<div className="gf-card-grid">
					{roomList.map(room => (
						<FacilityCard
							key={room.id}
							facility={{
								...room,
								description: room.description ?? room.desc,
								is_available: room.is_available ?? room.is_avail,
							}}
							slots={room.slots}
							date={selectedDate}
							timezone={timezone}
							showSchedule={showSchedule}
							photoPlaceholderUrl={photoPlaceholderUrl}
							photoFallbackUrl={photoFallbackUrl}
							selected={String(selectedFacilityId) === String(room.id)}
						>
							{children}
						</FacilityCard>
					))}
				</div>
			) : (
				<div className="gf-empty">
					<span className="gf-empty-icon"><Icon name="room" className="gf-note-icon" /></span>
					<h3>Belum ada fasilitas yang sesuai</h3>
					<p>Coba ubah tipe, lokasi, atau kapasitas untuk menemukan fasilitas lainnya.</p>
					<button className="gf-button gf-button-forest" type="button" onClick={onReset} disabled={processing}>
						Reset filter<Icon name="landing-arrow" className="gf-icon" />
					</button>
				</div>
			)}
			{rooms.last_page > 1 && (
				<nav className="gf-pagination" aria-label="Halaman daftar fasilitas">
					{pagination.map((link, index) => {
						const label = paginationLabel(link, index, pagination.length);
						return link.active ? (
							<span className="gf-page gf-page-active" key={index} aria-current="page" aria-label={`Halaman ${label}`}>{label}</span>
						) : link.url ? (
							<Link
								className="gf-page"
								href={link.url}
								key={index}
								preserveScroll
								preserveState
								aria-label={/^\d+$/.test(label) ? `Halaman ${label}` : label}
								onStart={() => onProcessingChange?.(true)}
								onFinish={() => onProcessingChange?.(false)}
							>
								{label}
							</Link>
						) : (
							<span className="gf-page gf-page-disabled" key={index} aria-disabled="true">{label}</span>
						);
					})}
				</nav>
			)}
		</div>
	);
}