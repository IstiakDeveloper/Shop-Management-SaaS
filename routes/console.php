<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule automatic stock entry date synchronization
Schedule::command('stock:fix-dates')
    ->daily()
    ->at('01:00')
    ->onSuccess(function () {
        info('Stock entry dates synchronized successfully');
    })
    ->onFailure(function () {
        logger()->error('Failed to synchronize stock entry dates');
    });
