<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_confirm_password_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get('/confirm-password');

        $response->assertStatus(200)->assertInertia(fn (Assert $page) => $page
            ->component('Auth/ConfirmPassword')->where('confirmUrl', route('password.confirm')));
    }

    public function test_password_can_be_confirmed(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/confirm-password', [
            'password' => 'password',
        ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();
    }

    public function test_password_is_not_confirmed_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/confirm-password', [
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors();
    }

    #[DataProvider('malformedPasswords')]
    public function test_malformed_passwords_are_rejected_without_confirming_the_session(mixed $password): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post('/confirm-password', [
            'password' => $password,
        ])->assertSessionHasErrors('password')
            ->assertSessionMissing('auth.password_confirmed_at');
    }

    public static function malformedPasswords(): array
    {
        return [
            'missing' => [null],
            'empty' => [''],
            'array' => [['password']],
        ];
    }

    public function test_password_confirmation_attempts_are_rate_limited_and_recover_after_the_limit_expires(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->travelTo(now()->startOfSecond());

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->post('/confirm-password', [
                'password' => 'wrong-password',
            ])->assertSessionHasErrors('password')
                ->assertSessionMissing('auth.password_confirmed_at');
        }

        $this->post('/confirm-password', ['password' => 'password'])
            ->assertStatus(429)
            ->assertSessionMissing('auth.password_confirmed_at');

        $this->travel(61)->seconds();
        $this->post('/confirm-password', ['password' => 'password'])
            ->assertRedirect()
            ->assertSessionHasNoErrors()
            ->assertSessionHas('auth.password_confirmed_at');
    }
}
