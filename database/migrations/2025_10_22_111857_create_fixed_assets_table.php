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
        Schema::create('fixed_assets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->date('purchase_date');
            $table->decimal('cost', 12, 2); // Original purchase cost
            $table->decimal('depreciation_rate', 5, 2)->default(0); // Annual depreciation %
            $table->decimal('accumulated_depreciation', 12, 2)->default(0);
            $table->decimal('current_value', 12, 2); // cost - accumulated_depreciation
            $table->enum('status', ['active', 'disposed', 'sold'])->default('active');
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fixed_assets');
    }
};
