import { cn } from '@/lib/utils';

const colors: Record<string, string> = {
    pdf: 'bg-red-600',
    doc: 'bg-blue-600',
    docx: 'bg-blue-600',
    xls: 'bg-green-700',
    xlsx: 'bg-green-700',
    ppt: 'bg-orange-600',
    pptx: 'bg-orange-600',
    zip: 'bg-zinc-600',
    jpg: 'bg-purple-600',
    jpeg: 'bg-purple-600',
    png: 'bg-purple-600',
};

/**
 * Small colored tag showing a file's extension.
 */
export function FileBadge({
    extension,
    className,
}: {
    extension: string;
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[0.65rem] font-bold tracking-wide text-white uppercase',
                colors[extension] ?? 'bg-zinc-500',
                className,
            )}
            aria-hidden
        >
            {extension || 'file'}
        </span>
    );
}
