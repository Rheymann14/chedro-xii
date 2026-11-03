import { useEffect, useState } from 'react';

const formatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
});

/**
 * Philippine Standard Time clock. Renders only on the client to avoid
 * server/client hydration mismatches.
 */
export function PhilippineTime({ className }: { className?: string }) {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        const tick = () => setNow(new Date());
        tick();
        const timer = window.setInterval(tick, 1000);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <span className={className}>
            <abbr
                title="Philippine Standard Time"
                className="font-semibold no-underline"
            >
                PST
            </abbr>{' '}
            <time className="tabular-nums">
                {now ? formatter.format(now) : ''}
            </time>
        </span>
    );
}
