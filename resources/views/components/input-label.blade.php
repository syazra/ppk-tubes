@props(['value'])

<label {{ $attributes->merge([
    'class' => '
        block font-medium text-sm 
        text-teal-dark-01
        ']) }}>
    {{ $value ?? $slot }}
</label>
