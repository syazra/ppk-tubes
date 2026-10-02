<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'id' => 1,
                'name' => 'Dr. Aris Puji Widodo, S.Si., M.T.',
                'email' => 'arispujiw@admin.kampus.ac.id',
                'role' => 'admin',
                'account_type' => 'admin', 
                'identity_number' => '197404011999031002',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Annisa Istiadah N., A.Md',
                'email' => 'annisaisti@operator.kampus.ac.id',
                'role' => 'operator',
                'account_type' => 'petugas',
                'identity_number' => '198911012023102001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Anang Ardiyanto, S.Kom.',
                'email' => 'anangardiyanto@operator.kampus.ac.id',
                'role' => 'operator',
                'account_type' => 'petugas',
                'identity_number' => '199406052023101001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Ruth Septriana Sipangkar',
                'email' => 'ruthseptriana@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124120024',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Syafira Azka Ramadhani',
                'email' => 'syafirazka@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124130088',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Yasmina Syahidah',
                'email' => 'yasminasya@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124130116',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Muhammad Farhan Abdul Azis',
                'email' => 'mfarhanabdul@students.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'mahasiswa',
                'identity_number' => '24060124140166',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Sandy Kurniawan, S.Kom., M.Kom.',
                'email' => 'sandykurniawan@lecturer.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'dosen',
                'identity_number' => '199603032024061003',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Henri Tantyoko, S.Kom., M.Kom.',
                'email' => 'henritantyoko@lecturer.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'dosen',
                'identity_number' => '199612272024061001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 10,
                'name' => 'Beny Nugroho, S.Kom.',
                'email' => 'benynugroho@staff.kampus.ac.id',
                'role' => 'user',
                'account_type' => 'staf',
                'identity_number' => '198611152023101001',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['id' => $user['id']],
                $user
            );
        }
    }
}