<div>
    <label>Word</label>
    <input type="text" name="word" value="{{ old('word', $word->word ?? '') }}">
</div>
<div>
    <label>Category</label>
    <input type="text" name="category" value="{{ old('category', $word->category ?? '') }}">
</div>
<div>
    <label>Score</label>
    <input type="number" name="score" value="{{ old('score', $word->score ?? '') }}">
</div>
<div>
    <label>type</label>
    <input type="text" name="type" value="{{ old('score', $word->type ?? '') }}">
</div>
<div>
    <button type="submit">{{ $buttonText }}</button>
</div>
