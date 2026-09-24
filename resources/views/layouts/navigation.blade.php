<aside class="w-64 sticky top-0 h-screen bg-grad-teal-02 border-r border-teal-light-03 flex flex-col justify-between shrink-0">
    <div>
        <!--LOGO -->
        <div class="h-16 flex items-center px-6 border-b border-teal-light-03/40">
            <a href="{{ route('guest.dashboard') }}" class="flex items-center gap-3">
                <x-heroicon-o-academic-cap class="w-8 h-8 stroke-white-01"/>
                <span class="font-bold text-white-01 text-lg">CampuSpace</span>
            </a>
        </div>

        <!-- NAVIGATIONS -->
        <nav class="px-0 py-4 space-y-1">
            {{ $slot }}
        </nav>
        
    </div>

    <!-- PROFILE -->
    <div class="p-4 border-t border-teal-light-03/40">
        <div class="px-2 py-2 mb-2">
            <div class="font-medium text-sm text-green-light-01 truncate">{{ Auth::user()?->name ?? 'Guest' }}</div>
            <div class="text-xs text-green-normal-01 truncate">{{ Auth::user()?->email ?? '' }}</div>
        </div>

        <div class="space-y-1">
            <a href="{{ route('profile.edit') }}" 
               class="block px-3 py-1.5 text-xs font-medium text-green-light-01 rounded-md transition">
                {{ __('Profile') }}
            </a>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" 
                        class="w-full text-left px-3 py-1.5 text-xs font-medium text-red-500 rounded-md transition">
                    {{ __('Log Out') }}
                </button>
            </form>
        </div>
    </div>
</aside>
