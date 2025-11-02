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
        Schema::create('stock_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['opening', 'purchase', 'sale', 'adjustment']); // Type of stock movement
            $table->decimal('quantity', 10, 2); // Can be negative for outgoing
            $table->decimal('purchase_price', 10, 2)->nullable(); // For purchases and opening stock
            $table->decimal('sale_price', 10, 2)->nullable(); // For sales
            $table->date('entry_date');
            $table->foreignId('reference_id')->nullable(); // Link to purchase_id, sale_id, etc.
            $table->string('reference_type')->nullable(); // purchase, sale, adjustment
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'product_id']);
            $table->index(['tenant_id', 'entry_date']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_entries');
    }
};
