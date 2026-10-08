<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PublicFacilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->travelTo(Carbon::parse('2026-10-08 08:00:00', 'Asia/Jakarta'));
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

    private function reservation(Room $room, array $attributes = []): Reservation
    {
        return Reservation::create($attributes + [
            'user_id' => User::factory()->create()->id,
            'room_id' => $room->id,
            'desc' => 'Tujuan privat rapat pemohon',
            'date_to_reserv' => '2026-10-08',
            'start_time' => '08:00:00',
            'end_time' => '09:00:00',
            'status' => 'disetujui',
        ]);
    }

    public function test_guests_can_read_facilities_and_landing_filter_options(): void
    {
        $this->facility();
        $this->facility(['name' => 'Aula Besar', 'type' => 'Aula', 'location' => 'Gedung B']);

        $this->get(route('facilities.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Guest/Facilities')
            ->has('rooms.data', 2)
            ->where('filters.date', '2026-10-08')
            ->where('filters.capacity', '')
            ->where('types', ['Aula', 'Laboratorium'])
            ->where('locations', ['Gedung A', 'Gedung B'])
            ->where('urls.landing', route('landing'))
            ->where('urls.about', route('about'))
            ->where('urls.login', route('login'))
            ->etc());

        $this->get(route('landing'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Landing')
            ->where('facilityUrl', route('facilities.index'))
            ->where('aboutUrl', route('about'))
            ->where('facilityTypes', ['Aula', 'Laboratorium'])
            ->where('facilityLocations', ['Gedung A', 'Gedung B'])
            ->etc());
    }

    public function test_guests_can_read_about_page_and_its_public_navigation_urls(): void
    {
        $this->get('/tentang')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Guest/About')
            ->where('urls.landing', route('landing'))
            ->where('urls.facilities', route('facilities.index'))
            ->where('urls.about', route('about'))
            ->where('urls.login', route('login'))
            ->where('auth.user', null)
            ->etc());
    }

    public function test_facility_filters_combine_type_location_and_minimum_capacity(): void
    {
        $match = $this->facility(['name' => 'Lab Utama', 'capacity' => 60]);
        $this->facility(['name' => 'Lab Kecil', 'capacity' => 20]);
        $this->facility(['name' => 'Lab Lain', 'location' => 'Gedung B', 'capacity' => 60]);
        $this->facility(['name' => 'Lab Aula', 'type' => 'Aula', 'capacity' => 60]);
        $this->facility(['name' => 'Komputer Utama', 'capacity' => 60]);

        $this->get(route('facilities.index', [
            'search' => 'Lab', 'type' => 'Laboratorium', 'location' => 'Gedung A', 'capacity' => 60,
        ]))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('rooms.data', 1)
            ->where('rooms.data.0.id', $match->id)
            ->where('filters.search', 'Lab')
            ->where('filters.type', 'Laboratorium')
            ->where('filters.location', 'Gedung A')
            ->where('filters.capacity', '60')
            ->etc());
    }

    public function test_location_search_matches_partial_building_names(): void
    {
        $match = $this->facility(['location' => 'Gedung A Lantai 3']);
        $this->facility(['location' => 'Gedung B']);

        $this->get(route('facilities.index', ['location' => 'Gedung A']))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('rooms.data', 1)
            ->where('rooms.data.0.id', $match->id)
            ->where('filters.location', 'Gedung A')
            ->etc());
    }

    public function test_facilities_paginate_without_losing_filters(): void
    {
        foreach (range(1, 8) as $number) {
            $this->facility(['name' => sprintf('Lab %02d', $number)]);
        }

        $response = $this->get(route('facilities.index', [
            'type' => 'Laboratorium', 'date' => '2026-10-09', 'page' => 2,
        ]))->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->where('rooms.total', 8)
            ->where('rooms.per_page', 6)
            ->where('rooms.current_page', 2)
            ->has('rooms.data', 2)
            ->etc());
        $previousUrl = $response->inertiaProps('rooms.prev_page_url');
        parse_str(parse_url($previousUrl, PHP_URL_QUERY), $previousQuery);
        $this->assertSame('Laboratorium', $previousQuery['type']);
        $this->assertSame('2026-10-09', $previousQuery['date']);
    }

    public function test_only_approved_reservations_on_selected_date_block_overlapping_slots(): void
    {
        $room = $this->facility();
        $this->reservation($room);
        foreach (['menunggu', 'ditolak', 'dibatalkan'] as $status) {
            $this->reservation($room, ['status' => $status, 'start_time' => '10:00:00', 'end_time' => '11:00:00']);
        }
        $this->reservation($room, ['date_to_reserv' => '2026-10-09', 'start_time' => '11:00:00', 'end_time' => '12:00:00']);
        $otherRoom = $this->facility(['name' => 'Lab Lain']);
        $this->reservation($otherRoom, ['start_time' => '12:00:00', 'end_time' => '13:00:00']);

        $this->get(route('facilities.index', ['date' => '2026-10-08', 'search' => 'Komputer']))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('rooms.data', 1)
            ->has('rooms.data.0.slots', 26)
            ->where('rooms.data.0.slots.0.start_time', '07:00')
            ->where('rooms.data.0.slots.0.available', true)
            ->where('rooms.data.0.slots.1.available', true)
            ->where('rooms.data.0.slots.2.available', false)
            ->where('rooms.data.0.slots.3.available', false)
            ->where('rooms.data.0.slots.4.available', true)
            ->where('rooms.data.0.slots.6.available', true)
            ->where('rooms.data.0.slots.7.available', true)
            ->where('rooms.data.0.slots.8.available', true)
            ->where('rooms.data.0.slots.10.available', true)
            ->where('rooms.data.0.slots.25.end_time', '20:00')
            ->etc());
    }

    public function test_partial_slot_overlap_blocks_both_slots_and_touching_boundaries_stay_available(): void
    {
        $room = $this->facility();
        $this->reservation($room, ['start_time' => '07:15', 'end_time' => '07:45']);
        $this->reservation($room, ['start_time' => '08:30', 'end_time' => '09:00']);

        $this->get(route('facilities.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('rooms.data.0.slots.0.available', false)
            ->where('rooms.data.0.slots.1.available', false)
            ->where('rooms.data.0.slots.2.available', true)
            ->where('rooms.data.0.slots.3.available', false)
            ->where('rooms.data.0.slots.4.available', true)
            ->etc());
    }

    public function test_inactive_facilities_remain_visible_with_every_slot_unavailable(): void
    {
        $room = $this->facility(['is_avail' => false]);
        $response = $this->get(route('facilities.index'))->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->where('rooms.data.0.id', $room->id)
            ->where('rooms.data.0.is_avail', false)
            ->etc());
        $slots = $response->inertiaProps('rooms.data.0.slots');
        $this->assertCount(26, $slots);
        $this->assertSame([false], array_values(array_unique(array_column($slots, 'available'))));
    }

    public function test_public_payload_contains_only_facility_details_and_slot_statuses(): void
    {
        $room = $this->facility();
        $user = User::factory()->create(['name' => 'Pemohon Privat', 'email' => 'private@example.com']);
        $this->reservation($room, ['user_id' => $user->id]);

        $response = $this->get(route('facilities.index'))->assertOk();
        $publicRoom = $response->inertiaProps('rooms.data.0');
        $this->assertSame(['id', 'name', 'location', 'type', 'capacity', 'desc', 'is_avail', 'images', 'slots'], array_keys($publicRoom));
        $this->assertSame(['start_time', 'end_time', 'available'], array_keys($publicRoom['slots'][0]));
        $response->assertDontSee('Pemohon Privat')
            ->assertDontSee('private@example.com')
            ->assertDontSee('Tujuan privat rapat pemohon');
    }

    public function test_guests_receive_ordered_public_photos_without_storage_metadata_or_missing_files(): void
    {
        Storage::fake('public');
        $disk = Storage::disk('public');
        $disk->put('facilities/front.jpg', 'photo');
        $disk->put('facilities/side view.jpg', 'photo');
        $room = $this->facility();
        $room->images()->create(['path' => 'facilities/side view.jpg', 'alt_text' => 'Tampak samping', 'display_order' => 2]);
        $room->images()->create(['path' => 'facilities/front.jpg', 'alt_text' => 'Tampak depan', 'display_order' => 1]);
        $room->images()->create(['path' => 'facilities/missing.jpg']);
        $room->images()->create(['path' => '../private.jpg']);

        $response = $this->get(route('facilities.index'))->assertOk();

        $this->assertSame([
            ['url' => $disk->url('facilities/front.jpg'), 'alt_text' => 'Tampak depan'],
            ['url' => $disk->url('facilities/side%20view.jpg'), 'alt_text' => 'Tampak samping'],
        ], $response->inertiaProps('rooms.data.0.images'));
        $response->assertInertia(fn (Assert $page) => $page
            ->where('photoPlaceholderUrl', asset('images/facility-placeholder-photo.jpg'))
            ->where('photoFallbackUrl', asset('images/facility-placeholder.svg'))
            ->etc());
        $response->assertDontSee('facilities/missing.jpg')->assertDontSee('../private.jpg');
    }

    public function test_default_date_uses_jakarta_and_slot_status_does_not_apply_booking_lead_time(): void
    {
        $this->travelTo(Carbon::parse('2026-10-07 18:00:00', 'UTC'));
        $this->facility();

        $this->get(route('facilities.index'))->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('today', '2026-10-08')
            ->where('filters.date', '2026-10-08')
            ->where('rooms.data.0.slots.0.available', true)
            ->etc());
    }

    public function test_invalid_dates_capacities_and_non_scalar_filters_are_rejected(): void
    {
        foreach (['2026-02-30', '08-10-2026', '2026-10-08 08:00'] as $date) {
            $this->getJson(route('facilities.index', ['date' => $date]))
                ->assertUnprocessable()->assertJsonValidationErrors('date');
        }
        foreach ([0, -1, 100001, 'many', 1.5] as $capacity) {
            $this->getJson(route('facilities.index', ['capacity' => $capacity]))
                ->assertUnprocessable()->assertJsonValidationErrors('capacity');
        }
        $this->getJson(route('facilities.index', ['type' => ['Aula']]))
            ->assertUnprocessable()->assertJsonValidationErrors('type');
        $this->getJson(route('facilities.index', ['location' => ['Gedung A']]))
            ->assertUnprocessable()->assertJsonValidationErrors('location');
    }

    public function test_guests_cannot_write_facilities_or_submit_reservations(): void
    {
        $room = $this->facility();

        $this->post(route('facilities.index'), [])->assertStatus(405);
        $this->post(route('admin.facilities.store'), [])->assertRedirect(route('login'));
        $this->put(route('admin.facilities.update', $room), [])->assertRedirect(route('login'));
        $this->patch(route('admin.facilities.availability', $room), ['is_avail' => false])
            ->assertRedirect(route('login'));
        $this->post(route('reservations.store'), [])->assertRedirect(route('login'));
        $this->assertDatabaseCount('rooms', 1);
        $this->assertDatabaseCount('reservations', 0);
        $this->assertTrue($room->fresh()->is_avail);
    }
}
