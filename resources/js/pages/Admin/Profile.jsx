import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-dark-01 focus:ring-teal-dark-01';
const primaryClass = 'rounded-md bg-teal-dark-01 px-4 py-2 text-sm font-semibold text-white-01 hover:bg-teal-dark-02 disabled:opacity-60';

function Field({ id, label, type = 'text', value, onChange, error, autoComplete, required = false }) {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
            <input id={id} name={id} type={type} value={value} onChange={onChange} autoComplete={autoComplete} required={required} className={inputClass} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
            {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}

function Card({ children }) {
    return <section className="mb-5 max-w-7xl px-6 lg:px-8"><div className="rounded-lg border border-green-light-03 bg-white-01 p-6 shadow-sm"><div className="max-w-xl">{children}</div></div></section>;
}

function ProfileInformation({ admin, status, urls, mustVerifyEmail, emailVerified }) {
    const form = useForm({ name: admin.name, email: admin.email });
    const verification = useForm({});

    useEffect(() => {
        form.setDefaults({ name: admin.name, email: admin.email });
    }, [admin.name, admin.email]);

    function submit(event) {
        event.preventDefault();
        form.patch(urls.profileUpdate, { preserveScroll: true });
    }

    return (
        <>
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            <p className="mt-1 text-sm text-gray-600">Update your account&apos;s profile information and email address.</p>
            <form onSubmit={submit} className="mt-6 space-y-6">
                <Field id="name" label="Name" value={form.data.name} onChange={e => form.setData('name', e.target.value)} error={form.errors.name} autoComplete="name" required />
                <div>
                    <Field id="email" label="Email" type="email" value={form.data.email} onChange={e => form.setData('email', e.target.value)} error={form.errors.email} autoComplete="username" required />
                    {mustVerifyEmail && !emailVerified && (
                        <div className="mt-2 text-sm text-gray-800">
                            Your email address is unverified.{' '}
                            <button type="button" onClick={() => verification.post(urls.verificationSend, { preserveScroll: true })} disabled={verification.processing} className="underline text-gray-600 hover:text-gray-900">Click here to re-send the verification email.</button>
                            {status === 'verification-link-sent' && <p className="mt-2 font-medium text-green-600">A new verification link has been sent to your email address.</p>}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={form.processing} className={primaryClass}>Save</button>
                    {status === 'profile-updated' && <p className="text-sm text-gray-600">Saved.</p>}
                </div>
            </form>
        </>
    );
}

function UpdatePassword({ status, urls }) {
    const form = useForm({ current_password: '', password: '', password_confirmation: '' });

    function submit(event) {
        event.preventDefault();
        form.put(urls.passwordUpdate, {
            errorBag: 'updatePassword',
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    return (
        <>
            <h2 className="text-lg font-medium text-gray-900">Update Password</h2>
            <p className="mt-1 text-sm text-gray-600">Ensure your account is using a long, random password to stay secure.</p>
            <form onSubmit={submit} className="mt-6 space-y-6">
                <Field id="current_password" label="Current Password" type="password" value={form.data.current_password} onChange={e => form.setData('current_password', e.target.value)} error={form.errors.current_password} autoComplete="current-password" />
                <Field id="password" label="New Password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} error={form.errors.password} autoComplete="new-password" />
                <Field id="password_confirmation" label="Confirm Password" type="password" value={form.data.password_confirmation} onChange={e => form.setData('password_confirmation', e.target.value)} error={form.errors.password_confirmation} autoComplete="new-password" />
                <div className="flex items-center gap-4">
                    <button type="submit" disabled={form.processing} className={primaryClass}>Save</button>
                    {status === 'password-updated' && <p className="text-sm text-gray-600">Saved.</p>}
                </div>
            </form>
        </>
    );
}

function DeleteAccount({ urls }) {
    const [open, setOpen] = useState(false);
    const passwordRef = useRef(null);
    const form = useForm({ password: '' });

    useEffect(() => {
        if (open) passwordRef.current?.focus();
    }, [open]);

    function close() {
        setOpen(false);
        form.reset();
        form.clearErrors();
    }

    function submit(event) {
        event.preventDefault();
        form.delete(urls.profileDestroy, {
            errorBag: 'userDeletion',
            preserveScroll: true,
            onError: () => setOpen(true),
        });
    }

    return (
        <>
            <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>
            <p className="mt-1 text-sm text-gray-600">Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.</p>
            <button type="button" onClick={() => setOpen(true)} className="mt-6 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Delete Account</button>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onKeyDown={event => { if (event.key === 'Escape') close(); }}>
                    <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                        <form onSubmit={submit}>
                            <h3 id="delete-account-title" className="text-lg font-medium text-gray-900">Are you sure you want to delete your account?</h3>
                            <p className="mt-1 text-sm text-gray-600">Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.</p>
                            <div className="mt-6">
                                <label htmlFor="delete-password" className="sr-only">Password</label>
                                <input ref={passwordRef} id="delete-password" name="password" type="password" value={form.data.password} onChange={e => form.setData('password', e.target.value)} placeholder="Password" className={`${inputClass} w-3/4`} aria-invalid={Boolean(form.errors.password)} aria-describedby={form.errors.password ? 'delete-password-error' : undefined} />
                                {form.errors.password && <p id="delete-password-error" className="mt-2 text-sm text-red-600">{form.errors.password}</p>}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={close} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700">Cancel</button>
                                <button type="submit" disabled={form.processing} className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">Delete Account</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Profile({ admin, status, csrfToken, urls, mustVerifyEmail, emailVerified }) {
    return (
        <>
            <Head title="Edit Profil" />
            <AdminLayout admin={admin} csrfToken={csrfToken} urls={urls} active="profile" title="Edit Profil" subtitle="Halaman untuk mengubah informasi profil">
                <Card><ProfileInformation admin={admin} status={status} urls={urls} mustVerifyEmail={mustVerifyEmail} emailVerified={emailVerified} /></Card>
                <Card><UpdatePassword status={status} urls={urls} /></Card>
                <Card><DeleteAccount urls={urls} /></Card>
            </AdminLayout>
        </>
    );
}
