<!-- list navs -->
<x-navbar-link routes="operator.dashboard">
    <x-heroicon-o-home class="w-5 h-5"/>
    <span>{{ __('Beranda') }}</span>
</x-navbar-link>

<x-navbar-link routes="operator.reservations">
    <x-heroicon-o-calendar class="w-5 h-5"/>
    <span>{{ __('Semua Reservasi') }}</span>
</x-navbar-link>

<x-navbar-link routes="operator.reports">
    <x-heroicon-o-document-text class="w-5 h-5"/>
    <span>{{ __('Semua Laporan') }}</span>
</x-navbar-link>