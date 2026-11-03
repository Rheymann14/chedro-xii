<?php

namespace App\Support;

use App\Models\SiteSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Office profile and contact details editable by administrators.
 */
class SiteSettings
{
    public const CACHE_KEY = 'site.settings';

    /**
     * @return array{
     *     office_name: string,
     *     office_address: string,
     *     email: string,
     *     phone: string|null,
     *     facebook_url: string|null,
     *     map_url: string|null,
     *     director_name: string,
     *     director_position: string,
     *     office_hours: string,
     * }
     */
    public static function defaults(): array
    {
        return [
            'office_name' => 'Regional Office XII',
            'office_address' => 'Regional Center, Brgy. Carpenter Hill, Koronadal City, South Cotabato',
            'email' => 'chedro12@ched.gov.ph',
            'phone' => null,
            'facebook_url' => null,
            'map_url' => null,
            'director_name' => 'Rody P. Garcia, MDM, JD, EdD',
            'director_position' => 'Regional Director',
            'office_hours' => 'Monday to Friday, 8:00 AM – 5:00 PM',
        ];
    }

    /**
     * @return array{
     *     office_name: string,
     *     office_address: string,
     *     email: string,
     *     phone: string|null,
     *     facebook_url: string|null,
     *     map_url: string|null,
     *     director_name: string,
     *     director_position: string,
     *     office_hours: string,
     * }
     */
    public static function all(): array
    {
        $stored = Cache::rememberForever(self::CACHE_KEY, fn (): array => SiteSetting::query()
            ->pluck('value', 'key')
            ->all());

        $settings = static::defaults();

        foreach (array_keys($settings) as $key) {
            $value = $stored[$key] ?? null;

            if (is_string($value)) {
                $settings[$key] = $value;
            }
        }

        return $settings;
    }

    /**
     * @param  array<string, string|null>  $values
     */
    public static function update(array $values): void
    {
        foreach (array_intersect_key($values, static::defaults()) as $key => $value) {
            SiteSetting::query()->updateOrCreate(['key' => $key], ['value' => $value]);
        }

        static::flush();
    }

    public static function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
