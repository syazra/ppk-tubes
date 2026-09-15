<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('admin.navbar')
    </x-slot>

    <!-- Right main content -->
    <x-title-bar 
        title="Dashboard Admin" 
        subtitle="Keterangan Dashboard Admin" 
    />

    <x-white-card>
        <div class="text-teal-dark-01">
            Selamat datang, Admin!
        </div>
    </x-white-card>

</x-app-layout>