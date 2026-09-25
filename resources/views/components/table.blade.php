<x-white-card class="!p-0 overflow-hidden">
    <div class="overflow-x-auto">
        <table {{ $attributes->merge(['class' => 'w-full text-sm']) }}>
            
            <!-- Header Table (Warna dan styling sudah dikunci disini) -->
            @isset($header)
                <thead class="bg-teal-50 text-teal-700">
                    <tr>
                        {{ $header }}
                    </tr>
                </thead>
            @endisset

            <!-- Body / Isi Table -->
            <tbody>
                {{ $slot }}
            </tbody>
            
        </table>
    </div>
</x-white-card>