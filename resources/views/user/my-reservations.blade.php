<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    @if (session('success'))
        <div x-data="{ show: true }" 
             x-init="setTimeout(() => show = false, 4000)" 
             x-show="show" 
             x-transition
             class="fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm text-teal-800 rounded-lg bg-teal-50 border border-teal-200 shadow-lg" 
             role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span class="sr-only">Info</span>
            <div>
                <span class="font-medium">Berhasil!</span> {{ session('success') }}
            </div>
            <button @click="show = false" type="button" class="ms-auto -mx-1.5 -my-1.5 bg-teal-50 text-teal-500 rounded-lg focus:ring-2 focus:ring-teal-400 p-1.5 hover:bg-teal-200 inline-flex items-center justify-center h-8 w-8">
                <span class="sr-only">Close</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    @endif

    <x-title-bar 
        title="Reservasi Saya" 
        subtitle="Lihat daftar fasilitas yang pernah kamu pinjam." 
    />

    <div>

    <!-- Tombol Tambah Reservasi -->
    <x-white-card>
        <div class="flex justify-end">
            <a href="{{ route('reservations.form') }}"
            class="bg-teal-normal-01 text-white-01 px-5 py-2 rounded-lg hover:bg-teal-normal-02">
                + Tambah Reservasi
            </a>
        </div>
    </x-white-card>

    <!-- Table Reservasi -->
    <x-table>
        <!-- 1. Bagian Judul Kolom (Header Slot) -->
        <x-slot name="header">
            <th class="px-5 py-4 text-left">NAMA FASILITAS</th>
            <th class="px-5 py-4 text-left">TANGGAL & WAKTU</th>
            <th class="px-5 py-4 text-left">TUJUAN PENGGUNAAN</th>
            <th class="px-5 py-4 text-left">STATUS</th>
            <th class="px-5 py-4 text-left">AKSI</th>
        </x-slot>

        <!-- 2. Bagian Isi Data (Default Slot) -->
        @forelse($reservations as $reservation)
            <tr class="border-t">
                
                <!-- Nama Fasilitas -->
                <td class="px-5 py-4">
                    <p class="font-semibold text-teal-900">{{ $reservation->room->name ?? '-' }}</p>
                    <p class="text-xs text-gray-400">{{ ucfirst($reservation->room->type ?? '') }}</p>
                </td>

                <!-- Tanggal dan Waktu -->
                <td class="px-5 py-4 text-teal-600">
                    <p>{{ \Carbon\Carbon::parse($reservation->date_to_reserv)->format('d F Y') }}</p>
                    <p class="text-xs text-gray-500">{{ $reservation->start_time }} - {{ $reservation->end_time }}</p>
                </td>

                <!-- Tujuan -->
                <td class="px-5 py-4 text-gray-600">
                    {{ $reservation->desc }}
                </td>

                <!-- Status -->
                <td class="px-5 py-4">
                    @if($reservation->status == 'disetujui')
                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">Disetujui</span>
                    @elseif($reservation->status == 'ditolak')
                        <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">Ditolak</span>
                    @elseif($reservation->status == 'dibatalkan')
                        <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs">Dibatalkan</span>
                    @else
                        <span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">Menunggu</span>
                    @endif
                </td>

                <!-- Aksi -->
                <td class="px-5 py-4">
                    @if($reservation->status == 'disetujui')
                        <a href="{{ route('reservations.ticket', $reservation->id) }}" class="border border-blue-400 text-blue-500 rounded-lg px-3 py-1 text-xs">Lihat tiket</a>
                    @elseif($reservation->status == 'menunggu')
                        <form action="{{ route('reservations.cancel', $reservation->id) }}" method="POST">
                            @csrf
                            @method('PATCH')
                            <button type="submit" onclick="return confirm('Yakin ingin membatalkan reservasi ini?')" class="border border-red-500 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg px-3 py-1 text-xs">
                                Batalkan
                            </button>
                        </form>
                    @else
                        <span class="text-gray-400 text-xs">Tidak tersedia</span>
                    @endif
                </td>
                
            </tr>
        @empty
            <tr>
                <td colspan="5" class="text-center py-10 text-gray-400">
                    Belum ada reservasi
                </td>
            </tr>
        @endforelse
    </x-table>

    </div>
</x-app-layout>