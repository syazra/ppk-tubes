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
            'user.my-reservations',
            compact('reservations')
        );
    }



    /**
     * Form reservasi
     */
    public function create()
    {
        $rooms = Room::where('is_avail', true)->get();


        return view(
            'user.reservation-form',
            compact('rooms')
        );
    }





    /**
     * Detail tiket reservasi
     */
    public function ticket(Reservation $reservation)
    {
        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );


        return view(
            'user.reservation-ticket',
            compact('reservation')
        );
    }







    /**
     * Membatalkan reservasi
     */
    public function cancel(Reservation $reservation)
    {

        abort_if(
            $reservation->user_id != Auth::id(),
            403
        );



        if($reservation->status != 'menunggu'){

            return back()
                ->with(
                    'error',
                    'Reservasi tidak dapat dibatalkan'
                );

        }



        $reservation->update([

            'status' => 'dibatalkan'

        ]);



        return back()
            ->with(
                'success',
                'Reservasi berhasil dibatalkan'
            );

    }








    /**
     * Mengambil jadwal booking ruangan
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




        $reservations = Reservation::where(
                'room_id',
                $request->room_id
            )

            ->where(
                'date_to_reserv',
                $request->date
            )


            // yang masih dianggap memakai ruangan
            ->whereNotIn(
                'status',
                [
                    'ditolak',
                    'dibatalkan'
                ]
            )

            ->get();






        return response()->json(

            $reservations->map(function($reservation){

                return [

                    'start_time' => $reservation->start_time,

                    'end_time' => $reservation->end_time

                ];

            })

        );

    }









    /**
     * Simpan reservasi
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
            ]

        ]);








        /*
         * Cek jam operasional
         */

        if(
            $validated['start_time'] < '07:00'
            ||
            $validated['end_time'] > '20:00'
        ){

            return back()
                ->withErrors([
                    'time' => 'Jam reservasi hanya 07.00 - 20.00'
                ])
                ->withInput();

        }









        /*
         * Cek durasi kelipatan 30 menit
         */

        $start = strtotime(
            $validated['start_time']
        );


        $end = strtotime(
            $validated['end_time']
        );



        if(
            ($end - $start) <= 0
            ||
            (($end-$start)%1800 !=0)
        ){

            return back()
                ->withErrors([
                    'time' => 'Durasi harus kelipatan 30 menit'
                ])
                ->withInput();

        }









        /*
         * Cek bentrok
         */


        $conflict = Reservation::where(
                'room_id',
                $validated['room_id']
            )


            ->where(
                'date_to_reserv',
                $validated['date_to_reserv']
            )


            ->whereNotIn(
                'status',
                [
                    'ditolak',
                    'dibatalkan'
                ]
            )


            ->where(function($query) use ($validated){


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







        if($conflict){


            return back()

                ->withErrors([

                    'time' => 'Waktu tersebut sudah digunakan'

                ])

                ->withInput();


        }









        /*
         * Simpan
         */

        Reservation::create([


            'user_id' => Auth::id(),


            'room_id' => $validated['room_id'],


            'desc' => $validated['desc'],


            'date_to_reserv' => $validated['date_to_reserv'],


            'start_time' => $validated['start_time'],


            'end_time' => $validated['end_time'],


            'status' => 'menunggu'


        ]);







        return redirect()

            ->route('reservations.index')

            ->with(
                'success',
                'Reservasi berhasil dibuat'
            );

    }

}