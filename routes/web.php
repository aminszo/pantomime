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

// Route to get a random word based on genre and score
Route::post('/save-data', [GameController::class, 'saveUsedWords']);


Route::get('/delete', function (Request $request) {
    $request->session()->flush();
});

Route::get('/read', function (Request $request) {
    dump($request->session()->all());
    dd($request->session()->get('data'));
});

Route::get('/push', function (Request $request) {
    $request->session()->push('data', 'developers');
});


Route::get('/words-bag', [GameController::class, 'getWordsBunchNew']);
