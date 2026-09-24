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

    <!-- Right main content: Title Bar Kustom -->
    <x-title-bar 
        title="Riwayat Laporan Saya" 
        subtitle="Pantau status laporan kerusakan fasilitas yang telah kamu kirimkan." 
    />

    <!-- White Card Utama untuk Konten Tabel -->
    <x-white-card>
        <div class="flex justify-between items-center mb-6 border-b pb-4">
            <div>
                <h3 class="text-xl font-bold text-gray-800">Daftar Pengaduan Kerusakan</h3>
                <p class="text-sm text-gray-500 mt-1">Daftar riwayat laporan yang telah diurutkan dari yang terlama.</p>
            </div>
            <a href="{{ route('reports.create') }}" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm shadow-sm transition">
                + Buat Laporan Baru
            </a>
        </div>

        {{-- Pesan Notifikasi Sukses / Error --}}
        @if(session('success'))
            <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm flex items-center justify-between">
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if(session('error'))
            <div class="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm flex items-center justify-between">
                <span>{{ session('error') }}</span>
            </div>
        @endif

        {{-- Tabel Daftar Laporan --}}
        <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fasilitas / Ruangan</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bukti Foto</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 text-sm">
                    @forelse($reports as $index => $report)
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-500">{{ $index + 1 }}</td>
                            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                                {{ $report->room->name ?? 'Ruangan Dihapus' }}
                                <div class="text-xs text-gray-400">{{ $report->room->location ?? '-' }}</div>
                            </td>
                            <td class="px-6 py-4 text-gray-600 max-w-xs break-words whitespace-normal">
                                {{ $report->desc }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if($report->image)
                                    <a href="{{ asset('storage/' . $report->image) }}" target="_blank" class="text-indigo-600 hover:underline text-xs font-semibold">
                                        Lihat Foto
                                    </a>
                                @else
                                    <span class="text-gray-400 text-xs">Tidak ada</span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                @if($report->status === 'menunggu')
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                        Menunggu
                                    </span>
                                @elseif($report->status === 'disetujui')
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Disetujui
                                    </span>
                                @elseif($report->status === 'dibatalkan')
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Dibatalkan
                                    </span>
                                @else
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                        Ditolak
                                    </span>
                                @endif
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                                {{ $report->created_at->format('d M Y, H:i') }}
                            </td>
                            
                            {{-- Tombol Batalkan --}}
                            <td class="px-6 py-4 whitespace-nowrap text-center text-xs">
                                @if($report->status === 'menunggu')
                                    <form action="{{ route('reports.cancel', $report->id) }}" method="POST" onsubmit="return confirm('Apakah kamu yakin ingin membatalkan laporan ini?')">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit" class="bg-red-50 hover:bg-red-100 text-red-600 font-medium px-3 py-1.5 rounded-md transition">
                                            Batalkan
                                        </button>
                                    </form>
                                @else
                                    <span class="text-gray-400 italic">Tidak dapat dibatalkan</span>
                                @endif
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="px-6 py-8 text-center text-gray-400">
                                Belum ada riwayat laporan yang kamu kirimkan.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-white-card>
</x-app-layout>