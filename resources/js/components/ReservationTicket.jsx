import PopCard from './PopCard';
import StatusBadge, { getStatusColor } from './StatusBadge';
import { reservationStatusLabels, reservationTicketFields } from '../lib/reservationPresentation';

// The modal and the user's PDF use the same fields. Inline print styles also
// keep PDF rendering independent of CSS features unsupported by html2canvas.
export function ReservationTicketContent({ reservation, print = false, children }) {
    const status = reservationStatusLabels[reservation.status] ?? reservation.status;
    const printStyle = print ? { padding: 28, background: '#ffffff', color: '#111827', fontFamily: 'Arial, sans-serif', fontSize: 14 } : undefined;
    return <div style={printStyle}>
        {print && <h1 style={{ margin: '0 0 24px', color: '#134e4a', fontSize: 24 }}>Tiket reservasi</h1>}
        <div className={print ? undefined : 'mb-5'} style={print ? { marginBottom: 20 } : undefined}>
            <p className={print ? undefined : 'mb-1 text-sm text-gray-500'} style={print ? { margin: '0 0 6px', color: '#6b7280' } : undefined}>Status</p>
            {print ? <p style={{ margin: 0, color: '#134e4a', fontWeight: 700 }}>{status}</p> : <StatusBadge color={getStatusColor(reservation.status)}>{status}</StatusBadge>}
        </div>
        <div className={print ? undefined : 'flex flex-col gap-6 sm:flex-row sm:items-start'} style={print ? { display: 'flex', alignItems: 'flex-start', gap: 28 } : undefined}>
            <dl className={print ? undefined : 'grid min-w-0 flex-1 gap-3 text-sm'} style={print ? { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', flex: 1, gap: '18px 24px', margin: 0, minWidth: 0 } : undefined}>
                {reservationTicketFields(reservation).map(({ label, value }) => <div key={label} className={print ? undefined : 'min-w-0'}>
                    <dt className={print ? undefined : 'text-gray-500'} style={print ? { color: '#6b7280', marginBottom: 6 } : undefined}>{label}</dt>
                    <dd className={print ? undefined : 'break-words whitespace-pre-wrap font-semibold text-teal-darker'} style={print ? { margin: 0, fontWeight: 600, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' } : undefined}>{value}</dd>
                </div>)}
            </dl>
            <div className={print ? undefined : 'flex shrink-0 flex-col items-center gap-3 sm:sticky sm:top-0'} style={print ? { width: 150, textAlign: 'center', flexShrink: 0 } : undefined}>
                {reservation.qr_url && <img src={reservation.qr_url} alt={`QR Code reservasi RSV-${reservation.id}`} className={print ? undefined : 'h-36 w-36 object-contain'} style={print ? { width: 144, height: 144, objectFit: 'contain' } : undefined} />}
                <p className={print ? undefined : 'text-center text-xs text-gray-500'} style={print ? { color: '#6b7280', fontSize: 12 } : undefined}>Scan QR untuk verifikasi</p>
                {children}
            </div>
        </div>
    </div>;
}

export default function ReservationTicket({ reservation, onClose, onDownload, onPrint, downloading = false, error }) {
    return <PopCard title="Tiket reservasi" onClose={onClose} className="max-h-[90dvh] !max-w-2xl overflow-y-auto">
        <ReservationTicketContent reservation={reservation}>
            {onPrint && <button type="button" onClick={onPrint} disabled={downloading} className="rounded-md border border-teal-normal-01 px-4 py-2 text-sm font-semibold text-teal-darker disabled:cursor-wait disabled:opacity-60">Print tiket</button>}
            {onDownload && <button type="button" onClick={onDownload} disabled={downloading} className="rounded-md bg-teal-normal-01 px-4 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
                {downloading ? 'Menyiapkan tiket…' : 'Download Tiket'}
            </button>}
        </ReservationTicketContent>
        {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </PopCard>;
}
