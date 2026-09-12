@props(['disabled' => false])

<input @disabled($disabled) {{ $attributes->merge([
'class' => '
    bg-white-02 
    border border-teal-light-03
    focus:border-teal-normal-01
    focus:ring-teal-normal-01
    rounded-md shadow-sm
']) }}>
