import { useState } from 'react';
import Icon from './Icons';
import useRoomSlots from '../hooks/useRoomSlots';
import AvailabilityTimeline, { isSlotAvailable } from './AvailabilityTimeline';
import '../../css/facility-card.css';

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date);
}

function fallbackPhoto(event, fallbackUrl) {
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied) {
        image.hidden = true;
        return;
    }
    image.dataset.fallbackApplied = 'true';
    image.src = fallbackUrl;
}

function SlotDetails({ facility, date, timezone, providedSlots }) {
    const [open, setOpen] = useState(false);
    const hasProvidedSlots = Array.isArray(providedSlots);
    const remote = useRoomSlots(facility.slots_url, date, open && !hasProvidedSlots);
    const slots = hasProvidedSlots ? providedSlots : remote.slots;
    const availableCount = slots.filter(isSlotAvailable).length;

    return (
        <details className="fc-schedule" onToggle={event => setOpen(event.currentTarget.open)}>
            <summary>
                <span className="fc-schedule-icon"><Icon name="calendar" className="fc-icon" /></span>
                <span className="fc-schedule-copy"><span>Lihat slot waktu</span><small>{slots.length ? `${availableCount} dari ${slots.length} slot tersedia` : 'Periksa ketersediaan jadwal'}</small></span>
                <Icon name="landing-chevron" className="fc-icon fc-chevron" />
            </summary>
            <div className="fc-schedule-body" aria-live="polite" aria-atomic="true">
                <p className="fc-schedule-date">{formatDate(date)} · {timezone === 'Asia/Jakarta' ? 'WIB' : timezone}</p>
                {!hasProvidedSlots && remote.loading && <p className="fc-message" role="status">Memuat slot waktu…</p>}
                {!hasProvidedSlots && remote.error && <div className="fc-error" role="alert"><span>{remote.error}</span><button type="button" onClick={remote.retry}>Coba lagi</button></div>}
                {slots.length > 0 && <AvailabilityTimeline slots={slots} compact label={`Ketersediaan slot ${facility.name}`} />}
                {hasProvidedSlots && !slots.length && <p className="fc-message">Belum ada jadwal untuk tanggal ini.</p>}
            </div>
        </details>
    );
}

export default function FacilityCard({ facility, selected = false, date, timezone = 'WIB', slots, showSchedule = true, photoPlaceholderUrl = '/images/facility-placeholder-photo.jpg', photoFallbackUrl = '/images/facility-placeholder.svg', children }) {
    const [showGallery, setShowGallery] = useState(false);
    const photos = facility.images ?? [];
    const cover = photos[0];

    return (
        <article className="fc-card" data-selected={selected ? 'true' : undefined}>
            <div className="fc-photo">
                <img key={cover?.url ?? photoPlaceholderUrl} src={cover?.url ?? photoPlaceholderUrl} alt={cover?.alt_text || (cover ? `Foto ${facility.name}` : `Ilustrasi ${facility.name}`)} width="640" height="360" loading="lazy" onError={event => fallbackPhoto(event, photoFallbackUrl)} />
                {!cover && <span className="fc-photo-label">Foto ilustrasi</span>}
            </div>
            <div className="fc-body">
                <div className="fc-heading"><h3>{facility.name}</h3><span className={`fc-status ${facility.is_available ? 'fc-status-active' : ''}`}><i aria-hidden="true" />{facility.is_available ? 'Aktif' : 'Nonaktif'}</span></div>
                <dl className="fc-metadata">
                    <dt>Tipe</dt><dd>{facility.type}</dd>
                    <dt>Lokasi</dt><dd>{facility.location}</dd>
                    <dt>Kapasitas</dt><dd>{facility.capacity} orang</dd>
                </dl>
                {facility.description && <p className="fc-description">{facility.description.length > 160 ? `${facility.description.slice(0, 157)}…` : facility.description}</p>}
                {photos.length > 1 && <div className="fc-gallery">
                    <button type="button" className="fc-gallery-toggle" aria-expanded={showGallery} onClick={() => setShowGallery(value => !value)}><Icon name="grid" className="fc-icon" />{showGallery ? 'Tutup galeri' : `Lihat semua foto (${photos.length})`}</button>
                    {showGallery && <div className="fc-gallery-grid">{photos.map((photo, index) => <a key={`${photo.url}-${index}`} href={photo.url} target="_blank" rel="noopener noreferrer">
                        <img src={photo.url} alt={photo.alt_text || `Foto ${index + 1} ${facility.name}`} loading="lazy" onError={event => fallbackPhoto(event, photoFallbackUrl)} />
                        <span>{photo.alt_text || `Foto ${index + 1}`}</span>
                    </a>)}</div>}
                </div>}
                {showSchedule && <SlotDetails facility={facility} date={date} timezone={timezone} providedSlots={slots} />}
                {!facility.is_available && <p className="fc-inactive">Fasilitas nonaktif; slot tidak tersedia.</p>}
                {children && facility.is_available && (
                    <div className="fc-action">
                        {typeof children === 'function' ? children(facility, selected) : children}
                    </div>
                )}
            </div>
        </article>
    );
}
