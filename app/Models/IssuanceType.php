<?php

namespace App\Models;

use Database\Factories\IssuanceTypeFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $sort_order
 */
#[Fillable(['name', 'sort_order'])]
class IssuanceType extends Model
{
    /** @use HasFactory<IssuanceTypeFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::saving(function (IssuanceType $type): void {
            $type->slug = Str::slug($type->name);
        });
    }

    /**
     * @return HasMany<Issuance, $this>
     */
    public function issuances(): HasMany
    {
        return $this->hasMany(Issuance::class);
    }
}
