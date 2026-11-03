import { Head, Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    CalendarClock,
    FilePen,
    FileText,
    FolderOpen,
    Images,
    Newspaper,
    Plus,
} from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import { dashboard } from '@/routes/admin';
import banners from '@/routes/admin/banners';
import downloads from '@/routes/admin/downloads';
import issuances from '@/routes/admin/issuances';
import posts from '@/routes/admin/posts';

type Props = {
    stats: {
        published_posts: number;
        scheduled_posts: number;
        draft_posts: number;
        issuances: number;
        downloads: number;
        active_banners: number;
    };
    recentPosts: {
        id: number;
        title: string;
        type_label: string;
        is_published: boolean;
        updated_at: string | null;
    }[];
};

export default function Dashboard({ stats, recentPosts }: Props) {
    const tiles: {
        label: string;
        value: number;
        icon: LucideIcon;
        href: string;
    }[] = [
        {
            label: 'Published posts',
            value: stats.published_posts,
            icon: Newspaper,
            href: posts.index.url({ query: { status: 'published' } }),
        },
        {
            label: 'Scheduled posts',
            value: stats.scheduled_posts,
            icon: CalendarClock,
            href: posts.index.url({ query: { status: 'scheduled' } }),
        },
        {
            label: 'Drafts',
            value: stats.draft_posts,
            icon: FilePen,
            href: posts.index.url({ query: { status: 'draft' } }),
        },
        {
            label: 'Memoranda',
            value: stats.issuances,
            icon: FileText,
            href: issuances.index.url(),
        },
        {
            label: 'Downloadable files',
            value: stats.downloads,
            icon: FolderOpen,
            href: downloads.index.url(),
        },
        {
            label: 'Active banners',
            value: stats.active_banners,
            icon: Images,
            href: banners.index.url(),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <AdminPage
                title="Dashboard"
                description="Overview of the website content."
                actions={
                    <>
                        <Button asChild>
                            <Link href={posts.create()}>
                                <Plus className="size-4" />
                                New post
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={issuances.create()}>
                                <Plus className="size-4" />
                                New memorandum
                            </Link>
                        </Button>
                    </>
                }
            >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {tiles.map((tile) => (
                        <Link
                            key={tile.label}
                            href={tile.href}
                            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md"
                        >
                            <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                                <tile.icon className="size-5" aria-hidden />
                            </span>
                            <span>
                                <span className="block text-2xl font-semibold tabular-nums">
                                    {tile.value}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {tile.label}
                                </span>
                            </span>
                        </Link>
                    ))}
                </div>

                <section className="rounded-xl border bg-card shadow-xs">
                    <h2 className="border-b px-4 py-3 font-semibold">
                        Recently updated posts
                    </h2>
                    {recentPosts.length > 0 ? (
                        <ul className="divide-y">
                            {recentPosts.map((post) => (
                                <li key={post.id}>
                                    <Link
                                        href={posts.edit(post.id)}
                                        className="flex flex-col gap-1 px-4 py-3 hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <span className="font-medium">
                                            {post.title}
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                                            <Badge variant="outline">
                                                {post.type_label}
                                            </Badge>
                                            {!post.is_published && (
                                                <Badge variant="secondary">
                                                    Not public
                                                </Badge>
                                            )}
                                            {formatDateTime(post.updated_at)}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No posts yet.{' '}
                            <Link
                                href={posts.create()}
                                className="font-medium text-primary hover:underline"
                            >
                                Write the first one
                            </Link>
                            .
                        </p>
                    )}
                </section>
            </AdminPage>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
