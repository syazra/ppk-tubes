<!-- list navs -->
<x-navbar-link routes="user.dashboard">
    <x-heroicon-o-home class="w-5 h-5"/>
    <span>{{ __('Beranda') }}</span>
</x-navbar-link>

<x-navbar-link routes="reservations.index">
    <x-heroicon-o-calendar class="w-5 h-5"/>
    <span>{{ __('Reservasi Saya') }}</span>
</x-navbar-link>

<x-navbar-link routes="reports.index">
    <x-heroicon-o-document-text class="w-5 h-5"/>
    <span>{{ __('Laporan Saya') }}</span>
</x-navbar-link>
