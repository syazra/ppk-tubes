<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_is_disabled(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [
            'name' => 'Student',
            'email' => 'student@students.kampus.ac.id',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertNotFound();
        $this->assertDatabaseCount('users', 0);
    }

    public function test_only_admin_can_access_student_registration(): void
    {
        $student = User::factory()->create(['role' => 'user', 'email' => 'student@students.kampus.ac.id']);

        $this->get('/admin/dashboard')->assertRedirect('/login');
        $this->post('/admin/students')->assertRedirect('/login');

        $this->actingAs($student)->get('/admin/dashboard')->assertForbidden();
        $this->actingAs($student)->post('/admin/students', [
            'name' => 'Another Student',
            'email' => 'another@students.kampus.ac.id',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertForbidden();

        $this->assertDatabaseMissing('users', ['email' => 'another@students.kampus.ac.id']);
    }

    public function test_admin_can_create_student_without_becoming_that_student(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@admin.kampus.ac.id']);

        $this->actingAs($admin)->get('/admin/dashboard')->assertOk();

        $response = $this->actingAs($admin)->post('/admin/students', [
            'name' => 'New Student',
            'email' => 'new@students.kampus.ac.id',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertSessionHasNoErrors()->assertRedirect(route('admin.dashboard'));
        $this->assertAuthenticatedAs($admin);
        $student = User::where('email', 'new@students.kampus.ac.id')->firstOrFail();
        $this->assertSame('user', $student->role);
        $this->assertTrue(Hash::check('password', $student->password));
    }

    public function test_admin_cannot_create_non_student_email(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'email' => 'admin@admin.kampus.ac.id']);

        $this->actingAs($admin)->post('/admin/students', [
            'name' => 'Wrong Domain',
            'email' => 'wrong@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('users', ['email' => 'wrong@example.com']);
    }
}
