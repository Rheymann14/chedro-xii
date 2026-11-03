import { Head } from '@inertiajs/react';
import { Download, FolderOpen } from 'lucide-react';
import { EmptyState } from '@/components/public/empty-state';
import { FileBadge } from '@/components/public/file-badge';
import { PageHeader } from '@/components/public/page-header';
import { formatFileSize } from '@/lib/format';
import { index } from '@/routes/downloads';
import type { DownloadCategoryGroup } from '@/types';

export default function DownloadsIndex({
    categories,
}: {
    categories: DownloadCategoryGroup[];
}) {
    const description =
        'Application forms, templates, and other documents for students, HEIs, and the public.';

    return (
        <>
            <Head title="Downloadable Forms">
                <meta name="description" content={description} />
            </Head>

            <PageHeader
                title="Downloadable Forms"
                description={description}
                breadcrumbs={[{ title: 'Downloadable Forms', href: index() }]}
            />

            <div className="container-page grid gap-8 py-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
                {categories.length > 0 ? (
                    <>
                        <nav
                            aria-label="Categories"
                            className="hidden lg:block"
                        >
                            <ul className="sticky top-20 space-y-1">
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <a
                                            href={`#${category.slug}`}
                                            className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
                                        >
                                            {category.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="space-y-10">
                            {categories.map((category) => (
                                <section
                                    key={category.id}
                                    id={category.slug}
                                    className="scroll-mt-20"
                                >
                                    <h2 className="mb-3 text-lg font-bold text-brand dark:text-primary">
                                        {category.name}
                                    </h2>
                                    <ul className="divide-y rounded-lg border bg-card shadow-xs">
                                        {category.downloads.map((file) => (
                                            <li
                                                key={file.id}
                                                className="flex items-center gap-3 p-3 sm:p-4"
                                            >
                                                <FileBadge
                                                    extension={
                                                        file.file_extension
                                                    }
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium">
                                                        {file.title}
                                                    </p>
                                                    {file.description && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {file.description}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        {file.file_extension.toUpperCase()}{' '}
                                                        ·{' '}
                                                        {formatFileSize(
                                                            file.file_size,
                                                        )}
                                                    </p>
                                                </div>
                                                <a
                                                    href={file.file_url}
                                                    download
                                                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                                                >
                                                    <Download
                                                        className="size-4"
                                                        aria-hidden
                                                    />
                                                    <span className="hidden sm:inline">
                                                        Download
                                                    </span>
                                                    <span className="sr-only sm:hidden">
                                                        Download {file.title}
                                                    </span>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="lg:col-span-2">
                        <EmptyState
                            icon={FolderOpen}
                            title="No forms available yet"
                            description="Downloadable forms will be posted here."
                        />
                    </div>
                )}
            </div>
        </>
    );
}
