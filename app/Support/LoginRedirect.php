<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class LoginRedirect
{
    public function destination(Request $request, ?string $fallback = null): string
    {
        $user = $request->user();
        $dashboard = $user?->dashboardRouteName();
        abort_if($user === null || $dashboard === null, 403);

        $intended = $request->session()->pull('url.intended');

        return is_string($intended) && $this->isAllowed($request, $user, $intended)
            ? $intended
            : ($fallback ?? route($dashboard, absolute: false));
    }

    private function isAllowed(Request $request, User $user, string $target): bool
    {
        if (preg_match('/[\x00-\x20\x7f]/', $target) || str_contains($target, '\\') || str_starts_with($target, '//')) {
            return false;
        }

        $parts = parse_url($target);
        if ($parts === false || isset($parts['user']) || isset($parts['pass'])) {
            return false;
        }

        if (isset($parts['host'])) {
            $scheme = strtolower($parts['scheme'] ?? '');
            $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);

            if ($scheme !== $request->getScheme()
                || strtolower($parts['host']) !== strtolower($request->getHost())
                || $port !== $request->getPort()) {
                return false;
            }
        } elseif (isset($parts['scheme']) || ! str_starts_with($target, '/')) {
            return false;
        }

        try {
            $route = app('router')->getRoutes()->match(Request::create($target, 'GET'));
        } catch (NotFoundHttpException|MethodNotAllowedHttpException) {
            return false;
        }

        $middleware = $route->gatherMiddleware();
        if (! in_array('auth', $middleware, true) || in_array('guest', $middleware, true)) {
            return false;
        }

        foreach ($middleware as $guard) {
            if ($guard === 'admin' && ! $user->isAdmin()) {
                return false;
            }

            if (is_string($guard) && str_starts_with($guard, 'role:')
                && ! $user->hasRole(...explode(',', substr($guard, 5)))) {
                return false;
            }
        }

        return true;
    }
}
