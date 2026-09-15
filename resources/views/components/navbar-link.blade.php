@props(['routes', 'badge' => null])

@php
    $isActive = request()->routeIs($routes);
@endphp

<a href="{{ route($routes) }}" 
    class="flex items-center justify-between py-3 pl-4 pr-6 ml-4 transition duration-150 
    {{ $isActive ? 'bg-teal-dark-01/50 rounded-l-full text-white-01 font-semibold' : 
    'text-white-01 hover:bg-white rounded-l-full' }}">
    
    <!-- Wrapper Ikon & Teks -->
    <div class="flex items-center gap-3 text-sm">
        {{ $slot }}
    </div>

    @if($badge)
        <span class="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-teal-dark-01 bg-white rounded-full">
            {{ $badge }}
        </span>
    @endif
</a>