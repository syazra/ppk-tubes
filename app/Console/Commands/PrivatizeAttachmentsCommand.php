<?php

namespace App\Console\Commands;

use App\Services\PrivatizeAttachments;
use Illuminate\Console\Command;

class PrivatizeAttachmentsCommand extends Command
{
    protected $signature = 'attachments:privatize';

    protected $description = 'Copy existing attachments into private storage, verify contents, and remove public copies';

    public function handle(PrivatizeAttachments $migration): int
    {
        $this->info('Verified and privatized '.$migration->migrate().' attachment files.');

        return self::SUCCESS;
    }
}
