<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HistorySecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_authenticated_inertia_pages_encrypt_history_and_cannot_be_cached(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/user/dashboard');

        $response->assertOk()
            ->assertViewHas('page', fn (array $page) => $page['encryptHistory'] === true);
        $this->assertTrue($response->headers->hasCacheControlDirective('no-store'));
        $this->assertTrue($response->headers->hasCacheControlDirective('private'));

        $this->get('/user/dashboard', [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $response->viewData('page')['version'],
        ])
            ->assertOk()
            ->assertJsonPath('encryptHistory', true);
    }

    public function test_logout_clears_private_history_on_the_next_guest_page(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/user/dashboard')->assertOk();

        $this->post('/logout')->assertRedirect('/');

        $this->get('/')->assertOk()->assertViewHas('page', fn (array $page) => $page['clearHistory'] === true
            && ! isset($page['encryptHistory'])
            && $page['props']['auth']['user'] === null);

        $this->get('/user/dashboard')->assertRedirect(route('login'));
    }

    public function test_guest_pages_clear_history_after_an_expired_session(): void
    {
        $this->get('/login')->assertOk()->assertViewHas('page', fn (array $page) => $page['clearHistory'] === true && ! isset($page['encryptHistory']));
    }

    public function test_login_and_authenticated_react_pages_cannot_be_cached(): void
    {
        $login = $this->get('/login')->assertOk();
        $this->assertTrue($login->headers->hasCacheControlDirective('no-store'));

        $user = User::factory()->create();
        $profile = $this->actingAs($user)->get('/profile')->assertOk();
        $this->assertTrue($profile->headers->hasCacheControlDirective('no-store'));

        $confirmation = $this->get('/confirm-password')->assertOk();
        $this->assertTrue($confirmation->headers->hasCacheControlDirective('no-store'));
    }
}
