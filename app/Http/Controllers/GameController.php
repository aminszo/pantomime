<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class GameController extends Controller
{
    public function index()
    {
        return view("game.main");
    }

    /**
     * Get a random word based on genre and score.
     */
    public function getRandomWord($genre, $score = 1, Request $request)
    {

        $category = Category::where('en_name', $genre)->first();

        // Retrieve a random word based on the specified genre and score
        $word = $category->words()->where('score', $score)
            ->whereNotIn('id', $request->session()->get('data') ?? [])->inRandomOrder()->first();
        $word->type = $category->type;

        // Return the word as a JSON response
        return response()->json($word);
    }

    public function getWordsBunchNew()
    {
        $bag = [];
        $scores = [3 => 5, 2 => 3, 1 => 2];

        $category = Category::where('type', 'word')->whereNotIn('en_name', ['job', 'test'])->get();

        foreach ($category as $cat) {
            foreach ($scores as $score => $take) {
                $words = $cat->words()->where('score', $score)->inRandomOrder()->take($take)->get();
                foreach ($words as $word) {
                    $word->genre = $cat->en_name;
                    $word->genre_fa = $cat->fa_name;
                    array_push($bag, $word);
                }
            }
        }

        shuffle($bag);
        return response()->json($bag);
    }

    public function saveUsedWords(Request $request)
    {

        // dd("hi");
        $data = $request->data;


        $request->session()->push('data', $data);

        // $request->session()->push('data', $request->data);
        // session(["do" => $data]);
    }
}
