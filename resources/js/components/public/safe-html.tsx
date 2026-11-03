import DOMPurify from 'dompurify';
import { cn } from '@/lib/utils';

/**
 * Renders rich-text HTML. Content is sanitized on the server when saved and
 * sanitized again in the browser as a second line of defense.
 */
export function SafeHtml({
    html,
    className,
}: {
    html: string | null;
    className?: string;
}) {
    if (!html) {
        return null;
    }

    const clean =
        typeof window === 'undefined'
            ? html
            : DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });

    return (
        <div
            className={cn('prose-content', className)}
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    );
}
