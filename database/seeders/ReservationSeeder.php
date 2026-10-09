<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        DB::table('reservations')->insert([
            [
                'user_id' => 5,
                'room_id' => 2,
                'desc' => 'Rapat organisasi mahasiswa',
                'date_to_reserv' => $now->copy()->addDays(1)->toDateString(),
                'start_time' => '08:00:00',
                'end_time' => '10:00:00',
                'status' => 'menunggu',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 4,
                'room_id' => 3,
                'desc' => 'Diskusi kelompok tugas kuliah',
                'date_to_reserv' => $now->copy()->addDays(2)->toDateString(),
                'start_time' => '13:00:00',
                'end_time' => '15:00:00',
                'status' => 'ditolak',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 6,
                'room_id' => 2,
                'desc' => 'Seminar internal mahasiswa',
                'date_to_reserv' => $now->copy()->addDays(3)->toDateString(),
                'start_time' => '09:00:00',
                'end_time' => '14:00:00',
                'status' => 'disetujui',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'user_id' => 7,
                'room_id' => 1,
                'desc' => 'Peminjaman ruangan',
                'date_to_reserv' => $now->copy()->addDays(4)->toDateString(),
                'start_time' => '10:00:00',
                'end_time' => '12:00:00',
                'status' => 'dibatalkan',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
