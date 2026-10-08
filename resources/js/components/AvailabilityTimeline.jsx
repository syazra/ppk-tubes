import '../../css/availability-timeline.css';

export function isSlotAvailable(slot) {
    return typeof slot.available === 'boolean' ? slot.available : slot.status === 'available';
}

export default function AvailabilityTimeline({ slots, label, compact = false, onSelect, startTime = '', endTime = '' }) {
    const interactive = Boolean(onSelect);
    return (
        <div className={`at-timeline ${compact ? 'at-compact' : ''}`}>
            <div className="at-legend" aria-label="Keterangan jadwal">
                <span><i className="at-key-available" />Tersedia</span>
                {interactive && <span><i className="at-key-selected" />Dipilih</span>}
                <span><i className="at-key-unavailable" />Tidak tersedia</span>
            </div>
            <div className="at-scroll" tabIndex={0} role="region" aria-label={label}>
                <div className="at-rows" role={interactive ? 'group' : 'list'} aria-label={label}>
                    {slots.map((slot, index) => {
                        const available = isSlotAvailable(slot);
                        const selected = interactive && available && startTime && endTime && slot.start_time >= startTime && slot.start_time < endTime;
                        const status = !available ? 'Tidak tersedia' : selected ? 'Dipilih' : 'Tersedia';
                        const className = `at-slot ${!available ? 'at-unavailable' : selected ? 'at-selected' : 'at-available'}`;
                        const slotLabel = `${slot.start_time} sampai ${slot.end_time}, ${status.toLowerCase()}`;
                        return <div className="at-row" key={slot.start_time} role={interactive ? undefined : 'listitem'} aria-label={interactive ? undefined : slotLabel}>
                            <span className="at-hour" aria-hidden="true">{slot.start_time.slice(3, 5) === '00' ? slot.start_time.slice(0, 5) : ''}</span>
                            {interactive ? <button type="button" className={className} disabled={!available} aria-pressed={Boolean(selected)} aria-label={slotLabel} onClick={() => onSelect(index)} /> : <div className={className} aria-hidden="true" />}
                        </div>;
                    })}
                    {slots.length > 0 && <div className="at-end" aria-hidden="true">{slots.at(-1).end_time.slice(0, 5)}</div>}
                </div>
            </div>
        </div>
    );
}
