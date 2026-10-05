<x-app-layout>
    <!-- Left Sidebar -->
    <x-slot name="sidebar">
        @include('user.navbar')
    </x-slot>

    @if (session('success'))
        <div x-data="{ show: true }" 
             x-init="setTimeout(() => show = false, 4000)" 
             x-show="show" 
             x-transition
             class="fixed top-5 right-5 z-50 flex items-center p-4 mb-4 text-sm text-teal-800 rounded-lg bg-teal-50 border border-teal-200 shadow-lg" 
             role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span class="sr-only">Info</span>
            <div>
                <span class="font-medium">Berhasil!</span> {{ session('success') }}
            </div>
            <button @click="show = false" type="button" class="ms-auto -mx-1.5 -my-1.5 bg-teal-50 text-teal-500 rounded-lg focus:ring-2 focus:ring-teal-400 p-1.5 hover:bg-teal-200 inline-flex items-center justify-center h-8 w-8">
                <span class="sr-only">Close</span>
                <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
            </button>
        </div>
    @endif

    <x-title-bar 
        title="Reservasi Saya" 
        subtitle="Lihat daftar fasilitas yang pernah kamu pinjam." 
    />

    <div>

    <!-- Tombol Tambah Reservasi -->
    <x-white-card>
        <div class="flex justify-end">
            <a href="{{ route('reservations.form') }}"
            class="bg-teal-normal-01 text-white-01 px-5 py-2 rounded-lg hover:bg-teal-normal-02">
                + Tambah Reservasi
            </a>
        </div>
    

    <div class="overflow-visible relative z-50 px-5 py-5">    

        <form id="filterForm">

            <div class="flex justify-between items-center gap-3">

                <!-- Search -->
                <div class="flex-1">

                    <x-text-input
                        id="searchInput"
                        type="text"
                        name="search"
                        value="{{ request('search') }}"
                        placeholder="Cari fasilitas atau tanggal..."
                        class="w-full"
                    />

                </div>


                <div class="flex gap-2">


                    <!-- FILTER -->
                    <div x-data="{ open:false }" class="relative">

                        <button 
                            type="button"
                            @click="open = !open"
                            class="border border-teal-light-03 rounded-lg px-3 py-2 flex items-center gap-2 text-sm bg-white">

                            <x-heroicon-o-adjustments-horizontal 
                                class="h-5 w-5"/>

                            Filter

                        </button>


                        <div
                            style="background:white"
                            x-show="open"
                            @click.outside="open=false"
                            x-transition
                            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-[100]">

                            <div class="p-4 space-y-4">


                                <div>

                                    <label class="text-sm font-medium text-teal-01">
                                        Status
                                    </label>


                                    <select 
                                        id="statusFilter"
                                        name="status"
                                        class="mt-2 w-full bg-white-02 border border-teal-light-03 rounded-md shadow-sm px-3 py-2 text-sm">


                                        <option value="">
                                            Semua Status
                                        </option>


                                        <option value="menunggu"
                                            {{ request('status') == 'menunggu' ? 'selected' : '' }}>
                                            Menunggu
                                        </option>


                                        <option value="disetujui"
                                            {{ request('status') == 'disetujui' ? 'selected' : '' }}>
                                            Disetujui
                                        </option>


                                        <option value="ditolak"
                                            {{ request('status') == 'ditolak' ? 'selected' : '' }}>
                                            Ditolak
                                        </option>


                                        <option value="dibatalkan"
                                            {{ request('status') == 'dibatalkan' ? 'selected' : '' }}>
                                            Dibatalkan
                                        </option>


                                    </select>

                                </div>


                            </div>

                        </div>

                    </div>



                    <!-- SORT -->
                    <div x-data="{ open:false }" class="relative">

                        <button 
                            type="button"
                            @click="open = !open"
                            class="border border-teal-light-03 rounded-lg px-3 py-2 flex items-center gap-2 text-sm hover:bg-white">


                            <x-heroicon-o-arrows-up-down
                                class="h-5 w-5"/>

                            Sort

                        </button>



                        <div
                            style="background:white"
                            x-show="open"
                            @click.outside="open=false"
                            x-transition
                            class="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-200 z-[100]">


                            <div class="p-3">


                                <button
                                    type="button"
                                    name="sort"
                                    value="reservation_near"
                                    class="sort-btn w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">

                                    ↑ Waktu Reservasi Terdekat

                                </button>


                                <button
                                    type="button"
                                    name="sort"
                                    value="reservation_far"
                                    class="sort-btn w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">

                                    ↓ Waktu Reservasi Terjauh

                                </button>


                                <button
                                    type="button"
                                    name="sort"
                                    value="created_near"
                                    class="sort-btn w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">

                                    ↑ Pengajuan Terbaru

                                </button>


                                <button
                                    type="button"
                                    name="sort"
                                    value="created_far"
                                    class="sort-btn w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm">

                                    ↓ Pengajuan Terlama

                                </button>


                            </div>

                        </div>

                    </div>


                </div>

            </div>

        </form>

    </div>

    
