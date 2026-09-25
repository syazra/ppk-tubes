<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('operator.navbar')
    </x-slot>

    <!-- Right main content: Title Bar Kustom -->
    <x-title-bar 
        title="Semua Laporan" 
        subtitle="Lihat semua daftar laporan kerusakan fasilitas." 
    />

    <!-- Ringkasan laporan -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-8 mt-0">
        <x-white-small-card>
            <div class="text-sm text-gray-500">Total Laporan</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Disetujui</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Ditolak</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Menunggu</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>
    </div>

    <!-- Table Pelaporan -->
    <x-table>
        <!-- Slot Header -->
        <x-slot name="header">
            <th class="px-5 py-4 text-left">NO</th>
            <th class="px-5 py-4 text-left">FASILITAS / RUANGAN</th>
            <th class="px-5 py-4 text-left">DESKRIPSI</th>
            <th class="px-5 py-4 text-left">BUKTI FOTO</th>
            <th class="px-5 py-4 text-left">STATUS</th>
            <th class="px-5 py-4 text-left">TANGGAL</th>
            <th class="px-5 py-4 text-center">AKSI</th>
        </x-slot>

        <!-- Slot Body -->

    </x-table>

</x-app-layout>