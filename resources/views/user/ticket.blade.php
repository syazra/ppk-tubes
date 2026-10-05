<x-app-layout>

<div class="max-w-2xl mx-auto mt-10 px-4">

    <div class="bg-white rounded-xl shadow-lg p-8">

        {{-- Header --}}
        <div class="text-center mb-6 max-w-xs mx-auto"">

            @if($reservation->status == 'disetujui')

                <div class="mx-auto mb-3 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg class="w-7 h-7 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">

                        <path stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 13l4 4L19 7"/>
                    </svg>
                </div>

                <h2 class="text-xl font-semibold text-green-700">
                    Reservasi Valid
                </h2>

            @else

                <h2 class="text-xl font-semibold text-red-600">
                    Reservasi Tidak Aktif
                </h2>

            @endif


            <p class="text-gray-500 text-sm mt-1">
                Verifikasi Tiket Reservasi
            </p>

        </div>



        {{-- Divider --}}
        <div class="border-t border-gray-200 mb-4"></div>



        {{-- Detail Tiket --}}
        <div class="grid grid-cols-2 gap-x-10 gap-y-3 text-sm">


            <div>
                <p class="text-gray-500">
                    ID Reservasi
                </p>

                <p class="font-semibold text-teal-900 mt-1">
                    RSV-{{ $reservation->id }}
                </p>
            </div>



            <div>
                <p class="text-gray-500">
                    Peminjam
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->user->name }}
                </p>
            </div>



            <div>
                <p class="text-gray-500 mt-2">
                    Fasilitas
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->room->name }}
                </p>
            </div>



            <div>
                <p class="text-gray-500 mt-2">
                    Tipe Fasilitas
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->room->type }}
                </p>
            </div>



            <div>
                <p class="text-gray-500 mt-2">
                    Tanggal Reservasi
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->date_to_reserv }}
                </p>
            </div>



            <div>
                <p class="text-gray-500 mt-2">
                    Waktu
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->start_time }}
                    -
                    {{ $reservation->end_time }}
                </p>
            </div>



            <div class="col-span-2">

                <p class="text-gray-500 mt-2">
                    Tujuan Penggunaan
                </p>

                <p class="font-semibold mt-1">
                    {{ $reservation->desc }}
                </p>

            </div>



            <div>

                <p class="text-gray-500 mt-2">
                    Status
                </p>


                @if($reservation->status == 'disetujui')

                    <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        Disetujui
                    </span>


                @elseif($reservation->status == 'menunggu')

                    <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                        Menunggu
                    </span>


                @else

                    <span class="inline-block mt-2 px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        {{ ucfirst($reservation->status) }}
                    </span>

                @endif

            </div>


        </div>



        {{-- Footer --}}
        <div class="pt-5">

            <div class="border-t border-gray-200 pt-5 text-center">

                <p class="text-xs text-gray-400">
                    Tunjukkan halaman ini sebagai bukti validasi reservasi.
                </p>

            </div>

        </div>


    </div>

</div>

</x-app-layout>