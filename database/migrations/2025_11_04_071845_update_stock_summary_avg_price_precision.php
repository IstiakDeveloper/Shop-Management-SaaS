<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stock_summary', function (Blueprint $table) {
            // Increase precision for avg_purchase_price from decimal(10,2) to decimal(10,6)
            // This allows for more accurate weighted average calculations
            $table->decimal('avg_purchase_price', 10, 6)->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_summary', function (Blueprint $table) {
            // Revert back to decimal(10,2)
            $table->decimal('avg_purchase_price', 10, 2)->default(0)->change();
        });
    }
};
