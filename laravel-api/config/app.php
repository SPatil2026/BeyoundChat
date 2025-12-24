<?php

return [
    'name' => env('APP_NAME', 'BeyondChats API'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => 'en',
    'key' => env('APP_KEY'),
    'cipher' => 'AES-256-CBC',
    'providers' => [
        Illuminate\Database\DatabaseServiceProvider::class,
        Illuminate\Filesystem\FilesystemServiceProvider::class,
        Illuminate\Foundation\Providers\FoundationServiceProvider::class,
        Illuminate\Routing\RoutingServiceProvider::class,
        Illuminate\Validation\ValidationServiceProvider::class,
        App\Providers\AppServiceProvider::class,
    ],
];