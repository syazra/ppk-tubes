import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-3 py-2.5 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';

function RecapTable({ title, headers, rows, empty, renderRow }) {
    return <section className="rounded-xl border border-green-light-03 bg-white-01 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-teal-darker">{title}</h2>
        <div className="mt-4 overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-left text-sm"><thead className="bg-teal-light-01 text-xs uppercase tracking-wide text-teal-darker"><tr>{headers.map(header => <th key={header} className="px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{rows.map(renderRow)}{rows.length === 0 && <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-gray-500">{empty}</td></tr>}</tbody></table></div>
    </section>;
}

export default function FacilityRecap({ admin, csrfToken, urls, filters, locations, rooms, recap }) {
    const form = useForm({ from: filters.from, to: filters.to, location: filters.location, room_id: filters.room_id });
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value !== '' && value !== null));
    const roomChoices = rooms.filter(room => !form.data.location || room.location === form.data.location);

    function apply(event) {
        event.preventDefault();
        form.get(urls.recap, { preserveState: true, replace: true });
    }

    return <>
        <Head title="Rekap Fasilitas" />
        <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="recap" title="Rekap Fasilitas" subtitle="Okupansi dan frekuensi laporan kerusakan per fasilitas dan lokasi.">
            <div className="max-w-7xl space-y-6 px-6 pb-8 lg:px-8">
                <section className="rounded-xl border border-green-light-03 bg-white-01 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold text-teal-darker">Filter rekap</h2><p className="mt-1 text-sm text-gray-600">Okupansi: reservasi disetujui dan jam terpakai. Kerusakan: laporan menunggu atau disetujui.</p></div><Link href={urls.facilities} className="text-sm font-semibold text-teal-dark-01 underline">Kelola fasilitas</Link></div>
                    <form onSubmit={apply} className="mt-5 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <div><label htmlFor="from" className="text-sm font-semibold text-teal-darker">Dari tanggal</label><input id="from" type="date" value={form.data.from} onChange={event => form.setData('from', event.target.value)} className={inputClass} required />{form.errors.from && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors.from}</p>}</div>
                        <div><label htmlFor="to" className="text-sm font-semibold text-teal-darker">Sampai tanggal</label><input id="to" type="date" value={form.data.to} onChange={event => form.setData('to', event.target.value)} className={inputClass} required />{form.errors.to && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors.to}</p>}</div>
                        <div><label htmlFor="location" className="text-sm font-semibold text-teal-darker">Lokasi</label><select id="location" value={form.data.location} onChange={event => form.setData({ ...form.data, location: event.target.value, room_id: '' })} className={inputClass}><option value="">Semua lokasi</option>{locations.map(location => <option key={location} value={location}>{location}</option>)}</select></div>
                        <div><label htmlFor="room" className="text-sm font-semibold text-teal-darker">Fasilitas</label><select id="room" value={form.data.room_id} onChange={event => form.setData('room_id', event.target.value)} className={inputClass}><option value="">Semua fasilitas</option>{roomChoices.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></div>
                        <button type="submit" disabled={form.processing} className="rounded-xl bg-teal-dark-01 px-5 py-2.5 text-sm font-semibold text-white-01 hover:bg-teal-dark-02 disabled:opacity-60">Terapkan filter</button>
                    </form>
                    <div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-sm font-semibold text-teal-darker">Ekspor hasil:</span>{[['csv', 'CSV'], ['xlsx', 'Excel'], ['pdf', 'PDF']].map(([format, label]) => <a key={format} href={`${urls.export.replace('FORMAT', format)}?${query}`} className="rounded-xl border border-teal-dark-01 px-4 py-2 text-sm font-semibold text-teal-dark-01 hover:bg-teal-light-01">{label}</a>)}</div>
                </section>
                <section aria-label="Ringkasan" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Fasilitas', recap.totals.facilities], ['Reservasi disetujui', recap.totals.reservations], ['Jam terpakai', recap.totals.occupied_hours], ['Laporan kerusakan', recap.totals.damage_reports]].map(([label, value]) => <div key={label} className="rounded-xl border border-green-light-03 bg-white-01 p-5 shadow-sm"><p className="text-sm text-gray-600">{label}</p><p className="mt-2 text-2xl font-bold text-teal-darker">{value}</p></div>)}</section>
                <RecapTable title="Per fasilitas" headers={['Fasilitas', 'Lokasi', 'Jenis', 'Status', 'Reservasi', 'Jam terpakai', 'Kerusakan']} rows={recap.facilities} empty="Tidak ada fasilitas untuk filter ini." renderRow={row => <tr key={row.id}><td className="px-4 py-3 font-semibold text-teal-darker">{row.name}</td><td className="px-4 py-3">{row.location}</td><td className="px-4 py-3">{row.type}</td><td className="px-4 py-3">{row.is_avail ? 'Aktif' : 'Nonaktif'}</td><td className="px-4 py-3">{row.reservations}</td><td className="px-4 py-3">{row.occupied_hours}</td><td className="px-4 py-3">{row.damage_reports}</td></tr>} />
                <RecapTable title="Per lokasi" headers={['Lokasi', 'Fasilitas', 'Reservasi', 'Jam terpakai', 'Kerusakan']} rows={recap.locations} empty="Tidak ada lokasi untuk filter ini." renderRow={row => <tr key={row.location}><td className="px-4 py-3 font-semibold text-teal-darker">{row.location}</td><td className="px-4 py-3">{row.facilities}</td><td className="px-4 py-3">{row.reservations}</td><td className="px-4 py-3">{row.occupied_hours}</td><td className="px-4 py-3">{row.damage_reports}</td></tr>} />
            </div>
        </AdminLayout>
    </>;
}
