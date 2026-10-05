<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class UserFacilityBrowsingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        $this->travelTo(Carbon::parse('2026-10-05 06:00:00', 'Asia/Jakarta'));
    }

    private function facility(array $attributes = []): Room
    {
        return Room::create($attributes + [
            'name' => 'Lab Komputer',
            'location' => 'Gedung A',
            'type' => 'Laboratorium',
            'capacity' => 40,
            'desc' => 'Komputer dan proyektor',
            'is_avail' => true,
        ]);
    }

    private function signIn(): User
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user);

        return $user;
    }

    private function booking(Room $room, User $user, array $attributes = []): Reservation
    {
        return Reservation::create($attributes + [
            'room_id' => $room->id,
            'user_id' => $user->id,
            'desc' => 'Tujuan reservasi rahasia',
            'date_to_reserv' => '2026-10-06',
            'start_time' => '10:00',
            'end_time' => '11:00',
            'status' => 'menunggu',
        ]);
    }

    private function slots(Room $room, string $date = '2026-10-06'): TestResponse
    {
        return $this->getJson(route('reservations.facility-slots', [
            'room' => $room->id,
            'date' => $date,
        ]));
    }

    private function expectedSlots(array $unavailable = [], bool $allUnavailable = false): array
    {
        $starts = [
            '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
            '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
            '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
            '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
            '19:00', '19:30',
        ];
        $ends = [...array_slice($starts, 1), '20:00'];

        return array_map(fn ($start, $end) => [
            'start_time' => $start,
            'end_time' => $end,
            'status' => $allUnavailable || in_array($start, $unavailable, true)
                ? 'unavailable' : 'available',
        ], $starts, $ends);
    }

    private function reservationPayload(Room $room, array $attributes = []): array
    {
        return $attributes + [
            'room_id' => $room->id,
            'desc' => 'Kegiatan pengguna',
            'date_to_reserv' => '2026-10-06',
            'start_time' => '09:00',
            'end_time' => '10:00',
        ];
    }

    public function test_facility_browsing_and_availability_require_authentication(): void
    {
        $room = $this->facility();

        $this->get(route('reservations.form'))->assertRedirect(route('login'));
        $this->get(route('reservations.facilities'))->assertRedirect(route('login'));
        $this->get(route('reservations.facility-slots', ['room' => $room->id, 'date' => '2026-10-06']))
            ->assertRedirect(route('login'));
        $this->getJson(route('reservations.facility-slots', ['room' => $room->id, 'date' => '2026-10-06']))
            ->assertUnauthorized();

        $this->signIn();
        $this->get(route('reservations.form'))->assertOk();
        $this->get(route('reservations.facilities'))->assertOk();
        $this->slots($room)->assertOk();
    }

    public function test_browsing_extends_the_original_reservation_form_and_uses_the_catalog_for_room_selection(): void
    {
        $this->signIn();
        $active = $this->facility();
        $inactive = $this->facility(['name' => 'Aula Nonaktif', 'type' => 'Aula', 'is_avail' => false]);

        $response = $this->get(route('reservations.form', ['type' => 'Aula']))->assertOk();
        $response->assertViewHas('facilities', fn ($facilities) => $facilities->pluck('id')->all() === [$inactive->id]);
        $response->assertViewHas('rooms', fn ($rooms) => $rooms->pluck('id')->all() === [$active->id]);
        $response->assertSee('action="'.route('reservations.store').'" method="POST"', false);
        foreach (['room_id', 'date_to_reserv', 'desc', 'start_time', 'end_time'] as $field) {
            $response->assertSee('name="'.$field.'"', false);
        }
        foreach (['time-grid', 'time-labels', 'time-grid-wrapper', 'selected-range-text'] as $id) {
            $response->assertSee('id="'.$id.'"', false);
        }
        $response->assertSee('id="selected-facility"', false);
        $response->assertSee('Belum ada fasilitas dipilih. Pilih fasilitas dari daftar di atas.');
        $this->assertMatchesRegularExpression('/<input\b(?=[^>]*\btype="hidden")(?=[^>]*\bname="room_id")(?=[^>]*\bid="room_id")[^>]*>/i', $response->getContent());
        $this->assertDoesNotMatchRegularExpression('/<select\b[^>]*(?:name|id)="room_id"/i', $response->getContent());
        $response->assertSee('Nonaktif');
        $response->assertSee('Form Reservasi');
        $response->assertDontSee('data-select-facility="'.$inactive->id.'"', false);
        $this->get(route('reservations.facilities', ['type' => 'Laboratorium']))->assertOk()
            ->assertSee('data-select-facility="'.$active->id.'"', false)
            ->assertSee('data-facility-label="'.$active->name.' · '.$active->location.'"', false);
    }

    public function test_type_location_and_minimum_capacity_filters_work_separately_and_together(): void
    {
        $this->signIn();
        $labA = $this->facility(['name' => 'A Lab']);
        $labB = $this->facility(['name' => 'B Lab', 'location' => 'Gedung B', 'capacity' => 80]);
        $hall = $this->facility(['name' => 'C Aula', 'type' => 'Aula', 'capacity' => 100]);

        foreach ([
            [['type' => 'Laboratorium'], [$labA->id, $labB->id]],
            [['location' => 'gEdUnG a'], [$labA->id, $hall->id]],
            [['capacity' => 80], [$labB->id, $hall->id]],
            [['type' => 'Laboratorium', 'location' => 'gedung a', 'capacity' => 40], [$labA->id]],
        ] as [$filters, $ids]) {
            $this->get(route('reservations.facilities', $filters))->assertOk()
                ->assertViewHas('facilities', fn ($facilities) => $facilities->pluck('id')->all() === $ids);
        }
    }

    public function test_location_search_treats_sql_wildcards_as_literal_text(): void
    {
        $this->signIn();
        $literal = $this->facility(['location' => 'Gedung 100%_Timur']);
        $this->facility(['name' => 'Lab Kedua', 'location' => 'Gedung 100AXTimur']);

        $this->get(route('reservations.facilities', ['location' => '%_']))->assertOk()
            ->assertViewHas('facilities', fn ($facilities) => $facilities->pluck('id')->all() === [$literal->id]);
    }

    public function test_invalid_filters_and_dates_are_rejected(): void
    {
        $this->signIn();
        $room = $this->facility();

        foreach ([
            ['type' => 'Unknown'],
            ['type' => ['Aula']],
            ['location' => ['Gedung A']],
            ['location' => str_repeat('a', 101)],
            ['capacity' => -1],
            ['capacity' => 100001],
            ['capacity' => 'large'],
            ['capacity' => 1.5],
            ['date' => '2026-02-30'],
            ['date' => '2026-10-06 09:00:00'],
        ] as $invalid) {
            $this->getJson(route('reservations.facilities', $invalid))
                ->assertUnprocessable()->assertJsonValidationErrors(array_keys($invalid));
        }

        foreach ([null, 'not-a-date', '2026-02-30', '2026-10-06 09:00:00'] as $date) {
            $this->getJson(route('reservations.facility-slots', ['room' => $room->id, 'date' => $date]))
                ->assertUnprocessable()->assertJsonValidationErrors('date');
        }
        $this->getJson(route('reservations.facility-slots', ['room' => 9999, 'date' => '2026-10-06']))
            ->assertNotFound();
    }

    public function test_pagination_retains_filters_and_date_and_empty_search_is_rendered(): void
    {
        $this->signIn();
        foreach (range(1, 7) as $number) {
            $this->facility(['name' => sprintf('Lab %02d', $number)]);
        }
        $this->facility(['name' => 'Aula Berbeda', 'type' => 'Aula']);
        $filters = ['type' => 'Laboratorium', 'location' => 'Gedung A', 'capacity' => 40, 'date' => '2026-10-06'];

        $response = $this->get(route('reservations.facilities', $filters))->assertOk()
            ->assertViewHas('facilities', fn ($facilities) => $facilities->count() === 6 && $facilities->total() === 7);
        preg_match_all('/href="([^"]+)"/', $response->getContent(), $matches);
        $nextPage = null;
        foreach ($matches[1] as $href) {
            parse_str(parse_url(html_entity_decode($href), PHP_URL_QUERY) ?? '', $query);
            if (($query['page'] ?? null) === '2') {
                $nextPage = $query;
                break;
            }
        }
        $this->assertNotNull($nextPage, 'The rendered catalog must link to its second page.');
        foreach ($filters as $key => $value) {
            $this->assertSame((string) $value, $nextPage[$key] ?? null);
        }
        $this->get(route('reservations.facilities', [...$filters, 'page' => 2]))->assertOk()
            ->assertViewHas('facilities', fn ($facilities) => $facilities->pluck('name')->all() === ['Lab 07']);

        $this->get(route('reservations.facilities', ['location' => 'Tidak Ditemukan']))->assertOk()
            ->assertViewHas('facilities', fn ($facilities) => $facilities->isEmpty())
            ->assertSee('Reset');
    }

    public function test_facility_photo_order_and_public_urls_and_no_photo_fallback_are_rendered(): void
    {
        $this->signIn();
        Storage::fake('public');
        $room = $this->facility();
        $this->facility(['name' => 'Tanpa Foto']);
        foreach (['facilities/first.jpg', 'facilities/second.jpg', 'facilities/third.jpg'] as $path) {
            Storage::disk('public')->put($path, 'photo');
        }
        $room->images()->create(['path' => 'facilities/third.jpg', 'alt_text' => 'Foto ketiga', 'display_order' => 2]);
        $room->images()->create(['path' => 'facilities/first.jpg', 'alt_text' => 'Foto utama', 'display_order' => 0]);
        $room->images()->create(['path' => 'facilities/second.jpg', 'alt_text' => 'Foto kedua', 'display_order' => 0]);

        $response = $this->get(route('reservations.facilities'))->assertOk();
        $response->assertViewHas('facilities', function ($facilities) use ($room) {
            $facility = $facilities->firstWhere('id', $room->id);

            return $facility->relationLoaded('images') && $facility->images->pluck('path')->all() === [
                'facilities/first.jpg', 'facilities/second.jpg', 'facilities/third.jpg',
            ];
        });
        foreach (['facilities/first.jpg', 'facilities/second.jpg', 'facilities/third.jpg'] as $path) {
            $response->assertSee(Storage::disk('public')->url($path), false);
        }
        $response->assertSee('Foto utama')->assertSee('Foto kedua')->assertSee('Foto ketiga');
        $response->assertSee('Tanpa Foto');
        $this->assertMatchesRegularExpression('/<img[^>]+(?:placeholder|no-image)[^>]*>/i', $response->getContent());
    }

    public function test_out_of_range_page_does_not_generate_an_unbounded_list_of_pagination_links(): void
    {
        $this->signIn();
        foreach (range(1, 7) as $number) {
            $this->facility(['name' => 'Fasilitas '.$number]);
        }

        $response = $this->get(route('reservations.facilities', ['page' => 100000]))->assertOk()
            ->assertViewHas('facilities', fn ($facilities) => $facilities->isEmpty() && $facilities->total() === 7);
        $content = $response->getContent();
        preg_match_all('/data-facility-page\b/', $content, $links);
        $this->assertLessThanOrEqual(7, count($links[0]), 'Pagination must keep a bounded number of links even outside the last page.');
        $this->assertLessThan(20000, strlen($content), 'An empty partial must not render thousands of pagination links.');
    }

    public function test_browsing_and_slot_responses_do_not_expose_other_requesters_or_purposes(): void
    {
        $this->signIn();
        $other = User::factory()->create([
            'name' => 'Pemohon Privat ZYX',
            'email' => 'private-reserver-zyx@example.test',
        ]);
        $room = $this->facility();
        $this->booking($room, $other, ['desc' => 'Tujuan Privat ZYX']);

        $responses = [
            $this->get(route('reservations.form')),
            $this->get(route('reservations.facilities')),
            $this->slots($room),
            $this->getJson(route('reservations.slots', ['room_id' => $room->id, 'date' => '2026-10-06'])),
        ];
        foreach ($responses as $response) {
            $response->assertOk();
            foreach ([$other->name, $other->email, 'Tujuan Privat ZYX', 'user_id'] as $private) {
                $response->assertDontSee($private, false);
            }
        }
        $this->slots($room)->assertExactJson([
            'room_id' => $room->id,
            'date' => '2026-10-06',
            'slots' => $this->expectedSlots(['10:00', '10:30']),
        ]);
    }

    public function test_all_26_slots_follow_blocking_statuses_and_half_open_interval_boundaries(): void
    {
        $user = $this->signIn();
        $room = $this->facility();
        $otherRoom = $this->facility(['name' => 'Ruangan Lain']);
        $this->booking($room, $user);
        $this->booking($room, $user, ['status' => 'disetujui', 'start_time' => '11:00', 'end_time' => '12:00']);
        $this->booking($room, $user, ['status' => 'ditolak', 'start_time' => '13:00', 'end_time' => '14:00']);
        $this->booking($room, $user, ['status' => 'dibatalkan', 'start_time' => '14:00', 'end_time' => '15:00']);
        $this->booking($otherRoom, $user, ['start_time' => '16:00', 'end_time' => '17:00']);
        $this->booking($room, $user, ['date_to_reserv' => '2026-10-07', 'start_time' => '17:00', 'end_time' => '18:00']);

        $this->slots($room)->assertOk()->assertExactJson([
            'room_id' => $room->id,
            'date' => '2026-10-06',
            'slots' => $this->expectedSlots(['10:00', '10:30', '11:00', '11:30']),
        ]);
    }

    public function test_existing_off_grid_bookings_block_every_overlapping_slot_including_seconds(): void
    {
        $user = $this->signIn();
        $room = $this->facility();
        $this->booking($room, $user, ['start_time' => '08:30:01', 'end_time' => '09:00:01']);

        $this->slots($room)->assertOk()->assertExactJson([
            'room_id' => $room->id,
            'date' => '2026-10-06',
            'slots' => $this->expectedSlots(['08:30', '09:00']),
        ]);
        $this->post(route('reservations.store'), $this->reservationPayload($room, ['start_time' => '09:00', 'end_time' => '09:30']))
            ->assertSessionHasErrors('time');
        $this->assertDatabaseCount('reservations', 1);
    }

    public function test_three_hour_cutoff_uses_application_time_and_accepts_the_exact_boundary(): void
    {
        $this->signIn();
        $room = $this->facility();

        $this->slots($room, '2026-10-05')->assertOk()->assertExactJson([
            'room_id' => $room->id,
            'date' => '2026-10-05',
            'slots' => $this->expectedSlots(['07:00', '07:30', '08:00', '08:30']),
        ]);
        $this->travelTo(Carbon::parse('2026-10-05 06:00:01', 'Asia/Jakarta'));
        $this->slots($room, '2026-10-05')->assertOk()->assertExactJson([
            'room_id' => $room->id,
            'date' => '2026-10-05',
            'slots' => $this->expectedSlots(['07:00', '07:30', '08:00', '08:30', '09:00']),
        ]);
        $this->post(route('reservations.store'), $this->reservationPayload($room, ['date_to_reserv' => '2026-10-05']))
            ->assertSessionHasErrors('time');
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_inactive_facilities_and_past_dates_have_no_available_slots_and_midnight_rolls_forward(): void
    {
        $this->signIn();
        $active = $this->facility();
        $inactive = $this->facility(['name' => 'Tidak Aktif', 'is_avail' => false]);
        foreach ([[$active, '2026-10-04'], [$inactive, '2026-10-06']] as [$room, $date]) {
            $this->slots($room, $date)->assertOk()->assertExactJson([
                'room_id' => $room->id,
                'date' => $date,
                'slots' => $this->expectedSlots(allUnavailable: true),
            ]);
        }

        $this->travelTo(Carbon::parse('2026-10-05 22:30:00', 'Asia/Jakarta'));
        $this->slots($active, '2026-10-05')->assertOk()->assertExactJson([
            'room_id' => $active->id,
            'date' => '2026-10-05',
            'slots' => $this->expectedSlots(allUnavailable: true),
        ]);
        $this->slots($active, '2026-10-06')->assertOk()->assertExactJson([
            'room_id' => $active->id,
            'date' => '2026-10-06',
            'slots' => $this->expectedSlots(),
        ]);
        $response = $this->getJson(route('reservations.slots', ['room_id' => $active->id, 'date' => '2026-10-06']))
            ->assertOk()->assertHeader('X-Reservation-Earliest-Start');
        $this->assertSame('2026-10-06T01:30:00+07:00', Carbon::parse($response->headers->get('X-Reservation-Earliest-Start'))->toIso8601String());
        $this->get(route('reservations.form'))->assertOk()->assertViewHas('catalogDate', '2026-10-05');
    }

    public function test_legacy_slot_endpoint_retains_actual_booking_ranges_and_adds_timezone_cutoff_headers(): void
    {
        $user = $this->signIn();
        $room = $this->facility();
        $this->booking($room, $user, ['start_time' => '10:00:00', 'end_time' => '11:00:00']);
        $this->booking($room, $user, ['status' => 'dibatalkan', 'start_time' => '11:00:00', 'end_time' => '12:00:00']);

        $response = $this->getJson(route('reservations.slots', ['room_id' => $room->id, 'date' => '2026-10-06']))
            ->assertOk()->assertExactJson([['start_time' => '10:00:00', 'end_time' => '11:00:00']])
            ->assertHeader('X-Reservation-Earliest-Start')
            ->assertHeader('X-Reservation-Timezone', 'Asia/Jakarta');
        $this->assertSame('2026-10-05T09:00:00+07:00', Carbon::parse($response->headers->get('X-Reservation-Earliest-Start'))->toIso8601String());
        $this->getJson(route('reservations.slots', ['room_id' => $room->id, 'date' => '2026-10-05']))
            ->assertOk()->assertExactJson([]);

        $inactive = $this->facility(['name' => 'Nonaktif', 'is_avail' => false]);
        $this->getJson(route('reservations.slots', ['room_id' => $inactive->id, 'date' => '2026-10-06']))
            ->assertUnprocessable()->assertJsonValidationErrors('room_id');
    }

    public function test_existing_reservation_submission_accepts_available_times_and_records_current_user(): void
    {
        $user = $this->signIn();
        $room = $this->facility();

        $this->post(route('reservations.store'), $this->reservationPayload($room, ['date_to_reserv' => '2026-10-05']))
            ->assertSessionHasNoErrors()->assertRedirect(route('reservations.index'));
        $this->assertDatabaseHas('reservations', [
            'user_id' => $user->id,
            'room_id' => $room->id,
            'date_to_reserv' => '2026-10-05',
            'start_time' => '09:00',
            'end_time' => '10:00',
            'desc' => 'Kegiatan pengguna',
            'status' => 'menunggu',
        ]);
    }

    public function test_failed_submission_keeps_the_original_form_values_and_displays_the_server_time_error(): void
    {
        $this->signIn();
        $room = $this->facility();
        $this->from(route('reservations.form'))->post(route('reservations.store'), $this->reservationPayload($room, [
            'date_to_reserv' => '2026-10-05',
            'start_time' => '08:30',
            'end_time' => '09:30',
            'desc' => 'Kegiatan yang belum terkirim',
        ]))->assertRedirect(route('reservations.form'))
            ->assertSessionHasErrors(['time' => 'Reservasi harus dimulai minimal tiga jam dari sekarang.']);

        $this->withCookie(config('session.cookie'), $this->app['session']->getId());
        $response = $this->get(route('reservations.form'))->assertOk()
            ->assertSee('id="selected-facility"', false)
            ->assertSee($room->name.' · '.$room->location)
            ->assertSee('value="2026-10-05"', false)
            ->assertSee('Kegiatan yang belum terkirim');
        $this->assertMatchesRegularExpression('/<input\b(?=[^>]*\btype="hidden")(?=[^>]*\bid="room_id")(?=[^>]*\bvalue="'.$room->id.'")[^>]*>/i', $response->getContent());
        $this->assertMatchesRegularExpression('/<p\b[^>]*\bid="selected-facility"[^>]*>Fasilitas dipilih: '.preg_quote($room->name.' · '.$room->location, '/').'<\/p>/u', $response->getContent());
        $this->assertTrue(str_contains($response->getContent(), 'Reservasi harus dimulai minimal tiga jam dari sekarang.'), 'The server time error must be visible on the original reservation form.');
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_server_rejects_past_lead_time_off_grid_and_out_of_hours_reservations(): void
    {
        $this->signIn();
        $room = $this->facility();

        foreach ([
            ['date_to_reserv' => '2026-10-04'],
            ['date_to_reserv' => '2026-10-05', 'start_time' => '08:30', 'end_time' => '09:30'],
            ['start_time' => '09:15', 'end_time' => '10:15'],
            ['start_time' => '09:00', 'end_time' => '09:45'],
            ['start_time' => '06:30', 'end_time' => '07:30'],
            ['start_time' => '19:30', 'end_time' => '20:30'],
            ['start_time' => '10:00', 'end_time' => '09:00'],
            ['start_time' => '09:00', 'end_time' => '09:00'],
        ] as $attributes) {
            $this->from(route('reservations.form'))
                ->post(route('reservations.store'), $this->reservationPayload($room, $attributes))
                ->assertRedirect(route('reservations.form'))->assertSessionHasErrors('time');
            $this->assertDatabaseCount('reservations', 0);
        }

        $inactive = $this->facility(['name' => 'Nonaktif', 'is_avail' => false]);
        $this->post(route('reservations.store'), $this->reservationPayload($inactive))
            ->assertSessionHasErrors('room_id');
        $this->assertDatabaseCount('reservations', 0);
    }

    public function test_server_conflicts_match_availability_and_released_or_adjacent_ranges_remain_reservable(): void
    {
        $user = $this->signIn();
        $room = $this->facility();
        $waiting = $this->booking($room, $user);
        $this->booking($room, $user, ['status' => 'disetujui', 'start_time' => '11:00', 'end_time' => '12:00']);
        $this->booking($room, $user, ['status' => 'ditolak', 'start_time' => '13:00', 'end_time' => '14:00']);

        foreach ([['10:00', '10:30'], ['11:30', '12:00'], ['09:30', '10:30']] as [$start, $end]) {
            $this->post(route('reservations.store'), $this->reservationPayload($room, ['start_time' => $start, 'end_time' => $end]))
                ->assertSessionHasErrors('time');
        }
        $this->assertDatabaseCount('reservations', 3);
        $this->patch(route('reservations.cancel', $waiting))->assertSessionHasNoErrors();
        $this->assertSame('dibatalkan', $waiting->fresh()->status);
        $this->slots($room)->assertOk()->assertJsonPath('slots.6.status', 'available');

        foreach ([['10:00', '11:00'], ['12:00', '12:30'], ['13:00', '14:00']] as [$start, $end]) {
            $this->post(route('reservations.store'), $this->reservationPayload($room, ['start_time' => $start, 'end_time' => $end]))
                ->assertSessionHasNoErrors()->assertRedirect(route('reservations.index'));
        }
        $this->assertDatabaseCount('reservations', 6);
    }

    public function test_server_overlap_boundaries_work_for_stored_times_with_seconds(): void
    {
        $user = $this->signIn();
        $room = $this->facility();
        $this->booking($room, $user, ['start_time' => '10:00:00', 'end_time' => '11:00:00']);

        foreach ([['09:30', '10:00'], ['11:00', '11:30']] as [$start, $end]) {
            $this->post(route('reservations.store'), $this->reservationPayload($room, ['start_time' => $start, 'end_time' => $end]))
                ->assertSessionHasNoErrors()->assertRedirect(route('reservations.index'));
        }
        $this->assertDatabaseCount('reservations', 3);
    }
}
