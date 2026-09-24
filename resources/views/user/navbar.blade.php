<!-- list navs -->
<x-navbar-link routes="user.dashboard">
    <x-heroicon-o-home class="w-5 h-5"/>
    <span>{{ __('Dashboard') }}</span>
</x-navbar-link>

<x-navbar-link routes="reports.index">
    <x-heroicon-o-document-text class="w-5 h-5"/>
    <span>{{ __('Laporan Saya') }}</span>
</x-navbar-link>

<x-navbar-link routes="profile.edit">
    <x-heroicon-o-user class="w-5 h-5"/>
    <span>{{ __('Profile') }}</span>
</x-navbar-link>