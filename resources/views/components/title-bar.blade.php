@props(['title', 'subtitle' => null])

<div class="px-6 py-4 mb-6">
    <h2 class="font-semibold text-xl pb-1 text-teal-darker leading-tight">
        {{ $title ?? $slot }}
    </h2>
    <h3 class="font text-sm text-teal-dark-01 leading-tight">
        {{ $subtitle ?? $slot }}
    </h3>
</div>