import { Head } from '@inertiajs/react';
import { PageHeader } from '@/components/public/page-header';
import { SafeHtml } from '@/components/public/safe-html';
import { formatDate } from '@/lib/format';
import { show } from '@/routes/pages';

type Props = {
    page: {
        title: string;
        slug: string;
        meta_description: string | null;
        body: string | null;
        updated_at: string | null;
    };
};

export default function StaticPage({ page }: Props) {
    return (
        <>
            <Head title={page.title}>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
            </Head>

            <PageHeader
                title={page.title}
                breadcrumbs={[{ title: page.title, href: show(page.slug) }]}
            />

            <div className="container-page py-8">
                <article className="max-w-3xl space-y-8">
                    <SafeHtml html={page.body} />
                    {page.updated_at && (
                        <p className="border-t pt-4 text-xs text-muted-foreground">
                            Last updated {formatDate(page.updated_at)}
                        </p>
                    )}
                </article>
            </div>
        </>
    );
}
