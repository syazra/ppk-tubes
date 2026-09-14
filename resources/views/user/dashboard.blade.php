<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    <!-- Right main content -->
    <x-title-bar 
        title="Dashboard Mahasiswa / Dosen" 
        subtitle="Keterangan Dashboard Mahasiswa / Dosen" 
    />

    <x-white-card>
        <div class="p-6 text-teal-dark-01">
            Selamat datang, Mahasiswa / Dosen!
        </div>
    </x-white-card>

</x-app-layout>