@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge([
'class' => '
    bg-white-01 
    border-transparent
    focus:border-teal-normal-01
    focus:ring-teal-normal-01
    rounded-md shadow-sm
']) }}>
