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
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            // Change the enum to include 'trial' status
            $table->enum('status', ['active', 'trial', 'cancelled', 'expired', 'suspended'])->default('active')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenant_subscriptions', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('status', ['active', 'cancelled', 'expired', 'suspended'])->default('active')->change();
        });
    }
};
