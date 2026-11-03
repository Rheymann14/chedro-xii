import { router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { keepAlive } from '@/routes/session';

const ACTIVITY_EVENTS = [
    'pointerdown',
    'pointermove',
    'keydown',
    'scroll',
    'touchstart',
] as const;

// Shared across tabs so activity in one tab keeps the others signed in.
const STORAGE_KEY = 'last-activity-at';
const STORAGE_WRITE_INTERVAL_MS = 5_000;
const KEEP_ALIVE_INTERVAL_MS = 60_000;
const CHECK_INTERVAL_MS = 15_000;
// Waits a little past the server's lifetime so the session has surely expired.
const EXPIRY_GRACE_MS = 30_000;

function readSharedActivity(): number {
    try {
        return Number(window.localStorage.getItem(STORAGE_KEY)) || 0;
    } catch {
        return 0;
    }
}

function writeSharedActivity(timestamp: number): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, String(timestamp));
    } catch {
        // Storage can be unavailable (private mode); this tab still tracks itself.
    }
}

/**
 * Signs the user out after the session's idle timeout. User activity keeps the
 * server session alive; once idle, the page is reloaded so the server, whose
 * session has expired, redirects to the login page.
 */
export function useIdleLogout(): void {
    const { auth } = usePage().props;
    const isAuthenticated = auth.user !== null;
    const idleTimeoutMs = auth.idleTimeoutMinutes * 60_000 + EXPIRY_GRACE_MS;

    useEffect(() => {
        if (!isAuthenticated || idleTimeoutMs <= EXPIRY_GRACE_MS) {
            return;
        }

        let lastActivityAt = Date.now();
        let lastStorageWriteAt = 0;
        let lastKeepAliveAt = Date.now();
        let isExpiring = false;

        const idleFor = (now: number): number =>
            now - Math.max(lastActivityAt, readSharedActivity());

        const expire = (): void => {
            if (isExpiring) {
                return;
            }

            isExpiring = true;

            router.reload({
                onSuccess: (page) => {
                    if (page.component === 'auth/login') {
                        toast.info(
                            'You were signed out because you were inactive for too long.',
                        );
                    }
                },
                onFinish: () => {
                    isExpiring = false;
                    lastActivityAt = Date.now();
                },
            });
        };

        const handleActivity = (): void => {
            const now = Date.now();

            // Waking from sleep counts as activity, but the session may already be gone.
            if (idleFor(now) >= idleTimeoutMs) {
                expire();

                return;
            }

            lastActivityAt = now;

            if (now - lastStorageWriteAt >= STORAGE_WRITE_INTERVAL_MS) {
                lastStorageWriteAt = now;
                writeSharedActivity(now);
            }

            if (now - lastKeepAliveAt >= KEEP_ALIVE_INTERVAL_MS) {
                lastKeepAliveAt = now;
                void fetch(keepAlive.url(), {
                    headers: { Accept: 'application/json' },
                }).catch(() => undefined);
            }
        };

        const checkIdle = (): void => {
            if (idleFor(Date.now()) >= idleTimeoutMs) {
                expire();
            }
        };

        ACTIVITY_EVENTS.forEach((event) =>
            window.addEventListener(event, handleActivity, { passive: true }),
        );
        document.addEventListener('visibilitychange', checkIdle);
        const interval = window.setInterval(checkIdle, CHECK_INTERVAL_MS);

        return () => {
            ACTIVITY_EVENTS.forEach((event) =>
                window.removeEventListener(event, handleActivity),
            );
            document.removeEventListener('visibilitychange', checkIdle);
            window.clearInterval(interval);
        };
    }, [isAuthenticated, idleTimeoutMs]);
}
