export function selectReservationRange(slots, index, anchor, startTime, endTime, maxDurationMinutes = 180) {
    const slot = slots[index];
    if (!slot || slot.status !== 'available') return null;
    const empty = message => ({ anchor: null, startTime: '', endTime: '', message });
    if (anchor === null) {
        if (startTime && endTime && slot.start_time >= startTime && slot.start_time < endTime) return empty('');
        return { anchor: index, startTime: slot.start_time, endTime: slot.end_time, message: '' };
    }
    const first = Math.min(anchor, index);
    const last = Math.max(anchor, index);
    const range = slots.slice(first, last + 1);
    if (range.length !== last - first + 1 || range.some(item => item.status !== 'available')) return empty('Rentang waktu melewati slot yang tidak tersedia. Pilih rentang lain.');
    const minutes = time => time.split(':').slice(0, 2).reduce((total, value, index) => total + Number(value) * (index === 0 ? 60 : 1), 0);
    const duration = minutes(range.at(-1).end_time) - minutes(range[0].start_time);
    if (duration > maxDurationMinutes) return empty(`Durasi reservasi maksimal ${maxDurationMinutes / 60} jam.`);
    return { anchor: null, startTime: range[0].start_time, endTime: range.at(-1).end_time, message: '' };
}
