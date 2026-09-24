<x-app-layout>
    <x-title-bar 
        title="Reservasi Saya" 
        subtitle="Lihat daftar fasilitas yang pernah kamu pinjam." 
    />

    <x-white-card>
        <div class="p-6 text-teal-dark-01">
            Selamat datang, Mahasiswa / Dosen!
        </div>
    </x-white-card>

</x-app-layout>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reservasi Saya</title>

    <script src="https://cdn.tailwindcss.com"></script>
</head>


<body class="bg-[#f5f8ee] min-h-screen">


<div class="flex min-h-screen">


    <!-- Sidebar -->
    <aside class="w-52 bg-gradient-to-b from-teal-500 to-teal-700 text-white p-5 flex flex-col justify-between">


        <div>


            <!-- Logo -->
            <div class="mb-10">

                <div class="flex items-center gap-2">

                    <div class="bg-lime-300 text-teal-800 rounded-lg p-2">
                        🏢
                    </div>


                    <div>
                        <h1 class="font-bold text-lg">
                            PINJAMIN
                        </h1>

                        <p class="text-[10px]">
                            Portal peminjaman fasilitas kampus
                        </p>

                    </div>

                </div>

            </div>



            <!-- Menu -->


            <div class="bg-lime-300 text-teal-900 rounded-lg px-4 py-3 mb-6 text-sm">
                ▦ &nbsp; Katalog Fasilitas
            </div>



            <nav class="space-y-3 text-sm">


                <div class="px-3 py-2">
                    &nbsp; Beranda
                </div>


                <div class="bg-teal-800 rounded-lg px-3 py-2 font-semibold">
                    &nbsp; Reservasi Saya
                </div>


                <div class="px-3 py-2">
                    &nbsp; Laporan Saya
                </div>


            </nav>


        </div>




        <!-- User -->

        <div class="bg-teal-800 rounded-xl p-4">


            <div class="flex items-center gap-3">


                <div class="w-10 h-10 bg-lime-300 rounded-full"></div>


                <div>

                    <p class="font-semibold text-sm">
                        {{ Auth::user()->name }}
                    </p>

                    <p class="text-xs">
                        Mahasiswa
                    </p>

                </div>


            </div>


        </div>


    </aside>






    <!-- Content -->


    <main class="flex-1 p-10">



        <!-- Header -->


        <div class="flex justify-between items-center mb-8">


            <div>


                <h2 class="text-3xl font-bold text-teal-900">
                    Reservasi Saya
                </h2>


                <p class="text-gray-500 text-sm">
                    Lihat daftar fasilitas yang pernah kamu pinjam.
                </p>


            </div>




            <div class="flex gap-3">


                <input
                    type="text"
                    placeholder="Cari reservasi atau laporan..."
                    class="border border-gray-200 rounded-xl px-5 py-2 w-64 text-sm">


                <button class="border rounded-xl px-4">
                    🔔
                </button>


            </div>


        </div>






        <!-- Table -->


        <div class="bg-white rounded-xl border overflow-hidden">


            <table class="w-full text-sm">


                <thead class="bg-[#e8f5ef] text-teal-700 text-xs">


                    <tr>


                        <th class="text-left px-5 py-3">
                            NAMA FASILITAS
                        </th>


                        <th class="text-left px-5 py-3">
                            TANGGAL & WAKTU
                        </th>


                        <th class="text-left px-5 py-3">
                            TUJUAN PENGGUNAAN
                        </th>


                        <th class="text-left px-5 py-3">
                            STATUS
                        </th>


                        <th class="text-left px-5 py-3">
                            AKSI
                        </th>


                    </tr>


                </thead>




                <tbody>



                @forelse($reservations as $reservation)


                    <tr class="border-t">


                        <!-- Room -->

                        <td class="px-5 py-4">


                            <p class="font-semibold text-teal-900">

                                {{ $reservation->room->name ?? '-' }}

                            </p>


                            <p class="text-xs text-gray-400">

                                {{ $reservation->room->type ?? '' }}

                            </p>


                        </td>





                        <!-- Date -->

                        <td class="px-5 py-4 text-teal-600">


                            {{ \Carbon\Carbon::parse($reservation->date_to_reserv)->format('d F Y') }}


                            <br>


                            <span class="text-xs">

                                {{ $reservation->start_time }}-{{ $reservation->end_time }}

                            </span>


                        </td>





                        <!-- Desc -->

                        <td class="px-5 py-4 text-gray-600">

                            {{ $reservation->desc }}

                        </td>





                        <!-- Status -->


                        <td class="px-5 py-4">


                            <span class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">


                                {{ ucfirst($reservation->status) }}


                            </span>


                        </td>





                        <!-- Action -->

                        <td class="px-5 py-4">


                            <button class="border border-blue-400 text-blue-500 rounded-lg px-3 py-1 text-xs">

                                Lihat tiket

                            </button>


                        </td>



                    </tr>



                @empty


                    <tr>


                        <td colspan="5" class="text-center py-10 text-gray-400">


                            Belum ada reservasi


                        </td>


                    </tr>


                @endforelse



                </tbody>


            </table>


        </div>





    </main>







    <!-- Floating Button -->


    <a href="{{ route('reservations.form') }}"
    class="fixed bottom-10 right-12 bg-teal-600 text-white w-14 h-14 rounded-full text-3xl shadow flex items-center justify-center">

        +

    </a>




</div>



</body>

</html>