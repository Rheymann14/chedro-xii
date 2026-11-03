<?php

namespace App\Enums;

enum MenuLocation: string
{
    case Header = 'header';
    case QuickLinks = 'quick-links';
    case Footer = 'footer';

    public function label(): string
    {
        return match ($this) {
            self::Header => 'Main navigation',
            self::QuickLinks => 'Quick links',
            self::Footer => 'Footer links',
        };
    }
}
