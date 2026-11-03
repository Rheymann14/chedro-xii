@extends('errors.layout')

@section('code', '419')
@section('title', 'Page expired')
@section('message', 'Your session has expired. Please reload the page and try again.')

@section('actions')
    <button type="button" onclick="window.location.reload()" class="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Reload page
    </button>
@endsection
