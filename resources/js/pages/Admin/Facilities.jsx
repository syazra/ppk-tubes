import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';
const buttonClass = 'rounded-xl bg-teal-dark-01 px-5 py-3 text-sm font-semibold text-white-01 hover:bg-teal-dark-02 disabled:opacity-60';
const emptyRoom = { name: '', location: '', type: 'Ruang Kelas', capacity: '', desc: '' };

function pageLabel(label) {
    const text = label.replace('&laquo; ', '').replace(' &raquo;', '').trim();
    return { Previous: 'Sebelumnya', Next: 'Berikutnya' }[text] ?? text;
}

function FacilityFields({ form, types, prefix }) {
    const fields = [
        ['name', 'Nama fasilitas', 'text'],
        ['location', 'Lokasi', 'text'],
        ['capacity', 'Kapasitas', 'number'],
    ];

    return <>
        {fields.map(([key, label, type]) => <div key={key}>
            <label htmlFor={`${prefix}-${key}`} className="block text-sm font-semibold text-teal-darker">{label}</label>
            <input id={`${prefix}-${key}`} type={type} min={type === 'number' ? 1 : undefined} required value={form.data[key]} onChange={event => form.setData(key, event.target.value)} className={inputClass} aria-invalid={Boolean(form.errors[key])} />
            {form.errors[key] && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors[key]}</p>}
        </div>)}
        <div>
            <label htmlFor={`${prefix}-type`} className="block text-sm font-semibold text-teal-darker">Jenis</label>
            <select id={`${prefix}-type`} value={form.data.type} onChange={event => form.setData('type', event.target.value)} className={inputClass} required>
                {types.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {form.errors.type && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors.type}</p>}
        </div>
        <div className="sm:col-span-2">
            <label htmlFor={`${prefix}-desc`} className="block text-sm font-semibold text-teal-darker">Deskripsi</label>
            <textarea id={`${prefix}-desc`} rows="3" value={form.data.desc} onChange={event => form.setData('desc', event.target.value)} className={inputClass} />
            {form.errors.desc && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors.desc}</p>}
        </div>
    </>;
}

