<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', ['name' => 'Student', 'email' => 'student@example.test', 'password' => 'password'])->assertNotFound();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_only_admin_can_access_account_registration(): void
    {
        $student = User::factory()->create();
        $this->get('/admin/registrations')->assertRedirect('/login');
        $this->post('/admin/registrations')->assertRedirect('/login');
        $this->actingAs($student)->get('/admin/registrations')->assertForbidden();
        $this->post('/admin/registrations', $this->payload())->assertForbidden();
        $this->assertDatabaseCount('users', 1);
    }

    public function test_admin_can_provision_a_student_without_changing_their_own_session(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/admin/registrations')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Registrations')->where('urls.registrationStore', route('admin.registrations.store'))->etc());
        $this->post('/admin/registrations', $this->payload() + ['password' => 'attacker-chosen-password', 'role' => 'admin'])
            ->assertSessionHasNoErrors()->assertRedirect(route('admin.registrations.index'))->assertSessionHas('createdAccount');
        $this->assertAuthenticatedAs($admin);
        $student = User::where('email', 'new@example.test')->sole();
        $this->assertSame('user', $student->role);
        $this->assertTrue($student->hasVerifiedEmail());
        $this->assertTrue(Hash::check(session('createdAccount.password'), $student->password));
        $this->assertFalse(Hash::check('attacker-chosen-password', $student->password));
    }

    public function test_admin_cannot_provision_an_account_with_an_invalid_email(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'admin']))
            ->post('/admin/registrations', array_replace($this->payload(), ['email' => 'invalid-email']))
            ->assertSessionHasErrors('email');
        $this->assertDatabaseCount('users', 1);
    }

    private function payload(): array
    {
        return ['name' => 'New Student', 'email' => 'new@example.test', 'identity_number' => '24060124140199', 'account_type' => 'mahasiswa'];
    }
}
