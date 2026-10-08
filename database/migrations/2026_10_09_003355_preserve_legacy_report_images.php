<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('reports', 'image')) {
            return;
        }

        $column = collect(Schema::getColumns('reports'))->firstWhere('name', 'image');
        if (! $column['nullable']) {
            $this->changeImageColumn(true);
        }

        DB::table('reports')->whereNotNull('image')->where('image', '!=', '')
            ->chunkById(100, function ($reports) {
                foreach ($reports as $report) {
                    if (! DB::table('report_images')->where('report_id', $report->id)->where('image', $report->image)->exists()) {
                        DB::table('report_images')->insert([
                            'report_id' => $report->id,
                            'image' => $report->image,
                            'created_at' => $report->created_at,
                            'updated_at' => $report->updated_at,
                        ]);
                    }
                }
            });

    }

    public function down(): void
    {
        if (! Schema::hasColumn('reports', 'image')) {
            return;
        }

        DB::table('reports')->whereNull('image')->chunkById(100, function ($reports) {
            foreach ($reports as $report) {
                $image = DB::table('report_images')->where('report_id', $report->id)->orderBy('id')->value('image');
                DB::table('reports')->where('id', $report->id)->update(['image' => $image ?? '']);
            }
        });

        $this->changeImageColumn(false);
    }

    private function changeImageColumn(bool $nullable): void
    {
        // SQLite rebuilds this table; retain related photos if its cascade fires.
        $photos = DB::table('report_images')->get()->map(fn ($photo) => (array) $photo)->all();
        Schema::withoutForeignKeyConstraints(function () use ($nullable) {
            Schema::table('reports', function (Blueprint $table) use ($nullable) {
                $table->string('image')->nullable($nullable)->change();
            });
        });
        foreach (array_chunk($photos, 100) as $chunk) {
            DB::table('report_images')->insertOrIgnore($chunk);
        }
    }
};