export default function Facilities({ admin, csrfToken, urls, status, rooms, filters, types }) {
    const createForm = useForm({ ...emptyRoom });
    const editForm = useForm({ ...emptyRoom });
    const filterForm = useForm({ search: filters.search, availability: filters.availability });
    const [editing, setEditing] = useState(null);
    const [changingId, setChangingId] = useState(null);

    function create(event) {
        event.preventDefault();
        createForm.post(urls.facilities, { preserveScroll: true, onSuccess: () => createForm.reset() });
    }

    function edit(room) {
        setEditing(room);
        editForm.setData({ name: room.name, location: room.location, type: room.type, capacity: room.capacity, desc: room.desc ?? '' });
        editForm.clearErrors();
    }

    function save(event) {
        event.preventDefault();
        editForm.put(`${urls.facilities}/${editing.id}`, { preserveScroll: true, onSuccess: () => setEditing(null) });
    }

    function changeAvailability(room) {
        const action = room.is_avail ? 'Nonaktifkan' : 'Aktifkan';
        if (!window.confirm(`${action} ${room.name}?`)) return;
        setChangingId(room.id);
        router.patch(`${urls.facilities}/${room.id}/availability`, { is_avail: !room.is_avail }, {
            preserveScroll: true,
            onFinish: () => setChangingId(null),
        });
    }

    function search(event) {
        event.preventDefault();
        filterForm.get(urls.facilities, { preserveState: true, replace: true });
    }

    return <>
        <Head title="Kelola Fasilitas" />
        <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="facilities" title="Kelola Fasilitas" subtitle="Tambah, perbarui, dan atur ketersediaan fasilitas kampus.">
            <div className="max-w-7xl space-y-6 px-6 pb-8 lg:px-8">
                {status && <p role="status" className="rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</p>}
                <section className="rounded-xl border border-green-light-03 bg-white-01 p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-teal-darker">Tambah fasilitas</h2>
                    <form onSubmit={create} className="mt-5 grid gap-4 sm:grid-cols-2">
                        <FacilityFields form={createForm} types={types} prefix="create" />
                        <div className="sm:col-span-2"><button type="submit" disabled={createForm.processing} className={buttonClass}>{createForm.processing ? 'Menyimpan...' : 'Tambah fasilitas'}</button></div>
                    </form>
                </section>
                <section className="rounded-xl border border-green-light-03 bg-white-01 p-6 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div><h2 className="text-xl font-bold text-teal-darker">Daftar fasilitas</h2><p className="mt-1 text-sm text-gray-600">Fasilitas nonaktif tidak dapat dipesan. Riwayatnya tetap tersimpan.</p></div>
                        <Link href={urls.recap} className={buttonClass}>Lihat rekap</Link>
                    </div>
                    <form onSubmit={search} className="my-5 flex flex-wrap items-end gap-3">
                        <div className="min-w-56 flex-1"><label htmlFor="facility-search" className="text-sm font-semibold text-teal-darker">Cari nama atau lokasi</label><input id="facility-search" type="search" value={filterForm.data.search} onChange={event => filterForm.setData('search', event.target.value)} className={inputClass} /></div>
                        <div><label htmlFor="facility-status" className="text-sm font-semibold text-teal-darker">Status</label><select id="facility-status" value={filterForm.data.availability} onChange={event => filterForm.setData('availability', event.target.value)} className={inputClass}><option value="">Semua</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></select></div>
                        <button type="submit" disabled={filterForm.processing} className={buttonClass}>Terapkan</button>
                    </form>
                    <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                        <thead className="bg-teal-light-01 text-xs uppercase tracking-wide text-teal-darker"><tr><th className="px-4 py-3">Fasilitas</th><th className="px-4 py-3">Lokasi</th><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">Kapasitas</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">{rooms.data.map(room => <tr key={room.id}>
                            <td className="px-4 py-3 font-semibold text-teal-darker">{room.name}</td><td className="px-4 py-3">{room.location}</td><td className="px-4 py-3">{room.type}</td><td className="px-4 py-3">{room.capacity}</td><td className="px-4 py-3">{room.is_avail ? 'Aktif' : 'Nonaktif'}</td>
                            <td className="whitespace-nowrap px-4 py-3"><button type="button" onClick={() => edit(room)} className="mr-4 font-semibold text-teal-dark-01 underline">Ubah</button><button type="button" disabled={changingId === room.id} onClick={() => changeAvailability(room)} className="font-semibold text-teal-dark-01 underline disabled:opacity-50">{room.is_avail ? 'Nonaktifkan' : 'Aktifkan'}</button></td>
                        </tr>)}{rooms.data.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Tidak ada fasilitas yang cocok.</td></tr>}</tbody>
                    </table></div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm"><p className="text-gray-600">Menampilkan {rooms.from ?? 0}–{rooms.to ?? 0} dari {rooms.total} fasilitas</p><nav aria-label="Halaman fasilitas" className="flex gap-2">{rooms.links.map((link, index) => link.url ? <Link key={index} href={link.url} preserveScroll className={`rounded border px-3 py-1.5 ${link.active ? 'border-teal-dark-01 bg-teal-dark-01 text-white-01' : 'border-gray-300 text-teal-darker'}`}>{pageLabel(link.label)}</Link> : <span key={index} className="rounded border border-gray-200 px-3 py-1.5 text-gray-400">{pageLabel(link.label)}</span>)}</nav></div>
                </section>
            </div>
        </AdminLayout>
        {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') setEditing(null); }}><div role="dialog" aria-modal="true" aria-labelledby="edit-facility-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white-01 p-6 shadow-xl"><h2 id="edit-facility-title" className="text-xl font-bold text-teal-darker">Ubah fasilitas</h2><form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2"><FacilityFields form={editForm} types={types} prefix="edit" /><div className="flex justify-end gap-3 sm:col-span-2"><button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold">Batal</button><button type="submit" disabled={editForm.processing} className={buttonClass}>{editForm.processing ? 'Menyimpan...' : 'Simpan perubahan'}</button></div></form></div></div>}
    </>;
}
