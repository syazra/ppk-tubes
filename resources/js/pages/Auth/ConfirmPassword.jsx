import { useForm } from '@inertiajs/react';
import AuthPanel from '../../components/AuthPanel';

export default function ConfirmPassword({ confirmUrl, logoutUrl }) {
    const form = useForm({ password: '' });

    function submit(event) {
        event.preventDefault();
        form.post(confirmUrl, { onFinish: () => form.reset('password') });
    }

    return (
        <AuthPanel title="Konfirmasi Kata Sandi" description="Konfirmasikan kata sandi Anda sebelum melanjutkan ke area aman aplikasi." logoutUrl={logoutUrl}>
            <form onSubmit={submit}>
                <label htmlFor="password" className="block text-sm font-semibold text-teal-darker">Kata sandi</label>
                <input id="password" name="password" type="password" autoComplete="current-password" autoFocus required value={form.data.password}
                    onChange={event => form.setData('password', event.target.value)} aria-invalid={Boolean(form.errors.password)} aria-describedby={form.errors.password ? 'password-error' : undefined}
                    className="mt-2 w-full rounded-lg border-gray-300 text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                {form.errors.password && <p id="password-error" role="alert" className="mt-2 text-sm text-red-700">{form.errors.password}</p>}
                <button type="submit" disabled={form.processing} className="mt-5 w-full rounded-lg bg-teal-dark-01 px-4 py-3 font-semibold text-white-01 hover:bg-teal-darker disabled:opacity-60">
                    {form.processing ? 'Memproses…' : 'Konfirmasi'}
                </button>
            </form>
        </AuthPanel>
    );
}
