<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @if(auth()->check() && auth()->user()->role == 'admin')
            <!-- Jika role user adalah admin -->
            @include('admin.navbar')
            
        @elseif(auth()->check() && auth()->user()->role == 'user')
            <!-- Jika role user adalah user biasa -->
            @include('user.navbar')
            
        @else
            <!-- Jika belum login atau role tidak dikenali (opsional) -->
            @include('default.navbar')
        @endif
    </x-slot>

    <!-- Right main content -->
    <x-title-bar 
        title="Edit Profil" 
        subtitle="Halaman untuk mengubah informasi profil" 
    />

    <x-white-card>
        <div class="max-w-xl">
            @include('profile.partials.update-profile-information-form')
        </div>
    </x-white-card>

    <x-white-card>
        <div class="max-w-xl">
            @include('profile.partials.update-password-form')
        </div>
    </x-white-card>

    <x-white-card>
        <div class="max-w-xl">
            @include('profile.partials.delete-user-form')
        </div>
    </x-white-card>
</x-app-layout>
