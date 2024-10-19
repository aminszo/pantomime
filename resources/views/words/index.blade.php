@extends('layout.words-layout')

@section('content')
    <h1>Words List</h1>
    <a href="{{ route('words.create') }}">Create New Word</a>

    @if (session('success'))
        <div>{{ session('success') }}</div>
    @endif

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Word</th>
                <th>Category</th>
                <th>Score</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($words as $word)
                <tr>
                    <td>{{ $word->id }}</td>
                    <td>{{ $word->word }}</td>
                    <td>{{ $word->category }}</td>
                    <td>{{ $word->score }}</td>
                    <td>
                        <a href="{{ route('words.edit', $word->id) }}">Edit</a>
                        <form action="{{ route('words.destroy', $word->id) }}" method="POST" style="display:inline;">
                            @csrf
                            @method('DELETE')
                            <button type="submit">Delete</button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
@endsection
