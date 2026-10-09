<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RoleNavigationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    #[DataProvider('roleDestinations')]
    public function test_signed_in_login_and_public_links_use_the_accounts_role(
        string $role, string $dashboard, string $reservations, string $createReservation, string $report,
    ): void {
        $this->actingAs(User::factory()->create(['role' => $role]));

        $this->get('/login')->assertRedirect(route($dashboard));
        $this->post('/login')->assertRedirect(route($dashboard));
        $this->get('/dashboard?verified=1')->assertRedirect(route($dashboard, ['verified' => 1]));
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.dashboardUrl', route($dashboard))
            ->where('reservationUrl', route($reservations))
            ->where('createReservationUrl', route($createReservation))
            ->where('canCreateReservation', in_array($role, ['user', 'pengguna'], true))
            ->where('reportUrl', route($report))
            ->etc());
        $this->get('/tentang')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.dashboardUrl', route($dashboard))->etc());
        $this->get('/fasilitas')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.dashboardUrl', route($dashboard))->etc());
    }

    public static function roleDestinations(): array
    {
        return [
            ['admin', 'admin.dashboard', 'admin.dashboard', 'admin.dashboard', 'admin.dashboard'],
            ['operator', 'operator.dashboard', 'operator.reservations', 'operator.reservations', 'operator.reports'],
            ['user', 'user.dashboard', 'reservations.index', 'reservations.form', 'reports.create'],
            ['pengguna', 'user.dashboard', 'reservations.index', 'reservations.form', 'reports.create'],
        ];
    }

    public function test_guest_public_links_preserve_the_login_and_reservation_flow(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('auth.user', null)->where('auth.dashboardUrl', null)
            ->where('reservationUrl', route('reservations.index'))
            ->where('createReservationUrl', route('reservations.form'))
            ->where('canCreateReservation', true)->where('reportUrl', route('login'))->etc());
    }

    #[DataProvider('crossRoleDestinations')]
    public function test_login_discards_a_saved_page_that_the_accounts_role_cannot_access(string $role, string $target, string $dashboard): void
    {
        $user = User::factory()->create(['role' => $role]);
        $this->get($target)->assertRedirect(route('login'));
        $this->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect(route($dashboard, absolute: false))->assertSessionMissing('url.intended');
    }

    public static function crossRoleDestinations(): array
    {
        return [
            ['admin', '/reservations/form', 'admin.dashboard'],
            ['operator', '/reservations', 'operator.dashboard'],
            ['user', '/operator/reservations', 'user.dashboard'],
            ['operator', '/admin/registrations', 'operator.dashboard'],
        ];
    }

    #[DataProvider('unsafeDestinations')]
    public function test_login_rejects_unsafe_or_inaccessible_saved_redirects(mixed $target, bool $inertia): void
    {
        $user = User::factory()->create();
        $response = $this->withSession(['url.intended' => $target])
            ->withHeaders($inertia ? ['X-Inertia' => 'true'] : [])
            ->post('/login', ['email' => $user->email, 'password' => 'password']);

        $response->assertSessionMissing('url.intended');
        if ($inertia) {
            $response->assertStatus(409)->assertHeader('X-Inertia-Location', route('user.dashboard'));
        } else {
            $response->assertRedirect(route('user.dashboard', absolute: false));
        }
    }

    public static function unsafeDestinations(): array
    {
        $targets = [
            'https://attacker.example/reservations', '//attacker.example/reservations',
            'http://localhost.attacker.example/reservations', 'http://attacker@localhost/reservations',
            'https://localhost/reservations', 'http://localhost:8080/reservations',
            '/\\attacker.example/reservations', "/reservations\r\nLocation: https://attacker.example",
            'javascript:alert(1)', 'reservations', '/login', '/', '/missing-page',
            '/logout', '/operator/reservations', '/admin/dashboard', ['invalid-array'],
        ];
        $cases = [];
        foreach ($targets as $target) {
            $cases[] = [$target, false];
            $cases[] = [$target, true];
        }

        return $cases;
    }

    #[DataProvider('allowedDestinations')]
    public function test_login_preserves_authorized_same_origin_destinations(string $role, string $target): void
    {
        $user = User::factory()->create(['role' => $role]);
        $target = str_replace('{origin}', url('/'), $target);
        $this->withSession(['url.intended' => $target])
            ->post('/login', ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect($target)->assertSessionMissing('url.intended');
    }

    public static function allowedDestinations(): array
    {
        return [
            ['user', '/reservations?status=menunggu#latest'],
            ['pengguna', '{origin}/reservations/form'],
            ['operator', '/operator/reservations?status=menunggu'],
            ['admin', '/admin/registrations'], ['operator', '/profile'],
        ];
    }

    public function test_password_confirmation_and_verification_reject_unsafe_saved_redirects(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'operator']));
        $this->withSession(['url.intended' => 'https://attacker.example'])
            ->post('/confirm-password', ['password' => 'password'])
            ->assertRedirect(route('operator.dashboard', absolute: false));
        $this->withSession(['url.intended' => '/reservations'])
            ->get('/verify-email')->assertRedirect(route('operator.dashboard', absolute: false));
        $this->withSession(['url.intended' => 'https://attacker.example'])
            ->post('/email/verification-notification')->assertRedirect(route('operator.dashboard', absolute: false));
    }

    public function test_email_verification_consumes_an_unsafe_saved_redirect_and_keeps_the_success_flag(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(10), [
            'id' => $user->id, 'hash' => sha1($user->email),
        ]);
        $this->actingAs($user)->withSession(['url.intended' => '//attacker.example'])
            ->get($url)->assertRedirect('/dashboard?verified=1')->assertSessionMissing('url.intended');
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }
}
