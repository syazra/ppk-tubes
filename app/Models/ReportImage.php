<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportImage extends Model
{
    protected $appends = ['url'];

    public function getUrlAttribute(): string
    {
        return route('reports.images.show', $this->id);
    }

    protected $fillable = [
        'report_id',
        'image',
    ];

    /** @return BelongsTo<Report, $this> */
    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }
}
