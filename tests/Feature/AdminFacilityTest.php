<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use ZipArchive;

class AdminFacilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function facility(array $attributes = []): Room
    {
        return Room::create($attributes + [
            'name' => 'Lab Komputer',
            'location' => 'Gedung A',
            'type' => 'Laboratorium',
            'capacity' => 40,
            'desc' => 'Lab kampus',
            'is_avail' => true,
        ]);
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    public function test_only_admin_can_manage_facilities_and_export_recap(): void
    {
        $this->get(route('admin.facilities.index'))->assertRedirect(route('login'));
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->get(route('admin.facilities.index'))->assertForbidden();
        $this->actingAs($user)->post(route('admin.facilities.store'), [])->assertForbidden();
        $this->actingAs($user)->get(route('admin.facilities.recap'))->assertForbidden();
        $this->actingAs($user)->get(route('admin.facilities.recap.export', 'csv'))->assertForbidden();
    }

    public function test_admin_can_create_edit_and_deactivate_without_losing_history(): void
    {
        $admin = $this->admin();
        $payload = [
            'name' => 'Aula Baru', 'location' => 'Gedung B', 'type' => 'Aula',
            'capacity' => 120, 'desc' => 'Ruang acara',
        ];

        $this->actingAs($admin)->post(route('admin.facilities.store'), $payload)
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.facilities.index'));
        $room = Room::where('name', 'Aula Baru')->firstOrFail();
        $this->assertTrue($room->is_avail);

        $this->put(route('admin.facilities.update', $room), [
            ...$payload, 'name' => 'Aula Utama', 'capacity' => 150,
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('rooms', ['id' => $room->id, 'name' => 'Aula Utama', 'capacity' => 150]);

        $this->patch(route('admin.facilities.availability', $room), ['is_avail' => false])
            ->assertSessionHasNoErrors();
        $this->assertFalse($room->fresh()->is_avail);
        $this->assertDatabaseCount('rooms', 1);

        $this->patch(route('admin.facilities.availability', $room), ['is_avail' => true])
            ->assertSessionHasNoErrors();
        $this->assertTrue($room->fresh()->is_avail);
    }

    public function test_facility_validation_and_inactive_reservation_protection(): void
    {
        $admin = $this->admin();
        $this->actingAs($admin)->post(route('admin.facilities.store'), [
            'name' => '', 'location' => '', 'type' => 'Unknown', 'capacity' => 0,
        ])->assertSessionHasErrors(['name', 'location', 'type', 'capacity']);

        $room = $this->facility(['is_avail' => false]);
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->post(route('reservations.store'), [
            'room_id' => $room->id, 'desc' => 'Kegiatan', 'date_to_reserv' => '2026-10-02',
            'start_time' => '10:00', 'end_time' => '11:00',
        ])->assertSessionHasErrors('room_id');
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_recap_groups_approved_occupancy_and_valid_damage_by_facility_and_location(): void
    {
        $admin = $this->admin();
        $user = User::factory()->create(['role' => 'user']);
        $first = $this->facility();
        $second = $this->facility(['name' => 'Aula', 'location' => 'Gedung A', 'type' => 'Aula']);
        $third = $this->facility(['name' => 'Lapangan', 'location' => 'Gedung B', 'type' => 'Lapangan', 'is_avail' => false]);

        foreach ([
            [$first, 'disetujui', '2026-09-12', '08:00', '10:30'],
            [$first, 'menunggu', '2026-09-12', '11:00', '12:00'],
            [$second, 'disetujui', '2026-09-13', '09:00', '10:00'],
            [$third, 'disetujui', '2026-08-13', '09:00', '12:00'],
        ] as [$room, $status, $date, $start, $end]) {
            Reservation::create([
                'user_id' => $user->id, 'room_id' => $room->id, 'desc' => 'Kegiatan',
                'date_to_reserv' => $date, 'start_time' => $start,
                'end_time' => $end, 'status' => $status,
            ]);
        }
        foreach ([[$first, 'baru', '2026-09-12'], [$first, 'ditolak', '2026-09-13'], [$second, 'selesai', '2026-09-14'], [$third, 'diproses', '2026-08-14']] as [$room, $status, $date]) {
            $report = Report::create(['user_id' => $user->id, 'room_id' => $room->id, 'desc' => 'Rusak', 'image' => 'test.jpg', 'status' => $status]);
            $report->forceFill(['created_at' => $date.' 10:00:00'])->save();
        }

        $url = route('admin.facilities.recap', ['from' => '2026-09-01', 'to' => '2026-09-30', 'location' => 'Gedung A']);
        $this->actingAs($admin)->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/FacilityRecap')
            ->where('recap.totals.facilities', 2)
            ->where('recap.totals.reservations', 2)
            ->where('recap.totals.occupied_hours', 3.5)
            ->where('recap.totals.damage_reports', 2)
            ->where('recap.locations.0.location', 'Gedung A')
            ->where('recap.locations.0.reservations', 2)
            ->etc());

        $csv = $this->get(route('admin.facilities.recap.export', [
            'format' => 'csv', 'from' => '2026-09-01', 'to' => '2026-09-30', 'location' => 'Gedung A',
        ]))->assertOk()->streamedContent();
        $this->assertStringContainsString('Lab Komputer', $csv);
        $this->assertStringContainsString('Aula', $csv);
        $this->assertStringNotContainsString('Lapangan', $csv);

        $this->get(route('admin.facilities.recap', ['from' => '2026-09-30', 'to' => '2026-09-01']))
            ->assertSessionHasErrors('to');
    }

    public function test_exports_are_real_csv_xlsx_and_pdf_files(): void
    {
        $admin = $this->admin();
        $this->facility(['name' => '=TEST()', 'location' => 'Gedung A']);
        $parameters = ['from' => '2026-09-01', 'to' => '2026-09-30'];

        $csv = $this->actingAs($admin)->get(route('admin.facilities.recap.export', ['format' => 'csv', ...$parameters]))->assertOk();
        $csv->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString("'=TEST()", $csv->streamedContent());

        $xlsx = $this->get(route('admin.facilities.recap.export', ['format' => 'xlsx', ...$parameters]))->assertOk();
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($xlsx->baseResponse->getFile()->getPathname()) === true);
        $this->assertStringContainsString('=TEST()', $zip->getFromName('xl/worksheets/sheet1.xml'));
        $this->assertNotFalse($zip->getFromName('xl/worksheets/sheet2.xml'));
        $zip->close();

        $pdf = $this->get(route('admin.facilities.recap.export', ['format' => 'pdf', ...$parameters]))->assertOk();
        $pdf->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $pdf->getContent());

        $this->get(route('admin.facilities.recap.export', 'json'))->assertNotFound();
    }
}
