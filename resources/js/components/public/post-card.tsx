import { Link } from '@inertiajs/react';
import { CalendarDays, Clock, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, isClosed } from '@/lib/format';
import { cn } from '@/lib/utils';
import { show } from '@/routes/posts';
import type { PostSummary } from '@/types';

/**
 * Card for a post in grids and lists. The `horizontal` variant suits narrow
 * columns such as the home page news feed.
 */
export function PostCard({
    post,
    variant = 'vertical',
    priority = false,
}: {
    post: PostSummary;
    variant?: 'vertical' | 'horizontal';
    priority?: boolean;
}) {
    const horizontal = variant === 'horizontal';

    return (
        <article
            className={cn(
                'group relative flex overflow-hidden rounded-lg border bg-card shadow-xs transition-shadow hover:shadow-md',
                horizontal ? 'flex-row' : 'flex-col',
            )}
        >
            <div
                className={cn(
                    'relative shrink-0 overflow-hidden bg-muted',
                    horizontal
                        ? 'aspect-square w-28 sm:aspect-4/3 sm:w-48'
                        : 'aspect-video w-full',
                )}
            >
                {post.cover ? (
                    <img
                        src={post.cover.thumbnail_url}
                        alt={post.cover.alt ?? ''}
                        width={post.cover.width ?? undefined}
                        height={post.cover.height ?? undefined}
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="grid size-full place-items-center bg-accent">
                        <Newspaper
                            className="size-8 text-brand/40 dark:text-primary/40"
                            aria-hidden
                        />
                    </div>
                )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {post.published_at && (
                        <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5" aria-hidden />
                            <time dateTime={post.published_at}>
                                {formatDate(post.published_at)}
                            </time>
                        </span>
                    )}
                    {post.type === 'career' && post.closing_at && (
                        <Badge
                            variant={
                                isClosed(post.closing_at)
                                    ? 'secondary'
                                    : 'default'
                            }
                            className="gap-1"
                        >
                            <Clock className="size-3" aria-hidden />
                            {isClosed(post.closing_at)
                                ? 'Closed'
                                : `Until ${formatDate(post.closing_at)}`}
                        </Badge>
                    )}
                </div>

                <h3
                    className={cn(
                        'leading-snug font-semibold text-foreground group-hover:text-primary',
                        horizontal
                            ? 'line-clamp-3 text-sm sm:text-base'
                            : 'line-clamp-2 text-lg',
                    )}
                >
                    <Link
                        href={show(post.slug)}
                        prefetch
                        className="after:absolute after:inset-0"
                    >
                        {post.title}
                    </Link>
                </h3>

                {post.position && (
                    <p className="text-sm font-medium text-brand dark:text-primary">
                        {post.position}
                    </p>
                )}

                {post.excerpt && (
                    <p
                        className={cn(
                            'text-sm text-muted-foreground',
                            horizontal
                                ? 'hidden sm:line-clamp-2'
                                : 'line-clamp-3',
                        )}
                    >
                        {post.excerpt}
                    </p>
                )}
            </div>
        </article>
    );
}

export function PostCardSkeleton({
    variant = 'vertical',
}: {
    variant?: 'vertical' | 'horizontal';
}) {
    const horizontal = variant === 'horizontal';

    return (
        <div
            className={cn(
                'flex animate-pulse overflow-hidden rounded-lg border',
                horizontal ? 'flex-row' : 'flex-col',
            )}
        >
            <div
                className={cn(
                    'bg-muted',
                    horizontal ? 'aspect-square w-28 sm:w-48' : 'aspect-video',
                )}
            />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-2/3 rounded bg-muted" />
            </div>
        </div>
    );
}
