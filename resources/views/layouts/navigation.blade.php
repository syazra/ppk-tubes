<aside class="w-64 bg-grad-teal-02 border-r border-teal-light-03 min-h-screen flex flex-col justify-between shrink-0">
    <div>
        <!--LOGO -->
        <div class="h-16 flex items-center px-6 border-b border-teal-light-03/40">
            <a href="{{ route('dashboard') }}" class="flex items-center gap-3">
                <x-application-logo class="block h-8 w-auto fill-current text-white-01" />
                <span class="font-bold text-white-01 text-lg">Pinjamin</span>
            </a>
        </div>

        <!-- NAVIGATIONS -->
        <nav class="p-4 space-y-1">
            <a href="{{ route('dashboard') }}" 
               class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-150 {{ request()->routeIs('dashboard') ? 'bg-white/20 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-white/10' }}">
                <!-- Icon Dashboard -->
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <span>{{ __('Dashboard') }}</span>
            </a>

        </nav>
    </div>

    <!-- PROFILE -->
    <div class="p-4 border-t border-teal-light-03/40">
        <div class="px-2 py-2 mb-2">
            <div class="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{{ Auth::user()?->name ?? 'Guest' }}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400 truncate">{{ Auth::user()?->email ?? '' }}</div>
        </div>

        <div class="space-y-1">
            <a href="{{ route('profile.edit') }}" 
               class="block px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-white/10 rounded-md transition">
                {{ __('Profile') }}
            </a>

            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit" 
                        class="w-full text-left px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-500/10 rounded-md transition">
                    {{ __('Log Out') }}
                </button>
            </form>
        </div>
    </div>
</aside>