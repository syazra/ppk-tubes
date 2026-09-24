@props(['size' => 'md', 'showText' => true])

@php
    $badgeSizes = [
        'sm' => 'w-7 h-7 rounded-lg',
        'md' => 'w-9 h-9 rounded-xl',
        'lg' => 'w-11 h-11 rounded-2xl',
    ];
    $iconSizes = [
        'sm' => 'w-4 h-4',
        'md' => 'w-5 h-5',
        'lg' => 'w-6 h-6',
    ];
    $textSizes = [
        'sm' => 'text-base font-black tracking-wider',
        'md' => 'text-lg font-black tracking-wider',
        'lg' => 'text-xl font-black tracking-wider',
    ];
    $badgeClass = $badgeSizes[$size] ?? $badgeSizes['md'];
    $iconClass = $iconSizes[$size] ?? $iconSizes['md'];
    $textClass = $textSizes[$size] ?? $textSizes['md'];
@endphp

<div {{ $attributes->merge(['class' => 'inline-flex items-center gap-2.5 select-none']) }}>
    <!-- Green Squircle Badge -->
    <div class="{{ $badgeClass }} bg-green-normal-01 flex items-center justify-center shadow-sm shrink-0">
        <!-- Building / Kiosk / Facility Pinjam Icon -->
        <svg class="{{ $iconClass }} text-white-01" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <!-- Roof / Top beam -->
            <path d="M3 9l9-6 9 6" />
            <!-- Building / Kiosk body -->
            <path d="M4 10h16v10a1 1 0 01-1 1H5a1 1 0 01-1-1V10z" />
            <!-- Arch / Entrance / Card slot -->
            <path d="M9 21v-6a3 3 0 016 0v6" />
            <!-- Small detail dot / window -->
            <circle cx="12" cy="9.5" r="1" fill="currentColor" />
        </svg>
    </div>

    @if ($showText)
        <span class="{{ $textClass }} text-green-dark-02 uppercase font-bold tracking-widest">
            Pinjamin
        </span>
    @endif
</div>
