import { router } from '@inertiajs/react';
import { useSyncExternalStore } from 'react';

let leavingUrl: string | null = null;
let previousUrl: string | null = null;
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
};

/**
 * Remember the in-app page visited just before the current one, so "back"
 * links can return to it with its pagination, filters, and scroll position.
 * The URL is captured when a visit starts because `navigate` fires after the
 * new page has replaced the location. Back and forward navigation leave the
 * previous page unknown.
 *
 * The page's scroll position is also written to its history entry at that
 * moment. Inertia only saves it on a (debounced) scroll event, so an entry
 * created by a scroll-preserving visit, such as a timeline page change, would
 * otherwise be restored at the top of the page.
 */
export function trackPreviousPage(): void {
    router.on('start', () => {
        leavingUrl = window.location.pathname + window.location.search;

        if (window.history.state?.page) {
            window.history.replaceState(
                {
                    ...window.history.state,
                    documentScrollPosition: {
                        top: window.scrollY,
                        left: window.scrollX,
                    },
                },
                '',
            );
        }
    });

    router.on('navigate', (event) => {
        previousUrl = event.detail.type === 'visit' ? leavingUrl : null;
        listeners.forEach((listener) => listener());
    });
}

/**
 * The path and query of the page visited before this one, or null when the
 * visitor arrived directly or through browser history.
 */
export function usePreviousPage(): string | null {
    return useSyncExternalStore(
        subscribe,
        () => previousUrl,
        () => null,
    );
}
