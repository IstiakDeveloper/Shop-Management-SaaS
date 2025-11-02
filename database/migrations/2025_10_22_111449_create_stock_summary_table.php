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
        Schema::create('stock_summary', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('total_qty', 12, 2)->default(0); // Current stock
            $table->decimal('avg_purchase_price', 10, 2)->default(0); // Weighted average price
            $table->decimal('total_value', 12, 2)->default(0); // total_qty * avg_purchase_price
            $table->timestamp('last_updated_at')->useCurrent();
            $table->timestamps();

            $table->unique(['tenant_id', 'product_id']);
            $table->index(['tenant_id', 'total_qty']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_summary');
    }
};
