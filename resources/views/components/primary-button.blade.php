<button {{ $attributes->merge([
    'type' => 'submit', 
    'class' => '
        inline-flex items-center px-4 py-2 
        bg-teal-dark-01
        border border-transparent rounded-md 
        font-semibold text-xs text-white-01
         uppercase tracking-widest 
        hover:bg-teal-dark-02 focus:bg-teal-dark-02 active:bg-teal-dark-02
        focus:outline-none 
        transition ease-in-out duration-150
    ']) }}>
    {{ $slot }}
</button>