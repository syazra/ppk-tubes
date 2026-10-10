<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminAccountValidationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function payload(array $overrides = []): array
    {
        return $overrides + ['name' => 'Mahasiswa Baru', 'email' => 'new@example.com', 'identity_number' => '24060126123456', 'account_type' => 'mahasiswa'];
    }

    #[DataProvider('invalidAccounts')]
    public function test_invalid_account_fields_are_rejected_on_create_and_update(array $overrides, string $field): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'user', 'identity_number' => '24060126111111']);
        $before = $target->fresh()->getAttributes();
        $this->actingAs($admin)->post(route('admin.registrations.store'), $this->payload($overrides))->assertSessionHasErrors($field);
        $this->put(route('admin.registrations.update', $target), $this->payload($overrides))->assertSessionHasErrors($field);
        $this->assertDatabaseCount('users', 2);
        $this->assertSame($before, $target->fresh()->getAttributes());
    }

    public static function invalidAccounts(): array
    {
        return [
            'invalid email' => [['email' => 'not-an-email'], 'email'],
            'local email domain' => [['email' => 'name@localhost'], 'email'],
            'email array' => [['email' => ['x@example.com']], 'email'],
            'email too long' => [['email' => str_repeat('x', 250).'@example.com'], 'email'],
            'short NIM' => [['identity_number' => '1234567890123'], 'identity_number'],
            'long NIM' => [['identity_number' => '123456789012345'], 'identity_number'],
            'letters in NIM' => [['identity_number' => '2406012612345x'], 'identity_number'],
            'all zero NIM' => [['identity_number' => str_repeat('0', 14)], 'identity_number'],
            'numeric JSON identity' => [['identity_number' => 24060126123456], 'identity_number'],
            'short NIP' => [['account_type' => 'dosen', 'identity_number' => '12345678901234567'], 'identity_number'],
            'long NIP' => [['account_type' => 'staf', 'identity_number' => '1234567890123456789'], 'identity_number'],
            'all zero NIP' => [['account_type' => 'petugas', 'identity_number' => str_repeat('0', 18)], 'identity_number'],
            'blank name' => [['name' => '   '], 'name'],
            'short name' => [['name' => 'A'], 'name'],
            'numeric name' => [['name' => '12345'], 'name'],
            'markup name' => [['name' => '<b>Nama</b>'], 'name'],
            'control name' => [['name' => "Nama\nLain"], 'name'],
            'long name' => [['name' => str_repeat('A', 256)], 'name'],
            'invalid account type' => [['account_type' => 'admin'], 'account_type'],
        ];
    }

    public function test_valid_accounts_are_normalized_without_changing_the_admin_session(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        foreach (['mahasiswa' => '00060126123456', 'dosen' => '199603032024061003', 'staf' => '198611152023101001', 'petugas' => '199406052023101001'] as $type => $identity) {
            $this->post(route('admin.registrations.store'), $this->payload([
                'name' => "  Dr. Élodie O'Neil  ", 'email' => '  '.$type.'@EXAMPLE.COM  ',
                'identity_number' => ' '.$identity.' ', 'account_type' => $type, 'role' => 'admin',
            ]))->assertSessionHasNoErrors()->assertRedirect(route('admin.registrations.index'));
            $account = User::where('email', $type.'@example.com')->firstOrFail();
            $this->assertSame($identity, $account->identity_number);
            $this->assertSame("Dr. Élodie O'Neil", $account->name);
            $this->assertSame($type === 'petugas' ? 'operator' : 'user', $account->role);
            $this->assertTrue($account->hasVerifiedEmail());
            $this->assertTrue(Hash::check(session('createdAccount.password'), $account->password));
            $this->assertAuthenticatedAs($admin);
        }
        $this->get(route('admin.registrations.index'))->assertInertia(fn (Assert $page) => $page->where('identityLengths.mahasiswa', 14)->where('identityLengths.petugas', 18));
    }

    public function test_duplicate_email_is_case_insensitive_and_identity_is_unique_but_updates_can_keep_own_values(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $target = User::factory()->create(['role' => 'user', 'email' => 'Existing@Example.com', 'identity_number' => '24060126123456', 'account_type' => 'mahasiswa']);
        $this->actingAs($admin)->post(route('admin.registrations.store'), $this->payload(['email' => 'EXISTING@example.com']))->assertSessionHasErrors(['email', 'identity_number']);
        $this->put(route('admin.registrations.update', $target), $this->payload(['email' => 'EXISTING@example.com']))->assertSessionHasNoErrors();
        $this->assertSame('existing@example.com', $target->fresh()->email);
        $this->assertDatabaseCount('users', 2);
    }

    public function test_non_admin_cannot_create_accounts_and_admin_accounts_cannot_be_managed_here(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $this->actingAs($user)->post(route('admin.registrations.store'), $this->payload())->assertForbidden();
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->put(route('admin.registrations.update', $admin), $this->payload())->assertNotFound();
        $this->assertDatabaseCount('users', 2);
    }
}
