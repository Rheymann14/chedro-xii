import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Plain card widget with a heading and a short flag-red accent line.
 */
export function SidebarBox({
    title,
    children,
    className,
}: {
    title: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn('rounded-lg border bg-card p-5 shadow-xs', className)}
        >
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <span
                className="mt-2 mb-4 block h-0.5 w-10 bg-flag-red"
                aria-hidden
            />
            {children}
        </section>
    );
}
