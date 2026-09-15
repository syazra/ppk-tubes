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
        Schema::create('reports', function (Blueprint $table) {
            $table->id(); // Kolom id (Primary Key)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // Relasi ke tabel users
            $table->foreignId('room_id')->constrained('rooms')->cascadeOnDelete(); // Relasi ke tabel rooms
            $table->text('desc'); // Deskripsi kerusakan fasilitas
            $table->string('image')->nullable(); // Foto bukti kerusakan (opsional/boleh kosong)
            $table->timestamps(); // Kolom created_at dan updated_at otomatis
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};