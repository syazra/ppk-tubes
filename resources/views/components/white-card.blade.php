@props(['padding' => 'p-6'])

<div class="max-w-7xl sm:px-6 lg:px-8 mb-5">
    <div {{ $attributes->merge(['class' => "
        bg-white-01 
        border border-green-light-03
        overflow-hidden 
        shadow-sm sm:rounded-lg
        $padding
        "]) }}>
        {{ $slot }}
    </div>
</div>