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

        Room::create([
            'name' => 'Ruang Studi Ravenclaw',
            'location' => 'Gedung A Lt. 1',
            'desc' => 'Ruang studi untuk kegiatan belajar',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Seminar Elrond',
            'location' => 'Gedung A Lt. 1',
            'desc' => 'Ruang seminar untuk diskusi dan presentasi',
            'type' => 'Aula',
            'capacity' => 100,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Kajian Mithrandir',
            'location' => 'Gedung A Lt. 1',
            'desc' => 'Ruang untuk kegiatan kajian dan diskusi',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Arithmancy',
            'location' => 'Gedung A Lt. 2',
            'desc' => 'Ruang kelas untuk pembelajaran aritmatika',
            'type' => 'Ruang Kelas',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Rune Kuno',
            'location' => 'Gedung A Lt. 2',
            'desc' => 'Ruang pembelajaran simbol dan rune kuno',
            'type' => 'Ruang Kelas',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Sejarah Sihir',
            'location' => 'Gedung A Lt. 2',
            'desc' => 'Ruang pembelajaran sejarah',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Transfigurasi',
            'location' => 'Gedung A Lt. 2',
            'desc' => 'Ruang pembelajaran transfigurasi',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Bahasa Quenya',
            'location' => 'Gedung A Lt. 3',
            'desc' => 'Ruang pembelajaran bahasa Quenya',
            'type' => 'Ruang Kelas',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Dewan Putih',
            'location' => 'Gedung B',
            'desc' => 'Ruang pertemuan dan rapat',
            'type' => 'Aula',
            'capacity' => 100,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Cendekia Gondor',
            'location' => 'Gedung B Lt. 1',
            'desc' => 'Ruang diskusi dan pengembangan pengetahuan',
            'type' => 'Ruang Kelas',
            'capacity' => 35,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Hermione Granger',
            'location' => 'Gedung B Lt. 2',
            'desc' => 'Ruang belajar dan diskusi kelompok',
            'type' => 'Ruang Kelas',
            'capacity' => 30,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Ruang Perpustakaan Bilbo',
            'location' => 'Gedung B Lt. 2',
            'desc' => 'Ruang membaca dan belajar mandiri',
            'type' => 'Ruang Kelas',
            'capacity' => 40,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Ramuan',
            'location' => 'Gedung C Lt. 1',
            'desc' => 'Laboratorium untuk praktikum ramuan',
            'type' => 'Laboratorium',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Alkimia Flamel',
            'location' => 'Gedung C Lt. 1',
            'desc' => 'Laboratorium praktikum alkimia',
            'type' => 'Laboratorium',
            'capacity' => 20,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Herbologi',
            'location' => 'Gedung C Lt. 1',
            'desc' => 'Laboratorium praktikum herbologi',
            'type' => 'Laboratorium',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Observatorium Astronomi',
            'location' => 'Gedung C Lt. 3',
            'desc' => 'Observatorium untuk pengamatan astronomi',
            'type' => 'Laboratorium',
            'capacity' => 20,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Artefak Celebrimbor',
            'location' => 'Gedung C Lt. 2',
            'desc' => 'Laboratorium penelitian artefak',
            'type' => 'Laboratorium',
            'capacity' => 20,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Palantír',
            'location' => 'Gedung C Lt. 2',
            'desc' => 'Laboratorium penelitian artefak dan pengamatan',
            'type' => 'Laboratorium',
            'capacity' => 20,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Ithildin',
            'location' => 'Gedung C Lt. 2',
            'desc' => 'Laboratorium penelitian material',
            'type' => 'Laboratorium',
            'capacity' => 20,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Mantra',
            'location' => 'Gedung C Lt. 2',
            'desc' => 'Laboratorium praktikum mantra',
            'type' => 'Laboratorium',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Pertahanan Sihir',
            'location' => 'Gedung C Lt. 3',
            'desc' => 'Laboratorium praktikum pertahanan',
            'type' => 'Laboratorium',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Laboratorium Botani Fangorn',
            'location' => 'Gedung C Lt. 3',
            'desc' => 'Laboratorium praktikum botani',
            'type' => 'Laboratorium',
            'capacity' => 25,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Lapangan Quidditch',
            'location' => 'Area Olahraga',
            'desc' => 'Lapangan untuk kegiatan olahraga dan kompetisi',
            'type' => 'Lapangan',
            'capacity' => 200,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Lapangan Pelennor',
            'location' => 'Area Olahraga',
            'desc' => 'Lapangan untuk kegiatan olahraga',
            'type' => 'Lapangan',
            'capacity' => 150,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Lapangan Rohan',
            'location' => 'Area Olahraga',
            'desc' => 'Lapangan untuk kegiatan luar ruangan',
            'type' => 'Lapangan',
            'capacity' => 100,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Lapangan Cormallen',
            'location' => 'Area Olahraga',
            'desc' => 'Lapangan untuk kegiatan dan acara bersama',
            'type' => 'Lapangan',
            'capacity' => 100,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Arena Triwizard',
            'location' => 'Area Olahraga',
            'desc' => 'Arena untuk kompetisi dan acara besar',
            'type' => 'Lapangan',
            'capacity' => 250,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Taman Lothlórien',
            'location' => 'Area Taman',
            'desc' => 'Taman untuk kegiatan santai dan pertemuan',
            'type' => 'Lapangan',
            'capacity' => 80,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Taman Shire',
            'location' => 'Area Taman',
            'desc' => 'Taman untuk kegiatan luar ruangan',
            'type' => 'Lapangan',
            'capacity' => 60,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Taman Ithilien',
            'location' => 'Area Taman',
            'desc' => 'Taman untuk kegiatan dan acara komunitas',
            'type' => 'Lapangan',
            'capacity' => 80,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Pelataran Minas Tirith',
            'location' => 'Area Pelataran',
            'desc' => 'Pelataran untuk acara dan pertemuan',
            'type' => 'Lapangan',
            'capacity' => 150,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Pelataran Hogwarts',
            'location' => 'Area Pelataran',
            'desc' => 'Pelataran untuk kegiatan bersama',
            'type' => 'Lapangan',
            'capacity' => 150,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Halaman Bag End',
            'location' => 'Area Halaman',
            'desc' => 'Halaman untuk kegiatan luar ruangan',
            'type' => 'Lapangan',
            'capacity' => 60,
            'is_avail' => true
        ]);

        Room::create([
            'name' => 'Kebun Herbologi',
            'location' => 'Area Taman',
            'desc' => 'Kebun untuk praktikum dan kegiatan herbologi',
            'type' => 'Lapangan',
            'capacity' => 50,
            'is_avail' => true
        ]);

    }
}