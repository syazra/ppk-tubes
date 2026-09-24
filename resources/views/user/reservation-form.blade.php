<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Buat Reservasi</title>

    <script src="https://cdn.tailwindcss.com"></script>

</head>


<body class="bg-[#f5f8ee] min-h-screen">


<div class="flex min-h-screen">


    <!-- Sidebar -->

    <aside class="w-52 bg-gradient-to-b from-teal-500 to-teal-700 text-white p-5 flex flex-col justify-between">


        <div>


            <div class="mb-10">

                <h1 class="text-xl font-bold">
                    PINJAMIN
                </h1>

                <p class="text-xs">
                    Portal peminjaman fasilitas kampus
                </p>

            </div>




            <div class="bg-lime-300 text-teal-900 rounded-lg px-4 py-3 mb-5 text-sm">

                ▦ &nbsp; Katalog Fasilitas

            </div>




            <nav class="space-y-3 text-sm">


                <div class="px-3 py-2">
                    Beranda
                </div>


                <a href="{{ route('reservations.index') }}"
                class="bg-teal-800 rounded-lg px-3 py-2 block">

                    Reservasi Saya

                </a>



                <div class="px-3 py-2">
                    Laporan Saya
                </div>


            </nav>


        </div>






        <!-- User -->

        <div class="bg-teal-800 rounded-xl p-4">


            <p class="font-semibold text-sm">

                {{ Auth::user()->name }}

            </p>


            <p class="text-xs">

                Mahasiswa

            </p>


        </div>


    </aside>









    <!-- CONTENT -->


    <main class="flex-1 p-10 flex justify-center">



        <div class="bg-white rounded-xl shadow w-[600px] p-10">



            <h1 class="text-3xl font-bold text-teal-900 mb-8">

                Buat Reservasi

            </h1>






            <form action="{{ route('reservations.store') }}"
                  method="POST">

                @csrf







                <!-- Ruangan -->


                <div class="mb-5">


                    <label class="block text-sm mb-2">

                        Ruangan

                    </label>



                    <select
                    name="room_id"
                    id="room_id"
                    class="w-full bg-gray-100 rounded-lg p-3">


                        <option value="">
                            Pilih Ruangan
                        </option>



                        @foreach($rooms as $room)


                            <option value="{{ $room->id }}">

                                {{ $room->name }}
                                -
                                {{ $room->location }}

                            </option>


                        @endforeach


                    </select>



                </div>









                <!-- Tanggal -->


                <div class="mb-5">


                    <label class="block text-sm mb-2">

                        Hari / Tanggal

                    </label>



                    <input
                    type="date"
                    name="date_to_reserv"
                    id="date_to_reserv"
                    min="{{ date('Y-m-d') }}"
                    class="w-full bg-gray-100 rounded-lg p-3">



                </div>








                <!-- Tujuan -->


                <div class="mb-5">


                    <label class="block text-sm mb-2">

                        Tujuan Penggunaan

                    </label>



                    <textarea

                    name="desc"

                    rows="4"

                    placeholder="Masukkan tujuan penggunaan ruangan"

                    class="w-full bg-gray-100 rounded-lg p-3"></textarea>



                </div>









                <!-- BOOKING TIME -->

                <div class="mb-6">


                    <label class="block text-sm font-semibold mb-3">

                        Booking Time

                    </label>



                    <div class="border rounded-xl p-5 bg-gray-50">


                        <div class="flex justify-between items-center mb-4">


                            <p class="text-sm text-gray-500">

                                Pilih waktu reservasi

                            </p>


                            <p class="text-xs text-gray-400">

                                Slot 30 menit (07.00 - 20.00)

                            </p>


                        </div>




                        <!-- Slot muncul di sini -->

                        <div
                        id="slots"
                        class="grid grid-cols-3 gap-3">


                            <p class="text-gray-400 text-sm col-span-3">

                                Pilih ruangan dan tanggal terlebih dahulu

                            </p>


                        </div>



                    </div>



                </div>









                <!-- Hidden waktu -->


                <input
                type="hidden"
                name="start_time"
                id="start_time">



                <input
                type="hidden"
                name="end_time"
                id="end_time">







                <!-- Button -->


                <div class="flex justify-end gap-3">


                    <a href="{{ route('reservations.index') }}"
                    class="border px-5 py-2 rounded-lg">


                        Batal


                    </a>




                    <button
                    type="submit"
                    class="bg-teal-600 text-white px-6 py-2 rounded-lg">


                        Submit


                    </button>



                </div>



            </form>




        </div>



    </main>



