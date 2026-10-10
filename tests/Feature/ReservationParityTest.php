<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ReservationParityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_both_lists_and_qr_ticket_pages_expose_the_same_ticket_details(): void
    {
        $owner = User::factory()->create();
        $operator = User::factory()->create(['role' => 'operator']);
        $reservation = $this->reservation($owner);

        $userData = $this->actingAs($owner)->get(route('reservations.index'))->assertOk()->viewData('page')['props']['reservations']['data'][0];
        $operatorData = $this->actingAs($operator)->get(route('operator.reservations'))->assertOk()->viewData('page')['props']['reservations']['data'][0];
        $this->assertSame($operatorData, array_diff_key($userData, array_flip(['can_cancel', 'cancel_url', 'proposal_path'])));
        $this->assertSame('Instansi', $operatorData['reservation_type']);
        $this->assertSame('Komunitas Astronomi', $operatorData['institution']);
        $this->assertSame(25, $operatorData['participant_count']);
        $this->assertSame('Gedung Timur', $operatorData['room']['location']);

        foreach ([$owner, $operator] as $viewer) {
            $ticket = $this->actingAs($viewer)->get(route('reservations.ticket', $reservation))->assertOk()->viewData('page');
            $this->assertSame('ReservationTicket', $ticket['component']);
            $this->assertSame($operatorData, $ticket['props']['reservation']);
            $this->assertSame(route($viewer->role === 'operator' ? 'operator.reservations' : 'reservations.index'), $ticket['props']['backUrl']);
            $this->get(route('reservations.qrcode', $reservation))->assertOk()->assertHeader('Content-Type', 'image/svg+xml');
        }
    }

    #[DataProvider('searchTerms')]
    public function test_both_lists_search_the_same_fields(string $search): void
    {
        $owner = User::factory()->create(['name' => 'Nadia Peminjam', 'email' => 'nadia@example.test']);
        $reservation = $this->reservation($owner);
        $this->reservation($owner, ['room_id' => Room::create(['name' => 'Ruang Lain', 'type' => 'Lapangan', 'location' => 'Barat', 'capacity' => 20, 'is_avail' => true])->id,
            'institution' => 'Organisasi Lain', 'activity_name' => 'Olahraga', 'desc' => 'Latihan', 'date_to_reserv' => '2026-11-02']);
        foreach ([[$owner, 'reservations.index'], [User::factory()->create(['role' => 'operator']), 'operator.reservations']] as [$viewer, $route]) {
            $data = $this->actingAs($viewer)->get(route($route, ['search' => $search]))->assertOk()->viewData('page')['props'];
            $this->assertSame($search, $data['filters']['search']);
            // Borrower name/email match both of this borrower's reservations.
            $this->assertContains($reservation->id, array_column($data['reservations']['data'], 'id'));
            $this->assertCount(in_array($search, ['Nadia', 'nadia@example.test'], true) ? 2 : 1, $data['reservations']['data']);
        }
    }

    public static function searchTerms(): array
    {
        return array_map(fn ($term) => [$term], ['Nadia', 'nadia@example.test', 'Ruang Bintang', 'Laboratorium', 'Gedung Timur', '2026-10-20', 'Komunitas Astronomi', 'Pengamatan Bulan', 'Diskusi teleskop']);
    }

    #[DataProvider('sortOrders')]
    public function test_both_lists_honor_sorting_and_preserve_it_in_pagination(string $sort, bool $firstCreatedFirst): void
    {
        $owner = User::factory()->create();
        $first = $this->reservation($owner, ['date_to_reserv' => '2026-10-20']);
        $second = $this->reservation($owner, ['date_to_reserv' => '2026-10-21']);
        $first->forceFill(['created_at' => '2026-10-01 08:00:00'])->save();
        $second->forceFill(['created_at' => '2026-10-02 08:00:00'])->save();
        $expected = $firstCreatedFirst ? [$first->id, $second->id] : [$second->id, $first->id];
        foreach ([[$owner, 'reservations.index'], [User::factory()->create(['role' => 'operator']), 'operator.reservations']] as [$viewer, $route]) {
            $props = $this->actingAs($viewer)->get(route($route, ['sort' => $sort, 'status' => 'disetujui']))->assertOk()->viewData('page')['props'];
            $this->assertSame($sort, $props['filters']['sort']);
            $this->assertSame($expected, array_column($props['reservations']['data'], 'id'));
            $this->assertStringContainsString('sort='.$sort, $props['reservations']['links'][1]['url']);
            $this->assertStringContainsString('status=disetujui', $props['reservations']['links'][1]['url']);
        }
    }

    public static function sortOrders(): array
    {
        return [['created_near', false], ['created_far', true], ['reservation_near', true], ['reservation_far', false]];
    }

    public function test_shared_search_and_filters_keep_user_results_private_and_operator_results_global(): void
    {
        $owner = User::factory()->create();
        $own = $this->reservation($owner);
        $other = $this->reservation(User::factory()->create(), ['room_id' => $own->room_id]);
        $this->reservation($owner, ['room_id' => $own->room_id, 'status' => 'menunggu']);
        $filters = ['search' => 'Ruang Bintang', 'status' => 'disetujui'];
        $mine = $this->actingAs($owner)->get(route('reservations.index', $filters))->assertOk()->viewData('page')['props']['reservations']['data'];
        $this->assertSame([$own->id], array_column($mine, 'id'));
        $all = $this->actingAs(User::factory()->create(['role' => 'operator']))->get(route('operator.reservations', $filters))->assertOk()->viewData('page')['props']['reservations']['data'];
        $this->assertSame([$other->id, $own->id], array_column($all, 'id'));
    }

    public function test_both_lists_validate_sort_options(): void
    {
        foreach ([[User::factory()->create(), 'reservations.index'], [User::factory()->create(['role' => 'operator']), 'operator.reservations']] as [$viewer, $route]) {
            $this->actingAs($viewer)->get(route($route, ['sort' => 'invalid']))->assertRedirect()->assertSessionHasErrors('sort');
        }
    }

    public function test_shared_tickets_still_deny_other_users_and_unknown_roles(): void
    {
        $reservation = $this->reservation(User::factory()->create());
        foreach ([User::factory()->create(), User::factory()->create(['role' => 'unknown'])] as $viewer) {
            $this->actingAs($viewer)->get(route('reservations.ticket', $reservation))->assertForbidden();
            $this->get(route('reservations.qrcode', $reservation))->assertForbidden();
        }
        $this->actingAs(User::factory()->create(['role' => 'admin']))->get(route('reservations.ticket', $reservation))->assertOk();
    }

    private function reservation(User $owner, array $attributes = []): Reservation
    {
        $room = isset($attributes['room_id']) ? null : Room::create([
            'name' => 'Ruang Bintang', 'type' => 'Laboratorium', 'location' => 'Gedung Timur', 'capacity' => 30, 'is_avail' => true,
        ]);
        return Reservation::create(array_merge([
            'user_id' => $owner->id, 'room_id' => $room?->id, 'reservation_type' => 'Instansi',
            'institution' => 'Komunitas Astronomi', 'activity_name' => 'Pengamatan Bulan',
            'participant_count' => 25, 'desc' => 'Diskusi teleskop', 'date_to_reserv' => '2026-10-20',
            'start_time' => '08:00:00', 'end_time' => '10:00:00', 'status' => 'disetujui',
        ], $attributes));
    }
}
