<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VerificationAndProvisioningSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    #[DataProvider('protectedRoleRoutes')]
    public function test_unverified_accounts_cannot_access_role_dashboards_or_write_resources(string $role, string $dashboard, string $method, string $mutation): void
    {
        $this->actingAs(User::factory()->unverified()->create(['role' => $role]));
        $this->get($dashboard)->assertRedirect(route('verification.notice'));
        $this->json($method, $mutation)->assertForbidden();
        $this->assertDatabaseCount('reservations', 0);
        $this->assertDatabaseCount('reports', 0);
        $this->assertDatabaseCount('users', 1);
        $this->get('/verify-email')->assertOk();
        $this->post('/logout')->assertRedirect('/');
    }

    public static function protectedRoleRoutes(): array
    {
        return [
            ['admin', '/admin/dashboard', 'POST', '/admin/registrations'],
            ['operator', '/operator/dashboard', 'PATCH', '/operator/reservations/99999/approve'],
            ['user', '/user/dashboard', 'POST', '/reservations'],
            ['pengguna', '/user/dashboard', 'POST', '/report/store'],
        ];
    }

    public function test_changing_email_removes_access_until_the_new_address_is_verified(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->patch('/profile', [
            'name' => $user->name, 'email' => 'new-address@example.com', 'email_verified_at' => now(),
        ])->assertSessionHasNoErrors();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
        $this->get('/user/dashboard')->assertRedirect(route('verification.notice'));
        $this->postJson('/reservations')->assertForbidden();
    }

    #[DataProvider('nonDevelopmentEnvironments')]
    public function test_demo_seeding_cannot_overwrite_real_accounts(string $environment): void
    {
        $user = User::factory()->create(['id' => 1, 'password' => 'private-password']);
        $original = $user->fresh()->getAttributes();
        $this->app->instance('env', $environment);

        try {
            (new UserSeeder)->run();
            $this->fail('Demo account seeding should be blocked.');
        } catch (LogicException $exception) {
            $this->assertStringContainsString('local or testing', $exception->getMessage());
        }

        $this->assertSame($original, $user->fresh()->getAttributes());
        $this->assertDatabaseCount('users', 1);
    }

    public static function nonDevelopmentEnvironments(): array
    {
        return [['production'], ['staging']];
    }

    public function test_demo_accounts_can_still_be_seeded_for_testing(): void
    {
        $this->seed(UserSeeder::class);
        $this->assertDatabaseHas('users', ['email' => 'arispujiw@admin.kampus.ac.id', 'role' => 'admin']);
        $this->assertDatabaseHas('users', ['email' => 'anangardiyanto@operator.kampus.ac.id', 'role' => 'operator']);
    }

    public function test_malformed_deletion_password_is_rejected_without_destroying_the_account_or_session(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->delete('/profile', ['password' => ['password']])
            ->assertSessionHasErrorsIn('userDeletion', 'password');
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }
}
