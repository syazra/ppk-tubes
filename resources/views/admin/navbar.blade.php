<!-- list navs -->
<x-navbar-link routes="admin.dashboard">
    <x-heroicon-o-home class="w-5 h-5"/>
    <span>{{ __('Dashboard') }}</span>
</x-navbar-link>

<x-navbar-link routes="profile.edit">
    <x-heroicon-o-user class="w-5 h-5"/>
    <span>{{ __('Profile') }}</span>
</x-navbar-link>