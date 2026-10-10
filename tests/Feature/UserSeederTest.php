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
            ['id' => 1, 'email' => 'arispujiw@admin.kampus.ac.id', 'role' => 'admin'],
            ['id' => 2, 'email' => 'annisaisti@operator.kampus.ac.id', 'role' => 'operator'],
            ['id' => 3, 'email' => 'anangardiyanto@operator.kampus.ac.id', 'role' => 'operator'],
            ['id' => 4, 'email' => 'ruthseptriana@students.kampus.ac.id', 'role' => 'user'],
            ['id' => 8, 'email' => 'sandykurniawan@lecturer.kampus.ac.id', 'role' => 'user'],
            ['id' => 10, 'email' => 'benynugroho@staff.kampus.ac.id', 'role' => 'user'],
            ['id' => 31, 'email' => 'frodobaggins@students.kampus.ac.id', 'role' => 'user'],
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

    public function test_user_seeder_creates_at_least_100_unique_mahasiswa(): void
    {
        $this->seed(UserSeeder::class);

        $mahasiswa = User::where('account_type', 'mahasiswa')->get();

        $this->assertGreaterThanOrEqual(100, $mahasiswa->count());
        $this->assertSame($mahasiswa->count(), $mahasiswa->pluck('email')->unique()->count());
        $this->assertSame($mahasiswa->count(), $mahasiswa->pluck('identity_number')->unique()->count());
    }

    public function test_user_seeder_creates_ten_themed_dosen_and_ten_staf_with_unique_identities(): void
    {
        $this->seed(UserSeeder::class);

        foreach (['dosen' => 'lecturer', 'staf' => 'staff'] as $type => $domain) {
            $accounts = User::where('account_type', $type)->where('id', '>', 280)->get();

            $this->assertCount(10, $accounts);
            $this->assertSame('user', $accounts->first()->role);
            foreach ($accounts as $account) {
                $this->assertStringEndsWith('@'.$domain.'.kampus.ac.id', $account->email);
                $this->assertSame(18, strlen($account->identity_number));
            }
        }

        $this->assertSame(User::count(), User::pluck('identity_number')->unique()->count());
        $this->assertSame(User::count(), User::pluck('email')->unique()->count());
    }

    public function test_seeded_users_can_authenticate(): void
    {
        $this->seed(UserSeeder::class);

        $response = $this->post('/login', [
            'email' => 'arispujiw@admin.kampus.ac.id',
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }
}
