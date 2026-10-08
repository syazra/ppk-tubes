import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import ButtonGray from '../../components/ButtonGray';
import FilterTable from '../../components/FilterTable';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';
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

export default function Facilities({ user, csrfToken, urls, status, rooms, filters, types }) {
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
        <AppLayout
            user={user} 
            csrfToken={csrfToken} 
            urls={urls} 
            active="facilities" 
            title="Kelola Fasilitas" 
            subtitle="Tambah, perbarui, dan atur ketersediaan fasilitas kampus."
        >
            {status && <p role="status" className="rounded-xl border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</p>}
            
            {/* tambah fasilitas */}
            <section className="mb-6 w-full">
                <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm sm:p-8">
                    <h2 className="text-xl font-bold text-teal-darker">Tambah fasilitas</h2>
                    <form onSubmit={create} className="mt-5 grid gap-4 sm:grid-cols-2">
                        <FacilityFields form={createForm} types={types} prefix="create" />
                        <div className="sm:col-span-2"><Button type="submit" disabled={createForm.processing}>{createForm.processing ? 'Menyimpan...' : 'Tambah fasilitas'}</Button></div>
                    </form>
                </div>
            </section>

            {/* daftar fasilitas */}
            {/* <div className="mb-4 flex justify-end">
                <Link href={urls.recap} className="inline-flex items-center justify-center rounded-xl bg-teal-dark-01 px-5 py-3 text-sm font-semibold text-white-01 transition hover:bg-teal-dark-02 focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2 disabled:opacity-60">Lihat rekap</Link>
            </div> */}
            <FilterTable
                title="Daftar fasilitas"
                description="Fasilitas nonaktif tidak dapat dipesan. Riwayatnya tetap tersimpan."
                filterForm={filterForm}
                onSubmit={search}
                filterFields={[
                    { name: 'search', id: 'facility-search', label: 'Cari nama atau lokasi', placeholder: 'Cari nama atau lokasi' },
                    {
                        name: 'availability',
                        id: 'facility-status',
                        label: 'Status',
                        type: 'select',
                        options: [
                            { value: '', label: 'Semua' },
                            { value: 'active', label: 'Aktif' },
                            { value: 'inactive', label: 'Nonaktif' },
                        ],
                    },
                ]}
                rows={rooms}
                columns={[
                    { label: 'Fasilitas' },
                    { label: 'Lokasi' },
                    { label: 'Jenis' },
                    { label: 'Kapasitas' },
                    { label: 'Status' },
                    { label: 'Aksi' },
                ]}
                renderRow={room => (
                    <>
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-teal-darker">{room.name}</td>
                        <td className="whitespace-nowrap px-4 py-3">{room.location}</td>
                        <td className="whitespace-nowrap px-4 py-3">{room.type}</td>
                        <td className="whitespace-nowrap px-4 py-3">{room.capacity}</td>
                        <td className="whitespace-nowrap px-4 py-3">{room.is_avail ? 'Aktif' : 'Nonaktif'}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                            <button type="button" onClick={() => edit(room)} className="mr-4 font-semibold text-teal-dark-01 underline">Ubah</button>
                            <button type="button" disabled={changingId === room.id} onClick={() => changeAvailability(room)} className="font-semibold text-teal-dark-01 underline disabled:opacity-50">{room.is_avail ? 'Nonaktifkan' : 'Aktifkan'}</button>
                        </td>
                    </>
                )}
                emptyMessage="Tidak ada fasilitas yang cocok."
                recordLabel="fasilitas"
                paginationLabel="Navigasi halaman fasilitas"
            />
        </AppLayout>

        {editing && 
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') setEditing(null); }}><div role="dialog" aria-modal="true" aria-labelledby="edit-facility-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white-01 p-6 shadow-xl"><h2 id="edit-facility-title" className="text-xl font-bold text-teal-darker">Ubah fasilitas</h2><form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2"><FacilityFields form={editForm} types={types} prefix="edit" /><div className="flex justify-end gap-3 sm:col-span-2"><ButtonGray type="button" onClick={() => setEditing(null)}>Batal</ButtonGray><Button type="submit" disabled={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Simpan perubahan'}</Button></div></form></div></div>
        }
    </>;
}
