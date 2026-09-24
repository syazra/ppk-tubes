<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'Pinjamin') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600,700&display=swap" rel="stylesheet" />
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-teal-darker antialiased">
        <main class="auth-page {{ request()->routeIs('login') ? 'auth-page-artboard' : '' }} flex min-h-screen items-center px-4 py-6 sm:px-8 sm:py-10 lg:px-[5vw]">
            <div class="auth-card flex w-full max-w-[574px] flex-col justify-center rounded-[28px] bg-white-02 px-6 py-10 shadow-xl sm:px-12 sm:py-12 lg:px-[72px]">
                {{ $slot }}
            </div>
        </main>
    </body>
</html>