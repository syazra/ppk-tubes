<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\RoomImage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class FacilityThemeSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            'Gedung E Lt. 2' => 'Menara Aether - Tingkat II',
            'Gedung AP' => 'Balairung Naga Senja',
            'Gedung A Lt.3' => 'Menara Ravenclaw - Puncak Kabut',
            'Gedung A Lt. 1' => 'Menara Ravenclaw - Sayap Timur',
            'Gedung A Lt. 2' => 'Menara Ravenclaw - Lorong Rune',
            'Gedung A Lt. 3' => 'Menara Ravenclaw - Puncak Kabut',
            'Gedung B' => 'Citadel Gondor - Balairung Putih',
            'Gedung B Lt. 1' => 'Citadel Gondor - Arsip Bintang',
            'Gedung B Lt. 2' => 'Citadel Gondor - Galeri Mithril',
            'Gedung C Lt. 1' => 'Biara Obsidian - Ruang Bawah Tanah',
            'Gedung C Lt. 2' => 'Biara Obsidian - Sayap Alkimia',
            'Gedung C Lt. 3' => 'Biara Obsidian - Puncak Gerhana',
            'Area Olahraga' => 'Dataran Naga - Gelanggang Angin',
            'Area Taman' => 'Rimba Perak - Kebun Cahaya Bulan',
            'Area Pelataran' => 'Benteng Eldoria - Pelataran Senja',
            'Area Halaman' => 'Bukit Hobbit - Halaman Embun',
        ];

        DB::transaction(function () use ($locations): void {
            foreach ($locations as $old => $new) {
                Room::where('location', $old)->update(['location' => $new]);
            }

            $oldName = 'Lab Komputer 1';
            $newName = 'Laboratorium Teknomansi Aether';

            foreach (Room::where('name', $oldName)->get() as $room) {
                $room->update([
                    'name' => $newName,
                    'desc' => 'Laboratorium teknomansi untuk praktikum rune dan kristal komputasi',
                ]);

                foreach (['Kegiatan belajar bersama di ', 'Diskusi dan persiapan kegiatan di '] as $prefix) {
                    Reservation::where('room_id', $room->id)->where('desc', $prefix.$oldName)
                        ->update(['desc' => $prefix.$newName]);
                }

                RoomImage::where('room_id', $room->id)->where('alt_text', 'Foto '.$oldName)
                    ->update(['alt_text' => 'Foto '.$newName]);

                Report::where('room_id', $room->id)
                    ->where('desc', 'Beberapa komputer tidak dapat menyala dan jaringan terputus.')
                    ->update(['desc' => 'Kristal komputasi tidak menyala dan jaringan rune terputus.']);
            }
        });
    }
}
