import { Lock } from 'lucide-react';
import { FileBadge } from '@/components/public/file-badge';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import type { IssuanceItem } from '@/types';

/**
 * Responsive list of issuances: stacked rows on phones, with the reference
 * number and date alongside on wider screens.
 */
export function IssuanceList({
    issuances,
    compact = false,
}: {
    issuances: IssuanceItem[];
    compact?: boolean;
}) {
    return (
        <ul className="divide-y">
            {issuances.map((issuance) => (
                <li key={issuance.id}>
                    <a
                        href={issuance.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-3 py-3 hover:bg-accent/40 sm:px-2"
                    >
                        <FileBadge
                            extension={issuance.file_extension}
                            className={compact ? 'h-8 w-8' : undefined}
                        />
                        <div className="min-w-0 flex-1 space-y-1">
                            <p className="line-clamp-2 text-sm leading-snug font-medium group-hover:text-primary group-hover:underline">
                                {issuance.title}
                            </p>
                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                {issuance.reference_no && (
                                    <span className="font-medium text-foreground/80">
                                        {issuance.reference_no}
                                    </span>
                                )}
                                {!compact && <span>{issuance.type}</span>}
                                <time dateTime={issuance.issued_on}>
                                    {formatDate(issuance.issued_on)}
                                </time>
                                {issuance.is_internal && (
                                    <Badge
                                        variant="secondary"
                                        className="gap-1"
                                    >
                                        <Lock className="size-3" aria-hidden />
                                        Internal
                                    </Badge>
                                )}
                            </p>
                        </div>
                    </a>
                </li>
            ))}
        </ul>
    );
}
