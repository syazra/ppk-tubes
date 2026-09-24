import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

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

export default function Registrations({ admin, csrfToken, urls, createdAccount, status, accounts, filters }) {
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
            <Head title="Registrasi Akun" />
            <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="registrations" title="Registrasi Akun" subtitle="Buat dan kelola akun pengguna serta petugas.">
                <section className="mb-6 max-w-4xl px-6 lg:px-8">
                    {createdAccount && (
                        <div role="status" className="mb-5 rounded-lg border border-teal-light-03 bg-teal-light-01 p-5 text-teal-darker">
                            <h2 className="font-semibold">Akun berhasil dibuat</h2>
                            <p className="mt-1 text-sm">Simpan password ini dan berikan kepada {createdAccount.name}. Password hanya ditampilkan setelah pembuatan akun.</p>
                            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                <div><dt className="font-medium">Jenis akun</dt><dd>{accountTypeLabel(createdAccount.account_type)}</dd></div>
                                <div><dt className="font-medium">Nomor induk</dt><dd>{createdAccount.identity_number}</dd></div>
                                <div><dt className="font-medium">Email</dt><dd>{createdAccount.email}</dd></div>
                                <div><dt className="font-medium">Password sementara</dt><dd className="flex items-center gap-2"><code className="rounded bg-white px-2 py-1 font-mono">{createdAccount.password}</code><button type="button" onClick={copyPassword} className="underline">{copied ? 'Tersalin' : 'Salin'}</button></dd></div>
                            </dl>
                        </div>
                    )}
                    {status && <div role="status" className="mb-5 rounded-lg border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">{status}</div>}

                    <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm sm:p-8">
                        <h2 className="text-xl font-bold text-teal-darker">Buat akun</h2>
                        <p className="mt-1 text-sm text-gray-600">Password dibuat otomatis oleh sistem setelah formulir disimpan.</p>

                        <form onSubmit={submit} className="mt-6 space-y-5">
                            <div>
                                <label htmlFor="account_type" className="mb-2 block text-sm font-semibold text-teal-darker">Jenis akun</label>
                                <select id="account_type" name="account_type" value={createForm.data.account_type} onChange={event => createForm.setData('account_type', event.target.value)} required className={inputClass} aria-invalid={Boolean(createForm.errors.account_type)} aria-describedby={createForm.errors.account_type ? 'account_type-error' : undefined}>
                                    {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                                <FieldError id="account_type" message={createForm.errors.account_type} />
                            </div>
                            <div>
                                <label htmlFor="name" className="mb-2 block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                                <input id="name" name="name" type="text" value={createForm.data.name} onChange={event => createForm.setData('name', event.target.value)} required autoComplete="name" className={inputClass} aria-invalid={Boolean(createForm.errors.name)} aria-describedby={createForm.errors.name ? 'name-error' : undefined} />
                                <FieldError id="name" message={createForm.errors.name} />
                            </div>
                            <div>
                                <label htmlFor="identity_number" className="mb-2 block text-sm font-semibold text-teal-darker">{identityLabel}</label>
                                <input id="identity_number" name="identity_number" type="text" value={createForm.data.identity_number} onChange={event => createForm.setData('identity_number', event.target.value)} required autoComplete="off" className={inputClass} aria-invalid={Boolean(createForm.errors.identity_number)} aria-describedby={createForm.errors.identity_number ? 'identity_number-error' : undefined} />
                                <FieldError id="identity_number" message={createForm.errors.identity_number} />
                            </div>
                            <div>
                                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-teal-darker">Email</label>
                                <input id="email" name="email" type="email" value={createForm.data.email} onChange={event => createForm.setData('email', event.target.value)} required autoComplete="email" className={inputClass} aria-invalid={Boolean(createForm.errors.email)} aria-describedby={createForm.errors.email ? 'email-error' : undefined} />
                                <FieldError id="email" message={createForm.errors.email} />
                            </div>
                            <button type="submit" disabled={createForm.processing} className="rounded-xl bg-teal-dark-01 px-5 py-3 text-sm font-semibold text-white-01 transition hover:bg-teal-dark-02 focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2 disabled:opacity-60">
                                {createForm.processing ? 'Menyimpan...' : 'Daftarkan akun'}
                            </button>
                        </form>
                    </div>
                </section>

                <section className="mb-8 max-w-7xl px-6 lg:px-8">
                    <div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm">
                        <div className="mb-5">
                            <h2 className="text-xl font-bold text-teal-darker">Data akun</h2>
                            <p className="mt-1 text-sm text-gray-600">Daftar mahasiswa, dosen, staf, dan petugas.</p>
                        </div>

                        <form onSubmit={applyFilters} className="mb-5 grid gap-3 md:grid-cols-[1fr_15rem_auto]">
                            <div>
                                <label htmlFor="account-search" className="sr-only">Cari nama, nomor induk, atau email</label>
                                <input id="account-search" type="search" value={filterForm.data.search} onChange={event => filterForm.setData('search', event.target.value)} placeholder="Cari nama, nomor induk, atau email" className={inputClass} />
                            </div>
                            <div>
                                <label htmlFor="account-filter" className="sr-only">Filter jenis akun</label>
                                <select id="account-filter" value={filterForm.data.type} onChange={event => filterForm.setData('type', event.target.value)} className={inputClass}>
                                    <option value="">Semua jenis akun</option>
                                    {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                            </div>
                            <button type="submit" disabled={filterForm.processing} className="rounded-xl border border-teal-dark-01 px-5 py-3 text-sm font-semibold text-teal-dark-01 hover:bg-teal-light-01 disabled:opacity-60">Terapkan filter</button>
                        </form>

                        {deleteForm.errors.delete && <p role="alert" className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{deleteForm.errors.delete}</p>}

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                                <thead className="bg-teal-light-01 text-xs uppercase tracking-wide text-teal-darker">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Jenis akun</th>
                                        <th scope="col" className="px-4 py-3">Nama</th>
                                        <th scope="col" className="px-4 py-3">NIM/NIP</th>
                                        <th scope="col" className="px-4 py-3">Email</th>
                                        <th scope="col" className="px-4 py-3">Tanggal dibuat</th>
                                        <th scope="col" className="px-4 py-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {accounts.data.map(account => (
                                        <tr key={account.id}>
                                            <td className="whitespace-nowrap px-4 py-3">{accountTypeLabel(account.account_type)}</td>
                                            <td className="whitespace-nowrap px-4 py-3 font-medium text-teal-darker">{account.name}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{account.identity_number || '—'}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{account.email}</td>
                                            <td className="whitespace-nowrap px-4 py-3">{formatCreatedAt(account.created_at)}</td>
                                            <td className="whitespace-nowrap px-4 py-3">
                                                <div className="flex gap-3">
                                                    <button type="button" onClick={() => openEdit(account)} className="font-medium text-teal-dark-01 underline">Edit</button>
                                                    <button type="button" onClick={() => deleteAccount(account)} disabled={deleteForm.processing} className="font-medium text-red-600 underline disabled:opacity-60">Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {accounts.data.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Tidak ada akun yang cocok dengan filter.</td></tr>}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
                            <p className="text-gray-600">Menampilkan {accounts.from ?? 0}–{accounts.to ?? 0} dari {accounts.total} akun</p>
                            <nav aria-label="Navigasi halaman akun" className="flex flex-wrap gap-1">
                                {accounts.links.map((link, index) => link.url
                                    ? <Link key={index} href={link.url} preserveState preserveScroll className={`rounded border px-3 py-1.5 ${link.active ? 'border-teal-dark-01 bg-teal-dark-01 text-white-01' : 'border-gray-300 text-teal-darker hover:bg-teal-light-01'}`}>{link.label.replace('&laquo; ', '').replace(' &raquo;', '')}</Link>
                                    : <span key={index} className="rounded border border-gray-200 px-3 py-1.5 text-gray-400">{link.label.replace('&laquo; ', '').replace(' &raquo;', '')}</span>)}
                            </nav>
                        </div>
                    </div>
                </section>
            </AdminLayout>

            {editing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') setEditing(null); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="edit-account-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white-01 p-6 shadow-xl">
                        <h2 id="edit-account-title" className="text-xl font-bold text-teal-darker">Edit akun</h2>
                        <form onSubmit={saveEdit} className="mt-5 space-y-4">
                            <div>
                                <label htmlFor="edit-account-type" className="block text-sm font-semibold text-teal-darker">Jenis akun</label>
                                <select id="edit-account-type" value={editForm.data.account_type} onChange={event => editForm.setData('account_type', event.target.value)} className={inputClass} required>
                                    <option value="" disabled>Pilih jenis akun</option>
                                    {accountTypes.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                                </select>
                                <FieldError id="edit-account-type" message={editForm.errors.account_type} />
                            </div>
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                                <input id="edit-name" value={editForm.data.name} onChange={event => editForm.setData('name', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-name" message={editForm.errors.name} />
                            </div>
                            <div>
                                <label htmlFor="edit-identity-number" className="block text-sm font-semibold text-teal-darker">NIM/NIP</label>
                                <input id="edit-identity-number" value={editForm.data.identity_number} onChange={event => editForm.setData('identity_number', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-identity-number" message={editForm.errors.identity_number} />
                            </div>
                            <div>
                                <label htmlFor="edit-email" className="block text-sm font-semibold text-teal-darker">Email</label>
                                <input id="edit-email" type="email" value={editForm.data.email} onChange={event => editForm.setData('email', event.target.value)} className={inputClass} required />
                                <FieldError id="edit-email" message={editForm.errors.email} />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700">Batal</button>
                                <button type="submit" disabled={editForm.processing} className="rounded-xl bg-teal-dark-01 px-5 py-2.5 text-sm font-semibold text-white-01 disabled:opacity-60">{editForm.processing ? 'Menyimpan...' : 'Simpan perubahan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
