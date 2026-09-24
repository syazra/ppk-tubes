<?php

namespace Database\Seeders;

use App\Models\Room;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        Room::create([
            'name' => 'Lab Komputer 1',
            'location' => 'Gedung E Lt. 2',
            'desc' => 'Laboratorium komputer untuk praktikum',
            'type' => 'Laboratorium',
            'capacity' => 40,
            'is_avail' => true
        ]);


        Room::create([
            'name' => 'Aula Utama',
            'location' => 'Gedung AP',
            'desc' => 'Aula untuk kegiatan besar',
            'type' => 'Aula',
            'capacity' => 200,
            'is_avail' => true
        ]);


        Room::create([
            'name' => 'Ruang Kelas A301',
            'location' => 'Gedung A Lt.3',
            'desc' => 'Ruang kelas reguler',
            'type' => 'Ruang Kelas',
            'capacity' => 50,
            'is_avail' => true
        ]);
    }
}