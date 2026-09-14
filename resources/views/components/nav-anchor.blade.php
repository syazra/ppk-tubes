@props(['routes'])

<a href="{{ route($routes) }}" 
    class="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-150 {{ request()->routeIs($routes) ? 'bg-white/20 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-white/10' }}">
    <!-- isi dengan icon dan nama page -->
    {{ $slot }} 
</a>