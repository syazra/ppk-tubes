<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('operator.navbar')
    </x-slot>

    <!-- Main content -->
    <x-title-bar 
        title="Semua Reservasi" 
        subtitle="Lihat semua daftar reservasi fasilitas." 
    />

    <!-- Ringkasan reservasi -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-8 mt-0">
        <x-white-small-card>
            <div class="text-sm text-gray-500">Total Reservasi</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Sudah diproses</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Sedang diproses</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>

        <x-white-small-card>
            <div class="text-sm text-gray-500">Belum diproses</div>
            <div class="text-2xl font-bold text-teal-900">dummy</div>
        </x-white-small-card>
    </div>

    <!-- Table Reservasi -->
    <x-table>
        <!-- 1. Bagian Judul Kolom (Header Slot) -->
        <x-slot name="header">
            <th class="px-5 py-4 text-left">NAMA PEMINJAM</th>
            <th class="px-5 py-4 text-left">NAMA FASILITAS</th>
            <th class="px-5 py-4 text-left">TANGGAL & WAKTU</th>
            <th class="px-5 py-4 text-left">TUJUAN PENGGUNAAN</th>
            <th class="px-5 py-4 text-left">STATUS</th>
            <th class="px-5 py-4 text-left">AKSI</th>
        </x-slot>

        <!-- 2. Bagian Isi Data (Default Slot) -->
        @forelse($reservations as $reservation)
            <tr class="border-t">

                <!-- Nama Peminjam -->
                <td class="px-5 py-4">
                    <p class="font-semibold text-teal-900">{{ $reservation->user->name ?? '-' }}</p>
                    <p class="text-xs text-gray-400">{{ $reservation->user->email ?? '-' }}</p>
                </td>

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

                <!-- Aksi untuk Operator -->
                <td class="px-5 py-4 flex gap-2">
                    @if($reservation->status == 'menunggu')
                        <!-- Tombol Setujui -->
                        <form action="{{ route('operator.reservations.approve', $reservation->id) }}" method="POST">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600">
                                Setujui
                            </button>
                        </form>

                        <!-- Tombol Tolak -->
                        <form action="{{ route('operator.reservations.reject', $reservation->id) }}" method="POST">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600">
                                Tolak
                            </button>
                        </form>

                    @else
                        <span class="text-gray-400 text-xs">Selesai / Aksi tidak tersedia</span>
                    @endif
                </td>
                
            </tr>
        @empty
            <tr>
                <td colspan="5" class="text-center py-10 text-gray-400">
                    Belum ada reservasi yang masuk.
                </td>
            </tr>
        @endforelse
    </x-table>

    </div>
</x-app-layout>