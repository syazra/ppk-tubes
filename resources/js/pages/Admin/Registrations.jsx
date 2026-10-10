import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import Button from '../../components/Button';
import ButtonGray from '../../components/ButtonGray';
import FilterTable from '../../components/FilterTable';
import AccountFields from '../../components/AccountFields';

const accountTypes = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'staf', label: 'Staf' },
    { value: 'petugas', label: 'Petugas' },
];

function accountTypeLabel(value) {
    return accountTypes.find(type => type.value === value)?.label ?? 'Belum diklasifikasi';
}

function formatCreatedAt(value) {
    return value
        ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
        : '—';
}

export default function Registrations({ user, csrfToken, urls, createdAccount, status, accounts, filters, identityLengths }) {
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
                                <AccountFields form={createForm} identityLengths={identityLengths} />
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
                            <AccountFields form={editForm} prefix="edit-" identityLengths={identityLengths} />
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
