<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use App\Services\PrivatizeAttachments;
use App\Services\RepairWorkflow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SecurityRemediationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->travelTo(now()->setDate(2026, 10, 11)->setTime(6, 0));
        Storage::fake('public');
    }

    private function room(): Room
    {
        return Room::create(['name' => 'Audit room', 'location' => 'Campus', 'type' => 'Ruang Kelas', 'capacity' => 30, 'is_avail' => true]);
    }

    private function booking(Room $room, User $owner, array $extra = []): Reservation
    {
        return Reservation::create(array_merge(['user_id' => $owner->id, 'room_id' => $room->id,
            'activity_name' => 'Audit', 'date_to_reserv' => '2026-10-12', 'start_time' => '09:00:00',
            'end_time' => '10:00:00', 'status' => 'menunggu'], $extra));
    }

    private function report(Room $room, User $owner, array $extra = []): Report
    {
        return Report::create(array_merge(['user_id' => $owner->id, 'room_id' => $room->id, 'desc' => 'Audit', 'status' => 'baru'], $extra));
    }

    public function test_approval_replay_cannot_revive_rejected_or_cancelled_requests(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $a = $this->booking($room, $owner);
        $b = $this->booking($room, $owner);
        $cancelled = $this->booking($room, $owner, ['status' => 'dibatalkan']);
        $this->actingAs(User::factory()->create(['role' => 'operator']));
        $this->patch(route('operator.reservations.approve', $a))->assertSessionHasNoErrors();
        $this->assertSame('ditolak', $b->fresh()->status);
        foreach ([$a, $b, $cancelled] as $booking) {
            $this->patch(route('operator.reservations.approve', $booking))->assertSessionHasErrors('reservation');
        }
        $this->assertSame(1, Reservation::where('status', 'disetujui')->count());
        $this->assertSame('dibatalkan', $cancelled->fresh()->status);
    }

    public function test_approval_checks_existing_conflicts_disabled_rooms_and_elapsed_start(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $this->booking($room, $owner, ['status' => 'disetujui']);
        $pending = $this->booking($room, $owner);
        $this->actingAs(User::factory()->create(['role' => 'operator']));
        $this->patch(route('operator.reservations.approve', $pending))->assertSessionHasErrors('reservation');
        $adjacent = $this->booking($room, $owner, ['start_time' => '10:00:00', 'end_time' => '11:00:00']);
        $this->patch(route('operator.reservations.approve', $adjacent))->assertRedirect();
        $this->assertSame('disetujui', $adjacent->fresh()->status);
        $room->update(['is_avail' => false, 'is_admin_disabled' => true]);
        $disabled = $this->booking($room, $owner, ['start_time' => '12:00:00', 'end_time' => '13:00:00']);
        $this->patch(route('operator.reservations.approve', $disabled))->assertSessionHasErrors('reservation');
        $room->update(['is_avail' => true, 'is_admin_disabled' => false]);
        $past = $this->booking($room, $owner, ['date_to_reserv' => '2026-10-10']);
        $this->patch(route('operator.reservations.approve', $past))->assertSessionHasErrors('reservation');
    }

    public function test_cancellation_enforces_the_six_hour_boundary_and_ui_permission(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $exact = $this->booking($room, $owner, ['date_to_reserv' => '2026-10-11', 'start_time' => '12:00:00', 'end_time' => '13:00:00']);
        $late = $this->booking($room, $owner, ['date_to_reserv' => '2026-10-11', 'start_time' => '11:59:00', 'end_time' => '13:00:00']);
        $this->actingAs($owner)->get(route('reservations.index'))->assertInertia(fn (Assert $page) => $page
            ->where('reservations.data', fn ($rows) => collect($rows)->keyBy('id')[$late->id]['can_cancel'] === false));
        $this->patch(route('reservations.cancel', $late))->assertSessionHas('error');
        $this->assertSame('menunggu', $late->fresh()->status);
        $this->patch(route('reservations.cancel', $exact))->assertRedirect();
        $this->assertSame('dibatalkan', $exact->fresh()->status);
    }

    public function test_completing_repairs_preserves_other_repairs_and_admin_deactivation(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $a = $this->report($room, $owner);
        $b = $this->report($room, $owner);
        $this->actingAs(User::factory()->create(['role' => 'operator']));
        foreach ([$a, $b] as $report) {
            $this->patch(route('operator.reports.process', $report), ['estimated_completion_at' => '2026-10-12 12:00:00'])->assertSessionHasNoErrors();
        }
        $this->patch(route('operator.reports.complete', $a))->assertSessionHasNoErrors();
        $this->assertFalse($room->fresh()->is_avail);
        $room->update(['is_admin_disabled' => true]);
        $this->patch(route('operator.reports.complete', $b))->assertSessionHasNoErrors();
        $this->assertFalse($room->fresh()->is_avail);
        $this->patch(route('operator.reports.complete', $b))->assertSessionHasErrors('report');
    }

    public function test_last_repair_reopens_an_enabled_room_and_extension_cannot_shorten_it(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $report = $this->report($room, $owner);
        $this->actingAs(User::factory()->create(['role' => 'operator']));
        $this->patch(route('operator.reports.process', $report), ['estimated_completion_at' => '2026-10-13 12:00:00']);
        $this->patch(route('operator.reports.extend', $report), ['estimated_completion_at' => '2026-10-12 12:00:00'])->assertSessionHasErrors('estimated_completion_at');
        $this->patch(route('operator.reports.complete', $report));
        $this->assertTrue($room->fresh()->is_avail);
    }

    public function test_overdue_scheduler_preserves_historical_bookings(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $report = $this->report($room, $owner, ['status' => 'diproses', 'estimated_completion_at' => '2026-10-10 12:00:00']);
        $past = $this->booking($room, $owner, ['status' => 'disetujui', 'date_to_reserv' => '2026-10-09']);
        $future = $this->booking($room, $owner, ['status' => 'disetujui', 'date_to_reserv' => '2026-10-11']);
        app(RepairWorkflow::class)->extendOverdue();
        $this->assertSame('disetujui', $past->fresh()->status);
        $this->assertSame('ditolak', $future->fresh()->status);
        $this->assertFalse($room->fresh()->is_avail);
        $this->assertSame('2026-10-11 12:00:00', $report->fresh()->estimated_completion_at);
    }

    public function test_private_downloads_require_owner_or_verified_staff(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $reservation = $this->booking($room, $owner, ['proposal_path' => 'proposals/private.pdf']);
        $image = $this->report($room, $owner)->images()->create(['image' => 'reports/private.png']);
        Storage::disk('attachments')->put('proposals/private.pdf', '%PDF-1.4 audit');
        Storage::disk('attachments')->put('reports/private.png', 'audit image');
        $urls = [route('reservations.proposal', $reservation), route('reports.images.show', $image)];
        foreach ($urls as $url) {
            $this->get($url)->assertRedirect(route('login'));
        }
        $this->actingAs(User::factory()->create());
        foreach ($urls as $url) {
            $this->get($url)->assertForbidden();
        }
        foreach ([$owner, User::factory()->create(['role' => 'operator']), User::factory()->create(['role' => 'admin'])] as $user) {
            $this->actingAs($user);
            foreach ($urls as $url) {
                $response = $this->get($url)->assertOk()->assertHeader('X-Content-Type-Options', 'nosniff');
                $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
                $this->assertStringContainsString('attachment;', $response->headers->get('Content-Disposition'));
            }
        }
        $this->actingAs(User::factory()->create(['role' => 'operator', 'email_verified_at' => null]));
        $this->get($urls[0])->assertRedirect(route('verification.notice'));
        $reservation->update(['proposal_path' => '../private.pdf']);
        $this->actingAs($owner)->get($urls[0])->assertNotFound();
    }

    public function test_photo_upload_is_private_and_quota_failure_removes_the_new_file(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==');
        $payload = fn () => ['room_id' => $room->id, 'desc' => 'Broken', 'images' => [UploadedFile::fake()->createWithContent('photo.png', $png)]];
        $this->actingAs($owner)->post(route('reports.store'), $payload())->assertSessionHasNoErrors();
        $image = Report::firstOrFail()->images->first();
        Storage::disk('attachments')->assertExists($image->image);
        Storage::disk('public')->assertMissing($image->image);
        config(['attachments.max_user_bytes' => strlen($png)]);
        $this->post(route('reports.store'), $payload())->assertSessionHasErrors('quota');
        $this->assertCount(1, Storage::disk('attachments')->allFiles());
        $this->assertDatabaseCount('reports', 1);
    }

    public function test_submission_rate_limit_is_per_account(): void
    {
        config(['attachments.requests_per_minute' => 2]);
        $this->actingAs(User::factory()->create());
        $this->post(route('reports.store'), [])->assertSessionHasErrors();
        $this->post(route('reports.store'), [])->assertSessionHasErrors();
        $this->post(route('reports.store'), [])->assertStatus(429);
        $this->actingAs(User::factory()->create())->post(route('reports.store'), [])->assertStatus(302);
    }

    public function test_report_listing_is_paginated_filtered_and_owner_scoped(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        for ($i = 0; $i < 12; $i++) {
            $this->report($room, $owner, ['desc' => 'Visible repair']);
        }
        $this->report($room, User::factory()->create(), ['desc' => 'Visible repair']);
        $this->report($room, $owner, ['status' => 'selesai']);
        $this->actingAs($owner)->get(route('reports.index', ['status' => 'baru', 'search' => 'Visible']))
            ->assertInertia(fn (Assert $page) => $page->has('reports.data', 10)->where('reports.total', 12));
    }

    public function test_legacy_migration_verifies_copies_preserves_catalogue_and_is_repeatable(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $reservation = $this->booking($room, $owner, ['proposal_path' => 'proposals/legacy.pdf']);
        $report = $this->report($room, $owner);
        $report->images()->create(['image' => 'report-images/legacy.jpg']);
        Storage::disk('public')->put('proposals/legacy.pdf', 'pdf evidence');
        Storage::disk('public')->put('report-images/legacy.jpg', 'photo evidence');
        Storage::disk('public')->put('facilities/catalog.jpg', 'public catalogue');
        $this->assertSame(2, app(PrivatizeAttachments::class)->migrate());
        $this->assertSame(0, app(PrivatizeAttachments::class)->migrate());
        Storage::disk('public')->assertMissing(['proposals/legacy.pdf', 'report-images/legacy.jpg']);
        Storage::disk('public')->assertExists('facilities/catalog.jpg');
        $this->assertSame('pdf evidence', Storage::disk('attachments')->get('proposals/legacy.pdf'));
        $this->assertSame(strlen('pdf evidence'), $reservation->fresh()->attachment_bytes);
        $this->assertSame(strlen('photo evidence'), $report->fresh()->attachment_bytes);
    }

    public function test_legacy_migration_keeps_original_when_private_contents_do_not_match(): void
    {
        Storage::disk('public')->put('reports/conflict.jpg', 'original');
        Storage::disk('attachments')->put('reports/conflict.jpg', 'different');
        try {
            app(PrivatizeAttachments::class)->migrate();
            $this->fail('A conflicting copy must stop migration.');
        } catch (\RuntimeException $exception) {
            $this->assertStringContainsString('verification failed', $exception->getMessage());
        }
        $this->assertSame('original', Storage::disk('public')->get('reports/conflict.jpg'));
    }

    public function test_pruning_removes_only_old_unreferenced_private_files(): void
    {
        $disk = Storage::disk('attachments');
        $this->booking($this->room(), User::factory()->create(), ['proposal_path' => 'proposals/retained.pdf']);
        foreach (['proposals/retained.pdf', 'reports/orphan.jpg', 'reports/recent.jpg'] as $path) {
            $disk->put($path, 'evidence');
        }
        touch($disk->path('proposals/retained.pdf'), now()->subDays(31)->timestamp);
        touch($disk->path('reports/orphan.jpg'), now()->subDays(31)->timestamp);
        touch($disk->path('reports/recent.jpg'), now()->timestamp);
        $this->artisan('attachments:prune', ['--dry-run' => true])->assertSuccessful();
        $disk->assertExists('reports/orphan.jpg');
        $this->artisan('attachments:prune')->assertSuccessful();
        $disk->assertMissing('reports/orphan.jpg');
        $disk->assertExists(['proposals/retained.pdf', 'reports/recent.jpg']);
        $this->artisan('attachments:prune', ['--days' => 0])->assertFailed();
    }

    public function test_legacy_reservation_upgrade_preserves_existing_booking(): void
    {
        $booking = $this->booking($this->room(), User::factory()->create());
        Schema::table('reservations', fn ($table) => $table->dropColumn([
            'reservation_type', 'institution', 'activity_name', 'proposal_path', 'participant_count',
        ]));
        $migration = require database_path('migrations/2026_10_11_000002_upgrade_legacy_reservation_columns.php');
        $migration->up();
        $migration->up();
        $this->assertSame('menunggu', $booking->fresh()->status);
        $this->assertSame('Kegiatan sebelumnya', $booking->fresh()->activity_name);
        $this->assertNull($booking->fresh()->proposal_path);
    }

    public function test_admin_can_deactivate_a_room_during_repair_and_cannot_override_the_repair(): void
    {
        $owner = User::factory()->create();
        $room = $this->room();
        $this->report($room, $owner, ['status' => 'diproses', 'estimated_completion_at' => '2026-10-12 12:00:00']);
        $this->actingAs(User::factory()->create(['role' => 'admin']));
        $this->patch(route('admin.facilities.availability', $room), ['is_avail' => false])->assertSessionHasNoErrors();
        $this->assertTrue($room->fresh()->is_admin_disabled);
        $this->patch(route('admin.facilities.availability', $room), ['is_avail' => true])->assertSessionHasNoErrors();
        $this->assertFalse($room->fresh()->is_admin_disabled);
        $this->assertFalse($room->fresh()->is_avail);
    }

    public function test_proposal_upload_is_private_and_capacity_failure_leaves_no_orphan(): void
    {
        $room = $this->room();
        $this->actingAs(User::factory()->create());
        $payload = fn ($count) => ['room_id' => $room->id, 'reservation_type' => 'Individu', 'activity_name' => 'Audit',
            'participant_count' => $count, 'date_to_reserv' => '2026-10-12', 'start_time' => '09:00', 'end_time' => '10:00',
            'proposal' => UploadedFile::fake()->createWithContent('proposal.pdf', "%PDF-1.4\naudit")];
        $this->post(route('reservations.store'), $payload(31))->assertSessionHasErrors('participant_count');
        $this->assertCount(0, Storage::disk('attachments')->allFiles());
        $this->post(route('reservations.store'), $payload(1))->assertSessionHasNoErrors();
        $booking = Reservation::firstOrFail();
        Storage::disk('attachments')->assertExists($booking->proposal_path);
        Storage::disk('public')->assertMissing($booking->proposal_path);
    }
}
