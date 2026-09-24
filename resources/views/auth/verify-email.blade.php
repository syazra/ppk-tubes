<x-guest-layout>
    <div>
        <!-- Brand Logo Header -->
        <div class="flex flex-col items-center justify-center text-center mb-5">
            <x-pinjamin-logo size="md" class="justify-center mb-2" />
            <h1 class="text-xl font-bold text-teal-darker tracking-tight mt-1">Verifikasi Email Kampus</h1>
            <p class="text-xs text-gray-500 mt-1 max-w-xs">
                Terima kasih telah mengaktifkan akun SSO. Harap periksa kotak masuk email kampus Anda untuk tautan verifikasi.
            </p>
        </div>

        @if (session('status') == 'verification-link-sent')
            <div class="mb-4 p-3 bg-teal-light-01 border border-teal-light-03 rounded-xl text-xs text-teal-dark-01 font-medium">
                Tautan verifikasi baru telah dikirimkan ke email SSO kampus Anda.
            </div>
        @endif

        <div class="space-y-3 mt-4">
            <form method="POST" action="{{ route('verification.send') }}">
                @csrf
                <button type="submit"
                        class="w-full py-2.5 px-4 bg-teal-normal-01 hover:bg-teal-dark-01 text-white-01 rounded-xl text-sm font-semibold shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer">
                    <span>Kirim Ulang Email Verifikasi</span>
                </button>
            </form>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit"
                        class="w-full py-2 px-3 text-xs text-gray-500 hover:text-red-600 transition flex items-center justify-center gap-1 cursor-pointer">
                    <span>Keluar dari Akun</span>
                </button>
            </form>
        </div>
    </div>
</x-guest-layout>
