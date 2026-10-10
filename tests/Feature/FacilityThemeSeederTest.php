<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Database\Seeders\FacilityThemeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FacilityThemeSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_existing_facilities_and_related_demo_data_are_updated_in_place(): void
    {
        $user = User::factory()->create();
        $room = Room::create([
            'name' => 'Lab Komputer 1',
            'location' => 'Gedung E Lt. 2',
            'type' => 'Laboratorium',
            'capacity' => 40,
            'is_avail' => false,
        ]);
        $photo = $room->images()->create(['path' => 'facilities/custom.jpg', 'alt_text' => 'Foto Lab Komputer 1']);
        $report = Report::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'desc' => 'Beberapa komputer tidak dapat menyala dan jaringan terputus.',
            'status' => 'selesai',
            'resolution' => 'Keputusan operator',
        ]);
        $reservation = Reservation::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'desc' => 'Kegiatan belajar bersama di Lab Komputer 1',
            'date_to_reserv' => now()->addDays(5)->toDateString(),
            'start_time' => '08:00:00',
            'end_time' => '10:00:00',
            'status' => 'dibatalkan',
        ]);

        $this->seed(FacilityThemeSeeder::class);

        $this->assertSame('Laboratorium Teknomansi Aether', $room->fresh()->name);
        $this->assertSame('Menara Aether - Tingkat II', $room->fresh()->location);
        $this->assertFalse($room->fresh()->is_avail);
        $this->assertSame(40, $room->fresh()->capacity);
        $this->assertSame('facilities/custom.jpg', $photo->fresh()->path);
        $this->assertSame('Foto Laboratorium Teknomansi Aether', $photo->fresh()->alt_text);
        $this->assertSame('Kristal komputasi tidak menyala dan jaringan rune terputus.', $report->fresh()->desc);
        $this->assertSame('selesai', $report->fresh()->status);
        $this->assertSame('Keputusan operator', $report->fresh()->resolution);
        $this->assertSame('Kegiatan belajar bersama di Laboratorium Teknomansi Aether', $reservation->fresh()->desc);
        $this->assertSame('dibatalkan', $reservation->fresh()->status);
        $before = [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray(), $photo->fresh()->toArray()];

        $this->seed(FacilityThemeSeeder::class);

        $this->assertSame($before, [Room::all()->toArray(), Report::all()->toArray(), Reservation::all()->toArray(), $photo->fresh()->toArray()]);
        $this->assertDatabaseCount('rooms', 1);
        $this->assertDatabaseCount('reports', 1);
        $this->assertDatabaseCount('reservations', 1);
    }
}
