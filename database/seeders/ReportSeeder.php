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
                $themedDescription = DemoActivityText::REPORT_EXAMPLES[$description];
                DemoActivityText::upgrade('reports', $room->id, [$description => $themedDescription]);
                $description = $themedDescription;
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

            foreach (Room::orderBy('id')->get() as $index => $room) {
                $issueMap = DemoActivityText::REPORTS[$room->type];
                DemoActivityText::upgrade('reports', $room->id, $issueMap);
                $issues = array_values($issueMap);
                foreach ($issues as $sample => $issue) {
                    $status = ['baru', 'selesai', 'ditolak', 'dibatalkan'][($index + $sample) % 4];
                    // Keep active demo rooms bookable; ongoing repairs use the four existing inactive rooms.
                    if (! $room->is_avail && $sample === 0) {
                        $status = 'diproses';
                    }
                    $submitted = $now->copy()->subDays(3 + ($index * 4 + $sample) % 85)->setTime(8 + $sample * 2, 15);
                    $updated = in_array($status, ['baru', 'diproses'], true)
                        ? ($status === 'baru' ? $submitted : $now->copy()->subDay())
                        : $submitted->copy()->addDays(1 + $sample % 2);
                    $report = Report::firstOrCreate([
                        'room_id' => $room->id,
                        'desc' => $issue,
                    ], [
                        'user_id' => $users[($index * 4 + $sample + 11) % $users->count()]->id,
                        'status' => $status,
                        'estimated_completion_at' => match ($status) {
                            'diproses' => $now->copy()->addDays(2 + $index % 10)->setTime(17, 0),
                            'selesai' => $updated,
                            default => null,
                        },
                        'rejection_reason' => $status === 'ditolak' ? ['Pemeriksaan kustodian menunjukkan perkakas masih bekerja sebagaimana mestinya.', 'Keluhan serupa telah ditangani berdasarkan gulungan aduan terdahulu.', 'Gangguan berasal dari jimat milik pelapor; pesona ruangan tetap utuh.'][($index + $sample) % 3] : null,
                        'resolution' => $status === 'selesai' ? ['Kait yang longgar dikencangkan lalu diuji bersama penghuni menara.', 'Bagian yang retak diganti oleh pandai besi; segel penjaga kembali utuh.', 'Perkakas dibersihkan dan rune diselaraskan; ruangan siap digunakan kembali.'][($index + $sample) % 3] : null,
                    ]);
                    if ($report->wasRecentlyCreated) {
                        $report->forceFill(['created_at' => $submitted, 'updated_at' => $updated])->save();
                    }
                }
            }
        });
    }
}
