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
        Schema::table('purchases', function (Blueprint $table) {
            DB::statement("ALTER TABLE purchases MODIFY COLUMN status ENUM('pending', 'partial', 'completed', 'returned') DEFAULT 'completed'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            DB::statement("ALTER TABLE purchases MODIFY COLUMN status ENUM('pending', 'completed', 'returned') DEFAULT 'completed'");
        });
    }
};
