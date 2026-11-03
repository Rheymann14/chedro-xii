<?php

namespace App\Enums;

enum IssuanceVisibility: string
{
    case Public = 'public';
    case Internal = 'internal';

    public function label(): string
    {
        return match ($this) {
            self::Public => 'Public',
            self::Internal => 'Internal (staff only)',
        };
    }
}
