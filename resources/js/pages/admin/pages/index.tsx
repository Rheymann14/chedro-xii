import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import pages from '@/routes/admin/pages';

type AdminPageItem = {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    updated_at: string | null;
    author: string | null;
    public_url: string;
};

export default function PagesIndex({
    pages: list,
}: {
    pages: AdminPageItem[];
}) {
    return (
        <>
            <Head title="Pages" />
            <AdminPage
                title="Pages"
                description="Static pages such as the mandate, Citizen's Charter, and Transparency Seal."
                actions={
                    <Button asChild>
                        <Link href={pages.create()}>
                            <Plus className="size-4" />
                            New page
                        </Link>
                    </Button>
                }
            >
                <ul className="divide-y rounded-xl border bg-card shadow-xs">
                    {list.map((page) => (
                        <li
                            key={page.id}
                            className="flex items-center gap-3 p-3 sm:p-4"
                        >
                            <div className="min-w-0 flex-1 space-y-1">
                                <Link
                                    href={pages.edit(page.id)}
                                    className="font-medium hover:text-primary hover:underline"
                                >
                                    {page.title}
                                </Link>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <span>/pages/{page.slug}</span>
                                    {!page.is_published && (
                                        <Badge variant="secondary">
                                            Hidden
                                        </Badge>
                                    )}
                                    <span>
                                        Updated{' '}
                                        {formatDateTime(page.updated_at)}
                                        {page.author && ` by ${page.author}`}
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                                <a
                                    href={page.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="View on site"
                                >
                                    <ExternalLink className="size-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                                <Link
                                    href={pages.edit(page.id)}
                                    aria-label="Edit"
                                >
                                    <Pencil className="size-4" />
                                </Link>
                            </Button>
                            <ConfirmDelete
                                form={pages.destroy.form(page.id)}
                                title={`Delete “${page.title}”?`}
                                description="Menu links pointing to this page will stop working."
                            />
                        </li>
                    ))}
                </ul>
            </AdminPage>
        </>
    );
}

PagesIndex.layout = {
    breadcrumbs: [{ title: 'Pages', href: pages.index() }],
};
