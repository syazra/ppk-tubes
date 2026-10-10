<?php

namespace Database\Seeders;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

class ReservationSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->whereIn('email', [
            'ruthseptriana@students.kampus.ac.id',
            'sandykurniawan@lecturer.kampus.ac.id',
            'benynugroho@staff.kampus.ac.id',
        ])->orderBy('email')->get();
        $rooms = Room::orderBy('id')->get();

        if ($users->count() !== 3 || $rooms->isEmpty()) {
            throw new LogicException('Seed demo users and facilities before reservations.');
        }

        $today = now(config('app.timezone'))->startOfDay();
        $statuses = ['menunggu', 'disetujui', 'ditolak', 'dibatalkan'];

        DB::transaction(function () use ($users, $rooms, $today, $statuses): void {
            foreach ($rooms as $index => $room) {
                $user = $users[$index % $users->count()];

                Reservation::firstOrCreate([
                    'user_id' => $user->id,
                    'room_id' => $room->id,
                    'activity_name' => 'Kegiatan belajar bersama di '.$room->name,
                ], [
                    'date_to_reserv' => $today->copy()->subDays(1 + $index % 14)->toDateString(),
                    'start_time' => '08:00:00',
                    'end_time' => '10:00:00',
                    'status' => 'disetujui',
                    'rejection_reason' => null,
                ]);

                $status = $room->is_avail ? $statuses[$index % count($statuses)] : 'ditolak';

                Reservation::firstOrCreate([
                    'user_id' => $user->id,
                    'room_id' => $room->id,
                    'activity_name' => 'Diskusi dan persiapan kegiatan di '.$room->name,
                ], [
                    'date_to_reserv' => $today->copy()->addDays(2 + $index % 7)->toDateString(),
                    'start_time' => '13:00:00',
                    'end_time' => '15:00:00',
                    'status' => $status,
                    'rejection_reason' => $status === 'ditolak'
                        ? ($room->is_avail ? 'Pengajuan belum memenuhi persyaratan kegiatan.' : 'Fasilitas sedang dalam perbaikan')
                        : null,
                ]);
            }
        });
    }
}
