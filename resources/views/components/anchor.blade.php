<a {{ $attributes->merge([
    'type' => 'submit', 
    'class' => '
        underline text-sm 
        text-teal-dark-01 hover:text-teal-darker 
        px-1.5 py-0.5 rounded-md 
        focus:outline-none focus:ring-2 focus:ring-teal-normal-01 focus:ring-offset-1 
        transition ease-in-out duration-150
    ']) }}>
    {{ $slot }}
</a>
