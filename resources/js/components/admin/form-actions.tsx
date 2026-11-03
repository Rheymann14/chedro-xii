import { Link } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

/**
 * Save and cancel buttons with optional upload progress, shown at the end of
 * back-office forms.
 */
export function FormActions({
    processing,
    cancelHref,
    submitLabel,
    progress,
}: {
    processing: boolean;
    cancelHref: NonNullable<InertiaLinkProps['href']>;
    submitLabel: string;
    progress?: { percentage?: number } | null;
}) {
    return (
        <div className="space-y-3 border-t pt-6">
            {progress?.percentage !== undefined && (
                <progress
                    value={progress.percentage}
                    max={100}
                    className="h-2 w-full max-w-sm accent-primary"
                >
                    {progress.percentage}%
                </progress>
            )}
            <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                    {processing && <Spinner />}
                    {submitLabel}
                </Button>
                <Button variant="outline" asChild>
                    <Link href={cancelHref}>Cancel</Link>
                </Button>
            </div>
        </div>
    );
}
