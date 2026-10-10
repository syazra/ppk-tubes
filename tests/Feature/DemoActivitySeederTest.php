<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
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

    public function test_main_seeder_populates_a_limited_dynamic_amount_of_activity(): void
    {
        Storage::fake('public');
        $this->travelTo(Carbon::parse('2026-10-10 19:00:00', config('app.timezone')));
        $this->seed(DatabaseSeeder::class);

        $eligible = User::where('role', 'user')->whereIn('account_type', ['mahasiswa', 'dosen', 'staf'])->count();
        $rooms = Room::count();
        $this->assertSame(37, $rooms);
        $this->assertDatabaseCount('room_images', 37);

        // Counts scale with the user pool but stay capped by the number of rooms.
        $this->assertSame(min((int) round($eligible * 0.25), $rooms * 2), Reservation::count());
        $this->assertSame(max(12, min((int) round($eligible / 8), $rooms)), Report::count());
        $this->assertLessThan($eligible, Reservation::count());

        $this->assertSame(0, Room::where('location', 'like', 'Gedung %')->orWhere('location', 'like', 'Area %')->count());
        $this->assertSame(1, Room::where('name', 'Laboratorium Teknomansi Aether')->count());
        $this->assertSame(['baru', 'dibatalkan', 'diproses', 'ditolak', 'selesai'], Report::distinct()->orderBy('status')->pluck('status')->all());
        $this->assertSame(['dibatalkan', 'disetujui', 'ditolak', 'menunggu'], Reservation::distinct()->orderBy('status')->pluck('status')->all());
        $this->assertSame(['Aula', 'Laboratorium', 'Lapangan', 'Ruang Kelas'], Room::where('is_avail', false)->orderBy('type')->pluck('type')->all());

        foreach (Report::with('room', 'user')->get() as $report) {
            $this->assertSame('user', $report->user->role);
            $this->assertTrue($report->updated_at->gte($report->created_at));
            $this->assertTrue($report->created_at->isPast());
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
        $this->assertGreaterThan(0, $reservations->filter(fn ($r) => $r->date_to_reserv < '2026-10-10')->count());
        $this->assertGreaterThan(0, $reservations->filter(fn ($r) => $r->date_to_reserv > '2026-10-10')->count());
        $this->assertGreaterThan(10, $reservations->pluck('user_id')->unique()->count());
        $this->assertGreaterThan(10, $reservations->pluck('date_to_reserv')->unique()->count());
        $this->assertGreaterThanOrEqual(4, $reservations->pluck('start_time')->unique()->count());

        // Descriptions should be varied, themed text rather than repeated boilerplate.
        $this->assertGreaterThan(30, $reservations->pluck('desc')->unique()->count());

        $sampleText = mb_strtolower(implode(' ', array_merge(
            Report::pluck('desc')->all(), Report::pluck('rejection_reason')->all(), Report::pluck('resolution')->all(),
            Reservation::pluck('desc')->all(), Reservation::pluck('rejection_reason')->all(),
        )));
        foreach (['mikrofon', 'speaker', 'proyektor', 'workshop', 'pemrograman', 'analisis data', 'kabel', 'stopkontak', 'agenda kampus'] as $modernTerm) {
            $this->assertStringNotContainsString($modernTerm, $sampleText);
        }

        foreach ($reservations as $reservation) {
            $this->assertSame('user', $reservation->user->role);
            $this->assertLessThan($reservation->end_time, $reservation->start_time);
            $this->assertLessThanOrEqual($reservation->date_to_reserv, $reservation->created_at->toDateString());
            $this->assertTrue($reservation->updated_at->gte($reservation->created_at));
            if ($reservation->date_to_reserv > '2026-10-10' && ! $reservation->room->is_avail) {
                $this->assertSame('ditolak', $reservation->status);
                $this->assertSame('Fasilitas sedang dalam perbaikan', $reservation->rejection_reason);
            }
            if ($reservation->status === 'menunggu') {
                $this->assertTrue($reservation->canStillBeProcessed());
            }
        }
    }

    public function test_activity_counts_can_be_overridden_with_environment_variables(): void
    {
        putenv('DEMO_RESERVATIONS=15');
        putenv('DEMO_REPORTS=14');
        $_ENV['DEMO_RESERVATIONS'] = '15';
        $_ENV['DEMO_REPORTS'] = '14';

        try {
            $this->seed([UserSeeder::class, RoomSeeder::class, ReportSeeder::class, ReservationSeeder::class]);

            $this->assertDatabaseCount('reservations', 15);
            $this->assertDatabaseCount('reports', 14);
        } finally {
            putenv('DEMO_RESERVATIONS');
            putenv('DEMO_REPORTS');
            unset($_ENV['DEMO_RESERVATIONS'], $_ENV['DEMO_REPORTS']);
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
        $reportCount = Report::count();
        $reservationCount = Reservation::count();
        $before = [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray()];
        $this->travel(2)->days();

        $this->seed([ReportSeeder::class, ReservationSeeder::class]);

        $this->assertSame($before, [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray()]);
        $this->assertSame($reportCount, Report::count());
        $this->assertSame($reservationCount, Reservation::count());
        $this->assertTrue($report->room->fresh()->is_avail);
    }

    public function test_missing_facility_rolls_back_reports_and_deactivation(): void
    {
        $this->seed(UserSeeder::class);
        $room = Room::create([
            'name' => 'Laboratorium Teknomansi Aether',
            'location' => 'Menara Aether - Tingkat II',
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
