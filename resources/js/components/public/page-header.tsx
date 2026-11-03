import type { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { BreadcrumbItem } from '@/types';

/**
 * Title band shown at the top of public inner pages.
 */
export function PageHeader({
    title,
    description,
    breadcrumbs = [],
    children,
}: {
    title: string;
    description?: string | null;
    breadcrumbs?: BreadcrumbItem[];
    children?: ReactNode;
}) {
    return (
        <div className="border-b bg-background">
            <div className="container-page py-8 sm:py-10">
                {breadcrumbs.length > 0 && (
                    <div className="mb-4">
                        <Breadcrumbs
                            breadcrumbs={[
                                { title: 'Home', href: '/' },
                                ...breadcrumbs,
                            ]}
                        />
                    </div>
                )}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {title}
                        </h1>
                        <span
                            className="block h-1 w-14 bg-flag-red"
                            aria-hidden
                        />
                        {description && (
                            <p className="text-muted-foreground sm:text-lg">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
