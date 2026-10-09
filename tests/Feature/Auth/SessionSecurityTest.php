<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class SessionSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
        config(['session.driver' => 'database']);
        $this->app['session']->forgetDrivers();
        $this->app->forgetInstance('session.store');
    }

    public function test_login_rotates_the_session_and_csrf_token_and_records_the_password_snapshot(): void
    {
        $user = User::factory()->create();
        $this->withSession(['guest-data' => 'preserved']);
        $originalId = session()->getId();
        $originalToken = session()->token();
        session()->save();

        $response = $this->withCookie(session()->getName(), $originalId)->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('user.dashboard', absolute: false))
            ->assertSessionHas('guest-data', 'preserved')
            ->assertSessionHas('password_hash_web', Auth::guard('web')->hashPasswordForCookie($user->password));
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame($originalId, session()->getId());
        $this->assertNotSame($originalToken, session()->token());
        $this->assertNotSame($user->password, session('password_hash_web'));
        $this->assertDatabaseMissing('sessions', ['id' => $originalId]);
    }

    public function test_password_changed_before_the_first_post_login_request_revokes_the_session(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);

        $user->update(['password' => Hash::make('changed-password')]);

        $this->useBrowserSession($sessionId);
        $this->get('/user/dashboard')->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertNull(session('password_hash_web'));
    }

    public function test_password_change_rotates_the_current_session_and_revokes_other_browser_sessions(): void
    {
        $user = User::factory()->create();
        $otherSessionId = $this->login($user);

        $this->useBrowserSession(Str::random(40));
        $currentSessionId = $this->login($user);
        $oldPasswordSnapshot = session('password_hash_web');
        $oldToken = session()->token();

        $this->useBrowserSession($currentSessionId);
        $response = $this->withSession(['auth.password_confirmed_at' => time()])
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ]);

        $response->assertRedirect('/profile')
            ->assertSessionHasNoErrors()
            ->assertSessionMissing('auth.password_confirmed_at');
        $newSessionId = session()->getId();
        $this->assertNotSame($currentSessionId, $newSessionId);
        $this->assertNotSame($oldToken, session()->token());
        $this->assertNotSame($oldPasswordSnapshot, session('password_hash_web'));
        $this->assertDatabaseMissing('sessions', ['id' => $currentSessionId]);
        $this->assertDatabaseHas('sessions', ['id' => $otherSessionId]);
        $this->assertDatabaseHas('sessions', ['id' => $newSessionId]);

        $this->useBrowserSession($newSessionId);
        $this->get('/user/dashboard')->assertOk();
        $this->assertAuthenticatedAs($user);

        $this->useBrowserSession($otherSessionId);
        $this->get('/user/dashboard')->assertRedirect(route('login'));
        $this->assertGuest();

        $this->useBrowserSession($currentSessionId);
        $this->get('/user/dashboard')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_failed_password_changes_preserve_the_current_session_and_confirmation(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);
        $passwordSnapshot = session('password_hash_web');
        $csrfToken = session()->token();
        $confirmedAt = time();

        $this->useBrowserSession($sessionId);
        $this->withSession(['auth.password_confirmed_at' => $confirmedAt])
            ->from('/profile')
            ->put('/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])
            ->assertRedirect('/profile')
            ->assertSessionHasErrorsIn('updatePassword', 'current_password')
            ->assertSessionHas('auth.password_confirmed_at', $confirmedAt)
            ->assertSessionHas('password_hash_web', $passwordSnapshot);

        $this->assertSame($sessionId, session()->getId());
        $this->assertSame($csrfToken, session()->token());
        $this->assertAuthenticatedAs($user);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    #[DataProvider('malformedPasswordUpdates')]
    public function test_malformed_password_updates_preserve_the_password_and_authenticated_session(
        mixed $currentPassword,
        mixed $newPassword,
        string $errorField,
    ): void {
        $user = User::factory()->create();
        $originalPasswordHash = $user->password;
        $sessionId = $this->login($user);
        $passwordSnapshot = session('password_hash_web');
        $csrfToken = session()->token();
        $confirmedAt = time();

        $this->useBrowserSession($sessionId);
        $this->withSession(['auth.password_confirmed_at' => $confirmedAt])
            ->from('/profile')
            ->put('/password', [
                'current_password' => $currentPassword,
                'password' => $newPassword,
                'password_confirmation' => $newPassword,
            ])
            ->assertRedirect('/profile')
            ->assertSessionHasErrorsIn('updatePassword', $errorField)
            ->assertSessionHas('auth.password_confirmed_at', $confirmedAt)
            ->assertSessionHas('password_hash_web', $passwordSnapshot);

        $this->assertSame($sessionId, session()->getId());
        $this->assertSame($csrfToken, session()->token());
        $this->assertSame($originalPasswordHash, $user->fresh()->password);
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('sessions', ['id' => $sessionId]);
    }

    public static function malformedPasswordUpdates(): array
    {
        return [
            'array current password' => [['password'], 'new-password', 'current_password'],
            'array new password' => ['password', ['new-password'], 'password'],
        ];
    }

    public function test_logout_destroys_the_session_data_and_rotates_the_session_and_csrf_token(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);
        $csrfToken = session()->token();

        $this->useBrowserSession($sessionId);
        $this->withSession(['private-data' => 'secret', 'auth.password_confirmed_at' => time()])
            ->post('/logout')
            ->assertRedirect('/')
            ->assertSessionMissing('private-data')
            ->assertSessionMissing('auth.password_confirmed_at')
            ->assertSessionMissing('password_hash_web');

        $this->assertGuest();
        $this->assertNotSame($sessionId, session()->getId());
        $this->assertNotSame($csrfToken, session()->token());
        $this->assertDatabaseMissing('sessions', ['id' => $sessionId]);

        $this->useBrowserSession($sessionId);
        $this->get('/user/dashboard')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_normal_login_clears_inertia_history_on_the_next_page(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);

        $this->useBrowserSession($sessionId);
        $this->get('/user/dashboard')
            ->assertOk()
            ->assertViewHas('page', fn (array $page): bool => ($page['clearHistory'] ?? false) === true);
    }

    public function test_normal_logout_clears_inertia_history_on_the_next_page(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);

        $this->useBrowserSession($sessionId);
        $this->post('/logout')->assertRedirect('/');

        $this->useBrowserSession(session()->getId());
        $this->get('/')
            ->assertOk()
            ->assertViewHas('page', fn (array $page): bool => ($page['clearHistory'] ?? false) === true
                && $page['props']['auth']['user'] === null);
    }

    public function test_password_change_clears_inertia_history_on_the_next_page(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);

        $this->useBrowserSession($sessionId);
        $this->get('/user/dashboard')->assertOk();
        $this->useBrowserSession($sessionId);
        $this->from('/profile')->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertSessionHasNoErrors();

        $this->useBrowserSession(session()->getId());
        $this->get('/user/dashboard')
            ->assertOk()
            ->assertViewHas('page', fn (array $page): bool => ($page['clearHistory'] ?? false) === true);
    }

    public function test_login_is_blocked_after_five_failures_and_recovers_after_the_lockout_expires(): void
    {
        $user = User::factory()->create();
        $this->travelTo(now()->startOfSecond());

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->from('/login')->post('/login', [
                'email' => $user->email,
                'password' => 'wrong-password',
            ])->assertSessionHasErrors('email');
        }

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertSessionHasErrors('email');
        $this->assertGuest();

        $this->travel(61)->seconds();
        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('user.dashboard', absolute: false))->assertSessionHasNoErrors();
        $this->assertAuthenticatedAs($user);
    }

    public function test_password_update_attempts_are_rate_limited_and_recover_after_the_limit_expires(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);
        $this->travelTo(now()->startOfSecond());

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->useBrowserSession($sessionId);
            $this->from('/profile')->put('/password', [
                'current_password' => 'wrong-password',
                'password' => 'new-password',
                'password_confirmation' => 'new-password',
            ])->assertSessionHasErrorsIn('updatePassword', 'current_password');
        }

        $this->useBrowserSession($sessionId);
        $this->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(429);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));

        $this->travel(61)->seconds();
        $this->useBrowserSession($sessionId);
        $this->from('/profile')->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertRedirect('/profile')->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('new-password', $user->fresh()->password));
    }

    public function test_account_deletion_cannot_bypass_the_password_verification_limit(): void
    {
        $user = User::factory()->create();
        $sessionId = $this->login($user);

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->useBrowserSession($sessionId);
            $this->from('/profile')->delete('/profile', [
                'password' => 'wrong-password',
            ])->assertSessionHasErrorsIn('userDeletion', 'password');
        }

        $this->useBrowserSession($sessionId);
        $this->delete('/profile', ['password' => 'password'])->assertStatus(429);
        $this->assertDatabaseHas('users', ['id' => $user->id]);

        $this->useBrowserSession($sessionId);
        $this->post('/confirm-password', ['password' => 'password'])->assertStatus(429);

        $this->useBrowserSession($sessionId);
        $this->put('/password', [
            'current_password' => 'password',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])->assertStatus(429);
        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    private function login(User $user): string
    {
        $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertRedirect(route('user.dashboard', absolute: false))->assertSessionHasNoErrors();

        return session()->getId();
    }

    private function useBrowserSession(string $sessionId): void
    {
        // Each browser request must reload its own stored session and user.
        Auth::forgetGuards();
        $this->app->forgetInstance('auth.driver');
        session()->flush();
        $this->withCookie(session()->getName(), $sessionId);
    }
}
