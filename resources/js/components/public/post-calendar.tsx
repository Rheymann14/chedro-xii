import { Link, useHttp } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { calendar } from '@/routes';
import { show } from '@/routes/posts';

type CalendarPost = {
    id: number;
    title: string;
    slug: string;
    type_label: string;
};

type CalendarResponse = {
    month: string;
    days: Record<string, CalendarPost[]>;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthLabel = new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    year: 'numeric',
});

const dayLabel = new Intl.DateTimeFormat('en-PH', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
});

const pad = (value: number) => String(value).padStart(2, '0');

const toKey = (year: number, month: number, day: number) =>
    `${year}-${pad(month + 1)}-${pad(day)}`;

/**
 * Month calendar that highlights the days with published posts. Selecting a
 * highlighted day lists that day's posts below the grid.
 */
export function PostCalendar() {
    const [cursor, setCursor] = useState<{
        year: number;
        month: number;
    } | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [today, setToday] = useState<string | null>(null);
    const http = useHttp<Record<string, never>, CalendarResponse>({});

    useEffect(() => {
        const now = new Date();
        setCursor({ year: now.getFullYear(), month: now.getMonth() });
        setToday(toKey(now.getFullYear(), now.getMonth(), now.getDate()));
    }, []);

    useEffect(() => {
        if (cursor === null) {
            return;
        }

        void http
            .get(
                calendar.url({
                    query: { month: `${cursor.year}-${pad(cursor.month + 1)}` },
                }),
            )
            .catch(() => undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursor]);

    if (cursor === null) {
        return <div className="h-80 animate-pulse rounded-md bg-muted" />;
    }

    const days = http.response?.days ?? {};
    const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array.from({ length: firstWeekday }, () => null),
        ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];

    const move = (offset: number) => {
        const date = new Date(cursor.year, cursor.month + offset, 1);
        setSelected(null);
        setCursor({ year: date.getFullYear(), month: date.getMonth() });
    };

    const selectedPosts = selected ? (days[selected] ?? []) : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => move(-1)}
                    aria-label="Previous month"
                    className="grid size-8 place-items-center rounded-md hover:bg-accent"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <p className="font-semibold" aria-live="polite">
                    {monthLabel.format(new Date(cursor.year, cursor.month, 1))}
                </p>
                <button
                    type="button"
                    onClick={() => move(1)}
                    aria-label="Next month"
                    className="grid size-8 place-items-center rounded-md hover:bg-accent"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>

            <div
                className={cn(
                    'grid grid-cols-7 gap-1 text-center text-sm transition-opacity',
                    http.processing && 'opacity-60',
                )}
            >
                {WEEKDAYS.map((weekday) => (
                    <span
                        key={weekday}
                        className="py-1 text-[0.7rem] font-semibold text-muted-foreground uppercase"
                    >
                        {weekday}
                    </span>
                ))}
                {cells.map((day, index) => {
                    if (day === null) {
                        return <span key={`blank-${index}`} />;
                    }

                    const key = toKey(cursor.year, cursor.month, day);
                    const count = days[key]?.length ?? 0;

                    return (
                        <button
                            key={key}
                            type="button"
                            disabled={count === 0}
                            onClick={() =>
                                setSelected(selected === key ? null : key)
                            }
                            aria-pressed={selected === key}
                            aria-label={`${day}${count > 0 ? `, ${count} post${count === 1 ? '' : 's'}` : ''}`}
                            className={cn(
                                'relative grid aspect-square place-items-center rounded-md text-sm',
                                count > 0
                                    ? 'font-semibold text-foreground hover:bg-accent'
                                    : 'text-muted-foreground',
                                today === key && 'ring-1 ring-primary',
                                selected === key &&
                                    'bg-primary text-primary-foreground hover:bg-primary',
                            )}
                        >
                            {day}
                            {count > 0 && (
                                <span
                                    className={cn(
                                        'absolute bottom-1 size-1 rounded-full',
                                        selected === key
                                            ? 'bg-primary-foreground'
                                            : 'bg-flag-red',
                                    )}
                                    aria-hidden
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {selected && (
                <div className="space-y-2 border-t pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                        {dayLabel.format(new Date(`${selected}T00:00:00`))}
                    </p>
                    <ul className="space-y-2">
                        {selectedPosts.map((post) => (
                            <li key={post.id}>
                                <Link
                                    href={show(post.slug)}
                                    className="block rounded-md border p-2.5 hover:border-primary/40 hover:bg-accent/50"
                                >
                                    <span className="block text-[0.7rem] font-semibold text-flag-red uppercase">
                                        {post.type_label}
                                    </span>
                                    <span className="line-clamp-2 text-sm font-medium">
                                        {post.title}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
