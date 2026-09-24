<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_seeder_creates_expected_accounts_and_roles(): void
    {
        $this->seed(UserSeeder::class);

        $expectedAccounts = [
            ['id' => 1, 'email' => 'operator@operator.kampus.ac.id', 'role' => 'operator'],
            ['id' => 2, 'email' => 'admin@admin.kampus.ac.id', 'role' => 'admin'],
            ['id' => 3, 'email' => 'student@students.kampus.ac.id', 'role' => 'user'],
            ['id' => 4, 'email' => 'lecturer@lecturer.kampus.ac.id', 'role' => 'user'],
            ['id' => 5, 'email' => 'nama@operator.kampus.ac.id', 'role' => 'operator'],
            ['id' => 6, 'email' => 'nama@admin.kampus.ac.id', 'role' => 'admin'],
            ['id' => 7, 'email' => 'nama@students.kampus.ac.id', 'role' => 'user'],
            ['id' => 8, 'email' => 'nama@lecturer.kampus.ac.id', 'role' => 'user'],
        ];

        foreach ($expectedAccounts as $expected) {
            $user = User::find($expected['id']);
            $this->assertNotNull($user);
            $this->assertEquals($expected['email'], $user->email);
            $this->assertEquals($expected['email'], $user->akun);
            $this->assertEquals($expected['role'], $user->role);
            $this->assertTrue(Hash::check('password', $user->password));
        }
    }

    public function test_seeded_users_can_authenticate(): void
    {
        $this->seed(UserSeeder::class);

        $response = $this->post('/login', [
            'email' => 'admin@admin.kampus.ac.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }
}
