<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(UserSeeder::class);
        $this->call(RoomSeeder::class);
        $this->call(RoomImageSeeder::class);
        $this->call(ReportSeeder::class);
        $this->call(ReservationSeeder::class);
    }
}
