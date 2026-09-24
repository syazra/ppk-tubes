<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @if($user->isAdmin())
            @include('admin.navbar')
        @elseif($user->isOperator())
            @include('operator.navbar')
        @elseif($user->isUser())
            @include('user.navbar')
        @else
            @include('guest.navbar')
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
