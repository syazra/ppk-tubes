<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('operator.navbar')
    </x-slot>

    <!-- Right main content -->
    <x-title-bar 
        title="Dashboard Operator" 
        subtitle="Keterangan Dashboard Operator" 
    />

    <x-white-card>
        <div class="text-teal-dark-01">
            Selamat datang, Operator!
        </div>
    </x-white-card>

</x-app-layout>