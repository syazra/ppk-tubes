<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class PageLoadingScreenTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    #[DataProvider('loadingPages')]
    public function test_full_document_visits_have_a_boot_loader_but_ajax_responses_do_not(string $path, ?string $role): void
    {
        if ($role !== null) {
            $this->actingAs(User::factory()->create(['role' => $role]));
        }

        $initial = $this->get($path)->assertOk()->assertSee('id="page-loading-boot"', false);
        $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => $initial->viewData('page')['version']])->get($path)
            ->assertOk()
            ->assertHeader('X-Inertia', 'true')
            ->assertDontSee('page-loading-boot', false);
    }

    public static function loadingPages(): array
    {
        return [
            'login' => ['/login', null],
            'user dashboard' => ['/user/dashboard', 'user'],
            'admin dashboard' => ['/admin/dashboard', 'admin'],
        ];
    }

    public function test_public_pages_do_not_get_the_login_loading_screen(): void
    {
        foreach (['/', '/fasilitas', '/tentang'] as $path) {
            $this->get($path)->assertOk()->assertDontSee('page-loading-boot', false);
        }
    }
}
