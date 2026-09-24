<!-- list navs -->
<x-navbar-link routes="admin.dashboard">
    <x-heroicon-o-home class="w-5 h-5"/>
    <span>{{ __('Dashboard') }}</span>
</x-navbar-link>

<a href="{{ route('admin.dashboard') }}#register-student"
   class="flex items-center gap-3 py-3 pl-4 pr-6 ml-4 rounded-l-full text-sm text-white-01 hover:bg-white/10">
    <x-heroicon-o-user-plus class="w-5 h-5"/>
    <span>Registrasi Mahasiswa</span>
</a>

<x-navbar-link routes="profile.edit">
    <x-heroicon-o-user class="w-5 h-5"/>
    <span>{{ __('Profile') }}</span>
</x-navbar-link>
