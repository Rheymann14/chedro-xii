import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Standard wrapper for back-office pages: title, description, and actions,
 * followed by the page content.
 */
export function AdminPage({
    title,
    description,
    actions,
    children,
    className,
}: {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn('flex flex-1 flex-col gap-6 p-4 sm:p-6', className)}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {actions && (
                    <div className="flex flex-wrap items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>
            {children}
        </div>
    );
}
