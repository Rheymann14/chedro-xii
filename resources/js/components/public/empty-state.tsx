import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    children,
}: {
    title: string;
    description?: string;
    icon?: LucideIcon;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-14 text-center">
            <Icon className="size-10 text-muted-foreground" aria-hidden />
            <div className="space-y-1">
                <p className="font-semibold">{title}</p>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
