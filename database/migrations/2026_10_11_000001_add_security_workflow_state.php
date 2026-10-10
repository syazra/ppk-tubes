<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rooms', function (Blueprint $table): void {
            $table->boolean('is_admin_disabled')->default(false);
        });
        // Existing inactive rooms without a repair are administratively disabled.
        DB::table('rooms')->where('is_avail', false)->whereNotIn('id',
            DB::table('reports')->select('room_id')->where('status', 'diproses')
        )->update(['is_admin_disabled' => true]);
        DB::table('rooms')->whereIn('id',
            DB::table('reports')->select('room_id')->where('status', 'diproses')
        )->update(['is_avail' => false]);
        foreach (['reservations', 'reports'] as $name) {
            Schema::table($name, function (Blueprint $table): void {
                $table->unsignedBigInteger('attachment_bytes')->default(0);
            });
        }
    }

    public function down(): void
    {
        Schema::table('rooms', fn (Blueprint $table) => $table->dropColumn('is_admin_disabled'));
        foreach (['reservations', 'reports'] as $name) {
            Schema::table($name, fn (Blueprint $table) => $table->dropColumn('attachment_bytes'));
        }
    }
};
