@extends('errors.layout')

@section('code', $exception->getStatusCode())
@section('title', 'Request could not be completed')
@section('message', 'Something about this request was not quite right. Please check the address or go back and try again.')
