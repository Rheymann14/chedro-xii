<?php

namespace App\Enums;

enum PostType: string
{
    case Announcement = 'announcement';
    case Career = 'career';
    case Award = 'award';

    public function label(): string
    {
        return match ($this) {
            self::Announcement => 'Announcement',
            self::Career => 'Career Opportunity',
            self::Award => 'Awards & Commendations',
        };
    }

    public function pluralLabel(): string
    {
        return match ($this) {
            self::Announcement => 'Announcements',
            self::Career => 'Career Opportunities',
            self::Award => 'Awards & Commendations',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Announcement => 'News, advisories, and postings from CHED Regional Office XII.',
            self::Career => 'Job vacancies and career opportunities at CHED Regional Office XII.',
            self::Award => 'Recognitions and commendations received by the office and its higher education institutions.',
        };
    }

    /**
     * The named route of the type's public listing page.
     */
    public function routeName(): string
    {
        return match ($this) {
            self::Announcement => 'announcements.index',
            self::Career => 'careers.index',
            self::Award => 'awards.index',
        };
    }
}
