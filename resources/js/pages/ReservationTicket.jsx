import { Head, Link } from '@inertiajs/react';
import { ReservationTicketContent } from '../components/ReservationTicket';

export default function ReservationTicketPage({ reservation, backUrl }) {
    const approved = reservation.status === 'disetujui';
    return <main className="min-h-screen bg-white-01 px-4 py-10 text-teal-darker">
        <Head title={`Tiket RSV-${reservation.id}`} />
        <div className="mx-auto max-w-2xl rounded-xl border border-green-light-03 bg-white p-6 shadow-lg">
            <header className="mb-6 border-b border-gray-200 pb-5 text-center">
                <h1 className={`text-xl font-semibold ${approved ? 'text-teal-darker' : 'text-red-700'}`}>{approved ? 'Reservasi Valid' : 'Reservasi Tidak Aktif'}</h1>
                <p className="mt-1 text-sm text-gray-500">Verifikasi Tiket Reservasi</p>
            </header>
            <ReservationTicketContent reservation={reservation} />
            <footer className="mt-6 border-t border-gray-200 pt-5 text-center">
                <p className="mb-4 text-xs text-gray-500">Tunjukkan tiket ini sebagai bukti validasi reservasi.</p>
                <Link href={backUrl} className="text-sm font-semibold text-teal-darker underline">Kembali ke reservasi</Link>
            </footer>
        </div>
    </main>;
}
