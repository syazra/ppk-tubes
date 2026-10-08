<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserReservationsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_reservation_form_route_renders_the_react_page_with_available_rooms(): void
    {
        $user = User::factory()->create();
        $availableRoom = Room::create([
            'name' => 'Ruang Tersedia',
            'location' => 'Gedung Uji',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true,
        ]);
        Room::create([
            'name' => 'Ruang Tidak Tersedia',
            'location' => 'Gedung Uji',
            'type' => 'Aula',
            'capacity' => 50,
            'is_avail' => false,
        ]);

        $this->actingAs($user)
            ->get(route('reservations.form'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/ReservationForm')
                ->has('rooms', 1)
                ->where('rooms.0.id', $availableRoom->id)
                ->has('facilities.data', 2)
                ->where('facilities.data.0.id', $availableRoom->id)
                ->where('facilities.data.0.slots_url', route('reservations.facility-slots', $availableRoom))
                ->where('facilities.data.0.images', [])
            );
    }

    public function test_reservations_index_renders_the_react_page_with_filtered_data(): void
    {
        $user = User::factory()->create();
        $room = Room::create([
            'name' => 'Ruang Uji',
            'location' => 'Gedung Uji',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true,
        ]);

        $matchingReservation = $this->createReservation($user, $room, 'menunggu');
        $this->createReservation($user, $room, 'disetujui');

        $this->actingAs($user)
            ->get(route('reservations.index', ['status' => 'menunggu']))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/MyReservations')
                ->where('filters.status', 'menunggu')
                ->has('reservations.data', 1)
                ->where('reservations.data.0.id', $matchingReservation->id)
                ->where('reservations.data.0.can_cancel', true)
            );
    }

    public function test_reservation_qr_endpoint_returns_an_svg_image(): void
    {
        $user = User::factory()->create();
        $room = Room::create([
            'name' => 'Ruang Uji',
            'location' => 'Gedung Uji',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true,
        ]);
        $reservation = $this->createReservation($user, $room, 'disetujui');

        $this->actingAs($user)
            ->get(route('reservations.qrcode', $reservation))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/svg+xml')
            ->assertSee('<svg', false);
    }

    private function createReservation(User $user, Room $room, string $status): Reservation
    {
        return Reservation::create([
            'user_id' => $user->id,
            'room_id' => $room->id,
            'desc' => 'Tujuan reservasi uji',
            'date_to_reserv' => '2026-10-15',
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => $status,
        ]);
    }
}
