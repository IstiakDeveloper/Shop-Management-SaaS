<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\Product;
use App\Policies\ProductPolicy;
use App\Models\Sale;
use App\Policies\SalePolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register policies explicitly
        Gate::policy(Product::class, ProductPolicy::class);
        Gate::policy(Sale::class, SalePolicy::class);
    }
}
