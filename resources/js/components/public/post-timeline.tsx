import { Link } from '@inertiajs/react';
import { Clock, Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate, isClosed } from '@/lib/format';
import { show } from '@/routes/posts';
import type { PostSummary } from '@/types';

const monthFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    month: 'short',
});

const dayFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    day: 'numeric',
});

/**
 * Vertical timeline of posts: a date marker on the rail, followed by a card
 * with the post's thumbnail, type, title, and summary.
 */
export function PostTimeline({ posts }: { posts: PostSummary[] }) {
    return (
        <ol className="relative space-y-6 border-l-2 border-border pl-6 sm:ml-20 sm:pl-10">
            {posts.map((post) => {
                const date = post.published_at
                    ? new Date(post.published_at)
                    : null;

                return (
                    <li key={post.id} className="relative">
                        <span
                            className="absolute top-5 -left-[1.95rem] size-3.5 rounded-full border-2 border-background bg-flag-red ring-2 ring-border sm:-left-[2.95rem]"
                            aria-hidden
                        />
                        {date && (
                            <time
                                dateTime={post.published_at ?? undefined}
                                className="absolute top-2 -left-[6.5rem] hidden w-14 flex-col items-center rounded-md border bg-card py-1 text-center leading-none shadow-xs sm:flex"
                            >
                                <span className="text-[0.65rem] font-semibold text-flag-red uppercase">
                                    {monthFormatter.format(date)}
                                </span>
                                <span className="text-xl font-bold text-foreground">
                                    {dayFormatter.format(date)}
                                </span>
                            </time>
                        )}

                        <article className="group relative flex gap-4 rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-md sm:p-4">
                            <div className="aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-accent sm:aspect-4/3 sm:w-40">
                                {post.cover ? (
                                    <img
                                        src={post.cover.url}
                                        alt={post.cover.alt ?? ''}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="grid size-full place-items-center">
                                        <Newspaper
                                            className="size-7 text-primary/40"
                                            aria-hidden
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Badge
                                        variant="secondary"
                                        className="font-semibold"
                                    >
                                        {post.type_label}
                                    </Badge>
                                    <span className="sm:hidden">
                                        {formatDate(post.published_at)}
                                    </span>
                                    {post.type === 'career' &&
                                        post.closing_at && (
                                            <span className="inline-flex items-center gap-1">
                                                <Clock
                                                    className="size-3.5"
                                                    aria-hidden
                                                />
                                                {isClosed(post.closing_at)
                                                    ? 'Closed'
                                                    : `Until ${formatDate(post.closing_at)}`}
                                            </span>
                                        )}
                                </div>
                                <h3 className="line-clamp-2 leading-snug font-semibold text-foreground group-hover:text-primary sm:text-lg">
                                    <Link
                                        href={show(post.slug)}
                                        prefetch
                                        className="after:absolute after:inset-0"
                                    >
                                        {post.title}
                                    </Link>
                                </h3>
                                {post.excerpt && (
                                    <p className="hidden text-sm text-muted-foreground sm:line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                )}
                            </div>
                        </article>
                    </li>
                );
            })}
        </ol>
    );
}