</div>









<script>

const room = document.getElementById('room_id');
const date = document.getElementById('date_to_reserv');
const slots = document.getElementById('slots');

const startTimeInput = document.getElementById('start_time');
const endTimeInput = document.getElementById('end_time');


let selectedSlots = [];


// Load slot ketika room atau tanggal berubah
room.addEventListener('change', loadSlots);
date.addEventListener('change', loadSlots);



function loadSlots() {


    if (
        room.value === '' ||
        date.value === ''
    ) {

        return;

    }



    fetch(
        `/reservations/slots?room_id=${room.value}&date=${date.value}`
    )


    .then(response => response.json())


    .then(data => {


        slots.innerHTML = '';

        selectedSlots = [];

        startTimeInput.value = '';
        endTimeInput.value = '';



        data.forEach(slot => {


            let button = document.createElement('button');


            button.type = 'button';


            button.innerHTML = `
                ${slot.start} - ${slot.end}
            `;



            button.className =
            "p-3 rounded-lg text-sm border";





            // Jika slot tersedia

            if(slot.available){


                button.classList.add(
                    'bg-green-100',
                    'text-green-700'
                );



                button.onclick = function(){


                    selectSlot(
                        slot,
                        button
                    );


                };



            }


            // Jika sudah dibooking

            else{


                button.disabled = true;


                button.classList.add(
                    'bg-gray-300',
                    'text-gray-500',
                    'cursor-not-allowed'
                );


            }



            slots.appendChild(button);



        });


    })

    .catch(error => {

        console.error(
            'Error load slot:',
            error
        );

    });


}






function selectSlot(slot, button){



    let exists = selectedSlots.find(
        item =>
        item.start === slot.start
    );





    // Jika klik ulang -> hapus

    if(exists){


        selectedSlots =
        selectedSlots.filter(
            item =>
            item.start !== slot.start
        );


        button.classList.remove(
            'ring-2',
            'ring-teal-600'
        );



        updateBookingTime();


        return;

    }





    // Cek slot harus berurutan

    if(selectedSlots.length > 0){


        selectedSlots.sort(
            (a,b)=>
            a.start.localeCompare(b.start)
        );



        let lastSlot =
        selectedSlots[selectedSlots.length - 1];



        if(lastSlot.end !== slot.start){


            alert(
                'Pilih waktu secara berurutan'
            );


            return;

        }


    }





    selectedSlots.push(slot);



    button.classList.add(
        'ring-2',
        'ring-teal-600'
    );



    updateBookingTime();



}








function updateBookingTime(){



    if(selectedSlots.length === 0){


        startTimeInput.value = '';

        endTimeInput.value = '';


        return;

    }





    selectedSlots.sort(
        (a,b)=>
        a.start.localeCompare(b.start)
    );





    startTimeInput.value =
    selectedSlots[0].start;



    endTimeInput.value =
    selectedSlots[selectedSlots.length - 1].end;



}



// Validasi sebelum submit

document
.querySelector('form')
.addEventListener(
    'submit',
    function(e){


        if(

            startTimeInput.value === '' ||

            endTimeInput.value === ''

        ){


            e.preventDefault();


            alert(
                'Silakan pilih Booking Time terlebih dahulu'
            );


        }


    }
);



</script>

</body>

</html>
