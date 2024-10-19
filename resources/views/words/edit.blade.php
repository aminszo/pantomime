@extends('layout.words-layout')

@section('content')
    <h1>Edit Word</h1>

    @if ($errors->any())
        <div>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('words.update', $word->id) }}" method="POST">
        @csrf
        @method('PUT')
        @include('words._form', ['buttonText' => 'Update'])
    </form>
@endsection
