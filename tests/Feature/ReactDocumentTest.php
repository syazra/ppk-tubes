<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReactDocumentTest extends TestCase
{
    use RefreshDatabase;

    public function test_document_shell_safely_serializes_script_tags_in_page_props(): void
    {
        $this->withoutVite();
        $name = '</script><script>alert("unsafe")</script>';
        $response = $this->actingAs(User::factory()->create(['name' => $name]))
            ->get(route('password.confirm'))->assertOk();
        $html = $response->getContent();
        $this->assertStringNotContainsString($name, $html);
        $this->assertSame(1, preg_match('/<script data-page="app" type="application\/json">(.*?)<\/script>/s', $html, $matches));
        $page = json_decode($matches[1], true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame($name, $page['props']['auth']['user']['name']);
        $this->assertStringContainsString('<div id="app"></div>', $html);
    }

    public function test_legacy_facilities_endpoint_serves_the_react_catalog(): void
    {
        $this->withoutVite();
        $this->actingAs(User::factory()->create())->get(route('reservations.facilities'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('User/Catalog')->has('facilities.data')->has('urls.catalog'));
    }

    public function test_verification_notice_preserves_resend_status(): void
    {
        $this->withoutVite();
        $this->actingAs(User::factory()->unverified()->create())
            ->withSession(['status' => 'verification-link-sent'])->get(route('verification.notice'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Auth/VerifyEmail')->where('status', 'verification-link-sent'));
    }
}
