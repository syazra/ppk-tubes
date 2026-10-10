<?php

namespace Tests\Feature;

use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperatorReservationActionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_approving_a_reservation_redirects_to_operator_reservations(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $reservation = $this->createPendingReservation();

        $this->actingAs($operator)
            ->patch(route('operator.reservations.approve', ['id' => $reservation->id]))
            ->assertRedirect(route('operator.reservations'))
            ->assertSessionHas('success', 'Reservasi disetujui.');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'disetujui',
        ]);
    }

    public function test_rejecting_a_reservation_redirects_to_operator_reservations(): void
    {
        $operator = User::factory()->create(['role' => 'operator']);
        $reservation = $this->createPendingReservation();

        $this->actingAs($operator)
            ->patch(route('operator.reservations.reject', ['id' => $reservation->id]))
            ->assertRedirect(route('operator.reservations'))
            ->assertSessionHas('success', 'Reservasi ditolak.');

        $this->assertDatabaseHas('reservations', [
            'id' => $reservation->id,
            'status' => 'ditolak',
        ]);
    }

    private function createPendingReservation(): Reservation
    {
        $user = User::factory()->create();
        $room = Room::create([
            'name' => 'Ruang Uji',
            'location' => 'Gedung Uji',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true,
        ]);

        return Reservation::create([
            'user_id' => $user->id,
            'room_id' => $room->id,
            'desc' => 'Reservasi untuk pengujian',
            'activity_name' => 'Reservasi untuk pengujian',
            'date_to_reserv' => '2026-10-15',
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => 'menunggu',
        ]);
    }
}
