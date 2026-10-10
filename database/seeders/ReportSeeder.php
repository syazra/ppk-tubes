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
        $users = User::where('role', 'user')->whereIn('email', [
            'ruthseptriana@students.kampus.ac.id',
            'sandykurniawan@lecturer.kampus.ac.id',
            'benynugroho@staff.kampus.ac.id',
        ])->orderBy('email')->get();

        if ($users->count() !== 3) {
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
                $report = Report::firstOrCreate([
                    'user_id' => $user->id,
                    'room_id' => $room->id,
                    'desc' => $description,
                ], [
                    'status' => $status,
                    'estimated_completion_at' => match ($status) {
                        'diproses' => $now->copy()->addDays(3 + $index)->setTime(17, 0),
                        'selesai' => $now->copy()->subDay()->setTime(17, 0),
                        default => null,
                    },
                    'rejection_reason' => $status === 'ditolak' ? 'Hasil pemeriksaan menunjukkan fasilitas berfungsi normal.' : null,
                    'resolution' => $status === 'selesai' ? 'Komponen diperbaiki dan fasilitas telah diuji kembali.' : null,
                    'created_at' => $now->copy()->subDays(2 + $index),
                    'updated_at' => $now->copy()->subDay(),
                ]);

                // Preserve operator decisions when the sample seeders are rerun.
                if ($report->wasRecentlyCreated && $status === 'diproses') {
                    $room->update(['is_avail' => false]);
                }
            }
        });
    }
}
