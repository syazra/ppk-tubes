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
        $users = User::where('role', 'user')->whereIn('account_type', ['mahasiswa', 'dosen', 'staf'])->orderBy('id')->get();
        $rooms = Room::orderBy('id')->get();

        if ($users->isEmpty() || $rooms->isEmpty()) {
            throw new LogicException('Seed demo users and facilities before reservations.');
        }

        $today = now(config('app.timezone'))->startOfDay();
        $statuses = ['menunggu', 'disetujui', 'ditolak', 'dibatalkan'];

        DB::transaction(function () use ($users, $rooms, $today, $statuses): void {
            foreach ($rooms as $index => $room) {
                $user = $users[$index % $users->count()];

                $history = Reservation::firstOrCreate([
                    'room_id' => $room->id,
                    'desc' => 'Kegiatan belajar bersama di '.$room->name,
                ], [
                    'user_id' => $user->id,
                    'date_to_reserv' => $today->copy()->subDays(1 + $index % 14)->toDateString(),
                    'start_time' => '08:00:00',
                    'end_time' => '10:00:00',
                    'status' => 'disetujui',
                    'rejection_reason' => null,
                ]);
                if ($history->wasRecentlyCreated) {
                    $submitted = $today->copy()->subDays(3 + $index % 14)->setTime(9, 0);
                    $history->forceFill(['created_at' => $submitted, 'updated_at' => $submitted->copy()->addHours(6)])->save();
                }

                $status = $room->is_avail ? $statuses[$index % count($statuses)] : 'ditolak';

                $upcoming = Reservation::firstOrCreate([
                    'room_id' => $room->id,
                    'desc' => 'Diskusi dan persiapan kegiatan di '.$room->name,
                ], [
                    'user_id' => $users[($index + 1) % $users->count()]->id,
                    'date_to_reserv' => $today->copy()->addDays(2 + $index % 7)->toDateString(),
                    'start_time' => '13:00:00',
                    'end_time' => '15:00:00',
                    'status' => $status,
                    'rejection_reason' => $status === 'ditolak'
                        ? ($room->is_avail ? 'Pengajuan belum memenuhi persyaratan kegiatan.' : 'Fasilitas sedang dalam perbaikan')
                        : null,
                ]);
                if ($upcoming->wasRecentlyCreated) {
                    $submitted = $today->copy()->subDays(1 + $index % 7)->setTime(11, 0);
                    $upcoming->forceFill(['created_at' => $submitted, 'updated_at' => $status === 'menunggu' ? $submitted : $submitted->copy()->addHours(4)])->save();
                }

                $activities = match ($room->type) {
                    'Aula' => ['Seminar kepemimpinan organisasi', 'Latihan paduan suara', 'Lokakarya penulisan ilmiah', 'Pentas seni kampus', 'Orientasi komunitas mahasiswa', 'Kuliah tamu lintas fakultas', 'Forum pengabdian masyarakat', 'Rapat koordinasi kepanitiaan'],
                    'Laboratorium' => ['Praktikum pengenalan instrumen', 'Eksperimen kelompok penelitian', 'Pelatihan keselamatan laboratorium', 'Pengujian prototipe tugas akhir', 'Workshop analisis data', 'Demonstrasi alkimia dasar', 'Uji kalibrasi peralatan', 'Diskusi hasil penelitian'],
                    'Lapangan' => ['Latihan olahraga antarangkatan', 'Turnamen persahabatan', 'Senam bersama komunitas', 'Latihan formasi tim', 'Seleksi anggota klub olahraga', 'Festival permainan tradisional', 'Pelatihan kebugaran staf', 'Persiapan kompetisi kampus'],
                    default => ['Diskusi kelompok mata kuliah', 'Presentasi proyek semester', 'Kelas pendampingan akademik', 'Lokakarya pemrograman', 'Rapat komunitas literasi', 'Bimbingan tugas akhir', 'Pelatihan administrasi organisasi', 'Persiapan lomba karya ilmiah'],
                };
                $times = [['08:00:00', '09:30:00'], ['10:00:00', '12:00:00'], ['13:00:00', '14:30:00'], ['15:00:00', '17:00:00']];
                foreach ($activities as $sample => $activity) {
                    $past = $sample < 4;
                    $dayOffset = $past ? -(20 + $sample * 20 + $index % 11) : 14 + ($sample - 4) * 14 + $index % 7;
                    $date = $today->copy()->addDays($dayOffset);
                    $status = $past
                        ? ['disetujui', 'ditolak', 'dibatalkan'][($index + $sample) % 3]
                        : $statuses[($index + $sample) % count($statuses)];
                    if (! $past && ! $room->is_avail) {
                        $status = 'ditolak';
                    }
                    [$start, $end] = $times[($index + $sample) % count($times)];
                    $reservation = Reservation::firstOrCreate([
                        'room_id' => $room->id,
                        'desc' => $activity,
                    ], [
                        'user_id' => $users[($index * 8 + $sample + 7) % $users->count()]->id,
                        'date_to_reserv' => $date->toDateString(),
                        'start_time' => $start,
                        'end_time' => $end,
                        'status' => $status,
                        'rejection_reason' => $status === 'ditolak'
                            ? (! $past && ! $room->is_avail ? 'Fasilitas sedang dalam perbaikan' : ['Dokumen kegiatan belum lengkap.', 'Kegiatan perlu dijadwalkan ulang sesuai agenda kampus.', 'Penanggung jawab kegiatan belum dikonfirmasi.'][($index + $sample) % 3])
                            : null,
                    ]);
                    if ($reservation->wasRecentlyCreated) {
                        $submitted = ($past ? $date->copy()->subDays(3 + $sample) : $today->copy()->subDays(1 + $index % 10))->setTime(9, 0);
                        $reservation->forceFill([
                            'created_at' => $submitted,
                            'updated_at' => $status === 'menunggu' ? $submitted : $submitted->copy()->addHours(4 + $sample),
                        ])->save();
                    }
                }
            }
        });
    }
}
