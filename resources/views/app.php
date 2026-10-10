<?php
// Minimal document shell; all application screens are rendered by React.
$ssr = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();
$vite = app(\Illuminate\Foundation\Vite::class);
$component = $page['component'] ?? '';
?>
<!DOCTYPE html>
<html lang="<?= e(str_replace('_', '-', app()->getLocale())) ?>">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet">
        <?= $vite->reactRefresh() ?>
        <?= $vite(['resources/css/app.css', 'resources/css/responsive.css', 'resources/js/admin.jsx']) ?>
        <?= $ssr?->head ?? '' ?>
    </head>
    <body class="font-sans antialiased">
        <?php if ($component === 'Login' || str_starts_with($component, 'User/') || str_starts_with($component, 'Admin/')): ?>
            <div id="page-loading-boot" role="status" style="position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:radial-gradient(circle at 50% 50%, #0d5a4c 0%, #0a3f36 45%, #062e29 100%);color:#f8f9f3;font:14px Figtree,sans-serif">Memuat halaman…</div>
        <?php endif; ?>
        <?php if ($ssr): ?>
            <?= $ssr->body ?>
        <?php else: ?>
            <script data-page="app" type="application/json"><?= json_encode($page, JSON_HEX_TAG | JSON_THROW_ON_ERROR) ?></script><div id="app"></div>
        <?php endif; ?>
    </body>
</html>
