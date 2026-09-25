<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @if(auth()->check() && auth()->user()->role == 'admin')
            @include('admin.navbar')
        @elseif(auth()->check() && auth()->user()->role == 'user')
            @include('user.navbar')
        @else
            @include('default.navbar')
        @endif
    </x-slot>

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