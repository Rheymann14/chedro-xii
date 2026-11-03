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

    const withLazyImages = html.replace(
        /<img\b(?![^>]*\bloading=)/gi,
        '<img loading="lazy" decoding="async"',
    );

    const clean =
        typeof window === 'undefined'
            ? withLazyImages
            : DOMPurify.sanitize(withLazyImages, { ADD_ATTR: ['target'] });

    return (
        <div
            className={cn('prose-content', className)}
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    );
}
