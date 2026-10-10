<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use LogicException;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->whereIn('account_type', ['mahasiswa', 'dosen', 'staf'])->orderBy('id')->get();

        if ($users->isEmpty()) {
            throw new LogicException('Seed demo users before reports.');
        }

        $examples = [
            ['Laboratorium Teknomansi Aether', 'diproses', 'Kristal komputasi tidak menyala dan jaringan rune terputus.'],
            ['Ruang Rune Kuno', 'diproses', 'Lampu dan proyektor ruang kelas perlu diperbaiki.'],
            ['Ruang Dewan Putih', 'diproses', 'Pendingin aula tidak berfungsi dan kursi perlu diperbaiki.'],
            ['Lapangan Pelennor', 'diproses', 'Permukaan lapangan berlubang dan perlu diratakan.'],
            ['Aula Utama', 'baru', 'Mikrofon aula mengeluarkan suara berisik saat digunakan.'],
            ['Ruang Kelas A301', 'baru', 'Salah satu papan tulis sulit dibersihkan.'],
            ['Laboratorium Ramuan', 'selesai', 'Keran wastafel laboratorium bocor.'],
            ['Lapangan Quidditch', 'selesai', 'Jaring pembatas lapangan robek.'],
            ['Ruang Studi Ravenclaw', 'ditolak', 'Pendingin ruangan diduga tidak menyala.'],
            ['Ruang Seminar Elrond', 'ditolak', 'Proyektor diduga mengalami kerusakan.'],
            ['Ruang Arithmancy', 'dibatalkan', 'Stopkontak di dekat meja depan tidak berfungsi.'],
            ['Taman Shire', 'dibatalkan', 'Bangku taman terlihat longgar.'],
        ];
        $now = now(config('app.timezone'));

        DB::transaction(function () use ($users, $examples, $now): void {
            foreach ($examples as $index => [$name, $status, $description]) {
                $room = Room::where('name', $name)->orderBy('id')->firstOrFail();
                $user = $users[$index % $users->count()];
                $description = DemoActivityText::REPORT_EXAMPLES[$description];
                $report = Report::firstOrCreate([
                    'room_id' => $room->id,
                    'desc' => $description,
                ], [
                    'user_id' => $user->id,
                    'status' => $status,
                    'estimated_completion_at' => match ($status) {
                        'diproses' => $now->copy()->addDays(3 + $index)->setTime(17, 0),
                        'selesai' => $now->copy()->subDay()->setTime(17, 0),
                        default => null,
                    },
                    'rejection_reason' => $status === 'ditolak' ? 'Pemeriksaan kustodian menunjukkan pesona fasilitas masih utuh.' : null,
                    'resolution' => $status === 'selesai' ? 'Kustodian memperbaiki perkakas dan menguji kembali pesona ruangan.' : null,
                ]);

                // Preserve operator decisions when the sample seeders are rerun.
                if ($report->wasRecentlyCreated) {
                    $report->forceFill([
                        'created_at' => $now->copy()->subDays(2 + $index),
                        'updated_at' => $now->copy()->subDay(),
                    ])->save();
                }
                if ($report->wasRecentlyCreated && $status === 'diproses') {
                    $room->update(['is_avail' => false]);
                }
            }

            $extra = $this->targetCount($users->count(), Room::count()) - count($examples);
            $rooms = Room::orderBy('id')->get();
            $statuses = ['baru', 'selesai', 'ditolak', 'dibatalkan', 'baru'];

            for ($i = 0; $i < $extra; $i++) {
                $room = $rooms[($i * 5 + 2) % $rooms->count()];
                $issues = DemoActivityPools::REPORTS[$room->type];
                $issue = $issues[($i + intdiv($i, $rooms->count())) % count($issues)];
                $status = $statuses[$i % count($statuses)];
                $submitted = $now->copy()->subDays(3 + ($i * 7) % 60)->setTime(8 + $i % 8, 15);
                $updated = $status === 'baru' ? $submitted : $submitted->copy()->addDays(1 + $i % 3);

                $report = Report::firstOrCreate([
                    'room_id' => $room->id,
                    'desc' => $issue,
                ], [
                    'user_id' => $users[($i * 11 + 7) % $users->count()]->id,
                    'status' => $status,
                    'estimated_completion_at' => $status === 'selesai' ? $updated : null,
                    'rejection_reason' => $status === 'ditolak'
                        ? DemoActivityPools::REJECTIONS_REPORT[$i % count(DemoActivityPools::REJECTIONS_REPORT)]
                        : null,
                    'resolution' => $status === 'selesai'
                        ? DemoActivityPools::RESOLUTIONS[$i % count(DemoActivityPools::RESOLUTIONS)]
                        : null,
                ]);
                if ($report->wasRecentlyCreated) {
                    $report->forceFill(['created_at' => $submitted, 'updated_at' => $updated])->save();
                }
            }
        });
    }

    /**
     * Roughly one report per eight eligible users (minimum: the fixed showcase examples),
     * never more than one per room. Override with the DEMO_REPORTS environment variable.
     */
    private function targetCount(int $userCount, int $roomCount): int
    {
        $minimum = 12;
        $override = config('demo.reports');
        if (is_numeric($override)) {
            return max($minimum, (int) $override);
        }

        return max($minimum, min((int) round($userCount / 8), $roomCount));
    }
}
