<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ReportSeeder;
use Database\Seeders\ReservationSeeder;
use Database\Seeders\RoomSeeder;
use Database\Seeders\UserSeeder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemoActivitySeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_main_seeder_populates_all_activity_statuses_and_inactive_facility_classes(): void
    {
        Storage::fake('public');
        $this->travelTo(Carbon::parse('2026-10-10 19:00:00', config('app.timezone')));
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('rooms', 37);
        $this->assertDatabaseCount('room_images', 37);
        $this->assertDatabaseCount('reports', 12);
        $this->assertDatabaseCount('reservations', 74);
        $this->assertSame(['baru', 'dibatalkan', 'diproses', 'ditolak', 'selesai'], Report::distinct()->orderBy('status')->pluck('status')->all());
        $this->assertSame(['dibatalkan', 'disetujui', 'ditolak', 'menunggu'], Reservation::distinct()->orderBy('status')->pluck('status')->all());
        $this->assertSame(['Aula', 'Laboratorium', 'Lapangan', 'Ruang Kelas'], Room::where('is_avail', false)->orderBy('type')->pluck('type')->all());

        foreach (Report::with('room', 'user')->get() as $report) {
            $this->assertSame('user', $report->user->role);
            if ($report->status === 'diproses') {
                $this->assertFalse($report->room->is_avail);
                $this->assertTrue(Carbon::parse($report->estimated_completion_at)->isFuture());
            }
            if ($report->status === 'selesai') {
                $this->assertNotEmpty($report->resolution);
            }
            if ($report->status === 'ditolak') {
                $this->assertNotEmpty($report->rejection_reason);
            }
        }

        $reservations = Reservation::with('room', 'user')->get();
        $this->assertSame(['dosen', 'mahasiswa', 'staf'], $reservations->pluck('user.account_type')->unique()->sort()->values()->all());
        $this->assertSame(37, $reservations->filter(fn ($reservation) => $reservation->date_to_reserv < '2026-10-10')->count());
        $this->assertSame(37, $reservations->filter(fn ($reservation) => $reservation->date_to_reserv > '2026-10-10')->count());

        foreach ($reservations as $reservation) {
            $this->assertSame('user', $reservation->user->role);
            $this->assertLessThan($reservation->end_time, $reservation->start_time);
            if ($reservation->date_to_reserv > '2026-10-10' && ! $reservation->room->is_avail) {
                $this->assertSame('ditolak', $reservation->status);
                $this->assertSame('Fasilitas sedang dalam perbaikan', $reservation->rejection_reason);
            }
            if ($reservation->status === 'menunggu') {
                $this->assertTrue($reservation->canStillBeProcessed());
            }
        }
    }

    public function test_rerunning_sample_seeders_preserves_operator_decisions_dates_and_existing_data(): void
    {
        $this->seed([UserSeeder::class, RoomSeeder::class, ReportSeeder::class, ReservationSeeder::class]);
        $report = Report::where('status', 'diproses')->firstOrFail();
        $report->update(['status' => 'selesai', 'resolution' => 'Sudah diperbaiki operator.']);
        $report->room->update(['is_avail' => true]);
        $reservation = Reservation::where('status', 'menunggu')->firstOrFail();
        $reservation->update(['status' => 'dibatalkan']);
        Reservation::create([
            'room_id' => $reservation->room_id,
            'user_id' => $reservation->user_id,
            'desc' => 'Reservasi buatan pengguna',
            'date_to_reserv' => now()->addDays(30)->toDateString(),
            'start_time' => '16:00:00',
            'end_time' => '17:00:00',
            'status' => 'menunggu',
        ]);
        $before = [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray()];
        $this->travel(2)->days();

        $this->seed([ReportSeeder::class, ReservationSeeder::class]);

        $this->assertSame($before, [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray()]);
        $this->assertDatabaseCount('reservations', 75);
        $this->assertTrue($report->room->fresh()->is_avail);
    }

    public function test_missing_facility_rolls_back_reports_and_deactivation(): void
    {
        $this->seed(UserSeeder::class);
        $room = Room::create([
            'name' => 'Lab Komputer 1',
            'location' => 'Gedung E Lt. 2',
            'type' => 'Laboratorium',
            'capacity' => 40,
            'is_avail' => true,
        ]);

        try {
            $this->seed(ReportSeeder::class);
            $this->fail('Missing demo facilities must stop the seeder.');
        } catch (ModelNotFoundException) {
            $this->assertDatabaseCount('reports', 0);
            $this->assertTrue($room->fresh()->is_avail);
        }
    }
}
