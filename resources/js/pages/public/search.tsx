import { Form, Head, Link } from '@inertiajs/react';
import { FileText, Search as SearchIcon } from 'lucide-react';
import { EmptyState } from '@/components/public/empty-state';
import { IssuanceList } from '@/components/public/issuance-list';
import { PageHeader } from '@/components/public/page-header';
import { PostCard } from '@/components/public/post-card';
import { SectionHeading } from '@/components/public/section-heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { search } from '@/routes';
import { show as showPage } from '@/routes/pages';
import type { IssuanceItem, PostSummary } from '@/types';

type Props = {
    q: string;
    results: {
        posts: PostSummary[];
        issuances: IssuanceItem[];
        pages: {
            title: string;
            slug: string;
            meta_description: string | null;
        }[];
    } | null;
};

export default function Search({ q, results }: Props) {
    const total = results
        ? results.posts.length + results.issuances.length + results.pages.length
        : 0;

    return (
        <>
            <Head title={q ? `Search: ${q}` : 'Search'} />

            <PageHeader
                title="Search"
                description="Find announcements, memoranda, and pages across the site."
                breadcrumbs={[{ title: 'Search', href: search() }]}
            />

            <div className="container-page space-y-10 py-8">
                <Form
                    action={search.url()}
                    method="get"
                    role="search"
                    className="flex max-w-2xl gap-2"
                >
                    <div className="relative flex-1">
                        <SearchIcon
                            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                            aria-hidden
                        />
                        <Input
                            type="search"
                            name="q"
                            defaultValue={q}
                            placeholder="Search the site…"
                            aria-label="Search the site"
                            minLength={2}
                            autoFocus={q === ''}
                            className="h-11 pl-9 text-base"
                        />
                    </div>
                    <Button type="submit" className="h-11">
                        Search
                    </Button>
                </Form>

                {results && total === 0 && (
                    <EmptyState
                        title={`No results for “${q}”`}
                        description="Try other keywords or check the spelling."
                    />
                )}

                {results && results.pages.length > 0 && (
                    <section>
                        <SectionHeading title="Pages" />
                        <ul className="grid gap-3 sm:grid-cols-2">
                            {results.pages.map((page) => (
                                <li key={page.slug}>
                                    <Link
                                        href={showPage(page.slug)}
                                        className="block h-full rounded-lg border bg-card p-4 shadow-xs hover:border-primary/40"
                                    >
                                        <span className="flex items-center gap-2 font-semibold">
                                            <FileText
                                                className="size-4 text-brand dark:text-primary"
                                                aria-hidden
                                            />
                                            {page.title}
                                        </span>
                                        {page.meta_description && (
                                            <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                                                {page.meta_description}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {results && results.posts.length > 0 && (
                    <section>
                        <SectionHeading title="Posts" />
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {results.posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </section>
                )}

                {results && results.issuances.length > 0 && (
                    <section>
                        <SectionHeading title="Memoranda & issuances" />
                        <div className="rounded-lg border bg-card px-3 shadow-xs sm:px-4">
                            <IssuanceList issuances={results.issuances} />
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
