import { Head, Link } from '@inertiajs/react';
import { AdminPage } from '@/components/admin/admin-page';
import { ListFilters } from '@/components/admin/list-filters';
import { EmptyState } from '@/components/public/empty-state';
import { PaginationNav } from '@/components/public/pagination-nav';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import messages from '@/routes/admin/messages';
import type { Paginated } from '@/types';

type MessageSummary = {
    id: number;
    name: string;
    email: string;
    subject: string;
    is_read: boolean;
    created_at: string | null;
};

type Props = {
    messages: Paginated<MessageSummary>;
    filters: { status: string };
    unreadCount: number;
};

export default function MessagesIndex({
    messages: list,
    filters,
    unreadCount,
}: Props) {
    return (
        <>
            <Head title="Messages" />
            <AdminPage
                title="Messages"
                description={`Inquiries sent through the contact form. ${unreadCount} unread.`}
            >
                <ListFilters
                    url={messages.index.url()}
                    selects={[
                        {
                            name: 'status',
                            label: 'messages',
                            value: filters.status,
                            options: [
                                { value: 'unread', label: 'Unread only' },
                            ],
                        },
                    ]}
                />

                {list.data.length === 0 ? (
                    <EmptyState title="No messages" />
                ) : (
                    <ul className="divide-y rounded-xl border bg-card shadow-xs">
                        {list.data.map((message) => (
                            <li key={message.id}>
                                <Link
                                    href={messages.show(message.id)}
                                    className="flex flex-col gap-1 p-3 hover:bg-accent/50 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                                >
                                    <span
                                        className={cn(
                                            'size-2 shrink-0 rounded-full',
                                            message.is_read
                                                ? 'bg-transparent'
                                                : 'bg-primary',
                                        )}
                                        aria-label={
                                            message.is_read
                                                ? undefined
                                                : 'Unread'
                                        }
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span
                                            className={cn(
                                                'block truncate',
                                                !message.is_read &&
                                                    'font-semibold',
                                            )}
                                        >
                                            {message.subject}
                                        </span>
                                        <span className="block truncate text-sm text-muted-foreground">
                                            {message.name} · {message.email}
                                        </span>
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {formatDateTime(message.created_at)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <PaginationNav paginator={list} />
            </AdminPage>
        </>
    );
}

MessagesIndex.layout = {
    breadcrumbs: [{ title: 'Messages', href: messages.index() }],
};
