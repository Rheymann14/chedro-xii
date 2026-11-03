<?php

namespace App\Models;

use App\Enums\IssuanceVisibility;
use App\Support\Media;
use Database\Factories\IssuanceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * Regional memoranda, advisories, and other issuances. Files always live on
 * the private media disk and are served through an authorizing controller.
 *
 * @property int $id
 * @property int $issuance_type_id
 * @property string $title
 * @property string|null $reference_no
 * @property Carbon $issued_on
 * @property string $file_path
 * @property string $file_name
 * @property IssuanceVisibility $visibility
 * @property int|null $author_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['issuance_type_id', 'title', 'reference_no', 'issued_on', 'visibility'])]
class Issuance extends Model
{
    /** @use HasFactory<IssuanceFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::deleted(fn (Issuance $issuance) => Media::deletePrivately($issuance->file_path));
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'issued_on' => 'date',
            'visibility' => IssuanceVisibility::class,
        ];
    }

    /**
     * @return BelongsTo<IssuanceType, $this>
     */
    public function type(): BelongsTo
    {
        return $this->belongsTo(IssuanceType::class, 'issuance_type_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Issuances the given visitor may see: everything for staff, public
     * issuances only for guests.
     *
     * @param  Builder<Issuance>  $query
     */
    #[Scope]
    protected function visibleTo(Builder $query, ?User $user): void
    {
        if ($user === null) {
            $query->where('visibility', IssuanceVisibility::Public);
        }
    }

    public function isInternal(): bool
    {
        return $this->visibility === IssuanceVisibility::Internal;
    }

    public function fileExtension(): string
    {
        return strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));
    }
}
