<?php

namespace App\Models;

use App\Support\Media;
use Database\Factories\DownloadFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $download_category_id
 * @property string $title
 * @property string|null $description
 * @property string $file_path
 * @property string $file_name
 * @property int $file_size
 * @property string|null $mime_type
 * @property int $sort_order
 * @property int|null $author_id
 */
#[Fillable(['download_category_id', 'title', 'description', 'sort_order'])]
class Download extends Model
{
    /** @use HasFactory<DownloadFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        static::deleted(fn (Download $download) => Media::delete($download->file_path));
    }

    /**
     * @return BelongsTo<DownloadCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(DownloadCategory::class, 'download_category_id');
    }

    public function fileExtension(): string
    {
        return strtolower(pathinfo($this->file_name, PATHINFO_EXTENSION));
    }
}
