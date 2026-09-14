<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();

            $table->string('name', 100);

            $table->string('location', 100);
            
            $table->text('desc')->nullable();

            $table->enum('type', [
                'classroom',
                'hall',
                'laboratory',
                'court'
            ]);

            $table->integer('capacity');

            $table->boolean('is_avail')
                  ->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};