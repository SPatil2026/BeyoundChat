<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ArticleController;

Route::middleware('api')->group(function () {
    Route::get('/articles', [ArticleController::class, 'index']);
    Route::get('/articles/latest', [ArticleController::class, 'getLatest']);
    Route::get('/articles/{id}', [ArticleController::class, 'show']);
    Route::post('/articles', [ArticleController::class, 'store']);
    Route::put('/articles/{id}', [ArticleController::class, 'update']);
    Route::delete('/articles/{id}', [ArticleController::class, 'destroy']);
    Route::post('/scrape', [ArticleController::class, 'scrapeAndStore']);
});