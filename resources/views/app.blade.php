<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/css/responsive.css', 'resources/js/admin.jsx'])
        <x-inertia::head />
    </head>
    <body class="font-sans antialiased">
        @if(($page['component'] ?? '') === 'Login' || str_starts_with($page['component'] ?? '', 'User/') || str_starts_with($page['component'] ?? '', 'Admin/'))
            <div id="page-loading-boot" role="status" style="position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:radial-gradient(circle at 50% 50%, #0d5a4c 0%, #0a3f36 45%, #062e29 100%);color:#f8f9f3;font:14px Figtree,sans-serif">Memuat halaman…</div>
        @endif
        <x-inertia::app />
    </body>
</html>
