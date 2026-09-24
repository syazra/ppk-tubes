<x-guest-layout>
    <div x-data="{
        showPassword: false,
        fillDemo(email) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = 'password';
            document.getElementById('password').focus();
        }
    }">
        <header class="mb-8 text-center">
            <x-pinjamin-logo size="md" class="justify-center" />
            <h1 class="mt-7 text-3xl font-bold tracking-tight text-teal-darker">Selamat datang kembali</h1>
            <p class="mt-2 text-sm leading-6 text-gray-600">Masuk untuk mengelola peminjaman fasilitas kampus.</p>
        </header>

        <x-auth-session-status class="mb-5" :status="session('status')" />

        <form method="POST" action="{{ route('login') }}" class="space-y-5">
            @csrf
            <div>
                <label for="email" class="mb-2 block text-sm font-semibold text-teal-darker">Email kampus</label>
                <input id="email" name="email" type="email" value="{{ old('email') }}" required autofocus autocomplete="username"
                       placeholder="nama@students.kampus.ac.id"
                       class="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 text-sm text-teal-darker placeholder:text-gray-400 focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                <x-input-error :messages="$errors->get('email')" class="mt-2" />
            </div>
            <div>
                <label for="password" class="mb-2 block text-sm font-semibold text-teal-darker">Kata sandi</label>
                <div class="relative">
                    <input id="password" name="password" type="password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password"
                           class="block w-full rounded-xl border-gray-300 bg-white px-4 py-3 pr-24 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                    <button type="button" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                            class="absolute inset-y-0 right-3 px-2 text-xs font-semibold text-teal-dark-01 hover:underline" x-text="showPassword ? 'Sembunyikan' : 'Lihat'"></button>
                </div>
                <x-input-error :messages="$errors->get('password')" class="mt-2" />
            </div>
            <label for="remember_me" class="flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input id="remember_me" name="remember" type="checkbox" class="rounded border-gray-300 text-teal-dark-01 focus:ring-teal-dark-01" />
                Ingat saya
            </label>
            <button type="submit" class="w-full rounded-xl bg-teal-dark-01 px-4 py-3 text-sm font-semibold text-white-01 shadow-sm transition hover:bg-teal-dark-02 focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2">Masuk</button>
        </form>

        <div class="mt-7 border-t border-gray-200 pt-5 text-center text-sm">
            @if (Route::has('guest.dashboard'))
                <a href="{{ route('guest.dashboard') }}" class="font-medium text-gray-600 hover:text-teal-dark-01 hover:underline">Jelajahi sebagai pengunjung</a>
            @endif
            @env('local')
            <details class="mt-5 text-left text-gray-600">
                <summary class="cursor-pointer text-center text-xs font-medium hover:text-teal-dark-01">Gunakan akun demo</summary>
                <p class="mt-3 text-xs leading-5">Pilih peran untuk mengisi formulir. Kata sandi demo: <strong>password</strong>.</p>
                <div class="mt-3 grid grid-cols-2 gap-2">
                    <button type="button" @click="fillDemo('student@students.kampus.ac.id')" class="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs hover:border-teal-dark-01 hover:bg-teal-light-01">Mahasiswa</button>
                    <button type="button" @click="fillDemo('lecturer@lecturer.kampus.ac.id')" class="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs hover:border-teal-dark-01 hover:bg-teal-light-01">Dosen</button>
                    <button type="button" @click="fillDemo('operator@operator.kampus.ac.id')" class="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs hover:border-teal-dark-01 hover:bg-teal-light-01">Operator</button>
                    <button type="button" @click="fillDemo('admin@admin.kampus.ac.id')" class="rounded-lg border border-gray-200 px-3 py-2 text-left text-xs hover:border-teal-dark-01 hover:bg-teal-light-01">Admin</button>
                </div>
            </details>
            @endenv
        </div>
    </div>
</x-guest-layout>
