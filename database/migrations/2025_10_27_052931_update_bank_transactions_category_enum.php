<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            DB::statement("ALTER TABLE bank_transactions MODIFY COLUMN category ENUM('opening', 'sale', 'purchase', 'expense', 'fixed_asset', 'vendor_payment', 'customer_payment', 'adjustment', 'other')");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bank_transactions', function (Blueprint $table) {
            DB::statement("ALTER TABLE bank_transactions MODIFY COLUMN category ENUM('opening', 'sale', 'purchase', 'expense', 'fixed_asset', 'adjustment', 'other')");
        });
    }
};
