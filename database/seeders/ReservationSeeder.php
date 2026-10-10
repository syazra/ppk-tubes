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
    /**
     * Roughly one reservation per four eligible users, never more than two per room.
     * Override with the DEMO_RESERVATIONS environment variable.
     */
    private function targetCount(int $userCount, int $roomCount): int
    {
        $override = env('DEMO_RESERVATIONS');
        if (is_numeric($override)) {
            return max(0, (int) $override);
        }

        return max(1, min((int) round($userCount * 0.25), $roomCount * 2));
    }

    public function run(): void
    {
        $users = User::where('role', 'user')->whereIn('account_type', ['mahasiswa', 'dosen', 'staf'])->orderBy('id')->get();
        $rooms = Room::orderBy('id')->get();

        if ($users->isEmpty() || $rooms->isEmpty()) {
            throw new LogicException('Seed demo users and facilities before reservations.');
        }

        $today = now(config('app.timezone'))->startOfDay();
        $total = $this->targetCount($users->count(), $rooms->count());
        $times = [['08:00:00', '09:30:00'], ['10:00:00', '12:00:00'], ['13:00:00', '14:30:00'], ['15:00:00', '17:00:00']];
        $pastStatuses = ['disetujui', 'disetujui', 'ditolak', 'dibatalkan', 'disetujui'];
        $futureStatuses = ['menunggu', 'disetujui', 'menunggu', 'ditolak', 'dibatalkan', 'disetujui'];
        $groups = DemoActivityPools::GROUPS;

        DB::transaction(function () use ($users, $rooms, $today, $total, $times, $pastStatuses, $futureStatuses, $groups): void {
            for ($i = 0; $i < $total; $i++) {
                $room = $rooms[($i * 7 + 3) % $rooms->count()];
                $user = $users[($i * 13 + 5) % $users->count()];
                $activities = DemoActivityPools::RESERVATIONS[$room->type];
                $activity = $activities[intdiv($i, $rooms->count()) + $i % count($activities)] ?? $activities[$i % count($activities)];
                $desc = $activity.' ('.$groups[$i % count($groups)].')';

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

                $status = $past ? $pastStatuses[intdiv($i, 2) % count($pastStatuses)] : $futureStatuses[intdiv($i, 2) % count($futureStatuses)];
                $repair = ! $past && ! $room->is_avail;
                if ($repair) {
                    $status = 'ditolak';
                }

                $reservation = Reservation::firstOrCreate([
                    'room_id' => $room->id,
                    'activity_name' => 'Diskusi dan persiapan kegiatan di '.$room->name,
                ], [
                    'user_id' => $user->id,
                    'date_to_reserv' => $date->toDateString(),
                    'start_time' => $start,
                    'end_time' => $end,
                    'status' => $status,
                    'rejection_reason' => $status === 'ditolak'
                        ? ($repair ? 'Fasilitas sedang dalam perbaikan' : DemoActivityPools::REJECTIONS_RESERVATION[$i % count(DemoActivityPools::REJECTIONS_RESERVATION)])
                        : null,
                ]);

                if ($reservation->wasRecentlyCreated) {
                    $submitted = ($past ? $date->copy()->subDays(3 + $i % 4) : $today->copy()->subDays(1 + $i % 10))->setTime(9, 0);
                    $reservation->forceFill([
                        'created_at' => $submitted,
                        'updated_at' => $status === 'menunggu' ? $submitted : $submitted->copy()->addHours(4 + $i % 6),
                    ])->save();
                }
            }
        });
    }
}
