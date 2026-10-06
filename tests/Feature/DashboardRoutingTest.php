<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
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

    public function test_user_dashboard_renders_the_inertia_page_with_quick_action_urls(): void
    {
        $user = User::factory()->create(['role' => 'user']);

        $this->actingAs($user)
            ->get(route('user.dashboard'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('User/Dashboard')
                ->has('recentReservations', 0)
                ->has('recentReports', 0)
                ->where('urls.reservationForm', route('reservations.form'))
                ->where('urls.reportCreate', route('reports.create'))
            );
    }
}
