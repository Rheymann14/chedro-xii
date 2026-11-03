import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

type SmartLinkProps = {
    href: string;
    newTab?: boolean;
    prefetch?: boolean;
    className?: string;
    title?: string;
    onClick?: () => void;
    children: ReactNode;
};

export function isInternalUrl(href: string): boolean {
    return href.startsWith('/') && !href.startsWith('//');
}

/**
 * Renders an Inertia <Link> for internal paths and a plain anchor for
 * external URLs, files, and links that should open in a new tab.
 */
export function SmartLink({
    href,
    newTab = false,
    prefetch = false,
    children,
    ...props
}: SmartLinkProps) {
    if (isInternalUrl(href) && !newTab) {
        return (
            <Link href={href} prefetch={prefetch} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <a
            href={href}
            {...(newTab
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            {...props}
        >
            {children}
        </a>
    );
}
