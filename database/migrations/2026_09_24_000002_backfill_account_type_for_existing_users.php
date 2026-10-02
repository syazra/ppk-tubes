<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->whereNull('account_type')->where('role', 'admin')
            ->update(['account_type' => 'admin']);

        DB::table('users')->whereNull('account_type')->where('role', 'operator')
            ->update(['account_type' => 'petugas']);

        DB::table('users')->whereNull('account_type')->where('role', 'user')
            ->where('email', 'like', '%@students.kampus.ac.id')
            ->update(['account_type' => 'mahasiswa']);

        DB::table('users')->whereNull('account_type')->where('role', 'user')
            ->where('email', 'like', '%@lecturer.kampus.ac.id')
            ->update(['account_type' => 'dosen']);

        DB::table('users')->whereNull('account_type')->where('role', 'user')
            ->where('email', 'like', '%@staff.kampus.ac.id')
            ->update(['account_type' => 'staf']);
    }

    public function down(): void
    {
        // Account types may have been edited since the backfill, so keep their current values.
    }
};
