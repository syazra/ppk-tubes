<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('admin.navbar')
    </x-slot>

    <x-title-bar
        title="Dashboard Admin"
        subtitle="Kelola akses mahasiswa ke Pinjamin."
    />

    <x-white-card>
        <div id="register-student" class="max-w-2xl p-6 sm:p-8">
            <h3 class="text-xl font-bold text-teal-darker">Registrasi Mahasiswa</h3>
            <p class="mt-1 text-sm text-gray-600">Buat akun mahasiswa dengan alamat email kampus yang valid.</p>

            @if (session('status'))
                <div role="status" class="mt-5 rounded-lg border border-teal-light-03 bg-teal-light-01 px-4 py-3 text-sm text-teal-darker">
                    {{ session('status') }}
                </div>
            @endif

            <form method="POST" action="{{ route('admin.students.store') }}" class="mt-6 space-y-5">
                @csrf
                <div>
                    <label for="name" class="mb-2 block text-sm font-semibold text-teal-darker">Nama lengkap</label>
                    <input id="name" name="name" type="text" value="{{ old('name') }}" required autocomplete="off"
                           class="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                    <x-input-error :messages="$errors->get('name')" class="mt-2" />
                </div>
                <div>
                    <label for="email" class="mb-2 block text-sm font-semibold text-teal-darker">Email mahasiswa</label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" required autocomplete="off"
                           placeholder="nama@students.kampus.ac.id"
                           class="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                    <p class="mt-2 text-xs text-gray-500">Harus menggunakan domain @students.kampus.ac.id.</p>
                    <x-input-error :messages="$errors->get('email')" class="mt-2" />
                </div>
                <div class="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label for="password" class="mb-2 block text-sm font-semibold text-teal-darker">Kata sandi awal</label>
                        <input id="password" name="password" type="password" required minlength="8" autocomplete="new-password"
                               class="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                        <x-input-error :messages="$errors->get('password')" class="mt-2" />
                    </div>
                    <div>
                        <label for="password_confirmation" class="mb-2 block text-sm font-semibold text-teal-darker">Ulangi kata sandi</label>
                        <input id="password_confirmation" name="password_confirmation" type="password" required autocomplete="new-password"
                               class="block w-full rounded-xl border-gray-300 bg-white-01 px-4 py-3 text-sm text-teal-darker focus:border-teal-dark-01 focus:ring-teal-dark-01" />
                    </div>
                </div>
                <button type="submit" class="rounded-xl bg-teal-dark-01 px-5 py-3 text-sm font-semibold text-white-01 transition hover:bg-teal-dark-02 focus:outline-none focus:ring-2 focus:ring-teal-dark-01 focus:ring-offset-2">
                    Buat akun mahasiswa
                </button>
            </form>
        </div>
    </x-white-card>

</x-app-layout>
