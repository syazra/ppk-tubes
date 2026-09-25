<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('operator.navbar')
    </x-slot>

    <!-- Header -->
    <div class="flex justify-between items-center mr-8">
        <x-title-bar 
            title="Beranda Operator" 
            subtitle="Selamat datang di halaman beranda operator CampuSpace." 
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

    <x-white-card>
        <div class="text-teal-dark-01">
            Selamat datang, Operator!
        </div>
    </x-white-card>

</x-app-layout>