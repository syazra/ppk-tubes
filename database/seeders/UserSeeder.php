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
                'name' => 'Operator Kampus',
                'email' => 'operator@operator.kampus.ac.id',
                'role' => 'operator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Admin Kampus',
                'email' => 'admin@admin.kampus.ac.id',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Mahasiswa Kampus',
                'email' => 'student@students.kampus.ac.id',
                'role' => 'user',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Dosen Kampus',
                'email' => 'lecturer@lecturer.kampus.ac.id',
                'role' => 'user',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Nama Operator',
                'email' => 'nama@operator.kampus.ac.id',
                'role' => 'operator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Nama Admin',
                'email' => 'nama@admin.kampus.ac.id',
                'role' => 'admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Nama Student',
                'email' => 'nama@students.kampus.ac.id',
                'role' => 'user',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Nama Lecturer',
                'email' => 'nama@lecturer.kampus.ac.id',
                'role' => 'user',
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
