<?php

namespace App\Http\Controllers;

use App\Models\Words;
use Illuminate\Http\Request;

class WordController extends Controller
{

    /**
     * Display a listing of the words.
     */
    public function index()
    {
        // Retrieve all words from the database
        $words = Words::all();

        // Return the view with the list of words
        return view('words.index', compact('words'));
    }


    /**
     * Show the form for creating a new word.
     */
    public function create()
    {
        // Return the view with the form to create a new word
        return view('words.create');
    }


    /**
     * Store a newly created word in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'word' => 'required|string',
            'category' => 'required|string',
            'score' => 'required|integer',
            'type' => 'required|string|in:word,proverb',
        ]);

        // Create a new word in the database
        Words::create($request->all());

        // Redirect to the list of words with a success message
        return redirect()->route('words.index')->with('success', 'Word created successfully.');
    }


    /**
     * Display the specified word.
     */
    public function show(Words $word)
    {
        // Return the view with the details of the specified word
        return view('words.show', compact('word'));
    }


    /**
     * Show the form for editing the specified word.
     */
    public function edit(Words $word)
    {
        // Return the view with the form to edit the specified word
        return view('words.edit', compact('word'));
    }


    /**
     * Update the specified word in storage.
     */
    public function update(Request $request, Words $word)
    {
        // Validate the request data
        $request->validate([
            'word' => 'required|string',
            'category' => 'required|string',
            'score' => 'required|integer',
            'type' => 'required|string|in:word,proverb',
        ]);

        // Update the word in the database
        $word->update($request->all());

        // Redirect to the list of words with a success message
        return redirect()->route('words.index')->with('success', 'Word updated successfully.');
    }


    /**
     * Remove the specified word from storage.
     */
    public function destroy(Words $word)
    {
        // Delete the word from the database
        $word->delete();

        // Redirect to the list of words with a success message
        return redirect()->route('words.index')->with('success', 'Word deleted successfully.');
    }
}
