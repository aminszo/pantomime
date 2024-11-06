<?php

use App\Models\Category;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GameController;
use App\Http\Controllers\WordController;
use Illuminate\Http\Request;

// Route for the home page
Route::get('/', [GameController::class, "index"]);

// Resource routes for CRUD operations on words
Route::resource('words', WordController::class);

// Route to get a random word based on genre and score
Route::get('/word/random/{genre}/{score}', [GameController::class, 'getRandomWord']);

// Route for saving used words to current session
Route::post('/save-data', [GameController::class, 'saveUsedWords']);

// Route for retrieving a word-bag (for rush mode)
Route::get('/words-bag', [GameController::class, 'getWordsBunchNew']);
