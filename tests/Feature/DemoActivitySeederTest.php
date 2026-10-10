<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoActivityText;
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
        $this->assertDatabaseCount('reports', 160);
        $this->assertDatabaseCount('reservations', 370);
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
        $this->assertSame(['dosen', 'mahasiswa', 'staf'], $reservations->pluck('user.account_type')->unique()->sort()->values()->all());
        $this->assertSame(185, $reservations->filter(fn ($reservation) => $reservation->date_to_reserv < '2026-10-10')->count());
        $this->assertSame(185, $reservations->filter(fn ($reservation) => $reservation->date_to_reserv > '2026-10-10')->count());
        $this->assertSame(27, $reservations->pluck('user_id')->unique()->count());
        $this->assertSame(27, Report::distinct()->count('user_id'));
        foreach (User::where('role', 'user')->get() as $user) {
            $this->assertGreaterThanOrEqual(10, Reservation::where('user_id', $user->id)->count());
            $this->assertGreaterThanOrEqual(5, Report::where('user_id', $user->id)->count());
        }
        foreach (Room::all() as $room) {
            $this->assertSame(10, Reservation::where('room_id', $room->id)->count());
            $this->assertGreaterThanOrEqual(8, Reservation::where('room_id', $room->id)->distinct()->count('user_id'));
            $this->assertGreaterThanOrEqual(4, Report::where('room_id', $room->id)->distinct()->count('user_id'));
        }
        $this->assertGreaterThan(30, $reservations->pluck('date_to_reserv')->unique()->count());
        $this->assertGreaterThanOrEqual(4, $reservations->pluck('start_time')->unique()->count());
        $this->assertGreaterThan(30, Report::distinct()->count('created_at'));
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
        // Changing the eligible user pool must not reassign or duplicate seeded activity.
        User::factory()->create(['role' => 'user', 'account_type' => 'mahasiswa']);
        $this->travel(2)->days();

        $this->seed([ReportSeeder::class, ReservationSeeder::class]);

        $this->assertSame($before, [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray()]);
        $this->assertDatabaseCount('reservations', 371);
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

    public function test_old_sample_text_is_upgraded_without_changing_metadata_or_custom_notes(): void
    {
        $this->seed([UserSeeder::class, RoomSeeder::class, ReportSeeder::class, ReservationSeeder::class]);
        $oldReport = array_key_first(DemoActivityText::REPORTS['Ruang Kelas']);
        $newReport = DemoActivityText::REPORTS['Ruang Kelas'][$oldReport];
        $report = Report::where('desc', $newReport)->firstOrFail();
        $report->update([
            'desc' => $oldReport, 'status' => 'selesai',
            'rejection_reason' => 'Catatan khusus penjaga, pertahankan.',
            'resolution' => 'Komponen diperbaiki dan fasilitas telah diuji kembali.',
        ]);
        $expectedReport = $report->fresh()->getAttributes();
        $expectedReport['desc'] = $newReport;
        $expectedReport['resolution'] = DemoActivityText::NOTES['resolution']['Komponen diperbaiki dan fasilitas telah diuji kembali.'];

        $reservation = Reservation::where('desc', 'Pembacaan pertanda pada kristal scrying')->firstOrFail();
        $reservation->update(['desc' => 'Workshop analisis data', 'status' => 'dibatalkan', 'rejection_reason' => 'Catatan khusus pemohon, pertahankan.']);
        $expectedReservation = $reservation->fresh()->getAttributes();
        $expectedReservation['desc'] = 'Pembacaan pertanda pada kristal scrying';
        $custom = Reservation::create([
            'room_id' => $reservation->room_id, 'user_id' => $reservation->user_id,
            'desc' => 'Workshop desain milik pengguna', 'date_to_reserv' => now()->addDays(30)->toDateString(),
            'start_time' => '16:00:00', 'end_time' => '17:00:00', 'status' => 'menunggu',
        ]);
        $expectedCustom = $custom->fresh()->getAttributes();
        $this->travel(2)->days();

        $this->seed([ReportSeeder::class, ReservationSeeder::class]);

        $this->assertSame($expectedReport, $report->fresh()->getAttributes());
        $this->assertSame($expectedReservation, $reservation->fresh()->getAttributes());
        $this->assertSame($expectedCustom, $custom->fresh()->getAttributes());
        $this->assertDatabaseCount('reports', 160);
        $this->assertDatabaseCount('reservations', 371);
    }
}
