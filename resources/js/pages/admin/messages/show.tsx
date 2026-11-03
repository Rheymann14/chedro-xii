import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, Reply, Trash2 } from 'lucide-react';
import { AdminPage } from '@/components/admin/admin-page';
import { ConfirmDelete } from '@/components/admin/confirm-delete';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/format';
import messages from '@/routes/admin/messages';

type Props = {
    message: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        subject: string;
        message: string;
        created_at: string | null;
    };
};

export default function MessageShow({ message }: Props) {
    return (
        <>
            <Head title={message.subject} />
            <AdminPage
                title={message.subject}
                description={`Received ${formatDateTime(message.created_at)}`}
                actions={
                    <>
                        <Button asChild>
                            <a
                                href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                            >
                                <Reply className="size-4" />
                                Reply by email
                            </a>
                        </Button>
                        <ConfirmDelete
                            form={messages.destroy.form(message.id)}
                            title="Delete this message?"
                            trigger={
                                <Button variant="outline">
                                    <Trash2 className="size-4 text-destructive" />
                                    Delete
                                </Button>
                            }
                        />
                    </>
                }
            >
                <div className="max-w-3xl space-y-6 rounded-xl border bg-card p-5 shadow-xs">
                    <dl className="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
                        <dt className="text-muted-foreground">From</dt>
                        <dd className="font-medium">{message.name}</dd>
                        <dt className="text-muted-foreground">Email</dt>
                        <dd>
                            <a
                                href={`mailto:${message.email}`}
                                className="inline-flex items-center gap-1.5 text-primary hover:underline"
                            >
                                <Mail className="size-4" />
                                {message.email}
                            </a>
                        </dd>
                        {message.phone && (
                            <>
                                <dt className="text-muted-foreground">Phone</dt>
                                <dd className="inline-flex items-center gap-1.5">
                                    <Phone className="size-4" />
                                    {message.phone}
                                </dd>
                            </>
                        )}
                    </dl>
                    <p className="border-t pt-6 leading-7 whitespace-pre-line">
                        {message.message}
                    </p>
                </div>

                <Link
                    href={messages.index()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Back to messages
                </Link>
            </AdminPage>
        </>
    );
}

MessageShow.layout = {
    breadcrumbs: [{ title: 'Messages', href: messages.index() }],
};
