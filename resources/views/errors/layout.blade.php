@php
    $appearance = $appearance ?? request()->cookie('appearance');
    $appearance = in_array($appearance, ['light', 'dark', 'system'], true) ? $appearance : 'light';
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => $appearance === 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="robots" content="noindex">

        <script>
            (function() {
                if ('{{ $appearance }}' === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
            })();
        </script>

        <title>@yield('title') - {{ config('app.name', 'Laravel') }}</title>

        <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/favicon-192.png" type="image/png" sizes="192x192">

        {{-- Skip the bundle when no build exists so a broken deploy still shows a readable page. --}}
        @if (is_file(public_path('hot')) || is_file(public_path('build/manifest.json')))
            @fonts
            @vite('resources/css/app.css')
        @endif
    </head>
    <body class="dot-spotlight flex min-h-svh items-center justify-center bg-surface p-6 font-sans text-foreground antialiased">
        <main class="w-full max-w-md space-y-6 text-center">
            <img src="/images/ched-seal-sm.webp" alt="Commission on Higher Education seal" width="224" height="224" class="mx-auto size-14">

            <div class="space-y-2">
                <p class="text-sm font-semibold text-primary">@yield('code')</p>
                <h1 class="text-2xl font-semibold tracking-tight">@yield('title')</h1>
                <p class="text-sm leading-6 text-muted-foreground">@yield('message')</p>
            </div>

            <div class="flex justify-center gap-3">
                @section('actions')
                    <a href="{{ url('/') }}" class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        Back to homepage
                    </a>
                @show
            </div>
        </main>
    </body>
</html>
