<div class="">
    <div {{ $attributes->merge(['class' => "
        bg-white-01 
        border border-green-light-03
        overflow-hidden 
        shadow-sm sm:rounded-lg
        p-6
        "]) }}>
        {{ $slot }}
    </div>
</div>