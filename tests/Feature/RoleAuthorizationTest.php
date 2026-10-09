<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\Reservation;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    #[DataProvider('forbiddenRoles')]
    public function test_other_roles_cannot_read_or_mutate_protected_resources(string $role, string $scope): void
    {
        $owner = User::factory()->create();
        $room = Room::create([
            'name' => 'Security test room', 'location' => 'Test building',
            'type' => 'Ruang Kelas', 'capacity' => 30, 'is_avail' => true,
        ]);
        $reservation = Reservation::create([
            'user_id' => $owner->id, 'room_id' => $room->id, 'desc' => 'Private reservation',
            'date_to_reserv' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00', 'end_time' => '10:00:00', 'status' => 'menunggu',
        ]);
        $report = Report::create([
            'user_id' => $owner->id, 'room_id' => $room->id,
            'desc' => 'Private report', 'status' => 'baru',
        ]);
        $this->actingAs(User::factory()->create(['role' => $role]));

        foreach (self::endpoints($scope) as [$method, $path]) {
            $path = strtr($path, [
                '{user}' => (string) $owner->id, '{room}' => (string) $room->id,
                '{reservation}' => (string) $reservation->id, '{report}' => (string) $report->id,
            ]);
            $this->call($method, $path)->assertForbidden();
        }

        $this->assertDatabaseHas('reservations', ['id' => $reservation->id, 'status' => 'menunggu']);
        $this->assertDatabaseHas('reports', ['id' => $report->id, 'status' => 'baru']);
        $this->assertDatabaseHas('rooms', ['id' => $room->id, 'is_avail' => true]);
        $this->assertDatabaseHas('users', ['id' => $owner->id, 'role' => 'user']);
        $this->assertDatabaseCount('reservations', 1);
        $this->assertDatabaseCount('reports', 1);
    }

    public static function forbiddenRoles(): array
    {
        return [
            ['admin', 'operator'], ['admin', 'user'],
            ['operator', 'admin'], ['operator', 'user'],
            ['user', 'admin'], ['user', 'operator'],
            ['pengguna', 'admin'], ['pengguna', 'operator'],
            ['unknown', 'admin'], ['unknown', 'operator'], ['unknown', 'user'],
        ];
    }

    public function test_guests_must_authenticate_before_reading_or_mutating_resources(): void
    {
        foreach (['admin', 'operator', 'user'] as $scope) {
            foreach (self::endpoints($scope) as [$method, $path]) {
                $path = strtr($path, ['{user}' => '99999', '{room}' => '99999', '{reservation}' => '99999', '{report}' => '99999']);
                $this->call($method, $path)->assertRedirect(route('login'));
            }
        }
    }

    public function test_wrong_roles_are_rejected_before_model_binding_reveals_resource_existence(): void
    {
        $this->actingAs(User::factory()->create());
        $this->put('/admin/registrations/99999')->assertForbidden();
        $this->patch('/admin/facilities/99999/availability')->assertForbidden();

        $this->actingAs(User::factory()->create(['role' => 'operator']));
        $this->get('/reservations/99999/ticket')->assertForbidden();
        $this->patch('/reports/99999/cancel')->assertForbidden();
    }

    public function test_users_cannot_escalate_their_role_through_profile_updates(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->patch('/profile', [
            'name' => 'Updated name', 'email' => $user->email,
            'role' => 'admin', 'account_type' => 'admin', 'password' => 'attacker-password',
        ])->assertRedirect(route('profile.edit'))->assertSessionHasNoErrors();

        $this->assertSame('user', $user->fresh()->role);
        $this->assertSame($user->account_type, $user->fresh()->account_type);
        $this->assertSame($user->password, $user->fresh()->password);
        $this->get('/admin/dashboard')->assertForbidden();
    }

    public function test_unknown_roles_are_denied_shared_account_routes_but_can_log_out(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'unknown']));
        $this->get('/dashboard')->assertForbidden();
        $this->get('/profile')->assertForbidden();
        $this->put('/password')->assertForbidden();
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_users_cannot_access_or_cancel_another_users_reservation_or_report(): void
    {
        $owner = User::factory()->create();
        $room = Room::create([
            'name' => 'Private room', 'location' => 'Test', 'type' => 'Ruang Kelas',
            'capacity' => 20, 'is_avail' => true,
        ]);
        $reservation = Reservation::create([
            'user_id' => $owner->id, 'room_id' => $room->id, 'desc' => 'Private booking',
            'date_to_reserv' => now()->addDay()->toDateString(),
            'start_time' => '08:00:00', 'end_time' => '09:00:00', 'status' => 'menunggu',
        ]);
        $report = Report::create([
            'user_id' => $owner->id, 'room_id' => $room->id, 'desc' => 'Private damage', 'status' => 'baru',
        ]);
        $this->actingAs(User::factory()->create());

        $this->get("/reservations/{$reservation->id}/ticket")->assertForbidden();
        $this->get("/reservations/{$reservation->id}/qrcode")->assertForbidden();
        $this->patch("/reservations/{$reservation->id}/cancel")->assertForbidden();
        $this->patch("/reports/{$report->id}/cancel")->assertRedirect(route('reports.index'))->assertSessionHas('error');
        $this->assertDatabaseHas('reservations', ['id' => $reservation->id, 'status' => 'menunggu']);
        $this->assertDatabaseHas('reports', ['id' => $report->id, 'status' => 'baru']);
    }

    private static function endpoints(string $scope): array
    {
        return match ($scope) {
            'admin' => [
                ['GET', '/admin/dashboard'], ['GET', '/admin/registrations'],
                ['POST', '/admin/registrations'], ['PUT', '/admin/registrations/{user}'],
                ['DELETE', '/admin/registrations/{user}'], ['GET', '/admin/facilities'],
                ['POST', '/admin/facilities'], ['PUT', '/admin/facilities/{room}'],
                ['PATCH', '/admin/facilities/{room}/availability'],
                ['GET', '/admin/facilities/recap'], ['GET', '/admin/facilities/recap/export/csv'],
            ],
            'operator' => [
                ['GET', '/operator/dashboard'], ['GET', '/operator/reservations'], ['GET', '/operator/reports'],
                ['PATCH', '/operator/reservations/{reservation}/approve'], ['PATCH', '/operator/reservations/{reservation}/reject'],
                ['PATCH', '/operator/reports/{report}/process'], ['PATCH', '/operator/reports/{report}/complete'],
                ['PATCH', '/operator/reports/{report}/reject'], ['PATCH', '/operator/reports/{report}/extend'],
            ],
            'user' => [
                ['GET', '/user/dashboard'], ['GET', '/reservations'], ['GET', '/reservations/form'],
                ['GET', '/reservations/slots'], ['GET', '/reservations/facilities'],
                ['GET', '/reservations/facilities/{room}/slots'], ['POST', '/reservations'],
                ['GET', '/reservations/{reservation}/ticket'], ['GET', '/reservations/{reservation}/qrcode'],
                ['PATCH', '/reservations/{reservation}/cancel'], ['GET', '/my-reports'],
                ['GET', '/report/create'], ['POST', '/report/store'], ['PATCH', '/reports/{report}/cancel'],
            ],
        };
    }
}
