<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->withSession(['status' => 'Kata sandi diperbarui.'])->get('/login');

        $response->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Login')
            ->where('status', 'Kata sandi diperbarui.')
            ->where('landingUrl', route('landing'))
            ->where('demoAccounts', [])
            ->where('auth.user', null)
            ->etc());
        $response->assertDontSee('Lupa kata sandi?');
        $response->assertDontSee('Daftar');
    }

    public function test_local_login_page_exposes_demo_accounts(): void
    {
        $this->app->instance('env', 'local');

        $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Login')
            ->where('demoAccounts', [
                ['label' => 'Mahasiswa', 'email' => 'ruthseptriana@students.kampus.ac.id'],
                ['label' => 'Dosen', 'email' => 'sandykurniawan@lecturer.kampus.ac.id'],
                ['label' => 'Staf', 'email' => 'benynugroho@staff.kampus.ac.id'],
                ['label' => 'Operator', 'email' => 'anangardiyanto@operator.kampus.ac.id'],
                ['label' => 'Admin', 'email' => 'arispujiw@admin.kampus.ac.id'],
            ])
            ->etc());
    }

    #[DataProvider('nonLocalEnvironments')]
    public function test_non_local_login_pages_do_not_expose_demo_accounts(string $environment): void
    {
        $this->app->instance('env', $environment);

        $this->get('/login')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Login')
            ->where('demoAccounts', [])
            ->etc());
    }

    public static function nonLocalEnvironments(): array
    {
        return [['production'], ['staging']];
    }

    #[DataProvider('roleDashboards')]
    public function test_users_can_authenticate_using_the_login_screen(string $role, string $dashboard): void
    {
        $user = User::factory()->create([
            'email' => 'student@students.kampus.ac.id',
            'role' => $role,
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route($dashboard, absolute: false));
        $response->assertHeaderMissing('X-Inertia-Location');
    }

    #[DataProvider('roleDashboards')]
    public function test_inertia_logins_trigger_full_page_visits_to_role_dashboards(string $role, string $dashboard): void
    {
        $user = User::factory()->create(['role' => $role]);

        $response = $this->withHeaders(['X-Inertia' => 'true'])->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertStatus(409)
            ->assertHeader('X-Inertia-Location', route($dashboard));
    }

    public static function roleDashboards(): array
    {
        return [
            'admin' => ['admin', 'admin.dashboard'],
            'operator' => ['operator', 'operator.dashboard'],
            'user' => ['user', 'user.dashboard'],
            'pengguna' => ['pengguna', 'user.dashboard'],
        ];
    }

    #[DataProvider('loginProtocols')]
    public function test_successful_logins_preserve_and_consume_the_intended_url(bool $inertia): void
    {
        $user = User::factory()->create();
        $intended = route('reservations.index');

        $response = $this->withSession(['url.intended' => $intended])
            ->withHeaders($inertia ? ['X-Inertia' => 'true'] : [])
            ->post('/login', ['email' => $user->email, 'password' => 'password']);

        $this->assertAuthenticatedAs($user);
        $response->assertSessionMissing('url.intended');
        if ($inertia) {
            $response->assertStatus(409)->assertHeader('X-Inertia-Location', $intended);
        } else {
            $response->assertRedirect($intended)->assertHeaderMissing('X-Inertia-Location');
        }
    }

    public static function loginProtocols(): array
    {
        return ['normal' => [false], 'inertia' => [true]];
    }

    #[DataProvider('loginProtocols')]
    public function test_users_can_not_authenticate_with_invalid_password(bool $inertia): void
    {
        $user = User::factory()->create();

        $this->from(route('login'))
            ->withHeaders($inertia ? ['X-Inertia' => 'true'] : [])
            ->post('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
            ])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email')
            ->assertHeaderMissing('X-Inertia-Location');

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