<!-- Table Reservasi -->
    <div id="reservationTable">
        @include('user.partials.reservation-table')
    </div>
    <div id="ticketModal" 
    class="hidden fixed inset-0 bg-teal-900/20 flex items-center justify-center z-50">

        <div style="background:white; z-index:50;" 
            class="rounded-xl p-6 w-full max-w-md shadow-lg">

            <!-- Header -->
            <div class="flex justify-between items-center mb-5">
                <h2 class="font-semibold text-lg text-teal-900">
                    Tiket Reservasi
                </h2>

    
                
                <button onclick="closeTicketModal()" 
                    class="text-gray-500 hover:text-gray-700">
                    ✕
                </button>
            </div>

            <!-- Info singkat + QR -->
            <div class="flex justify-between items-start mb-5">

                <!-- Kiri -->
                <div class="space-y-3">

                    <div>
                        <p class="text-gray-500 text-xs">
                            Status
                        </p>

                        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                            Disetujui
                        </span>
                    </div>

                    <div>
                        <p class="text-gray-500 text-xs">
                            ID Reservasi
                        </p>

                        <p class="font-semibold text-teal-900">
                            RSV-{{ $reservation->id ?? '' }}
                        </p>
                    </div>

                </div>


                <!-- QR kanan -->
                <div class="border rounded-lg p-3">
                    <img id="ticketQr"
                        src=""
                        alt="QR Code"
                        class="w-24 h-24">
                </div>

            </div>


            <!-- Detail Tiket -->
            <div id="ticketContent" class="space-y-3 text-sm">

            </div>
                
            </div>

    </div>
    <script>

        function openTicketModal(reservation){

            document.getElementById('ticketModal')
                .classList.remove('hidden');

            // tampilkan QR Code
            document.getElementById('ticketQr').src =
                `/qrcode/${reservation.id}`;

            document.getElementById('ticketContent').innerHTML = `

                <div>
                    <p class="text-gray-500">Fasilitas</p>
                    <p class="font-semibold">
                        ${reservation.room.name}
                    </p>
                </div>


                <div>
                    <p class="text-gray-500">Tanggal</p>
                    <p>
                        ${reservation.date_to_reserv}
                    </p>
                </div>


                <div>
                    <p class="text-gray-500">Waktu</p>
                    <p>
                        ${reservation.start_time} - ${reservation.end_time}
                    </p>
                </div>


                <div>
                    <p class="text-gray-500">Tujuan</p>
                    <p>
                        ${reservation.desc}
                    </p>
                </div>


            

            `;
        }


        function closeTicketModal(){
            document.getElementById('ticketModal')
                .classList.add('hidden');
        }
        

        let sortValue = '';

        function loadReservations(){

            let search = document
                .getElementById('searchInput')
                .value;


            let status = document
                .getElementById('statusFilter')
                .value;



            let params = new URLSearchParams();


            if(search){
                params.append('search', search);
            }


            if(status){
                params.append('status', status);
            }


            if(sortValue){
                params.append('sort', sortValue);
            }



            fetch(
                "{{ route('reservations.index') }}?" 
                + params.toString(),
                {
                    headers:{
                        'X-Requested-With':'XMLHttpRequest'
                    }
                }
            )
            .then(response => response.text())
            .then(html => {

                document
                .getElementById('reservationTable')
                .innerHTML = html;

            });

        }



        // SEARCH
        document
        .getElementById('searchInput')
        .addEventListener(
            'keyup',
            function(){

                loadReservations();

            }
        );



        // FILTER
        document
        .getElementById('statusFilter')
        .addEventListener(
            'change',
            function(){

                loadReservations();

            }
        );



        // SORT
        document
        .querySelectorAll('.sort-btn')
        .forEach(button => {

            button.addEventListener(
                'click',
                function(){

                    sortValue = this.value;

                    loadReservations();

                }
            );

        });



    </script>
</x-app-layout>