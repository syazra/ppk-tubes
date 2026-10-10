<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('room_id')
                ->constrained()
                ->cascadeOnDelete();


            // Jenis peminjaman
            $table->enum('reservation_type', ['Individu', 'Instansi'])
        ->default('Individu');

            //Informasi pengajuan
            $table->string('institution')->nullable();
            $table->string('activity_name');
            $table->string('proposal_path')->nullable();
            $table->unsignedInteger('participant_count')->nullable();
            $table->text('desc')->nullable();


            $table->date('date_to_reserv');


            $table->time('start_time');

            $table->time('end_time');


            $table->enum('status', [
                'menunggu',
                'disetujui',
                'ditolak',
                'dibatalkan'
            ])->default('menunggu');


            $table->timestamps();

        });
    }
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};