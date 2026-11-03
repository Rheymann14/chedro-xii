import { Head, usePage } from '@inertiajs/react';
import { EmptyState } from '@/components/public/empty-state';
import { FilterBar } from '@/components/public/filter-bar';
import { PageHeader } from '@/components/public/page-header';
import { PaginationNav } from '@/components/public/pagination-nav';
import { PostCard } from '@/components/public/post-card';
import type { Paginated, PostSummary, PostTypeValue } from '@/types';

type Props = {
    type: { value: PostTypeValue; label: string; description: string };
    posts: Paginated<PostSummary>;
    filters: { q: string; year: string };
    years: number[];
};

export default function PostsIndex({ type, posts, filters, years }: Props) {
    const { url } = usePage();
    const path = url.split('?')[0];

    return (
        <>
            <Head title={type.label}>
                <meta name="description" content={type.description} />
            </Head>

            <PageHeader
                title={type.label}
                description={type.description}
                breadcrumbs={[{ title: type.label, href: path }]}
            />

            <div className="container-page space-y-6 py-8">
                <FilterBar
                    url={path}
                    search={filters.q}
                    searchPlaceholder={`Search ${type.label.toLowerCase()}…`}
                    selects={
                        years.length > 1
                            ? [
                                  {
                                      name: 'year',
                                      label: 'years',
                                      value: filters.year,
                                      options: years.map((year) => ({
                                          value: String(year),
                                          label: String(year),
                                      })),
                                  },
                              ]
                            : []
                    }
                />

                {posts.data.length > 0 ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Showing {posts.meta.from}–{posts.meta.to} of{' '}
                            {posts.meta.total}
                        </p>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.data.map((post, index) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    priority={index < 3}
                                />
                            ))}
                        </div>
                        <PaginationNav paginator={posts} />
                    </>
                ) : (
                    <EmptyState
                        title="Nothing found"
                        description={
                            filters.q || filters.year
                                ? 'Try a different search term or year.'
                                : 'Nothing has been posted here yet.'
                        }
                    />
                )}
            </div>
        </>
    );
}
