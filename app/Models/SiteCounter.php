<?php

namespace App\Models;

use Database\Factories\SiteCounterFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * Named running totals, such as the public visitor count.
 *
 * @property int $id
 * @property string $key
 * @property int $value
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['key', 'value'])]
class SiteCounter extends Model
{
    /** @use HasFactory<SiteCounterFactory> */
    use HasFactory;

    public const VISITORS = 'visitors';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'value' => 'integer',
        ];
    }

    /**
     * Atomically add one to the named counter, creating it on first use.
     */
    public static function bump(string $key): void
    {
        $updated = static::query()->where('key', $key)->increment('value');

        if ($updated === 0) {
            static::query()->firstOrCreate(['key' => $key], ['value' => 0])->increment('value');
        }
    }
}
