import { Head, Link } from '@inertiajs/react';
import { ExternalLink, ImageOff, Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { ListFilters } from '@/components/admin/list-filters';
import { EmptyState } from '@/components/public/empty-state';
import { PaginationNav } from '@/components/public/pagination-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import posts from '@/routes/admin/posts';
import { show } from '@/routes/posts';
import type { Paginated } from '@/types';

type AdminPost = {
    id: number;
    title: string;
    slug: string;
    type: string;
    type_label: string;
    status: 'published' | 'scheduled' | 'draft';
    published_at: string | null;
    updated_at: string | null;
    author: string | null;
    thumbnail: string | null;
};

type Props = {
    posts: Paginated<AdminPost>;
    filters: { q: string; type: string; status: string };
    types: { value: string; label: string }[];
};

const statusStyles: Record<AdminPost['status'], string> = {
    published: 'bg-green-600 text-white hover:bg-green-600',
    scheduled: 'bg-amber-500 text-white hover:bg-amber-500',
    draft: '',
};

export default function PostsIndex({ posts: list, filters, types }: Props) {
    return (
        <>
            <Head title="Posts" />
            <AdminPage
                title="Posts"
                description="Announcements, career opportunities, and awards."
                actions={
                    <Button asChild>
                        <Link href={posts.create()}>
                            <Plus className="size-4" />
                            New post
                        </Link>
                    </Button>
                }
            >
                <ListFilters
                    url={posts.index.url()}
                    search={filters.q}
                    selects={[
                        {
                            name: 'type',
                            label: 'types',
                            value: filters.type,
                            options: types,
                        },
                        {
                            name: 'status',
                            label: 'statuses',
                            value: filters.status,
                            options: [
                                { value: 'published', label: 'Published' },
                                { value: 'scheduled', label: 'Scheduled' },
                                { value: 'draft', label: 'Draft' },
                            ],
                        },
                    ]}
                />

                {list.data.length === 0 ? (
                    <EmptyState title="No posts found" />
                ) : (
                    <ul className="divide-y rounded-xl border bg-card shadow-xs">
                        {list.data.map((post) => (
                            <li
                                key={post.id}
                                className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
                            >
                                <div className="hidden size-14 shrink-0 overflow-hidden rounded-md bg-muted sm:block">
                                    {post.thumbnail ? (
                                        <img
                                            src={post.thumbnail}
                                            alt=""
                                            loading="lazy"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <ImageOff className="m-auto mt-4 size-5 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <Link
                                        href={posts.edit(post.id)}
                                        className="line-clamp-2 font-medium hover:text-primary hover:underline"
                                    >
                                        {post.title}
                                    </Link>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline">
                                            {post.type_label}
                                        </Badge>
                                        <Badge
                                            variant="secondary"
                                            className={
                                                statusStyles[post.status]
                                            }
                                        >
                                            {post.status}
                                        </Badge>
                                        {post.published_at && (
                                            <span>
                                                {formatDateTime(
                                                    post.published_at,
                                                )}
                                            </span>
                                        )}
                                        {post.author && (
                                            <span>by {post.author}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center">
                                    {post.status === 'published' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            asChild
                                        >
                                            <a
                                                href={show.url(post.slug)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label="View on site"
                                            >
                                                <ExternalLink className="size-4" />
                                            </a>
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link
                                            href={posts.edit(post.id)}
                                            aria-label="Edit"
                                        >
                                            <Pencil className="size-4" />
                                        </Link>
                                    </Button>
                                    <ConfirmDelete
                                        form={posts.destroy.form(post.id)}
                                        title={`Delete “${post.title}”?`}
                                        description="The post and all its images and video will be permanently deleted."
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                <PaginationNav paginator={list} />
            </AdminPage>
        </>
    );
}

PostsIndex.layout = {
    breadcrumbs: [{ title: 'Posts', href: posts.index() }],
};
