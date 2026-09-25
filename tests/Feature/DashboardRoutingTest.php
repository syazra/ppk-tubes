<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardRoutingTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_redirects_each_role_to_its_own_page(): void
    {
        $destinations = [
            'admin' => 'admin.dashboard',
            'operator' => 'operator.dashboard',
            'user' => 'user.dashboard',
        ];

        foreach ($destinations as $role => $route) {
            $user = User::factory()->create(['role' => $role]);

            $this->actingAs($user)
                ->get('/dashboard?verified=1')
                ->assertRedirect(route($route, ['verified' => 1]));
        }
    }

    public function test_guest_must_log_in_to_visit_dashboard(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }
}
