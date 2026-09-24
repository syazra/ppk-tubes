<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('guest.navbar')
    </x-slot>

    <!-- Right main content -->
    <x-title-bar 
        title="Dashboard Pengunjung" 
        subtitle="Keterangan Dashboard Pengunjung" 
    />

    <x-white-card>
        <div class="text-teal-dark-01">
            Selamat datang, Pengunjung!
        </div>
    </x-white-card>

</x-app-layout>