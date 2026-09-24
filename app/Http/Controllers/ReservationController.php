<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class ReservationController extends Controller
{


    /**
     * Menampilkan reservasi user
     */
    public function index()
    {
        $reservations = Reservation::with('room')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();


        return view(
            'user.reservation',
            compact('reservations')
        );
    }





    /**
     * Menampilkan form reservasi
     */
    public function create()
    {
        $rooms = Room::where('is_avail', true)->get();


        $reservations = Reservation::with('room')
            ->where('user_id', Auth::id())
            ->latest()
            ->get();


        return view(
            'user.reservation-form',
            compact(
                'rooms',
                'reservations'
            )
        );
    }







    /**
     * Mengambil slot waktu yang tersedia
     */
    public function availableSlots(Request $request)
    {

        $request->validate([

            'room_id' => [
                'required',
                'exists:rooms,id'
            ],


            'date' => [
                'required',
                'date'
            ]

        ]);




        // Ambil reservasi yang sudah ada
        $reservations = Reservation::where('room_id', $request->room_id)

            ->where('date_to_reserv', $request->date)

            ->where('status', '!=', 'rejected')

            ->get();





        $slots = [];



        // Mulai jam 07.00
        $time = strtotime('07:00');


        // Selesai jam 20.00
        $end = strtotime('20:00');





        while ($time < $end) {


            $slotStart = date('H:i', $time);


            $slotEnd = date(
                'H:i',
                strtotime('+30 minutes', $time)
            );



            $available = true;





            foreach ($reservations as $reservation) {


                /*
                 * Cek apakah slot bentrok
                 *
                 * Contoh:
                 * Reservasi 09:00 - 10:30
                 *
                 * Maka:
                 * 09:30 - 10:00 => blocked
                 */


                if (

                    $slotStart < $reservation->end_time

                    &&

                    $slotEnd > $reservation->start_time

                ) {


                    $available = false;


                    break;

                }


            }






            $slots[] = [

                'start' => $slotStart,

                'end' => $slotEnd,

                'available' => $available

            ];






            // tambah 30 menit

            $time = strtotime('+30 minutes', $time);


        }





        return response()->json($slots);


    }








    /**
     * Menyimpan reservasi baru
     */
    public function store(Request $request)
    {


        $validated = $request->validate([


            'room_id' => [

                'required',

                'exists:rooms,id'

            ],



            'desc' => [

                'required',

                'string'

            ],



            'date_to_reserv' => [

                'required',

                'date'

            ],



            'start_time' => [

                'required',

                'date_format:H:i'

            ],



            'end_time' => [

                'required',

                'date_format:H:i'

            ],


        ]);








        /*
         * Validasi jam operasional
         */

        if (

            $validated['start_time'] < '07:00'

            ||

            $validated['end_time'] > '20:00'

        ) {


            return back()

                ->withErrors([

                    'time' => 'Jam reservasi hanya 07.00 - 20.00'

                ])

                ->withInput();


        }









        /*
         * Validasi kelipatan 30 menit
         */


        $start = strtotime($validated['start_time']);

        $end = strtotime($validated['end_time']);



        if (

            ($end - $start) <= 0

            ||

            (($end - $start) % 1800 != 0)

        ) {


            return back()

                ->withErrors([

                    'time' => 'Durasi reservasi harus kelipatan 30 menit'

                ])

                ->withInput();


        }









        /*
         * Cek bentrok reservasi
         */


        $conflict = Reservation::where('room_id', $validated['room_id'])

            ->where(
                'date_to_reserv',
                $validated['date_to_reserv']
            )


            ->where(
                'status',
                '!=',
                'rejected'
            )


            ->where(function ($query) use ($validated) {


                $query

                    ->where(
                        'start_time',
                        '<',
                        $validated['end_time']
                    )


                    ->where(
                        'end_time',
                        '>',
                        $validated['start_time']
                    );


            })


            ->exists();






        if ($conflict) {


            return back()

                ->withErrors([

                    'time' => 'Waktu tersebut sudah digunakan'

                ])

                ->withInput();


        }









        /*
         * Simpan reservasi
         */


        Reservation::create([


            'user_id' => Auth::id(),


            'room_id' => $validated['room_id'],


            'desc' => $validated['desc'],


            'date_to_reserv' => $validated['date_to_reserv'],


            'start_time' => $validated['start_time'],


            'end_time' => $validated['end_time'],


            'status' => 'pending'


        ]);







        return redirect()

            ->route('reservations.index')

            ->with(
                'success',
                'Reservasi berhasil dibuat'
            );


    }



}