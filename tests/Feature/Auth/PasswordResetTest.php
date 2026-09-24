<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    public function test_self_service_password_reset_routes_are_disabled(): void
    {
        $this->get('/forgot-password')->assertNotFound();
        $this->post('/forgot-password', ['email' => 'student@students.kampus.ac.id'])->assertNotFound();
        $this->get('/reset-password/example-token')->assertNotFound();
        $this->post('/reset-password', [])->assertNotFound();
    }
}
