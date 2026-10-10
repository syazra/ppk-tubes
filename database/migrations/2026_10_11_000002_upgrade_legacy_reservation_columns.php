<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Earlier installations ran an older version of the creation migration.
        foreach (['reservation_type', 'institution', 'activity_name', 'proposal_path', 'participant_count'] as $column) {
            if (Schema::hasColumn('reservations', $column)) {
                continue;
            }
            Schema::table('reservations', function (Blueprint $table) use ($column): void {
                match ($column) {
                    'reservation_type' => $table->enum($column, ['Individu', 'Instansi'])->default('Individu'),
                    'activity_name' => $table->string($column)->default('Kegiatan sebelumnya'),
                    'participant_count' => $table->unsignedInteger($column)->nullable(),
                    default => $table->string($column)->nullable(),
                };
            });
        }
    }

    public function down(): void
    {
        // These may predate this migration; retain historical fields and data.
    }
};
