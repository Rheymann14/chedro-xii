import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Paginated } from '@/types';

/**
 * Pagination for Laravel length-aware paginators. Shows a compact
 * previous/next control on phones and page numbers from `sm` upward.
 *
 * Pass `only` to reload just those props and keep the scroll position, for a
 * paginated section inside a larger page.
 */
export function PaginationNav<T>({
    paginator,
    only,
    className,
}: {
    paginator: Paginated<T>;
    only?: string[];
    className?: string;
}) {
    const { meta, links } = paginator;

    if (meta.last_page <= 1) {
        return null;
    }

    const pageLinks = meta.links.slice(1, -1);
    const visit = only ? { only, preserveScroll: true } : {};

    return (
        <nav
            aria-label="Pagination"
            className={cn(
                'flex items-center justify-between gap-2 border-t pt-6',
                className,
            )}
        >
            <PageButton href={links.prev} label="Previous page" visit={visit}>
                <ChevronLeft className="size-4" aria-hidden />
                <span>Previous</span>
            </PageButton>

            <p className="text-sm text-muted-foreground sm:hidden">
                Page {meta.current_page} of {meta.last_page}
            </p>

            <ul className="hidden items-center gap-1 sm:flex">
                {pageLinks.map((link, index) => (
                    <li key={`${link.label}-${index}`}>
                        {link.url ? (
                            <Link
                                href={link.url}
                                {...visit}
                                aria-current={link.active ? 'page' : undefined}
                                className={cn(
                                    'inline-flex size-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent',
                                    link.active &&
                                        'bg-primary text-primary-foreground hover:bg-primary',
                                )}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <span className="inline-flex size-9 items-center justify-center text-sm text-muted-foreground">
                                {link.label}
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            <PageButton href={links.next} label="Next page" visit={visit}>
                <span>Next</span>
                <ChevronRight className="size-4" aria-hidden />
            </PageButton>
        </nav>
    );
}

function PageButton({
    href,
    label,
    visit,
    children,
}: {
    href: string | null;
    label: string;
    visit: { only?: string[]; preserveScroll?: boolean };
    children: ReactNode;
}) {
    const className =
        'inline-flex h-9 items-center gap-1 rounded-md border px-3 text-sm font-medium';

    if (!href) {
        return (
            <span
                aria-disabled
                className={cn(className, 'text-muted-foreground opacity-50')}
            >
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            {...visit}
            aria-label={label}
            className={cn(className, 'hover:bg-accent')}
        >
            {children}
        </Link>
    );
}
