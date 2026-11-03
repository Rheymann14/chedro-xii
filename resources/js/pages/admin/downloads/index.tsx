import { Head, Link } from '@inertiajs/react';
import { Pencil, Plus } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { ListFilters } from '@/components/admin/list-filters';
import { EmptyState } from '@/components/public/empty-state';
import { PaginationNav } from '@/components/public/pagination-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/format';
import downloads from '@/routes/admin/downloads';
import type { Paginated } from '@/types';

type AdminDownload = {
    id: number;
    title: string;
    category: string;
    file_name: string;
    file_size: number;
    file_url: string;
};

type Props = {
    downloads: Paginated<AdminDownload>;
    filters: { category: string };
    categories: { id: number; name: string }[];
};

export default function DownloadsIndex({
    downloads: list,
    filters,
    categories,
}: Props) {
    return (
        <>
            <Head title="Downloads" />
            <AdminPage
                title="Downloads"
                description="Forms and documents listed on the public Downloadable Forms page."
                actions={
                    <Button asChild>
                        <Link href={downloads.create()}>
                            <Plus className="size-4" />
                            Upload file
                        </Link>
                    </Button>
                }
            >
                <ListFilters
                    url={downloads.index.url()}
                    selects={[
                        {
                            name: 'category',
                            label: 'categories',
                            value: filters.category,
                            options: categories.map((category) => ({
                                value: String(category.id),
                                label: category.name,
                            })),
                        },
                    ]}
                />

                {list.data.length === 0 ? (
                    <EmptyState title="No files yet" />
                ) : (
                    <ul className="divide-y rounded-xl border bg-card shadow-xs">
                        {list.data.map((download) => (
                            <li
                                key={download.id}
                                className="flex items-center gap-3 p-3 sm:p-4"
                            >
                                <div className="min-w-0 flex-1 space-y-1">
                                    <a
                                        href={download.file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium hover:text-primary hover:underline"
                                    >
                                        {download.title}
                                    </a>
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                        <Badge variant="outline">
                                            {download.category}
                                        </Badge>
                                        <span className="truncate">
                                            {download.file_name}
                                        </span>
                                        <span>
                                            {formatFileSize(download.file_size)}
                                        </span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" asChild>
                                    <Link
                                        href={downloads.edit(download.id)}
                                        aria-label="Edit"
                                    >
                                        <Pencil className="size-4" />
                                    </Link>
                                </Button>
                                <ConfirmDelete
                                    form={downloads.destroy.form(download.id)}
                                    title={`Delete “${download.title}”?`}
                                />
                            </li>
                        ))}
                    </ul>
                )}

                <PaginationNav paginator={list} />
            </AdminPage>
        </>
    );
}

DownloadsIndex.layout = {
    breadcrumbs: [{ title: 'Downloads', href: downloads.index() }],
};
