<?php

use App\Services\RepairWorkflow;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => app(RepairWorkflow::class)->extendOverdue())->everyMinute()->name('extend-overdue-repairs')->withoutOverlapping();
Schedule::command('attachments:prune --days=30')->daily()->withoutOverlapping();
