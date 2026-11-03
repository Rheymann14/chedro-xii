<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database. Create the first administrator with
     * `php artisan make:account`.
     */
    public function run(): void
    {
        $this->call([
            MenuSeeder::class,
            PageSeeder::class,
            TaxonomySeeder::class,
        ]);
    }
}
