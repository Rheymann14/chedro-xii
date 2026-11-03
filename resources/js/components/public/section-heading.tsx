import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

/**
 * Section title with a short flag-red accent line and an optional "view all"
 * link.
 */
export function SectionHeading({
    title,
    description,
    href,
    linkLabel = 'View all',
}: {
    title: string;
    description?: string;
    href?: NonNullable<InertiaLinkProps['href']>;
    linkLabel?: string;
}) {
    return (
        <div className="mb-6 flex items-end justify-between gap-4">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {title}
                </h2>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
                <span className="block h-1 w-12 bg-flag-red" aria-hidden />
            </div>
            {href && (
                <Link
                    href={href}
                    prefetch
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                    {linkLabel}
                    <ArrowRight className="size-4" aria-hidden />
                </Link>
            )}
        </div>
    );
}
