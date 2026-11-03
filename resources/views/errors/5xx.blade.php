@extends('errors.layout')

@section('code', $exception->getStatusCode())
@section('title', 'Service unavailable')
@section('message', 'We are having trouble completing your request right now. Please try again in a few minutes.')
