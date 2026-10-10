import { useForm } from '@inertiajs/react';
import AuthPanel from '../../components/AuthPanel';

export default function VerifyEmail({ status, sendUrl, logoutUrl }) {
    const form = useForm({});

    function submit(event) {
        event.preventDefault();
        form.post(sendUrl);
    }

    return (
        <AuthPanel title="Verifikasi Email" description="Periksa kotak masuk email Anda untuk tautan verifikasi akun." logoutUrl={logoutUrl}>
            {status === 'verification-link-sent' && <p role="status" className="mb-4 rounded-lg bg-teal-light-01 p-3 text-sm text-teal-dark-01">Tautan verifikasi baru telah dikirimkan ke email Anda.</p>}
            <form onSubmit={submit}>
                <button type="submit" disabled={form.processing} className="w-full rounded-lg bg-teal-dark-01 px-4 py-3 font-semibold text-white-01 hover:bg-teal-darker disabled:opacity-60">
                    {form.processing ? 'Mengirim…' : 'Kirim ulang email verifikasi'}
                </button>
            </form>
        </AuthPanel>
    );
}
