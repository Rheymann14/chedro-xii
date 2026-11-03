<?php

namespace App\Support;

class SearchTerm
{
    /**
     * Build a "contains" LIKE pattern, escaping LIKE wildcards in the term.
     */
    public static function contains(string $term): string
    {
        return '%'.str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], trim($term)).'%';
    }
}
