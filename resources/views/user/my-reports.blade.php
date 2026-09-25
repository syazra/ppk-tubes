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

    <!-- Right main content: Title Bar Kustom -->
    <x-title-bar 
        title="Riwayat Laporan Saya" 
        subtitle="Pantau status laporan kerusakan fasilitas yang telah kamu kirimkan." 
    />

    <!-- White Card Utama untuk Konten Tabel -->
    <x-white-card>
        <div class="flex justify-end">
            <a href="{{ route('reports.create') }}"
            class="bg-teal-normal-01 text-white-01 px-5 py-2 rounded-lg hover:bg-teal-normal-02">
                + Buat Laporan Baru
            </a>
        </div>

        {{-- Pesan Notifikasi Error --}}
        <!-- @if(session('success'))
            <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm flex items-center justify-between">
                <span>{{ session('success') }}</span>
            </div>
        @endif -->

        @if(session('error'))
            <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-center justify-between">
                <span>{{ session('error') }}</span>
            </div>
        @endif
    </x-white-card>

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
        @forelse($reports as $index => $report)
            <tr class="border-t">
                <!-- No -->
                <td class="px-5 py-4 text-gray-500">
                    {{ $index + 1 }}
                </td>
                
                <!-- Fasilitas -->
                <td class="px-5 py-4 font-medium text-gray-800">
                    {{ $report->room->name ?? 'Ruangan Dihapus' }}
                    <div class="text-xs text-gray-400">{{ $report->room->location ?? '-' }}</div>
                </td>
                
                <!-- Deskripsi -->
                <td class="px-5 py-4 text-gray-600 max-w-xs break-words whitespace-normal">
                    {{ $report->desc }}
                </td>
                
                <!-- Bukti Foto -->
                <td class="px-5 py-4">
                    @if($report->image)
                        <a href="{{ asset('storage/' . $report->image) }}" target="_blank" class="text-indigo-600 hover:underline text-xs font-semibold">
                            Lihat Foto
                        </a>
                    @else
                        <span class="text-gray-400 text-xs">Tidak ada</span>
                    @endif
                </td>
                
                <!-- Status -->
                <td class="px-5 py-4">
                    @if($report->status === 'menunggu')
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-700">
                            Menunggu
                        </span>
                    @elseif($report->status === 'disetujui')
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-700">
                            Disetujui
                        </span>
                    @elseif($report->status === 'dibatalkan')
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700">
                            Dibatalkan
                        </span>
                    @else
                        <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-700">
                            Ditolak
                        </span>
                    @endif
                </td>
                
                <!-- Tanggal -->
                <td class="px-5 py-4 text-gray-500 text-xs">
                    {{ $report->created_at->format('d M Y, H:i') }}
                </td>
                
                <!-- Aksi -->
                <td class="px-5 py-4 text-center">
                    @if($report->status === 'menunggu')
                        <form action="{{ route('reports.cancel', $report->id) }}" method="POST" onsubmit="return confirm('Apakah kamu yakin ingin membatalkan laporan ini?')">
                            @csrf
                            @method('PATCH')
                            <button type="submit" class="border border-red-500 bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1 rounded-lg transition text-xs">
                                Batalkan
                            </button>
                        </form>
                    @else
                        <span class="text-gray-400 italic text-xs">Tidak tersedia</span>
                    @endif
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="7" class="px-5 py-10 text-center text-gray-400">
                    Belum ada riwayat laporan yang kamu kirimkan.
                </td>
            </tr>
        @endforelse
    </x-table>

</x-app-layout>