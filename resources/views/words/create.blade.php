@extends('layout.words-layout')

@section('content')
    <h1>Create Word</h1>

    @if ($errors->any())
        <div>
            <ul>
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('words.store') }}" method="POST">
        @csrf
        @include('words._form', ['buttonText' => 'Create'])
    </form>
@endsection
