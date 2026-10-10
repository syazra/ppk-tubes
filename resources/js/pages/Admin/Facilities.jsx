import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import ButtonGray from '../../components/ButtonGray';
import FilterTable from '../../components/FilterTable';
import UploadFile from '../../components/UploadFile';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';
const emptyRoom = { name: '', location: '', type: 'Ruang Kelas', capacity: '', desc: '', images: [], removed_image_ids: [] };

function pageLabel(label) {
    const text = label.replace('&laquo; ', '').replace(' &raquo;', '').trim();
    return { Previous: 'Sebelumnya', Next: 'Berikutnya' }[text] ?? text;
}

function FacilityFields({ form, types, prefix, photoLimits, capacityMax, existingImages = [] }) {
    const retained = existingImages.filter(image => !form.data.removed_image_ids.includes(image.id));
    const imageErrors = Object.entries(form.errors).filter(([key]) => key === 'images' || key.startsWith('images.') || key.startsWith('removed_image_ids')).map(([, message]) => message).join(' ');
    const fields = [
        ['name', 'Nama fasilitas', 'text'],
        ['location', 'Lokasi', 'text'],
        ['capacity', 'Kapasitas', 'number'],
    ];

    return <>
        {fields.map(([key, label, type]) => <div key={key}>
            <label htmlFor={`${prefix}-${key}`} className="block text-sm font-semibold text-teal-darker">{label}</label>
            <input id={`${prefix}-${key}`} type={type} min={type === 'number' ? 1 : undefined} max={type === 'number' ? capacityMax : undefined} step={type === 'number' ? 1 : undefined} minLength={type === 'text' ? 2 : undefined} maxLength={type === 'text' ? 100 : undefined} required value={form.data[key]} onChange={event => form.setData(key, event.target.value)} className={inputClass} aria-invalid={Boolean(form.errors[key])} aria-describedby={`${prefix}-${key}-hint${form.errors[key] ? ` ${prefix}-${key}-error` : ''}`} />
            <p id={`${prefix}-${key}-hint`} className="mt-1 text-xs text-gray-500">{type === 'number' ? `Angka bulat 1–${capacityMax.toLocaleString('id-ID')} orang.` : '2–100 karakter.'}</p>
            {form.errors[key] && <p id={`${prefix}-${key}-error`} role="alert" className="mt-1 text-sm text-red-600">{form.errors[key]}</p>}
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
            <textarea id={`${prefix}-desc`} rows="3" maxLength={2000} value={form.data.desc} onChange={event => form.setData('desc', event.target.value)} className={inputClass} />
            {form.errors.desc && <p role="alert" className="mt-1 text-sm text-red-600">{form.errors.desc}</p>}
        </div>
        <div className="sm:col-span-2">
            {existingImages.length > 0 && <div className="mb-4 flex flex-wrap gap-3" aria-label="Foto tersimpan">
                {existingImages.map(image => {
                    const removed = form.data.removed_image_ids.includes(image.id);
                    return <div key={image.id} className={`w-28 ${removed ? 'opacity-50' : ''}`}>
                        <img src={image.url || '/images/facility-placeholder.svg'} alt={image.alt_text} className="h-24 w-28 rounded-lg object-cover" />
                        <button type="button" disabled={form.processing} className="mt-1 text-sm font-semibold text-teal-dark-01 underline" onClick={() => form.setData('removed_image_ids', removed ? form.data.removed_image_ids.filter(id => id !== image.id) : [...form.data.removed_image_ids, image.id])}>{removed ? 'Batalkan hapus' : 'Hapus foto'}</button>
                    </div>;
                })}
            </div>}
            <UploadFile label="Foto fasilitas (opsional)" name="images" accept="image/jpeg,image/png,image/webp" multiple value={form.data.images} onChange={files => form.setData('images', files)} error={imageErrors} helperText={`Maksimal ${photoLimits.count} foto, masing-masing 2 MB. JPG, JPEG, PNG, atau WebP; maksimal 6.000 × 6.000 piksel.`} maxFiles={Math.max(0, photoLimits.count - retained.length)} maxSizeBytes={photoLimits.sizeBytes} allowedTypes={['image/jpeg', 'image/png', 'image/webp']} disabled={form.processing} />
            {form.progress && <p role="status" className="mt-2 text-sm text-teal-darker">Mengunggah: {form.progress.percentage}%</p>}
        </div>
    </>;
}

export default function Facilities({ user, csrfToken, urls, status, rooms, filters, types, photoLimits, capacityMax }) {
    const createForm = useForm({ ...emptyRoom });
    const editForm = useForm({ ...emptyRoom });
    const filterForm = useForm({ search: filters.search, availability: filters.availability });
    const [editing, setEditing] = useState(null);
    const [changingId, setChangingId] = useState(null);

    function create(event) {
        event.preventDefault();
        createForm.post(urls.facilities, { forceFormData: true, preserveScroll: true, onSuccess: () => createForm.reset() });
    }

    function edit(room) {
        setEditing(room);
        editForm.setData({ name: room.name, location: room.location, type: room.type, capacity: room.capacity, desc: room.desc ?? '', images: [], removed_image_ids: [] });
        editForm.clearErrors();
    }

    function save(event) {
        event.preventDefault();
        editForm.transform(data => ({ ...data, _method: 'put' })).post(`${urls.facilities}/${editing.id}`, { forceFormData: true, preserveScroll: true, onSuccess: () => setEditing(null) });
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
                        <FacilityFields form={createForm} types={types} prefix="create" photoLimits={photoLimits} capacityMax={capacityMax} />
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
                            <button type="button" disabled={changingId === room.id} onClick={() => changeAvailability(room)} className="font-semibold text-red-600 underline disabled:opacity-50">{room.is_avail ? 'Nonaktifkan' : 'Aktifkan'}</button>
                        </td>
                    </>
                )}
                emptyMessage="Tidak ada fasilitas yang cocok."
                recordLabel="fasilitas"
                paginationLabel="Navigasi halaman fasilitas"
            />
        </AppLayout>

        {editing && 
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') setEditing(null); }}><div role="dialog" aria-modal="true" aria-labelledby="edit-facility-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white-01 p-6 shadow-xl"><h2 id="edit-facility-title" className="text-xl font-bold text-teal-darker">Ubah fasilitas</h2><form onSubmit={save} className="mt-5 grid gap-4 sm:grid-cols-2"><FacilityFields form={editForm} types={types} prefix="edit" photoLimits={photoLimits} capacityMax={capacityMax} existingImages={editing.images} /><div className="flex justify-end gap-3 sm:col-span-2"><ButtonGray type="button" onClick={() => setEditing(null)}>Batal</ButtonGray><Button type="submit" disabled={editForm.processing}>{editForm.processing ? 'Menyimpan...' : 'Simpan perubahan'}</Button></div></form></div></div>
        }
    </>;
}
