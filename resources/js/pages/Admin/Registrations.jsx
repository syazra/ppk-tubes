import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import ButtonGray from '../../components/ButtonGray';
import FilterTable from '../../components/FilterTable';

const inputClass = 'mt-1 block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01';
const accountTypes = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'staf', label: 'Staf' },
    { value: 'petugas', label: 'Petugas' },
];

function FieldError({ id, message }) {
    return message ? <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{message}</p> : null;
}

function accountTypeLabel(value) {
    return accountTypes.find(type => type.value === value)?.label ?? 'Belum diklasifikasi';
}

function formatCreatedAt(value) {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
        : '—';
}

export default function Registrations({ user, csrfToken, urls, createdAccount, status, accounts, filters }) {
    const currentUser = user;
    const [copied, setCopied] = useState(false);
    const [editing, setEditing] = useState(null);
    const createForm = useForm({ account_type: 'mahasiswa', name: '', identity_number: '', email: '' });
    const filterForm = useForm({ search: filters.search, type: filters.type });
    const editForm = useForm({ account_type: '', name: '', identity_number: '', email: '' });
    const deleteForm = useForm({});

    function submit(event) {
        event.preventDefault();
        createForm.post(urls.registrationStore, { onSuccess: () => createForm.reset() });
    }

    function applyFilters(event) {
        event.preventDefault();
        filterForm.get(urls.registrations, { preserveState: true, preserveScroll: true, replace: true });
    }

    function openEdit(account) {
        setEditing(account);
        editForm.setData({
            account_type: account.account_type ?? '',
            name: account.name,
            identity_number: account.identity_number ?? '',
            email: account.email,
        });
        editForm.clearErrors();
    }

    function saveEdit(event) {
        event.preventDefault();
        editForm.put(`${urls.accounts}/${editing.id}`, {
            preserveScroll: true,
            onSuccess: () => setEditing(null),
        });
    }

    function deleteAccount(account) {
        if (!window.confirm(`Hapus akun ${account.name}?`)) return;

        deleteForm.delete(`${urls.accounts}/${account.id}`, { preserveScroll: true });
    }

    async function copyPassword() {
        await navigator.clipboard.writeText(createdAccount.password);
        setCopied(true);
    }

    const identityLabel = createForm.data.account_type === 'mahasiswa' ? 'Nomor Induk Mahasiswa (NIM)' : 'Nomor Induk Pegawai (NIP)';

    return (
        <>
            <Head title="Kelola Akun" />
            <AppLayout
                user={currentUser} 
                csrfToken={csrfToken} 
                urls={urls} 
                active="registrations" 
                title="Kelola Registrasi Akun" 
                subtitle="Buat dan kelola akun seluruh pengguna yang ada di Buana.">

                {/* DAFTARKAN AKUN BARU */}
                <section className="mb-6 w-full">
                    {createdAccount && (
                        <div role="status" className="mb-5 rounded-lg border border-teal-light-03 bg-teal-light-01 p-5 text-teal-darker">
                            <h2 className="font-bold">Akun berhasil dibuat</h2>
                            <p className="mt-1 text-sm">Simpan kata sandi ini dan berikan kepada <span className="font-bold text-teal-darker">{createdAccount.name}</span>. Kata sandi hanya ditampilkan setelah pembuatan akun.</p>
                            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                <div>
                                    <dt className="font-semibold">Jenis akun</dt>
                                    <dd className="text-teal-dark-03">{accountTypeLabel(createdAccount.account_type)}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">Nomor induk</dt>
                                    <dd className="text-teal-dark-03">{createdAccount.identity_number}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">Email</dt>
                                    <dd className="text-teal-dark-03">{createdAccount.email}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold">Kata sandi sementara</dt>
                                    <dd className="flex items-center gap-4 text-teal-dark-03">
                                        <code className="rounded bg-white px-2 py-1 font-mono">{createdAccount.password}</code>
                                        <button type="button" onClick={copyPassword} className="underline">
                                            {copied ? 'Tersalin' : 'Salin'}
                                        </button>
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                    {status && <div role="status" className="mb-5 rounded-lg border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                    <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-teal-darker">Buat akun pengguna</h2>
                        <p className="mt-1 text-sm text-gray-600">Kata sandi dibuat otomatis oleh sistem setelah formulir disimpan.</p>

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Tipe akun */}
                                <div>
                                    <label htmlFor="account_type" className="mb-2 block text-sm font-semibold text-teal-darker">Jenis akun</label>
                                    <select id="account_type" name="account_type" value={createForm.data.account_type} onChange={event => createForm.setData('account_type', event.target.value)} required className={inputClass} aria-invalid={Boolean(createForm.errors.account_type)} aria-describedby={createForm.errors.account_type ? 'account_type-error' : undefined}>
                                        {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                    </select>
                                    <FieldError id="account_type" message={createForm.errors.account_type} />
                                </div>
                                {/* Nama */}
                                <div>
                                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                                    <input id="name" name="name" type="text" value={createForm.data.name} onChange={event => createForm.setData('name', event.target.value)} required autoComplete="name" className={inputClass} aria-invalid={Boolean(createForm.errors.name)} aria-describedby={createForm.errors.name ? 'name-error' : undefined} />
                                    <FieldError id="name" message={createForm.errors.name} />
                                </div>
                                {/* NIP/NIK */}
                                <div>
                                    <label htmlFor="identity_number" className="mb-2 block text-sm font-semibold text-teal-darker">{identityLabel}</label>
                                    <input id="identity_number" name="identity_number" type="text" value={createForm.data.identity_number} onChange={event => createForm.setData('identity_number', event.target.value)} required autoComplete="off" className={inputClass} aria-invalid={Boolean(createForm.errors.identity_number)} aria-describedby={createForm.errors.identity_number ? 'identity_number-error' : undefined} />
                                    <FieldError id="identity_number" message={createForm.errors.identity_number} />
                                </div>
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="mb-2 block text-sm font-semibold text-teal-darker">Email</label>
                                    <input id="email" name="email" type="email" value={createForm.data.email} onChange={event => createForm.setData('email', event.target.value)} required autoComplete="email" className={inputClass} aria-invalid={Boolean(createForm.errors.email)} aria-describedby={createForm.errors.email ? 'email-error' : undefined} />
                                    <FieldError id="email" message={createForm.errors.email} />
                                </div>
                            </div>
                            
                            <Button type="submit" disabled={createForm.processing}>
                                {createForm.processing ? 'Menyimpan...' : 'Daftarkan akun'}
                            </Button>
                        </form>
                    </div>
                </section>

                {/* FILTERING DAN LIHAT SEMUA AKUN */}
                <FilterTable
                    title="Daftar mahasiswa, dosen, staf, dan petugas."
                    description=""
                    filterForm={filterForm}
                    onSubmit={applyFilters}
                    filterFields={[
                        { name: 'search', id: 'account-search', label: 'Cari nama, nomor induk, atau email', placeholder: 'Cari nama, nomor induk, atau email' },
                        {
                            name: 'type',
                            id: 'account-filter',
                            label: 'Filter jenis akun',
                            type: 'select',
                            options: [{ value: '', label: 'Semua jenis akun' }, ...accountTypes],
                        },
                    ]}
                    rows={accounts}
                    columns={[
                        { label: 'Jenis akun' },
                        { label: 'Nama' },
                        { label: 'NIM/NIP' },
                        { label: 'Email' },
                        { label: 'Tanggal dibuat' },
                        { label: 'Aksi' },
                    ]}
                    renderRow={account => (
                        <>
                            <td className="whitespace-nowrap px-4 py-3">{accountTypeLabel(account.account_type)}</td>
                            <td className="whitespace-nowrap px-4 py-3 font-medium text-teal-darker">{account.name}</td>
                            <td className="whitespace-nowrap px-4 py-3">{account.identity_number || '—'}</td>
                            <td className="whitespace-nowrap px-4 py-3">{account.email}</td>
                            <td className="whitespace-nowrap px-4 py-3">{formatCreatedAt(account.created_at)}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => openEdit(account)} className="font-medium text-teal-dark-01 underline">Ubah</button>
                                    <button type="button" onClick={() => deleteAccount(account)} disabled={deleteForm.processing} className="font-medium text-red-600 underline disabled:opacity-60">Hapus</button>
                                </div>
                            </td>
                        </>
                    )}
                    emptyMessage="Tidak ada akun yang cocok dengan filter."
                    errorMessage={deleteForm.errors.delete}
                    recordLabel="akun"
                    paginationLabel="Navigasi halaman akun"
                />
            </AppLayout>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') setEditing(null); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="edit-account-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white-01 p-6 shadow-xl">
                        <h2 id="edit-account-title" className="text-xl font-bold text-teal-darker">Ubah akun</h2>
                        <form onSubmit={saveEdit} className="mt-5 space-y-4">
                            {/* jenis */}
                            <div>
                                <label htmlFor="edit-account-type" className="block text-sm font-semibold text-teal-darker">Jenis akun</label>
                                <select id="edit-account-type" value={editForm.data.account_type} onChange={event => editForm.setData('account_type', event.target.value)} className={inputClass} required>
                                    <option value="" disabled>Pilih jenis akun</option>
                                    {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                                <FieldError id="edit-account-type" message={editForm.errors.account_type} />
                            </div>
                            {/* nama */}
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                                <input id="edit-name" value={editForm.data.name} onChange={event => editForm.setData('name', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-name" message={editForm.errors.name} />
                            </div>
                            {/* nim/nip */}
                            <div>
                                <label htmlFor="edit-identity-number" className="block text-sm font-semibold text-teal-darker">NIM/NIP</label>
                                <input id="edit-identity-number" value={editForm.data.identity_number} onChange={event => editForm.setData('identity_number', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-identity-number" message={editForm.errors.identity_number} />
                            </div>
                            {/* email */}
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-semibold text-teal-darker">Email</label>
                                <input id="edit-email" type="email" value={editForm.data.email} onChange={event => editForm.setData('email', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-email" message={editForm.errors.email} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <ButtonGray type="button" onClick={() => setEditing(null)}>
                                    Batal
                                </ButtonGray>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Menyimpan...' : 'Simpan perubahan'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
