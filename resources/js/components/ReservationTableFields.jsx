import StatusBadge, { getStatusColor } from './StatusBadge';
import { formatReservationDate, formatTime, reservationStatusLabels } from '../lib/reservationPresentation';

export const reservationColumns = [
    { label: 'Nama fasilitas' },
    { label: 'Tanggal & waktu' },
    { label: 'Jenis' },
    { label: 'Kegiatan / tujuan penggunaan', type: 'desc' },
    { label: 'Status' },
];

export function reservationCells(reservation) {
    return [
        <td key="facility" className="px-4 py-3 font-medium text-teal-darker">
            <p>{reservation.room?.name ?? '—'}</p>
            <p className="text-xs font-normal text-gray-500">{reservation.room?.location}</p>
        </td>,
        <td key="schedule" className="whitespace-nowrap px-4 py-3 text-teal-dark-01">
            <p>{formatReservationDate(reservation.date_to_reserv)}</p>
            <p className="text-xs text-gray-500">{formatTime(reservation.start_time)} – {formatTime(reservation.end_time)}</p>
        </td>,
        <td key="type" className="px-4 py-3 text-gray-600">{reservation.reservation_type ?? '—'}</td>,
        <td key="purpose" className="px-4 py-3 text-gray-600">
            <p>{reservation.activity_name || reservation.desc || '—'}</p>
            {reservation.proposal_url && <a href={reservation.proposal_url} className="text-sm font-semibold text-teal-dark-01 hover:underline">Unduh proposal</a>}
        </td>,
        <td key="status" className="whitespace-nowrap px-4 py-3">
            <StatusBadge color={getStatusColor(reservation.status)}>{reservationStatusLabels[reservation.status] ?? reservation.status}</StatusBadge>
        </td>,
    ];
}
