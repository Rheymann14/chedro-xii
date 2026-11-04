<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property UserRole $role
 * @property bool $is_active
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property bool $has_temporary_password
 * @property Carbon|null $password_changed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'role' => 'editor',
        'is_active' => true,
        'has_temporary_password' => false,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'is_active' => 'boolean',
            'has_temporary_password' => 'boolean',
            'password_changed_at' => 'datetime',
        ];
    }

    /**
     * Set a password chosen by an administrator, which the user should replace.
     */
    public function setTemporaryPassword(string $password): void
    {
        $this->forceFill([
            'password' => $password,
            'has_temporary_password' => true,
        ])->save();
    }

    /**
     * Set a password the user chose themselves.
     */
    public function setOwnPassword(string $password): void
    {
        $this->forceFill([
            'password' => $password,
            'has_temporary_password' => false,
            'password_changed_at' => now(),
        ])->save();
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Whether this user is the only remaining active administrator.
     */
    public function isLastActiveAdmin(): bool
    {
        return $this->isAdmin()
            && $this->is_active
            && static::query()->activeAdmins()->whereKeyNot($this->getKey())->doesntExist();
    }

    /**
     * Whether this user is still signed in on another device (database session driver only).
     */
    public function hasActiveSession(): bool
    {
        if (config('session.driver') !== 'database') {
            return false;
        }

        return DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->where('user_id', $this->getKey())
            ->where('last_activity', '>=', now()->subMinutes((int) config('session.lifetime'))->getTimestamp())
            ->exists();
    }

    /**
     * Sign this user out of every device (database session driver only).
     */
    public function endSessions(): void
    {
        if (config('session.driver') !== 'database') {
            return;
        }

        DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->where('user_id', $this->getKey())
            ->delete();
    }

    /**
     * @param  Builder<User>  $query
     */
    #[Scope]
    protected function activeAdmins(Builder $query): void
    {
        $query->where('role', UserRole::Admin)->where('is_active', true);
    }
}
