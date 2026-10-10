<?php

namespace Tests\SecurityAudit;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Audit probes: passing tests reproduce the current defects, not secure behavior.
 * Run explicitly with the root phpunit.xml; excluded from the regular suite.
 * All records use in-memory SQLite; uploads use Laravel's fake public disk.
 */
class SecurityAuditReproductionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->travelTo(now()->setDate(2026, 10, 11)->setTime(10, 0));
    }

    public function test_approval_replay_creates_two_approved_overlapping_reservations(): void
    {
        $first = $this->reservation();
        $second = $this->reservation(['room_id' => $first->room_id]);
        $this->actingAs(User::factory()->create(['role' => 'operator']));

        $this->patch('/operator/reservations/'.$first->id.'/approve')->assertRedirect();
        $this->assertSame('ditolak', $second->fresh()->status);
        $this->patch('/operator/reservations/'.$second->id.'/approve')->assertRedirect();

        $this->assertSame('disetujui', $first->fresh()->status);
        $this->assertSame('disetujui', $second->fresh()->status);
    }

    public function test_cancelled_reservation_in_disabled_room_can_be_approved(): void
    {
        $reservation = $this->reservation(['status' => 'dibatalkan']);
        $reservation->room->update(['is_avail' => false]);

        $this->actingAs(User::factory()->create(['role' => 'operator']))
            ->patch('/operator/reservations/'.$reservation->id.'/approve')
            ->assertRedirect();

        $this->assertSame('disetujui', $reservation->fresh()->status);
        $this->assertFalse($reservation->room->fresh()->is_avail);
    }

    public function test_owner_can_cancel_a_reservation_after_its_start_time(): void
    {
        $reservation = $this->reservation([
            'date_to_reserv' => '2026-10-11', 'start_time' => '09:00:00', 'end_time' => '11:00:00',
        ]);
        $this->assertFalse($reservation->canStillBeProcessed());

        $this->actingAs($reservation->user)
            ->patch('/reservations/'.$reservation->id.'/cancel')->assertRedirect();

        $this->assertSame('dibatalkan', $reservation->fresh()->status);
    }

    public function test_completing_one_report_reopens_room_with_another_active_repair(): void
    {
        $reservation = $this->reservation();
        $room = $reservation->room;
        $room->update(['is_avail' => false]);
        $attributes = [
            'user_id' => $reservation->user_id, 'room_id' => $room->id,
            'desc' => 'Synthetic audit repair', 'status' => 'diproses',
            'estimated_completion_at' => '2026-10-14 12:00:00',
        ];
        $first = Report::create($attributes);
        $second = Report::create($attributes);

        $this->actingAs(User::factory()->create(['role' => 'operator']))
            ->patch('/operator/reports/'.$first->id.'/complete', ['resolution' => 'First repair complete'])
            ->assertRedirect();

        $this->assertSame('diproses', $second->fresh()->status);
        $this->assertTrue($room->fresh()->is_avail);
    }

    public function test_proposals_are_stored_on_the_public_disk(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $room = $this->room();
        $this->actingAs($user)->post('/reservations', [
            'room_id' => $room->id, 'reservation_type' => 'Individu',
            'activity_name' => 'Synthetic audit upload', 'participant_count' => 1,
            'date_to_reserv' => '2026-10-13', 'start_time' => '08:00', 'end_time' => '09:00',
            'proposal' => UploadedFile::fake()->createWithContent('audit.pdf', "%PDF-1.4\n% synthetic audit file\n%%EOF"),
        ])->assertSessionHasNoErrors()->assertRedirect();

        $path = Reservation::sole()->proposal_path;
        $this->assertStringStartsWith('proposals/', $path);
        Storage::disk('public')->assertExists($path);
        $this->assertStringContainsString('/storage/proposals/', Storage::disk('public')->url($path));
    }

    public function test_report_photos_are_stored_on_the_public_disk(): void
    {
        Storage::fake('public');
        $this->actingAs(User::factory()->create())->post('/report/store', [
            'room_id' => $this->room()->id, 'desc' => 'Synthetic audit report',
            'images' => [UploadedFile::fake()->createWithContent('audit.png', base64_decode(
                'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='
            ))],
        ])->assertSessionHasNoErrors()->assertRedirect();

        $path = Report::sole()->images()->sole()->image;
        $this->assertStringStartsWith('reports/', $path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_resource_creation_routes_have_no_application_throttle(): void
    {
        foreach (['reservations.store', 'reports.store'] as $name) {
            $middleware = app('router')->getRoutes()->getByName($name)->gatherMiddleware();
            $this->assertSame([], array_values(array_filter($middleware, fn ($item) => str_contains($item, 'throttle'))));
        }
    }

    public function test_control_other_user_cannot_read_ticket_or_cancel_reservation(): void
    {
        $reservation = $this->reservation();
        $this->actingAs(User::factory()->create());
        $this->get('/reservations/'.$reservation->id.'/ticket')->assertForbidden();
        $this->patch('/reservations/'.$reservation->id.'/cancel')->assertForbidden();
        $this->assertSame('menunggu', $reservation->fresh()->status);
    }

    private function reservation(array $overrides = []): Reservation
    {
        return Reservation::create(array_merge([
            'user_id' => User::factory()->create()->id,
            'room_id' => $overrides['room_id'] ?? $this->room()->id,
            'activity_name' => 'Synthetic audit reservation', 'participant_count' => 1,
            'date_to_reserv' => '2026-10-13', 'start_time' => '08:00:00', 'end_time' => '09:00:00',
            'status' => 'menunggu',
        ], $overrides));
    }

    private function room(): Room
    {
        return Room::create([
            'name' => 'Audit room', 'location' => 'Audit building', 'type' => 'Ruang Kelas',
            'capacity' => 30, 'is_avail' => true,
        ]);
    }
}
