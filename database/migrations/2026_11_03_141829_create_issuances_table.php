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
        Schema::create('issuances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('issuance_type_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->string('reference_no')->nullable();
            $table->date('issued_on');
            $table->string('file_path');
            $table->string('file_name');
            $table->string('visibility', 20)->default('public');
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['visibility', 'issued_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issuances');
    }
};
