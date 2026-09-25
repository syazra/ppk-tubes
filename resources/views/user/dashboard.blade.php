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

    <!-- Header -->
    <div class="flex justify-between items-center mr-8">
        <x-title-bar 
            title="Beranda CampuSpace" 
            subtitle="Selamat datang di halaman beranda CampuSpace." 
        />

        <div class="flex items-center gap-4">
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input type="text" class="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500" placeholder="Cari reservasi atau laporan...">
            </div>
            <button class="p-2 border border-gray-200 rounded-lg text-teal-600 hover:bg-gray-50">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Cards Row -->
    <div class="grid grid-cols-2 gap-6 m-8 mt-0">
        <!-- Reservation Card -->
        <div class="bg-[#dcfce7] rounded-2xl p-8 relative overflow-hidden h-56 flex flex-col justify-between">
            <div class="z-10 w-2/3">
                <p class="text-teal-dark-01 font-medium">Butuh fasilitas?</p>
                <h2 class="font-inter font-bold text-2xl text-teal-darker leading-tight mb-6">Reservasi fasilitas di sini</h2>
                <a href="{{ route('reservations.form') }}" class="inline-block bg-[#a3e635] text-teal-darker font-semibold px-6 py-3 rounded-lg hover:bg-[#84cc16] transition-colors">
                    Mulai Reservasi
                </a>
            </div>
            <!-- Abstract decorative element mimicking the clipboard -->
            <div class="absolute right-[-20px] bottom-[-40px] w-56 h-72 bg-[#dd8857] rounded-lg opacity-60 rotate-12 flex items-center justify-center shadow-lg">
                <div class="w-48 h-60 bg-white rounded flex flex-col items-center pt-4 opacity-90 shadow-sm">
                    <div class="w-16 h-3 bg-gray-300 rounded-full mb-4"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-1/2 h-2 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>

        <!-- Report Card -->
        <div class="bg-[#cffafe] rounded-2xl p-8 relative overflow-hidden h-56 flex flex-col justify-between">
            <div class="z-10 w-2/3">
                <p class="text-teal-dark-01 font-medium">Menemukan fasilitas rusak?</p>
                <h2 class="font-inter font-bold text-2xl text-teal-darker leading-tight mb-6">Laporkan fasilitas di sini</h2>
                <a href="{{ route('reports.create') }}" class="inline-block bg-[#a3e635] text-teal-darker font-semibold px-6 py-3 rounded-lg hover:bg-[#84cc16] transition-colors">
                    Mulai Laporkan
                </a>
            </div>
            <!-- Abstract decorative element mimicking the inbox/arrow -->
            <!-- <div class="absolute right-4 bottom-4 w-40 h-40 flex flex-col items-center justify-end">
                <div class="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-500 mb-2 animate-bounce"></div>
                <div class="w-40 h-20 bg-white rounded-lg shadow-md border-b-[16px] border-[#38bdf8] relative overflow-hidden flex justify-center items-end pb-2">
                    <div class="w-24 h-12 bg-[#bae6fd] rounded-t-lg"></div>
                </div>
            </div> -->
            <div class="absolute right-[-20px] bottom-[-40px] w-56 h-72 bg-[#dd8857] rounded-lg opacity-60 rotate-12 flex items-center justify-center shadow-lg">
                <div class="w-48 h-60 bg-white rounded flex flex-col items-center pt-4 opacity-90 shadow-sm">
                    <div class="w-16 h-3 bg-gray-300 rounded-full mb-4"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-3/4 h-2 bg-gray-200 rounded-full mb-2"></div>
                    <div class="w-1/2 h-2 bg-gray-200 rounded-full"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- History Section -->
    <x-white-card class="!p-0 border border-gray-200 rounded-2xl overflow-hidden">
        <div class="flex divide-x divide-gray-200 min-h-[300px]">
            <!-- Reservation History -->
            <div class="w-1/2 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-teal-darker">Riwayat Reservasi</h3>
                    <a href="{{ route('reservations.index') }}" class="text-[#0ea5e9] text-sm font-semibold flex items-center hover:underline">
                        Lihat lainnya
                        <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
                
                <div class="space-y-4 flex-1">
                    @forelse($recentReservations ?? [] as $reservation)
                        <div class="flex justify-between items-center {{ $loop->first ? '' : 'pt-4 border-t border-gray-100' }}">
                            <div>
                                <h4 class="font-bold text-teal-darker">{{ $reservation->room->name ?? 'Ruangan' }}</h4>
                                <p class="text-xs text-gray-500 mb-1">{{ $reservation->room->type ?? 'Room' }}</p>
                                <p class="text-sm text-teal-normal-01">{{ \Carbon\Carbon::parse($reservation->date_to_reserv)->format('M d, Y') }}, {{ \Carbon\Carbon::parse($reservation->start_time)->format('H:i') }} - {{ \Carbon\Carbon::parse($reservation->end_time)->format('H:i') }}</p>
                            </div>
                            @php
                                $statusColors = [
                                    'disetujui' => 'bg-[#bbf7d0] text-teal-800',
                                    'menunggu' => 'bg-[#fef08a] text-yellow-800',
                                    'ditolak' => 'bg-[#fecaca] text-red-800',
                                    'dibatalkan' => 'bg-gray-200 text-gray-800',
                                ];
                                $color = $statusColors[strtolower($reservation->status)] ?? 'bg-gray-200 text-gray-800';
                            @endphp
                            <span class="px-3 py-1 {{ $color }} text-xs font-semibold rounded-full capitalize">{{ $reservation->status }}</span>
                        </div>
                    @empty
                        <div class="flex h-full items-center justify-center text-center mt-12">
                            <div>
                                <p class="text-gray-400 text-sm">Belum pernah membuat reservasi.</p>
                                <p class="text-gray-400 text-sm">Buat reservasi <a href="{{ route('reservations.form') }}" class="text-teal-normal-01 font-medium hover:underline">di sini</a>.</p>
                            </div>
                        </div>
                    @endforelse
                </div>
            </div>

            <!-- Report History -->
            <div class="w-1/2 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-teal-darker">Riwayat Laporan</h3>
                    <a href="{{ route('reports.index') }}" class="text-[#0ea5e9] text-sm font-semibold flex items-center hover:underline">
                        Lihat lainnya
                        <svg class="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                </div>
                
                @if(isset($recentReports) && $recentReports->isNotEmpty())
                    <div class="space-y-4 flex-1">
                        @foreach($recentReports as $report)
                            <div class="flex justify-between items-center {{ $loop->first ? '' : 'pt-4 border-t border-gray-100' }}">
                                <div>
                                    <h4 class="font-bold text-teal-900">{{ $report->room->name ?? 'Fasilitas' }}</h4>
                                    <p class="text-xs text-gray-500 mb-1">{{ Str::limit($report->desc, 50) }}</p>
                                    <p class="text-sm text-teal-500">{{ $report->created_at->format('M d, Y') }}</p>
                                </div>
                                @php
                                    $statusColors = [
                                        'diproses' => 'bg-[#fef08a] text-yellow-800',
                                        'selesai' => 'bg-[#bbf7d0] text-teal-800',
                                        'menunggu' => 'bg-gray-200 text-gray-800',
                                    ];
                                    $color = $statusColors[strtolower($report->status)] ?? 'bg-gray-200 text-gray-800';
                                @endphp
                                <span class="px-3 py-1 {{ $color }} text-xs font-semibold rounded-full capitalize">{{ $report->status }}</span>
                            </div>
                        @endforeach
                    </div>
                @else
                    <div class="flex-1 flex items-center justify-center text-center mt-12">
                        <div>
                            <p class="text-gray-400 text-sm">Belum pernah membuat laporan.</p>
                            <p class="text-gray-400 text-sm">Buat laporan <a href="{{ route('reports.create') }}" class="text-teal-500 font-medium hover:underline">di sini</a>.</p>
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </x-white-card>
</x-app-layout>