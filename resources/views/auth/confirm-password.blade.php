<x-guest-layout>
    <div>
        <!-- Brand Logo Header -->
        <div class="flex flex-col items-center justify-center text-center mb-5">
            <x-pinjamin-logo size="md" class="justify-center mb-2" />
            <h1 class="text-xl font-bold text-teal-darker tracking-tight mt-1">Konfirmasi Kata Sandi</h1>
            <p class="text-xs text-gray-500 mt-1 max-w-xs">
                Ini adalah area aman aplikasi. Harap konfirmasikan kata sandi SSO Anda sebelum melanjutkan.
            </p>
        </div>

        <form method="POST" action="{{ route('password.confirm') }}" class="space-y-4">
            @csrf

            <!-- Password -->
            <div>
                <label for="password" class="block text-xs font-semibold text-teal-dark-03 mb-1">
                    Kata Sandi SSO
                </label>
                <div class="relative flex items-center">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-teal-dark-02">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </span>
                    <input id="password"
                           class="w-full pl-10 pr-4 py-2.5 bg-white-02 border border-teal-light-03/80 focus:border-teal-normal-01 focus:ring-2 focus:ring-teal-normal-01/20 rounded-xl text-sm text-teal-darker placeholder:text-gray-400 shadow-sm transition"
                           type="password"
                           name="password"
                           required
                           autocomplete="current-password"
                           placeholder="••••••••" />
                </div>
                <x-input-error :messages="$errors->get('password')" class="mt-1.5" />
            </div>

            <button type="submit"
                    class="w-full py-2.5 px-4 bg-teal-normal-01 hover:bg-teal-dark-01 text-white-01 rounded-xl text-sm font-semibold shadow-sm transition hover:shadow-md flex items-center justify-center gap-2 cursor-pointer">
                <span>Konfirmasi</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
            </button>
        </form>
    </div>
</x-guest-layout>
