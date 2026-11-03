<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Sanitizes rich-text HTML produced by the admin editor before it is stored.
 */
class RichText
{
    public static function sanitize(?string $html): ?string
    {
        if ($html === null || trim(strip_tags($html, '<img>')) === '') {
            return null;
        }

        return self::sanitizer()->sanitize($html);
    }

    /**
     * Plain-text excerpt of the given HTML, used when no excerpt is provided.
     */
    public static function excerpt(?string $html, int $limit = 220): ?string
    {
        if ($html === null) {
            return null;
        }

        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags(str_replace('<', ' <', $html)))));

        return $text === '' ? null : str($text)->limit($limit)->toString();
    }

    private static function sanitizer(): HtmlSanitizer
    {
        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->blockElement('div')
            ->blockElement('span')
            ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['http', 'https'])
            ->allowRelativeMedias()
            ->allowAttribute('target', ['a'])
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->dropAttribute('style', '*')
            ->dropAttribute('class', '*')
            ->withMaxInputLength(500_000);

        return new HtmlSanitizer($config);
    }
}
